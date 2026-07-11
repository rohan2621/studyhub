import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils/storage';
import { getDeviceFingerprint } from '../utils/fingerprint';
import { AppError } from '../constants/errors';
import { mapApiError } from '../utils/errorMapper';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000';

export const apiClient = axios.create({
  baseURL:        BASE_URL,
  timeout:        15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — attach auth headers ────────────────────────────────
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const [token, fingerprint] = await Promise.all([
    storage.get(storage.KEYS.ACCESS_TOKEN),
    getDeviceFingerprint(),
  ]);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-Device-Id'] = fingerprint;

  return config;
});

// ─── Refresh token queue ──────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

// ─── Response interceptor — handle 401 with token rotation ───────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle device mismatch — propagate as a typed error, do NOT retry
    if (error.response?.status === 409) {
      return Promise.reject({ appError: AppError.DEVICE_MISMATCH });
    }

    // Handle 401 — attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.get(storage.KEYS.REFRESH_TOKEN);
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken: string = data.access_token;
        await storage.set(storage.KEYS.ACCESS_TOKEN, newAccessToken);

        processQueue(null, newAccessToken);
        isRefreshing = false;

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear all stored credentials → forces navigation to login via AuthContext
        await storage.clearAll();

        return Promise.reject({ appError: AppError.TOKEN_EXPIRED, loggedOut: true });
      }
    }

    return Promise.reject({ appError: mapApiError(error), original: error });
  }
);
