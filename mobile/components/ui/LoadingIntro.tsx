import React, { useEffect } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
  withRepeat, withSequence, Easing, runOnJS
} from "react-native-reanimated";
import { StudyHubBrand } from "./StudyHubBrand";
import { useThemeStore } from "../../stores/themeStore";
import { BackgroundArt } from "./BackgroundArt";

interface Props {
  visible: boolean;
  onFinished?: () => void;
}

export function LoadingIntro({ visible, onFinished }: Props) {
  const { colors } = useThemeStore();
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.9);

  // pulse logo
  const logoPulse = useSharedValue(1);

  useEffect(() => {
    logoPulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (!visible) {
      // Fade out exit transition
      opacity.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }, (isFinished) => {
        if (isFinished && onFinished) {
          runOnJS(onFinished)();
        }
      });
      scale.value = withTiming(1.08, { duration: 600, easing: Easing.out(Easing.ease) });
    } else {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.back()) });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoPulse.value }],
  }));

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[StyleSheet.absoluteFillObject, { zIndex: 9999 }, animatedStyle]}
    >
      <LinearGradient
        colors={colors.backgroundGrad as any}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BackgroundArt />

        <View style={{ alignItems: "center", justifyContent: "center" }}>
          {/* Logo container */}
          <Animated.View style={[{ marginBottom: 28 }, logoStyle]}>
            <StudyHubBrand size="lg" showTagline={false} />
          </Animated.View>

          {/* Spinner */}
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 12 }} />

          {/* Slogan */}
          <Text style={{
            color: colors.textMuted,
            fontSize: 12,
            fontWeight: "600",
            letterSpacing: 2,
            textTransform: "uppercase",
            marginTop: 24,
            opacity: 0.8,
            textAlign: "center",
            paddingHorizontal: 20
          }}>
            Your E-Learning Universe
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}
