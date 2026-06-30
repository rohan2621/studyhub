export const DarkColors = {
  background: "#0a0a1a",
  backgroundGrad: ["#0a0a1a", "#1a0a2e", "#0a1a2e"] as string[],
  surface: "#16162a",
  card: "#1e1e38",
  inputBg: "#12122a",
  primary: "#6c63ff",
  primaryGrad: ["#6c63ff", "#a855f7"] as string[],
  secondary: "#a855f7",
  accent: "#06b6d4",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  muted: "#4a4a6a",
  border: "#2a2a4a",
  text: "#ffffff",
  textMuted: "#8888aa",
  shadow: "#6c63ff",
};

export const LightColors = {
  background: "#f0f0ff",
  backgroundGrad: ["#e8e8ff", "#f5f0ff", "#e8f5ff"] as string[],
  surface: "#ffffff",
  card: "#ffffff",
  inputBg: "#f5f5ff",
  primary: "#6c63ff",
  primaryGrad: ["#6c63ff", "#a855f7"] as string[],
  secondary: "#a855f7",
  accent: "#06b6d4",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  muted: "#9090b0",
  border: "#e0e0f0",
  text: "#1a1a2e",
  textMuted: "#606080",
  shadow: "#6c63ff",
};

export type ColorScheme = typeof DarkColors;
export const Colors = DarkColors;