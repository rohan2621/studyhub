import { apiClient } from './client';
import type { SearchResult } from '../types/api.types';

export const searchApi = {
  universal: async (q: string, subject?: string): Promise<SearchResult> => {
    const { data } = await apiClient.get<SearchResult>('/search', {
      params: { q, subject },
    });
    return data;
  },
};
