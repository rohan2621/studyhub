import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Token } from "@/lib/api-types";

interface AuthStore {
  user: User | null;
  token: Token | null;
  accessToken: string | null;
  refreshToken: string | null;
  deviceId: string | null;
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: Token | null) => void;
  setAccessToken: (accessToken: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setDeviceId: (id: string | null) => void;
  logout: () => void;
}

function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem("studyhub-device-id");
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem("studyhub-device-id", id);
    return id;
  } catch {
    return "";
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      accessToken: null,
      refreshToken: null,
      deviceId: getOrCreateDeviceId(),
      isHydrated: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setDeviceId: (id) => set({ deviceId: id }),
      logout: () =>
        set({
          user: null,
          token: null,
          accessToken: null,
          refreshToken: null,
        }),
    }),
    {
      name: "studyhub-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        deviceId: state.deviceId,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (state && !error) {
          state.isHydrated = true;
          useAuthStore.setState({ isHydrated: true });
        }
      },
    },
  ),
);

export function getTokenState(token: Token | null): "none" | "unused" | "active" | "expired" | "revoked" {
  if (!token) return "none";
  if (token.status === "revoked") return "revoked";
  if (token.status === "unused") return "unused";
  if (new Date(token.expires_at) < new Date()) return "expired";
  if (token.status === "active") return "active";
  return "none";
}

export function getTokenDaysRemaining(token: Token | null): number {
  if (!token || token.status !== "active") return 0;
  const now = new Date();
  const expires = new Date(token.expires_at);
  const diff = expires.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
