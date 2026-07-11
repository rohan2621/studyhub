import { apiClient } from './client';
import type { DiscussionThread, DiscussionReply, PaginatedResponse } from '../types/api.types';

export type DiscussionTab = 'trending' | 'pinned' | 'my_posts' | 'bookmarks';

export const discussionApi = {
  listThreads: async (tab: DiscussionTab = 'trending', cursor?: string): Promise<PaginatedResponse<DiscussionThread>> => {
    const { data } = await apiClient.get<PaginatedResponse<DiscussionThread>>('/discussions', {
      params: { tab, cursor, limit: 20 },
    });
    return data;
  },

  getThread: async (id: string): Promise<DiscussionThread> => {
    const { data } = await apiClient.get<DiscussionThread>(`/discussions/${id}`);
    return data;
  },

  getReplies: async (threadId: string, cursor?: string): Promise<PaginatedResponse<DiscussionReply>> => {
    const { data } = await apiClient.get<PaginatedResponse<DiscussionReply>>(
      `/discussions/${threadId}/replies`,
      { params: { cursor, limit: 30 } }
    );
    return data;
  },

  createThread: async (payload: { subject: string; title: string; body: string }): Promise<DiscussionThread> => {
    const { data } = await apiClient.post<DiscussionThread>('/discussions', payload);
    return data;
  },

  createReply: async (threadId: string, body: string): Promise<DiscussionReply> => {
    const { data } = await apiClient.post<DiscussionReply>(`/discussions/${threadId}/replies`, { body });
    return data;
  },

  bookmark: async (threadId: string): Promise<void> => {
    await apiClient.post(`/discussions/${threadId}/bookmark`);
  },
};
