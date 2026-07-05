export const LightColors = {
  background: "#ffffff",
  backgroundGrad: ["#ffffff", "#ffffff", "#ffffff"] as string[],
  surface: "#ffffff",
  card: "#ffffff",
  inputBg: "#ffffff",
  primary: "#000000",
  primaryGrad: ["#000000", "#000000"] as string[],
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
};

export const DarkColors: ColorScheme = {
  background: "#000000",
  backgroundGrad: ["#000000", "#000000", "#000000"] as string[],
  surface: "#000000",
  card: "#000000",
  inputBg: "#000000",
  primary: "#ffffff",
  primaryGrad: ["#ffffff", "#ffffff"] as string[],
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
};

export type ColorScheme = typeof LightColors;
export const Colors = LightColors;