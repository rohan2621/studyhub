import React, { createContext, useContext, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { storage } from '../utils/storage';
import { authApi } from '../api/auth';
import { tokenApi } from '../api/token';
import { useAuthStore } from '../store/authStore';
import { useTokenStore } from '../store/tokenStore';
import { logger } from '../services/logger';
import { startSyncService } from '../services/syncService';

interface AuthContextValue {
  bootstrap: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({ bootstrap: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const segments = useSegments();
  const { setUser, setAuthenticated, setHydrated, isAuthenticated, isHydrated } = useAuthStore();
  const { setTokenStatus } = useTokenStore();

  // ─── Bootstrap: runs once on cold launch ────────────────────────────────────
  async function bootstrap() {
    try {
      const accessToken = await storage.get(storage.KEYS.ACCESS_TOKEN);

      if (!accessToken) {
        setHydrated(true);
        return;
      }

      // Step 1: refresh access token
      try {
        const { access_token } = await authApi.refresh();
        await storage.set(storage.KEYS.ACCESS_TOKEN, access_token);
      } catch {
        // Refresh failed → clear creds and send to login
        await storage.clearAll();
        setHydrated(true);
        return;
      }

      // Step 2: load current user
      const user = await authApi.me();
      setUser(user);
      setAuthenticated(true);

      // Step 3: load token / subscription status
      const tokenStatus = await tokenApi.getStatus();
      setTokenStatus(tokenStatus);

      // Step 4: start background sync service
      startSyncService();

      logger.info('[Auth] Bootstrap complete', { userId: user.id });
    } catch (err) {
      logger.error('[Auth] Bootstrap failed', { err });
      await storage.clearAll();
    } finally {
      setHydrated(true);
    }
  }

  // Run bootstrap on mount
  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Navigation guard ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isHydrated) return;

    const inAuth = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuth) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isHydrated, segments]);

  return (
    <AuthContext.Provider value={{ bootstrap }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
