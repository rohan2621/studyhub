import { create } from "zustand";
import { storage } from "../lib/storage";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId: string;
  grade: string;
  section: string;
  school?: string;
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

  // alias so both naming conventions work across screens
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
    } catch {
      // ignore
    } finally {
      set({ isLoading: false });
    }
  },
}));