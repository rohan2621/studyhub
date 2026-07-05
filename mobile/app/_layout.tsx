import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import { getOrCreateDeviceId } from "../lib/storage";
import { LoadingIntro } from "../components/ui/LoadingIntro";

import * as ScreenCapture from "expo-screen-capture";


const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

export default function RootLayout() {
  const loadStoredAuth = useAuthStore((s) => s.loadStoredAuth);
  const load = useThemeStore((s) => s.load);
  const syncSystemTheme = useThemeStore((s) => s.syncSystemTheme);
  const isDark = useThemeStore((s) => s.isDark);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [introVisible, setIntroVisible] = useState(true);
  const [introMounted, setIntroMounted] = useState(true);

  useEffect(() => {
    loadStoredAuth();
    getOrCreateDeviceId();
    load();
    syncSystemTheme();
    ScreenCapture.preventScreenCaptureAsync().catch(console.error);


  }, []);

  useEffect(() => {
    if (!isLoading) {
      setIntroVisible(false);
    }
  }, [isLoading]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="device-mismatch" />
        </Stack>
        <Toast />
        
        {introMounted && (
          <LoadingIntro
            visible={introVisible}
            onFinished={() => setIntroMounted(false)}
          />
        )}
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}