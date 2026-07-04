import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Platform, Modal, DeviceEventEmitter } from "react-native";
import { Tabs } from "expo-router";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Lock, ChevronRight } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useThemeStore } from "../../stores/themeStore";
import { useAuthStore } from "../../stores/authStore";
import { api } from "../../lib/api";

function CustomTabBar({ state, descriptors, navigation, colors }: any) {
  const { isDark } = useThemeStore();
  // Sort and filter for the 4 main visible routes to guarantee perfect layout order
  const visibleRoutes = ["home", "search", "content", "profile"];
  const routes = state.routes
    .filter((r: any) => visibleRoutes.includes(r.name))
    .sort((a: any, b: any) => visibleRoutes.indexOf(a.name) - visibleRoutes.indexOf(b.name));

  const BAR_BG = isDark ? "rgba(8, 8, 17, 0.92)" : "rgba(255, 255, 255, 0.92)";

  return (
    <View style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: BAR_BG,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      height: Platform.OS === "ios" ? 78 : 60,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 0, // Set to 0 to ensure mathematically even tab distribution
      borderTopWidth: 1,
      borderTopColor: colors.border,
      shadowColor: colors.primary, // Glowing shadow matching the primary theme color
      shadowOpacity: 0.12,
      shadowRadius: 15,
      shadowOffset: { width: 0, height: -4 },
      elevation: 8,
    }}>
      {routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === state.routes.findIndex((r: any) => r.key === route.key);

        const label =
          route.name === "content"
            ? "Content"
            : options.title !== undefined
              ? options.title
              : route.name;

        const { user } = useAuthStore();
        const isAdmin = Number(user?.role) === 3 || user?.role === "Admin";
        const { data: tokenStatus } = useQuery<any>({ queryKey: ["tokenStatus"], enabled: !!user });

        const onPress = () => {
          if (!isAdmin && tokenStatus !== undefined && tokenStatus?.hasActiveToken === false && route.name !== "home" && route.name !== "profile") {
            DeviceEventEmitter.emit("SHOW_LOCK_MODAL");
            return;
          }

          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const getIcon = (focused: boolean, color: string) => {
          let name = "home-outline";
          if (route.name === "home") name = focused ? "home" : "home-outline";
          else if (route.name === "search") name = focused ? "search" : "search-outline";
          else if (route.name === "content") name = focused ? "book" : "book-outline";
          else if (route.name === "profile") name = focused ? "person" : "person-outline";

          return <Ionicons name={name as any} size={18} color={color} />;
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            activeOpacity={0.85}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "flex-end",
              paddingBottom: Platform.OS === "ios" ? 18 : 8,
              height: "100%",
              position: "relative",
            }}
          >
            {isFocused ? (
              <>
                {/* Elevated Circle overlapping top, explicitly centered horizontally */}
                <View style={{
                  position: "absolute",
                  top: -15, // Lowers the circle slightly to sit naturally for height 48
                  left: "50%",
                  marginLeft: -24, // Exactly half of the width (48) to center it perfectly
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: isDark ? "#080811" : "#ffffff", // Solid background to cover the bar's top border line
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.border, // Seamless curved border extension
                  shadowColor: colors.primary,
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 6,
                }}>
                  <View style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: colors.primary + "18", // Translucent glow background inside circle
                    justifyContent: "center",
                    alignItems: "center",
                  }}>
                    {getIcon(true, colors.primary)}
                  </View>
                </View>
                {/* Label Text at Bottom */}
                <Text style={{
                  color: colors.primary,
                  fontSize: 10,
                  fontWeight: "800",
                  letterSpacing: -0.2,
                }}>
                  {label}
                </Text>
              </>
            ) : (
              <>
                {getIcon(false, isDark ? "#7e7d9c" : "#64748b")}
                <Text style={{
                  color: isDark ? "#7e7d9c" : "#64748b",
                  fontSize: 10,
                  fontWeight: "600",
                  marginTop: 3,
                  letterSpacing: -0.2,
                }}>
                  {label}
                </Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useThemeStore();
  const { user } = useAuthStore();
  const isAdmin = Number(user?.role) === 3 || user?.role === "Admin";
  const [showLockModal, setShowLockModal] = useState(false);

  const { data: tokenStatus } = useQuery({
    queryKey: ["tokenStatus"],
    queryFn: async () => {
      try {
        return (await api.get("/tokens/me")).data;
      } catch (e: any) {
        if (e.response?.status === 402) return { hasActiveToken: false };
        throw e;
      }
    },
    retry: false,
    staleTime: 30_000,
  });

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("SHOW_LOCK_MODAL", () => {
      setShowLockModal(true);
    });
    return () => sub.remove();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} colors={colors} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="home" options={{ title: "Home" }} />
        <Tabs.Screen name="search" options={{ title: "Search" }} />
        <Tabs.Screen name="content" options={{ title: "Content" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />

        {/* hidden routes */}
        <Tabs.Screen name="notes" options={{ href: null }} />
        <Tabs.Screen name="homework" options={{ href: null }} />
        <Tabs.Screen name="discussions" options={{ href: null }} />
        <Tabs.Screen name="notifications" options={{ href: null }} />
        <Tabs.Screen name="past-papers" options={{ href: null }} />
        <Tabs.Screen name="timetable" options={{ href: null }} />
        <Tabs.Screen name="announcements" options={{ href: null }} />
        <Tabs.Screen name="activate-token" options={{ href: null }} />
      </Tabs>

      {/* ── Security Lock Modal ─────────────────────────────── */}
      <Modal
        visible={showLockModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLockModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: "rgba(11, 27, 48, 0.85)", // rich semi-transparent obsidian
          justifyContent: "center",
          alignItems: "center",
          padding: 24
        }}>
          {/* Glass Card */}
          <View style={{
            width: "100%",
            backgroundColor: colors.card,
            borderRadius: 28,
            padding: 28,
            borderWidth: 1.5,
            borderColor: colors.border,
            alignItems: "center",
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10
          }}>
            {/* Glowing Icon Wrapper */}
            <View style={{
              width: 72,
              height: 72,
              borderRadius: 24,
              backgroundColor: colors.primary + "18",
              borderWidth: 1.5,
              borderColor: colors.primary + "30",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20
            }}>
              <Lock size={32} color={colors.primary} strokeWidth={2} />
            </View>

            <Text style={{
              color: colors.text,
              fontSize: 20,
              fontWeight: "900",
              textAlign: "center",
              marginBottom: 10,
              letterSpacing: -0.5
            }}>
              Access Locked
            </Text>

            <Text style={{
              color: colors.textMuted,
              fontSize: 14,
              textAlign: "center",
              lineHeight: 21,
              marginBottom: 28,
              paddingHorizontal: 10
            }}>
              An active subscription token is required to unlock this feature. Please go to the activation tab to input your token code.
            </Text>

            {/* Buttons */}
            <TouchableOpacity
              onPress={() => {
                setShowLockModal(false);
                router.push("/(tabs)/profile" as any);
              }}
              style={{
                width: "100%",
                backgroundColor: colors.primary,
                borderRadius: 18,
                padding: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
                marginBottom: 12
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
                Activate Token
              </Text>
              <ChevronRight size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowLockModal(false)}
              style={{
                width: "100%",
                borderWidth: 1.5,
                borderColor: colors.border,
                borderRadius: 18,
                padding: 16,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text style={{ color: colors.textMuted, fontWeight: "700", fontSize: 15 }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}