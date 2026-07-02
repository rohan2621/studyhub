import { useEffect } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Tabs } from "expo-router";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useThemeStore } from "../../stores/themeStore";
import { useAuthStore } from "../../stores/authStore";
import { api } from "../../lib/api";

function CustomTabBar({ state, descriptors, navigation, colors }: any) {
  // Sort and filter for the 4 main visible routes to guarantee perfect layout order
  const visibleRoutes = ["home", "search", "content", "profile"];
  const routes = state.routes
    .filter((r: any) => visibleRoutes.includes(r.name))
    .sort((a: any, b: any) => visibleRoutes.indexOf(a.name) - visibleRoutes.indexOf(b.name));

  const BAR_BG = "rgba(9, 9, 14, 0.92)"; // Sleek translucent dark background

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
      shadowColor: "#8b5cf6", // Glowing shadow matching the purple theme color
      shadowOpacity: 0.15,
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

        const onPress = () => {
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
                  backgroundColor: "#09090e", // Solid background to cover the bar's top border line
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.border, // Seamless curved border extension
                  shadowColor: "#8b5cf6",
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 6,
                }}>
                  <View style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: "#8b5cf620", // Translucent purple glow background inside circle
                    justifyContent: "center",
                    alignItems: "center",
                  }}>
                    {getIcon(true, "#8b5cf6")}
                  </View>
                </View>
                {/* Label Text at Bottom */}
                <Text style={{
                  color: "#8b5cf6",
                  fontSize: 10,
                  fontWeight: "800",
                  letterSpacing: -0.2,
                }}>
                  {label}
                </Text>
              </>
            ) : (
              <>
                {getIcon(false, "#7e7d9c")}
                <Text style={{
                  color: "#7e7d9c",
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
    if (isAdmin) return;
    if (tokenStatus !== undefined && tokenStatus?.hasActiveToken === false) {
      router.replace("/(tabs)/activate-token" as any);
    }
  }, [tokenStatus, isAdmin]);

  return (
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
  );
}