import { Appearance } from "react-native";
import { create } from "zustand";
import { storage } from "../lib/storage";
import { DarkColors, LightColors, type ColorScheme } from "../constants/Colors";

type ThemeMode = "system" | "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  colors: ColorScheme;
  load: () => Promise<void>;
  toggle: () => Promise<void>;
  setTheme: (mode: ThemeMode) => Promise<void>;
  syncSystemTheme: () => void;
}

const getSystemDark = () => true;
const getTheme = (mode: ThemeMode) => {
  return { isDark: true, colors: DarkColors };
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "system",
  ...getTheme("system"),

  load: async () => {
    const saved = (await storage.get("theme")) as ThemeMode | null;
    const mode = saved ?? "system";
    set({ mode, ...getTheme(mode) });
  },

  toggle: async () => {
    const next: ThemeMode = get().isDark ? "light" : "dark";
    await storage.set("theme", next);
    set({ mode: next, ...getTheme(next) });
  },

  setTheme: async (mode) => {
    await storage.set("theme", mode);
    set({ mode, ...getTheme(mode) });
  },

  syncSystemTheme: () => {
    Appearance.addChangeListener(() => {
      if (get().mode === "system") set(getTheme("system"));
    });
  },
}));