import { useEffect } from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Animated, {
  FadeIn, FadeInDown, useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, Easing,
} from "react-native-reanimated";
import { ShieldAlert, LogOut, MessageCircle } from "lucide-react-native";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import { StudyHubBrand } from "../components/ui/StudyHubBrand";
import { GradientButton } from "../components/ui/GradientButton";
import { BackgroundArt } from "../components/ui/BackgroundArt";

export default function DeviceMismatchScreen() {
  const { logout } = useAuthStore();
  const { colors } = useThemeStore();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <LinearGradient colors={colors.backgroundGrad as any} style={{ flex: 1 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <BackgroundArt />

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
        <Animated.View entering={FadeInDown.springify().damping(14)} style={{ alignItems: "center", marginBottom: 28 }}>
          <StudyHubBrand size="lg" showTagline={false} />
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(150).duration(500)}
          style={[
            {
              width: 84, height: 84, borderRadius: 28,
              backgroundColor: colors.danger + "18",
              borderWidth: 1.5, borderColor: colors.danger + "40",
              justifyContent: "center", alignItems: "center",
              marginBottom: 22,
            },
            pulseStyle,
          ]}
        >
          <ShieldAlert size={38} color={colors.danger} strokeWidth={2} />
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(250).springify().damping(14)}
          style={{ fontSize: 22, fontWeight: "800", color: colors.text, textAlign: "center", marginBottom: 10 }}
        >
          Device Mismatch
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(320).springify().damping(14)}
          style={{ color: colors.textMuted, fontSize: 14, textAlign: "center", lineHeight: 21, marginBottom: 36 }}
        >
          Your token is active on another device. Contact us to reset your device binding.
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(400).springify().damping(14)} style={{ width: "100%" }}>
          <GradientButton
            title="Contact Support on WhatsApp"
            icon={<MessageCircle size={18} color="#fff" />}
            onPress={() => Linking.openURL("https://wa.me/9779800000000")}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(470).springify().damping(14)} style={{ width: "100%" }}>
          <TouchableOpacity
            onPress={async () => {
              await logout();
              router.replace("/(auth)/login");
            }}
            style={{
              marginTop: 12,
              borderWidth: 1.5,
              borderColor: colors.border,
              borderRadius: 18,
              padding: 16,
              width: "100%",
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <LogOut size={16} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontWeight: "700", fontSize: 15 }}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}
