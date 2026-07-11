// F4 fix: Declare the type first so both LightColors and DarkColors share
// the same explicit annotation, preventing silent structural mismatches.
export type ColorScheme = {
  background: string;
  backgroundGrad: string[];
  surface: string;
  card: string;
  inputBg: string;
  primary: string;
  primaryGrad: string[];
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  muted: string;
  border: string;
  text: string;
  textMuted: string;
  shadow: string;
  error: string;
};

export const LightColors: ColorScheme = {
  background: "#ffffff",
  backgroundGrad: ["#ffffff", "#ffffff", "#ffffff"],
  surface: "#ffffff",
  card: "#ffffff",
  inputBg: "#ffffff",
  primary: "#000000",
  primaryGrad: ["#000000", "#000000"],
  secondary: "#f3f4f6",
  accent: "#000000",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  muted: "#6b7280",
  border: "#e5e7eb",
  text: "#000000",
  textMuted: "#4b5563",
  shadow: "#000000",
  error: "#ef4444",
};

export const DarkColors: ColorScheme = {
  background: "#000000",
  backgroundGrad: ["#000000", "#000000", "#000000"],
  surface: "#000000",
  card: "#000000",
  inputBg: "#000000",
  primary: "#ffffff",
  primaryGrad: ["#ffffff", "#ffffff"],
  secondary: "#1f2937",
  accent: "#ffffff",
  success: "#34d399",
  warning: "#fbbf24",
  danger: "#f87171",
  muted: "#9ca3af",
  border: "#374151",
  text: "#ffffff",
  textMuted: "#d1d5db",
  shadow: "#ffffff",
  error: "#f87171",
};

export const Colors = LightColors;