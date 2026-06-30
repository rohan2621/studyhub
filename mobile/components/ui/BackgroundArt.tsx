import { View, Dimensions } from "react-native";
import Svg, { Path, Circle, Ellipse } from "react-native-svg";
import { useMemo } from "react";
import { useThemeStore } from "../../stores/themeStore";

const { width: W, height: H } = Dimensions.get("window");

function Stars() {
  const stars = useMemo(
    () => Array.from({ length: 22 }).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.5,
      r: Math.random() > 0.8 ? 2 : 1.2,
      o: Math.random() * 0.5 + 0.35,
    })), []
  );
  return (
    <Svg width={W} height={H * 0.5} style={{ position: "absolute", top: 0, left: 0 }}>
      {stars.map((s, i) => (
        <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.o} />
      ))}
    </Svg>
  );
}

function Moon({ color }: { color: string }) {
  return (
    <Svg width={44} height={44} viewBox="0 0 40 40" style={{ position: "absolute", top: 56, left: 24 }}>
      <Path d="M28 4 A16 16 0 1 0 28 36 A12 12 0 1 1 28 4 Z" fill={color} opacity={0.9} />
    </Svg>
  );
}

export function BackgroundArt() {
  const { colors, isDark } = useThemeStore();

  const farFill = isDark ? colors.card : colors.border;
  const nearFill = isDark ? colors.surface : colors.inputBg;
  const riverFill = isDark ? colors.primary : "#ffffff";
  const treeFill = isDark ? colors.background : colors.muted;

  return (
    <>
      {isDark && <Stars />}
      {isDark && <Moon color={colors.secondary} />}
      <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H * 0.32, overflow: "hidden" }}>
        <Svg width={W} height={H * 0.32} viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">
          {isDark && <Ellipse cx="200" cy="210" rx="160" ry="90" fill={colors.secondary} opacity={0.15} />}
          <Path d="M0 190 L60 140 L130 180 L200 130 L270 180 L340 145 L400 190 V300 H0 Z" fill={farFill} opacity={isDark ? 0.6 : 1} />
          <Path d="M0 220 L90 170 L160 210 L200 185 L240 210 L310 175 L400 220 V300 H0 Z" fill={nearFill} opacity={isDark ? 0.9 : 1} />
          <Path d="M200 188 C190 210, 213 224, 196 246 C182 264, 210 274, 192 296 L213 296 C228 270, 203 262, 217 244 C231 226, 212 216, 222 191 Z" fill={riverFill} opacity={isDark ? 0.45 : 0.85} />
          {[[14,286,0.85],[38,296,1],[330,290,0.9],[358,298,1.05],[110,298,0.55],[285,296,0.55]].map(([x,y,s],i) => (
            <Path key={i} transform={`translate(${x},${y}) scale(${s})`} d="M0,-32 L-11,0 L11,0 Z M0,-22 L-9,3 L9,3 Z M0,-12 L-6,5 L6,5 Z" fill={treeFill} opacity={isDark ? 1 : 0.6} />
          ))}
          {!isDark && (
            <>
              <Ellipse cx="55" cy="34" rx="34" ry="14" fill="#ffffff" opacity={0.9} />
              <Ellipse cx="86" cy="42" rx="22" ry="10" fill="#ffffff" opacity={0.9} />
              <Ellipse cx="330" cy="50" rx="28" ry="12" fill="#ffffff" opacity={0.85} />
            </>
          )}
        </Svg>
      </View>
    </>
  );
}