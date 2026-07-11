import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  theme:               'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  setTheme:            (t: 'light' | 'dark' | 'system') => void;
  setNotifications:    (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme:                'system',
      notificationsEnabled: true,
      setTheme:             (t) => set({ theme: t }),
      setNotifications:     (v) => set({ notificationsEnabled: v }),
    }),
    {
      name:    'settings-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
