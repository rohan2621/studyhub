export const DarkColors = {
  background: "#080811",
  backgroundGrad: ["#080811", "#120822", "#081020"] as string[],
  surface: "#101020",
  card: "#17172e",
  inputBg: "#0d0d1b",
  primary: "#7c3aed",
  primaryGrad: ["#7c3aed", "#a855f7"] as string[],
  secondary: "#a855f7",
  accent: "#06b6d4",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  muted: "#3c3c58",
  border: "#23233c",
  text: "#ffffff",
  textMuted: "#9ca3af",
  shadow: "#7c3aed",
};

export const LightColors = {
  background: "#f8fafc",
  backgroundGrad: ["#f1f5f9", "#f5f3ff", "#eff6ff"] as string[],
  surface: "#ffffff",
  card: "#ffffff",
  inputBg: "#f1f5f9",
  primary: "#6366f1",
  primaryGrad: ["#6366f1", "#8b5cf6"] as string[],
  secondary: "#8b5cf6",
  accent: "#06b6d4",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  muted: "#94a3b8",
  border: "#e2e8f0",
  text: "#0f172a",
  textMuted: "#475569",
  shadow: "#6366f1",
};

export type ColorScheme = typeof DarkColors;
export const Colors = DarkColors;