import { apiClient } from './client';
import type { FeedResponse, User } from '../types/api.types';

export const profileApi = {
  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/users/me');
    return data;
  },

  updateMe: async (payload: Partial<Pick<User, 'name' | 'grade'>>): Promise<User> => {
    const { data } = await apiClient.patch<User>('/users/me', payload);
    return data;
  },

  getFeed: async (): Promise<FeedResponse> => {
    const { data } = await apiClient.get<FeedResponse>('/feed');
    return data;
  },

  getBookmarks: async (): Promise<{ notes: any[]; discussions: any[] }> => {
    const { data } = await apiClient.get('/users/me/bookmarks');
    return data;
  },

  getDownloads: async (): Promise<any[]> => {
    const { data } = await apiClient.get('/users/me/downloads');
    return data;
  },
};
