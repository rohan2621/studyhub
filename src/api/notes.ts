import { apiClient } from './client';
import type { Note, PaginatedResponse } from '../types/api.types';

export interface NotesFilter {
  type?:    'note' | 'topper_note';
  subject?: string;
  chapter?: string;
  sort?:    'newest' | 'upvotes' | 'downloaded';
  cursor?:  string;
  limit?:   number;
}

export const notesApi = {
  list: async (filters: NotesFilter = {}): Promise<PaginatedResponse<Note>> => {
    const { data } = await apiClient.get<PaginatedResponse<Note>>('/notes', { params: filters });
    return data;
  },

  getById: async (id: string): Promise<Note> => {
    const { data } = await apiClient.get<Note>(`/notes/${id}`);
    return data;
  },

  upvote: async (id: string): Promise<void> => {
    await apiClient.post(`/notes/${id}/upvote`);
  },

  bookmark: async (id: string): Promise<void> => {
    await apiClient.post(`/notes/${id}/bookmark`);
  },

  unbookmark: async (id: string): Promise<void> => {
    await apiClient.delete(`/notes/${id}/bookmark`);
  },
};
