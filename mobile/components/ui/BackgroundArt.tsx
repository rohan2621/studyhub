import { View, Dimensions } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useMemo } from "react";
import { useThemeStore } from "../../stores/themeStore";

const { width: W, height: H } = Dimensions.get("window");

// Pre-generate a static list of stars
const STARS = Array.from({ length: 60 }).map((_, i) => ({
  cx: Math.random() * W,
  cy: Math.random() * H,
  r: Math.random() * 1.5 + 0.5,
  opacity: Math.random() * 0.5 + 0.3,
  key: i
}));

export function BackgroundArt() {
  const { isDark } = useThemeStore();

  if (!isDark) return null;

  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      <Svg width={W} height={H}>
        {STARS.map((star) => (
          <Circle
            key={star.key}
            cx={star.cx}
            cy={star.cy}
            r={star.r}
            fill="#ffffff"
            opacity={star.opacity}
          />
        ))}
      </Svg>
    </View>
  );
}