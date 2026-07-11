import { apiClient } from './client';
import type { Homework, Submission, PaginatedResponse } from '../types/api.types';

export type HomeworkTab = 'upcoming' | 'submitted' | 'completed' | 'overdue';

export const homeworkApi = {
  list: async (tab: HomeworkTab = 'upcoming', cursor?: string): Promise<PaginatedResponse<Homework>> => {
    const { data } = await apiClient.get<PaginatedResponse<Homework>>('/homework', {
      params: { tab, cursor, limit: 20 },
    });
    return data;
  },

  getById: async (id: string): Promise<Homework> => {
    const { data } = await apiClient.get<Homework>(`/homework/${id}`);
    return data;
  },

  submit: async (homeworkId: string, formData: FormData): Promise<Submission> => {
    const { data } = await apiClient.post<Submission>(
      `/homework/${homeworkId}/submit`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },

  mySubmission: async (homeworkId: string): Promise<Submission | null> => {
    try {
      const { data } = await apiClient.get<Submission>(`/homework/${homeworkId}/submission`);
      return data;
    } catch {
      return null;
    }
  },
};
