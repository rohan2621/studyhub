import { apiClient } from './client';
import type { AccessToken, TokenStatusResponse } from '../types/api.types';

export const tokenApi = {
  getStatus: async (): Promise<TokenStatusResponse> => {
    const { data } = await apiClient.get<TokenStatusResponse>('/tokens/me');
    return data;
  },

  activate: async (code?: string): Promise<AccessToken> => {
    const { data } = await apiClient.post<AccessToken>('/tokens/activate', code ? { code } : {});
    return data;
  },

  redeem: async (code: string): Promise<AccessToken> => {
    const { data } = await apiClient.post<AccessToken>('/tokens/redeem', { code });
    return data;
  },
};
