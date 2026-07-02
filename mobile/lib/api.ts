import axios from "axios";
import { router } from "expo-router";
import { storage } from "./storage";
import { API_URL } from "../constants/Api";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Request: attach auth token + device ID ─────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await storage.get("accessToken");
  const deviceId = await storage.get("deviceId");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (deviceId) config.headers["X-Device-Id"] = deviceId;
  return config;
});

// ── Response: handle auth errors globally ──────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const errorCode = error.response?.data?.error;

    // 401 → try refresh token once, then force login
    if (status === 401 && !original._retry) {
      original._retry = true;
      try {
        const userId = await storage.get("userId");
        const res = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { headers: { "X-User-Id": userId }, withCredentials: true }
        );
        const newToken = res.data.accessToken;
        await storage.set("accessToken", newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        await storage.delete("accessToken");
        await storage.delete("userId");
        await storage.delete("user");
        router.replace("/(auth)/login");
      }
    }

    // 402 → no active token, send to token wall
    // Don't redirect if this was a token-status/activation call itself
    if (status === 402 || errorCode === "NO_ACTIVE_TOKEN") {
      const reqUrl = original?.url ?? "";
      const isTokenCall = reqUrl.includes("/tokens/") || reqUrl.includes("/auth/") || reqUrl.includes("/profile");
      if (!isTokenCall) {
        router.replace("/(tabs)/activate-token" as any);
      }
      return Promise.reject(error);
    }

    // 403 DEVICE_MISMATCH → dedicated device mismatch screen
    if (status === 403 && errorCode === "DEVICE_MISMATCH") {
      router.replace("/device-mismatch" as any);
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);