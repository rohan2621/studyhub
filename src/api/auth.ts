import { apiClient } from './client';
import type { AuthResponse, LoginPayload, SignupPayload, User, School } from '../types/api.types';

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    const body = { ...payload, role: 'student' as const };
    const { data } = await apiClient.post<AuthResponse>('/auth/signup', body);
    return data;
  },

  refresh: async (): Promise<{ access_token: string }> => {
    const { data } = await apiClient.post<{ access_token: string }>('/auth/refresh');
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/users/me');
    return data;
  },

  schools: async (query?: string): Promise<School[]> => {
    const { data } = await apiClient.get<School[]>('/schools', {
      params: query ? { query } : undefined,
    });
    return data;
  },
};
