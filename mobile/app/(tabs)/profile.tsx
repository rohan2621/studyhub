import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { format } from "date-fns";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  CheckCircle2, AlertTriangle, Ticket, School, Bell, Search,
  Calendar, FileStack, LogOut, ChevronRight, Settings,
} from "lucide-react-native";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { GradientButton } from "../../components/ui/GradientButton";
import { StudyHubBrand } from "../../components/ui/StudyHubBrand";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { colors } = useThemeStore();

  const { data: tokenStatus, isLoading } = useQuery({
    queryKey: ["tokenStatus"],
    queryFn: async () => (await api.get("/tokens/me")).data,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get("/profile")).data,
  });

  if (isLoading) {
    return (
      <LinearGradient colors={colors.backgroundGrad} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </LinearGradient>
    );
  }

  const actions = [
    { icon: Bell, label: "Notifications", route: "/(tabs)/notifications" },
    { icon: Search, label: "Search Content", route: "/(tabs)/search" },
    { icon: Calendar, label: "Timetable", route: "/(tabs)/timetable" },
    { icon: FileStack, label: "Past Papers", route: "/(tabs)/past-papers" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={colors.backgroundGrad} style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 32 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Animated.View entering={FadeInDown.springify().damping(14)} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <Text style={{ color: colors.text, fontSize: 26, fontWeight: "800" }}>Profile</Text>
            <ThemeToggle />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).springify().damping(14)} style={{ alignItems: "center", marginBottom: 16 }}>
            <StudyHubBrand size="md" showTagline={false} />
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800", marginTop: 12 }}>{user?.name}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 4 }}>{user?.email}</Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <View style={{ backgroundColor: colors.primary + "20", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: colors.primary + "40" }}>
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" }}>{user?.role}</Text>
              </View>
              <View style={{ backgroundColor: colors.accent + "20", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: colors.accent + "40" }}>
                <Text style={{ color: colors.accent, fontSize: 12, fontWeight: "700" }}>Grade {user?.grade}</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>

        <View style={{ padding: 20, gap: 16 }}>
          <Animated.View entering={FadeInDown.delay(150)} style={{ backgroundColor: colors.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Ticket size={18} color={colors.text} />
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: "800" }}>Access Token</Text>
            </View>
            {tokenStatus?.hasActiveToken ? (
              <View>
                {[
                  ["Plan", tokenStatus.plan],
                  ["Expires", format(new Date(tokenStatus.expiresAt), "MMM dd, yyyy")],
                  ["Days Left", `${tokenStatus.daysLeft} days`],
                ].map(([label, value]) => (
                  <View key={label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Text style={{ color: colors.textMuted, fontSize: 14 }}>{label}</Text>
                    <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14 }}>{value}</Text>
                  </View>
                ))}
                <View style={{
                  backgroundColor: colors.success + "18", borderRadius: 14, padding: 14,
                  alignItems: "center", marginTop: 16, borderWidth: 1, borderColor: colors.success + "40",
                  flexDirection: "row", justifyContent: "center", gap: 8,
                }}>
                  <CheckCircle2 size={18} color={colors.success} />
                  <Text style={{ color: colors.success, fontWeight: "800", fontSize: 15 }}>Active & Connected</Text>
                </View>
              </View>
            ) : (
              <View>
                <View style={{
                  backgroundColor: colors.warning + "18", borderRadius: 14, padding: 16,
                  alignItems: "center", marginBottom: 16, borderWidth: 1, borderColor: colors.warning + "40",
                }}>
                  <AlertTriangle size={30} color={colors.warning} style={{ marginBottom: 8 }} />
                  <Text style={{ color: colors.warning, fontWeight: "700", fontSize: 15 }}>No Active Token</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: "center", marginTop: 4 }}>Contact us to unlock full access</Text>
                </View>
                <GradientButton title="Contact Us" icon={<ChevronRight size={18} color="#fff" />} onPress={() => {}} />
              </View>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)} style={{ backgroundColor: colors.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <School size={18} color={colors.text} />
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: "800" }}>School Info</Text>
            </View>
            {[
              ["School", profile?.school?.name ?? user?.school ?? "—"],
              ["City", profile?.school?.city ?? "—"],
              ["Grade", user?.grade ?? "—"],
            ].map(([label, value]) => (
              <View key={label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ color: colors.textMuted, fontSize: 14 }}>{label}</Text>
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14, flex: 1, textAlign: "right" }}>{value}</Text>
              </View>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(250)} style={{ backgroundColor: colors.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.border, gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Settings size={18} color={colors.text} />
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: "800" }}>Account</Text>
            </View>
            {actions.map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => router.push(item.route as any)}
                style={{ flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, backgroundColor: colors.inputBg, marginBottom: 8 }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary + "18", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
                  <item.icon size={18} color={colors.primary} />
                </View>
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15, flex: 1 }}>{item.label}</Text>
                <ChevronRight size={18} color={colors.muted} />
              </TouchableOpacity>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)}>
            <TouchableOpacity
              onPress={async () => { await logout(); router.replace("/(auth)/login"); }}
              style={{
                backgroundColor: colors.danger + "18",
                borderRadius: 20, padding: 18,
                alignItems: "center", borderWidth: 1.5,
                borderColor: colors.danger + "40",
                marginBottom: 40,
                flexDirection: "row", justifyContent: "center", gap: 10,
              }}
            >
              <LogOut size={20} color={colors.danger} />
              <Text style={{ color: colors.danger, fontWeight: "800", fontSize: 16 }}>Sign Out</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}