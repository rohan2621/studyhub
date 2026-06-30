import { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { format } from "date-fns";
import Animated, {
  FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withSpring,
} from "react-native-reanimated";
import {
  CheckCircle2, AlertTriangle, Ticket, ChevronRight, FileText, Star,
  ClipboardList, FileStack, Calendar, MessageCircle, Flame, TrendingUp,
  Sparkles,
} from "lucide-react-native";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { StudyHubBrand } from "../../components/ui/StudyHubBrand";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function QuickAccessTile({ item, index, colors }: any) {
  const scale = useSharedValue(1);
  const Icon = item.icon;
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedTouchable
      entering={FadeInDown.delay(index * 60).springify().damping(14)}
      style={[
        { width: "30%", aspectRatio: 1, borderRadius: 20 },
        animatedStyle,
      ]}
      onPressIn={() => (scale.value = withSpring(0.94, { damping: 14 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 12 }))}
      onPress={() => router.push(item.route)}
      activeOpacity={0.9}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.card,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <LinearGradient
          colors={[item.color + "30", item.color + "10"]}
          style={{ width: 50, height: 50, borderRadius: 16, justifyContent: "center", alignItems: "center", marginBottom: 8 }}
        >
          <Icon size={24} color={item.color} strokeWidth={2.2} />
        </LinearGradient>
        <Text style={{ color: colors.text, fontSize: 11, fontWeight: "700" }}>{item.label}</Text>
      </View>
    </AnimatedTouchable>
  );
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { colors } = useThemeStore();

  const { data: feed, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["feed"],
    queryFn: async () => (await api.get("/feed")).data,
  });

  const { data: tokenStatus } = useQuery({
    queryKey: ["tokenStatus"],
    queryFn: async () => (await api.get("/tokens/me")).data,
  });

  const urgencyColor = (u: string) => ({ red: colors.danger, amber: colors.warning, green: colors.success }[u] ?? colors.muted);

  if (isLoading) {
    return (
      <LinearGradient colors={colors.backgroundGrad} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </LinearGradient>
    );
  }

  const quickAccess = [
    { icon: FileText, label: "Notes", color: "#6c63ff", route: "/(tabs)/notes" },
    { icon: Star, label: "Topper", color: "#a855f7", route: "/(tabs)/notes" },
    { icon: ClipboardList, label: "Homework", color: "#06b6d4", route: "/(tabs)/homework" },
    { icon: FileStack, label: "Papers", color: "#10b981", route: "/(tabs)/past-papers" },
    { icon: Calendar, label: "Timetable", color: "#f59e0b", route: "/(tabs)/timetable" },
    { icon: MessageCircle, label: "Discuss", color: "#ef4444", route: "/(tabs)/discussions" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <LinearGradient colors={colors.backgroundGrad} style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 28 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Animated.View entering={FadeInDown.springify().damping(14)} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <StudyHubBrand size="sm" showTagline={false} />
              <View>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>Good day,</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ color: colors.text, fontSize: 20, fontWeight: "900" }}>{user?.name?.split(" ")[0]}</Text>
                  <Sparkles size={16} color={colors.primary} />
                </View>
              </View>
            </View>
            <ThemeToggle />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
            {tokenStatus?.hasActiveToken ? (
              <View style={{
                backgroundColor: colors.success + "18", borderRadius: 18, padding: 16,
                borderWidth: 1, borderColor: colors.success + "40",
                flexDirection: "row", alignItems: "center", gap: 12,
              }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.success + "25", justifyContent: "center", alignItems: "center" }}>
                  <CheckCircle2 size={22} color={colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.success, fontWeight: "700", fontSize: 14 }}>{tokenStatus.plan} — Active</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{tokenStatus.daysLeft} days remaining</Text>
                </View>
                {tokenStatus.isExpiringSoon && (
                  <View style={{ backgroundColor: colors.warning + "25", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ color: colors.warning, fontSize: 11, fontWeight: "700" }}>Renew Soon</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={{
                backgroundColor: colors.warning + "18", borderRadius: 18, padding: 16,
                borderWidth: 1, borderColor: colors.warning + "40",
                flexDirection: "row", alignItems: "center", gap: 12,
              }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.warning + "25", justifyContent: "center", alignItems: "center" }}>
                  {tokenStatus?.hasPendingToken ? <Ticket size={20} color={colors.warning} /> : <AlertTriangle size={20} color={colors.warning} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.warning, fontWeight: "700", fontSize: 14 }}>
                    {tokenStatus?.hasPendingToken ? "Token Ready!" : "No Active Token"}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                    {tokenStatus?.hasPendingToken ? "Activate your token to get full access" : "Contact us to unlock full access"}
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.warning} />
              </View>
            )}
          </Animated.View>
        </LinearGradient>

        <View style={{ padding: 20 }}>
          <Animated.Text entering={FadeInDown.delay(150)} style={{ color: colors.text, fontSize: 18, fontWeight: "800", marginBottom: 16 }}>
            Quick Access
          </Animated.Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
            {quickAccess.map((item, i) => (
              <QuickAccessTile key={item.label} item={item} index={i} colors={colors} />
            ))}
          </View>

          {feed?.upcomingHomework?.length > 0 && (
            <Animated.View entering={FadeInDown.delay(200)} style={{ marginBottom: 28 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <ClipboardList size={18} color={colors.text} />
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}>Due Soon</Text>
              </View>
              {feed.upcomingHomework.slice(0, 3).map((hw: any, i: number) => (
                <Animated.View key={hw.id} entering={FadeInDown.delay(220 + i * 50)} style={{
                  backgroundColor: colors.card, borderRadius: 18, padding: 16,
                  marginBottom: 10, borderWidth: 1, borderColor: colors.border,
                  flexDirection: "row", justifyContent: "space-between", alignItems: "center",
                }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>{hw.title}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>{hw.subject}</Text>
                  </View>
                  <View style={{
                    backgroundColor: urgencyColor(hw.urgency) + "20", borderRadius: 12,
                    paddingHorizontal: 12, paddingVertical: 8,
                    borderWidth: 1, borderColor: urgencyColor(hw.urgency) + "44",
                  }}>
                    <Text style={{ color: urgencyColor(hw.urgency), fontSize: 12, fontWeight: "800" }}>
                      {hw.daysUntilDue === 0 ? "Today!" : `${hw.daysUntilDue}d`}
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {feed?.trendingNotes?.length > 0 && (
            <Animated.View entering={FadeInDown.delay(250)} style={{ marginBottom: 28 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Flame size={18} color={colors.warning} />
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}>Trending Notes</Text>
              </View>
              {feed.trendingNotes.slice(0, 3).map((note: any, i: number) => (
                <Animated.View key={note.id} entering={FadeInDown.delay(270 + i * 50)} style={{
                  backgroundColor: colors.card, borderRadius: 18, padding: 16,
                  marginBottom: 10, borderWidth: 1, borderColor: colors.border,
                  flexDirection: "row", justifyContent: "space-between", alignItems: "center",
                }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>{note.title}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>{note.subject}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <TrendingUp size={14} color={colors.warning} />
                    <Text style={{ color: colors.warning, fontSize: 14, fontWeight: "800" }}>{note.upvotes}</Text>
                  </View>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {feed?.recentUploads?.length > 0 && (
            <Animated.View entering={FadeInDown.delay(300)} style={{ marginBottom: 40 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Sparkles size={18} color={colors.primary} />
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}>Recent Uploads</Text>
              </View>
              {feed.recentUploads.slice(0, 3).map((note: any, i: number) => (
                <Animated.View key={note.id} entering={FadeInDown.delay(320 + i * 50)} style={{
                  backgroundColor: colors.card, borderRadius: 18, padding: 16,
                  marginBottom: 10, borderWidth: 1, borderColor: colors.border,
                }}>
                  <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>{note.title}</Text>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>{note.subject}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>{format(new Date(note.createdAt), "MMM dd")}</Text>
                  </View>
                </Animated.View>
              ))}
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}