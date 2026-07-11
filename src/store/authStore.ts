import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types/api.types';

interface AuthState {
  user:           User | null;
  isAuthenticated: boolean;
  isHydrated:     boolean; // true once SecureStore has been read on launch
  setUser:        (user: User | null) => void;
  setAuthenticated:(v: boolean) => void;
  setHydrated:    (v: boolean) => void;
  logout:         () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      isAuthenticated: false,
      isHydrated:      false,

      setUser:         (user)   => set({ user }),
      setAuthenticated:(v)      => set({ isAuthenticated: v }),
      setHydrated:     (v)      => set({ isHydrated: v }),

      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name:    'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist non-sensitive fields; tokens stay in SecureStore
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);
