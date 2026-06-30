import axios from "axios";
import { storage } from "./storage";
import { API_URL } from "../constants/Api";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await storage.get("accessToken");
  const deviceId = await storage.get("deviceId");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (deviceId) config.headers["X-Device-Id"] = deviceId;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
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
      }
    }
    return Promise.reject(error);
  }
);