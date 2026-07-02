import { Stack } from "expo-router";
import { useThemeStore } from "../../stores/themeStore";

export default function AdminLayout() {
  const { colors } = useThemeStore();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: "slide_from_right" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="users" />
      <Stack.Screen name="tokens" />
      <Stack.Screen name="schools" />
      <Stack.Screen name="audit-logs" />
      <Stack.Screen name="custom-requests" />
      <Stack.Screen name="announcements" />
      <Stack.Screen name="content" />
    </Stack>
  );
}