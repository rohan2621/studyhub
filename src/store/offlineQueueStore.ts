import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OfflineItem {
  id:        string;
  type:      'homework_upload' | 'discussion_thread' | 'discussion_reply' | 'custom_request' | 'bookmark';
  payload:   Record<string, unknown>;
  createdAt: string;
  retries:   number;
}

interface OfflineQueueState {
  isOffline: boolean;
  queue:     OfflineItem[];
  setOffline:  (v: boolean) => void;
  enqueue:     (item: Omit<OfflineItem, 'createdAt' | 'retries'>) => void;
  dequeue:     (id: string) => void;
  incrementRetry: (id: string) => void;
  clear:       () => void;
}

export const useOfflineQueueStore = create<OfflineQueueState>()(
  persist(
    (set) => ({
      isOffline: false,
      queue:     [],

      setOffline: (v) => set({ isOffline: v }),

      enqueue: (item) =>
        set((s) => ({
          queue: [
            ...s.queue,
            { ...item, createdAt: new Date().toISOString(), retries: 0 },
          ],
        })),

      dequeue: (id) =>
        set((s) => ({ queue: s.queue.filter((i) => i.id !== id) })),

      incrementRetry: (id) =>
        set((s) => ({
          queue: s.queue.map((i) =>
            i.id === id ? { ...i, retries: i.retries + 1 } : i
          ),
        })),

      clear: () => set({ queue: [] }),
    }),
    {
      name:    'offline-queue',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
