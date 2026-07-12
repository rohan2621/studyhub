import axios from "axios";
import { useAuthStore } from "../stores/auth";

export const API_URL = import.meta.env.VITE_API_URL || "https://api.studyhub.app";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 15000; // 15 seconds Cache TTL

// Paths that should always bypass the client-side cache (real-time data)
const CACHE_BYPASS_PATHS = ["/notifications", "/tokens/me", "/feed"] as const;

// ── Request: attach auth token + device ID & handle cache ─────────────────────────
api.interceptors.request.use((config) => {
  const { accessToken, deviceId } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (deviceId) {
    config.headers["X-Device-Id"] = deviceId;
  }

  // Clear cache on any mutating request
  const method = config.method?.toLowerCase() ?? "";
  if (["post", "put", "delete", "patch"].includes(method)) {
    cache.clear();
  }

  // Serve GET requests from cache if valid and not bypassed
  if (method === "get") {
    const isBypass = CACHE_BYPASS_PATHS.some(path => config.url?.includes(path));
    if (!isBypass) {
      const cacheKey = `${config.url}?${new URLSearchParams(config.params || {}).toString()}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        config.adapter = () => {
          return Promise.resolve({
            data: cached.data,
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            request: {}
          } as any);
        };
      }
    }
  }

  return config;
});

// ── Response: handle auth errors globally & store cache ──────────────────────────
api.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase() ?? "";
    if (method === "get") {
      const isBypass = CACHE_BYPASS_PATHS.some(path => response.config.url?.includes(path));
      if (!isBypass) {
        const cacheKey = `${response.config.url}?${new URLSearchParams(response.config.params || {}).toString()}`;
        cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
      }
    }
    return response;
  },
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const errorCode = error.response?.data?.error;

    // 401 → try refresh token once, then force login
    if (status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { user, refreshToken, setAccessToken, setRefreshToken } = useAuthStore.getState();
        if (!user) throw new Error("No user to refresh");
        
        const res = await axios.post(
          `${API_URL.replace(/\/$/, "")}/auth/refresh`,
          { 
            userId: user.id,
            refreshToken: refreshToken || undefined
          },
          { 
            withCredentials: true 
          }
        );
        const newToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;
        
        setAccessToken(newToken);
        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
        }
        
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }

    // 402 → no active token (AppShell now handles UI for this, no forced redirect here)
    if (status === 402 || errorCode === "NO_ACTIVE_TOKEN") {
      return Promise.reject(error);
    }

    // 403 DEVICE_MISMATCH → handle mismatch logic
    if (status === 403 && errorCode === "DEVICE_MISMATCH") {
      window.location.href = "/profile?error=device-mismatch";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
