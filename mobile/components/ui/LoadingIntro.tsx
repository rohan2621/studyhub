import React, { useEffect } from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
  withRepeat, withSequence, withDelay, Easing, runOnJS,
  interpolate, interpolateColor,
} from "react-native-reanimated";
import { StudyHubBrand } from "./StudyHubBrand";
import { useThemeStore } from "../../stores/themeStore";

const { width: W } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onFinished?: () => void;
}

export function LoadingIntro({ visible, onFinished }: Props) {
  const { colors, isDark } = useThemeStore();
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.85);

  // Logo entrance
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.7);

  // Progress bar
  const progress = useSharedValue(0);

  // Tagline
  const tagOpacity = useSharedValue(0);

  // Glow pulse
  const glowPulse = useSharedValue(0);

  useEffect(() => {
    // Staggered entrance
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) }));
    logoScale.value = withDelay(200, withTiming(1, { duration: 700, easing: Easing.out(Easing.back(1.2)) }));
    scale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });

    // Progress bar fills up
    progress.value = withDelay(400, withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }));

    // Tagline fades in
    tagOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));

    // Glow pulse
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (!visible) {
      opacity.value = withTiming(0, { duration: 500, easing: Easing.in(Easing.ease) }, (isFinished) => {
        if (isFinished && onFinished) {
          runOnJS(onFinished)();
        }
      });
      scale.value = withTiming(1.1, { duration: 500, easing: Easing.in(Easing.ease) });
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progress.value, [0, 1], [0, 100])}%` as any,
  }));

  const tagStyle = useAnimatedStyle(() => ({
    opacity: tagOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0, 1], [0.15, 0.4]),
    transform: [{ scale: interpolate(glowPulse.value, [0, 1], [0.9, 1.1]) }],
  }));

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[StyleSheet.absoluteFillObject, { zIndex: 9999 }, containerStyle]}
    >
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        {/* Glow circle behind logo */}
        <Animated.View
          style={[{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: 0,
            backgroundColor: colors.primary,
          }, glowStyle]}
        />

        <View style={{ alignItems: "center", justifyContent: "center" }}>
          {/* Logo */}
          <Animated.View style={[{ marginBottom: 32 }, logoStyle]}>
            <StudyHubBrand size="lg" showTagline={false} />
          </Animated.View>

          {/* Progress bar */}
          <View style={{
            width: W * 0.5,
            height: 4,
            borderRadius: 0,
            backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}>
            <Animated.View style={[{
              height: "100%",
              borderRadius: 0,
            }, progressBarStyle]}>
              <View
                style={{ flex: 1, borderRadius: 0, }}
              />
            </Animated.View>
          </View>

          {/* Tagline */}
          <Animated.View style={tagStyle}>
            <Text style={{
              color: colors.textMuted,
              fontSize: 13,
              fontWeight: "600",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginTop: 28,
              textAlign: "center",
            }}>
              Learn · Organize · Achieve
            </Text>
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}
