import { Image } from "react-native";
import { useThemeStore } from "../../stores/themeStore";

export function StudyHubLogo({ size = 180 }) {
  const { isDark } = useThemeStore();
  
  return (
    <Image
      source={require("../../assets/icon.png")}
      style={{
        width: size,
        height: size,
        resizeMode: "contain",
        borderRadius: size / 4,
      }}
    />
  );
}