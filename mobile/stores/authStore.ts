import { create } from "zustand";
import { storage } from "../lib/storage";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId?: string;
  grade?: string;
  section?: string;
  school?: string;
}

// Helper: returns true for users with Admin role regardless of string/numeric form
export function isAdminUser(user: User | null): boolean {
  if (!user) return false;
  const r = user.role;
  return r === "Admin" || String(r).toLowerCase() === "admin" || (r as unknown) === 3;
}


interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User, refreshToken?: string) => Promise<void>;
  setAuth: (user: User, token: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (token, user, refreshToken) => {
    await storage.set("accessToken", token);
    if (refreshToken) {
      await storage.set("refreshToken", refreshToken);
    }
    await storage.set("userId", user.id);
    await storage.set("user", JSON.stringify(user));
    set({ user, accessToken: token, isAuthenticated: true });
  },

  // S5 fix: `setAuth` was an identical duplicate of `login`.
  // Keep as a thin alias so existing screens using setAuth() still compile.
  setAuth: async (user, token, refreshToken) => {
    await storage.set("accessToken", token);
    if (refreshToken) {
      await storage.set("refreshToken", refreshToken);
    }
    await storage.set("userId", user.id);
    await storage.set("user", JSON.stringify(user));
    set({ user, accessToken: token, isAuthenticated: true });
  },

  logout: async () => {
    await storage.delete("accessToken");
    await storage.delete("refreshToken");
    await storage.delete("userId");
    await storage.delete("user");
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  loadStoredAuth: async () => {
    try {
      const token = await storage.get("accessToken");
      const userStr = await storage.get("user");
      if (token && userStr) {
        set({ user: JSON.parse(userStr), accessToken: token, isAuthenticated: true });
      }
    } catch (e) {
      console.error("Failed to load stored auth, clearing:", e);
      await storage.delete("accessToken");
      await storage.delete("refreshToken");
      await storage.delete("userId");
      await storage.delete("user");
    } finally {
      set({ isLoading: false });
    }
  },
}));