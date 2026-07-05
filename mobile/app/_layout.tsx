import { useEffect, useState, useMemo } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import { getOrCreateDeviceId } from "../lib/storage";
import { LoadingIntro } from "../components/ui/LoadingIntro";
import { useAppUpdate } from "../hooks/useAppUpdate";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { WifiOff } from "lucide-react-native";

import * as ScreenCapture from "expo-screen-capture";
import { Appearance } from "react-native";
import { ThemeProvider, DefaultTheme, DarkTheme } from "@react-navigation/native";

const queryClient = new QueryClient({
  defaultOptions: { 
    queries: { 
      retry: 1, 
      staleTime: 30000,
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days cache limit
    } 
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

export default function RootLayout() {
  const loadStoredAuth = useAuthStore((s) => s.loadStoredAuth);
  const load = useThemeStore((s) => s.load);
  const syncSystemTheme = useThemeStore((s) => s.syncSystemTheme);
  const isDark = useThemeStore((s) => s.isDark);
  const colors = useThemeStore((s) => s.colors);
  const isLoading = useAuthStore((s) => s.isLoading);

  const { updateAvailable, downloadUpdate, dismissUpdate } = useAppUpdate();
  const { isOffline } = useNetworkStatus();

  const [introVisible, setIntroVisible] = useState(true);
  const [introMounted, setIntroMounted] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    loadStoredAuth();
    getOrCreateDeviceId();
    load();
    syncSystemTheme();
    ScreenCapture.preventScreenCaptureAsync().catch(console.error);

    // Enforce a minimum 2.5 second loading time so the intro animation can play fully
    setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2500);
  }, []);

  useEffect(() => {
    if (!isLoading && minTimeElapsed) {
      setIntroVisible(false);
    }
  }, [isLoading, minTimeElapsed]);

  // Force the native OS appearance to match the user's selected theme in the app
  // This prevents native elements (like keyboard, alerts) from looking dark when the app is in light mode.
  useEffect(() => {
    Appearance.setColorScheme(isDark ? "dark" : "light");
  }, [isDark]);

  const navTheme = useMemo(() => ({
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
    },
  }), [isDark, colors.background]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: asyncStoragePersister }}>
        <ThemeProvider value={navTheme}>
          <StatusBar style={isDark ? "light" : "dark"} />
          
          {isOffline && (
            <View style={{ backgroundColor: '#EF4444', paddingTop: 40, paddingBottom: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <WifiOff size={16} color="white" />
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>Offline Mode - Showing Cached Data</Text>
            </View>
          )}

          <Stack screenOptions={{ headerShown: false, animation: "slide_from_right", contentStyle: { backgroundColor: colors.background } }}>
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

          {updateAvailable && (
            <Modal transparent animationType="fade" visible={true}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
                <View style={{ backgroundColor: colors.surface, borderRadius: 24, padding: 24, overflow: 'hidden' }}>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 8, fontFamily: 'Outfit_700Bold' }}>
                    Update Available!
                  </Text>
                  <Text style={{ fontSize: 15, color: colors.textSecondary, marginBottom: 16 }}>
                    Version {updateAvailable.versionName} is ready to install.
                  </Text>
                  
                  <View style={{ backgroundColor: colors.background, padding: 16, borderRadius: 12, marginBottom: 24, maxHeight: 150 }}>
                    <ScrollView>
                      <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>
                        {updateAvailable.releaseNotes}
                      </Text>
                    </ScrollView>
                  </View>

                  <TouchableOpacity
                    onPress={downloadUpdate}
                    style={{ backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center' }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                      Download Update
                    </Text>
                  </TouchableOpacity>

                  {!updateAvailable.isMandatory && (
                    <TouchableOpacity
                      onPress={dismissUpdate}
                      style={{ paddingVertical: 16, alignItems: 'center', marginTop: 8 }}
                    >
                      <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '600' }}>
                        Maybe Later
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Modal>
          )}
        </ThemeProvider>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}
