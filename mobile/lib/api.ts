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
        const refreshToken = await storage.get("refreshToken");
        const res = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { 
            headers: { 
              "X-User-Id": userId,
              "X-Refresh-Token": refreshToken || ""
            }, 
            withCredentials: true 
          }
        );
        const newToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;
        await storage.set("accessToken", newToken);
        if (newRefreshToken) {
          await storage.set("refreshToken", newRefreshToken);
        }
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        await storage.delete("accessToken");
        await storage.delete("refreshToken");
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

// ── Learn API Endpoints ──────────────────────────────────────────────
export const learnApi = {
  // Domains
  getDomains: async () => {
    const res = await api.get("/learn/domains");
    return res.data;
  },
  getDomainBySlug: async (slug: string) => {
    const res = await api.get(`/learn/domains/${slug}`);
    return res.data;
  },

  // Courses
  getCourses: async (params?: { domainId?: string; search?: string }) => {
    const res = await api.get("/learn/courses", { params });
    return res.data;
  },
  getCourseBySlug: async (slug: string) => {
    const res = await api.get(`/learn/courses/${slug}`);
    return res.data;
  },
  enrollCourse: async (id: string) => {
    const res = await api.post(`/learn/courses/${id}/enroll`);
    return res.data;
  },
  getCourseProgress: async (id: string) => {
    const res = await api.get(`/learn/courses/${id}/progress`);
    return res.data;
  },

  // Lessons
  getLesson: async (id: string) => {
    const res = await api.get(`/learn/lessons/${id}`);
    return res.data;
  },
  completeLesson: async (id: string) => {
    const res = await api.post(`/learn/lessons/${id}/complete`);
    return res.data;
  },

  // Quizzes
  getQuizByLesson: async (lessonId: string) => {
    const res = await api.get(`/learn/quizzes/${lessonId}`);
    return res.data;
  },
  submitQuiz: async (quizId: string, answers: Record<string, number>) => {
    const res = await api.post(`/learn/quizzes/${quizId}/submit`, { answers });
    return res.data;
  },

  // Progress
  getProgressOverview: async () => {
    const res = await api.get("/learn/progress/overview");
    return res.data;
  },
  getRecommendations: async () => {
    const res = await api.get("/learn/progress/recommendations");
    return res.data;
  },
  getAchievements: async () => {
    const res = await api.get("/learn/progress/achievements");
    return res.data;
  },
  getStreak: async () => {
    const res = await api.get("/learn/progress/streak");
    return res.data;
  }
};