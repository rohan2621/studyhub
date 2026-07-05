import { create } from "zustand";

interface ThemeStore {
  theme: "light";
  applyTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()((set, get) => ({
  theme: "light" as const,
  applyTheme: () => {
    if (typeof window === "undefined") return;
    // Always force light mode — remove any dark class
    window.document.documentElement.classList.remove("dark");
  },
}));
