import { apiClient } from './client';
import type { CustomRequest, CustomRequestType } from '../types/api.types';

export interface CreateRequestPayload {
  type:    CustomRequestType;
  subject: string;
  chapter: string;
  note:    string;
}

export const requestApi = {
  create: async (payload: CreateRequestPayload): Promise<CustomRequest> => {
    const { data } = await apiClient.post<CustomRequest>('/custom-requests', payload);
    return data;
  },

  myRequests: async (): Promise<CustomRequest[]> => {
    const { data } = await apiClient.get<CustomRequest[]>('/custom-requests/me');
    return data;
  },
};
