import { Redirect } from "expo-router";
import { View } from "react-native";
import Animated, {
  FadeIn, useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, Easing,
} from "react-native-reanimated";
import { Loader2 } from "lucide-react-native";
import { useEffect } from "react";
import { useAuthStore, isAdminUser } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import { StudyHubBrand } from "../components/ui/StudyHubBrand";
import { BackgroundArt } from "../components/ui/BackgroundArt";

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const { colors } = useThemeStore();
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 900, easing: Easing.linear }),
      -1
    );
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  if (isLoading) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
        <BackgroundArt />
        <Animated.View entering={FadeIn.duration(400)} style={{ alignItems: "center", gap: 24 }}>
          <StudyHubBrand size="lg" showTagline />
          <Animated.View style={spinStyle}>
            <Loader2 size={28} color={colors.primary} />
          </Animated.View>
        </Animated.View>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Route admin users to the admin panel; everyone else goes to the student tabs
  if (isAdminUser(user)) {
    return <Redirect href="/(admin)" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
