import { useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  Animated as RNAnimated, Easing, Pressable, DeviceEventEmitter,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { format } from "date-fns";
import Toast from "react-native-toast-message";
import Animated, { FadeIn, FadeInDown, SlideInRight, Easing as ReanimatedEasing } from "react-native-reanimated";
import {
  CheckCircle2, AlertTriangle, Ticket, ChevronRight, FileText, Star,
  ClipboardList, FileStack, Calendar, MessageCircle, Flame, TrendingUp,
  Sparkles, Bell, Search, Megaphone, BookOpen, GraduationCap,
} from "lucide-react-native";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";
import { StudyHubBrand } from "../../components/ui/StudyHubBrand";

// ── Smooth press with opacity (no jiggle) ─────────────────────────────
function PressCard({ onPress, style, children }: any) {
  const opacity = useRef(new RNAnimated.Value(1)).current;
  const scale = useRef(new RNAnimated.Value(1)).current;

  const pressIn = () => {
    RNAnimated.parallel([
      RNAnimated.timing(opacity, { toValue: 0.82, duration: 90, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
      RNAnimated.timing(scale, { toValue: 0.97, duration: 90, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
    ]).start();
  };
  const pressOut = () => {
    RNAnimated.parallel([
      RNAnimated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
      RNAnimated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
    ]).start();
  };

  return (
    <RNAnimated.View style={[{ alignSelf: "stretch" }, style, { opacity, transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={{ width: "100%", height: (style?.aspectRatio || style?.height) ? "100%" : undefined }}
      >
        {children}
      </Pressable>
    </RNAnimated.View>
  );
}

// ── Skeleton pulse loader ──────────────────────────────────────────────
function Skeleton({ width, height, borderRadius = 10 }: { width: number | string; height: number; borderRadius?: number }) {
  const { colors } = useThemeStore();
  const anim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    const pulse = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
        RNAnimated.timing(anim, { toValue: 0, duration: 800, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const bg = anim.interpolate({ inputRange: [0, 1], outputRange: [colors.card, colors.border] });
  return <RNAnimated.View style={[{ width, height, borderRadius }, { backgroundColor: bg }] as any} />;
}

function LoadingSkeleton() {
  return (
    <View style={{ padding: 20, gap: 20 }}>
      <View style={{ gap: 10 }}>
        <Skeleton width="40%" height={14} />
        <Skeleton width="70%" height={22} />
        <Skeleton width="100%" height={70} borderRadius={18} />
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {[0, 1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} width="30%" height={90} borderRadius={20} />
        ))}
      </View>
      <Skeleton width="100%" height={56} borderRadius={18} />
      <View style={{ gap: 10 }}>
        <Skeleton width="50%" height={20} />
        {[0, 1].map(i => <Skeleton key={i} width="100%" height={70} borderRadius={18} />)}
      </View>
    </View>
  );
}

// ── Quick tile ──────────────────────────────────────────────────────────
function QuickTile({ item, index, colors, onPress }: any) {
  const Icon = item.icon;
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 55).duration(350).easing(ReanimatedEasing.out(ReanimatedEasing.quad))}
      style={{ width: "31%" }}
    >
      <PressCard onPress={onPress} style={{ aspectRatio: 1 }}>
        <View style={{
          flex: 1, backgroundColor: colors.card, borderRadius: 22,
          alignItems: "center", justifyContent: "center",
          borderWidth: 1, borderColor: colors.border,
          shadowColor: item.color, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2,
        }}>
          <LinearGradient
            colors={[item.color + "30", item.color + "08"] as any}
            style={{ width: 52, height: 52, borderRadius: 17, justifyContent: "center", alignItems: "center", marginBottom: 8 }}
          >
            <Icon size={24} color={item.color} strokeWidth={2} />
          </LinearGradient>
          <Text style={{ color: colors.text, fontSize: 11, fontWeight: "700", letterSpacing: 0.3 }}>{item.label}</Text>
        </View>
      </PressCard>
    </Animated.View>
  );
}

// ── Section heading ─────────────────────────────────────────────────────
function SectionTitle({ icon: Icon, iconColor, title, onSeeAll, delay = 0 }: any) {
  const { colors } = useThemeStore();
  return (
    <Animated.View entering={FadeIn.delay(delay).duration(300)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon size={18} color={iconColor ?? colors.text} />
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: "800", letterSpacing: -0.3 }}>{title}</Text>
      </View>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 13 }}>See all →</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

// ── Main component ──────────────────────────────────────────────────────
export default function HomeScreen() {
  const { user } = useAuthStore();
  const { colors } = useThemeStore();
  const isAdmin = Number(user?.role) === 3 || user?.role === "Admin";

  const { data: feed, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["feed"],
    queryFn: async () => (await api.get("/feed")).data,
  });

  const { data: tokenStatus } = useQuery({
    queryKey: ["tokenStatus"],
    queryFn: async () => {
      try { return (await api.get("/tokens/me")).data; }
      catch { return null; }
    },
  });

  const handleFeaturePress = (route: string) => {
    if (!isAdmin && tokenStatus?.hasActiveToken === false) {
      DeviceEventEmitter.emit("SHOW_LOCK_MODAL");
      return;
    }
    router.push(route);
  };

  const { data: announcements } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => (await api.get("/announcements")).data,
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/notifications?unreadOnly=true")).data,
  });

  const urgencyColor = (u: string) =>
    ({ red: colors.danger, amber: colors.warning, green: colors.success }[u] ?? colors.muted);

  const quickAccess = [
    { icon: FileText, label: "Notes", color: "#6c63ff", route: "/(tabs)/notes" },
    { icon: Star, label: "Toppers", color: "#a855f7", route: "/(tabs)/notes" },
    { icon: ClipboardList, label: "Homework", color: "#06b6d4", route: "/(tabs)/homework" },
    { icon: FileStack, label: "Papers", color: "#10b981", route: "/(tabs)/past-papers" },
    { icon: Calendar, label: "Timetable", color: "#f59e0b", route: "/(tabs)/timetable" },
    { icon: MessageCircle, label: "Discuss", color: "#ef4444", route: "/(tabs)/discussions" },
  ];

  const unreadCount = notifications?.unreadCount ?? 0;
  const pinnedAnn = (announcements ?? []).filter((a: any) => a.isPinned).slice(0, 2);
  const hasHomework = (feed?.upcomingHomework?.length ?? 0) > 0;
  const hasTrending = (feed?.trendingNotes?.length ?? 0) > 0;
  const hasRecent = (feed?.recentUploads?.length ?? 0) > 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <LinearGradient colors={colors.backgroundGrad as any} style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 24 }}>
        <Animated.View entering={FadeIn.duration(400)} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <StudyHubBrand size="sm" showTagline={false} />
            <View>
              <Text style={{ color: colors.textMuted, fontSize: 12, letterSpacing: 0.3 }}>{greeting()},</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 1 }}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: "900", letterSpacing: -0.5 }}>
                  {user?.name?.split(" ")[0]}
                </Text>
                <Sparkles size={15} color={colors.primary} />
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <PressCard onPress={() => handleFeaturePress("/(tabs)/notifications")} style={{ position: "relative" }}>
              <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: colors.card, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.border }}>
                <Bell size={19} color={colors.text} />
              </View>
              {unreadCount > 0 && (
                <View style={{ position: "absolute", top: -3, right: -3, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.danger, justifyContent: "center", alignItems: "center", paddingHorizontal: 3 }}>
                  <Text style={{ color: "#fff", fontSize: 10, fontWeight: "900" }}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
                </View>
              )}
            </PressCard>
          </View>
        </Animated.View>

        {/* Token status pill */}
        <Animated.View entering={FadeInDown.delay(120).duration(350)}>
          {tokenStatus?.hasActiveToken ? (
            <View style={{
              backgroundColor: colors.success + "14", borderRadius: 18, padding: 18,
              borderWidth: 1, borderColor: colors.success + "35",
              flexDirection: "row", alignItems: "center", gap: 14,
            }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.success + "22", justifyContent: "center", alignItems: "center" }}>
                <CheckCircle2 size={24} color={colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.success, fontWeight: "800", fontSize: 15 }}>{tokenStatus.plan} Plan — Active</Text>
                <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>{tokenStatus.daysLeft}d remaining · device locked 🔒</Text>
              </View>
              {tokenStatus.isExpiringSoon && (
                <View style={{ backgroundColor: colors.warning + "22", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.warning + "40" }}>
                  <Text style={{ color: colors.warning, fontSize: 12, fontWeight: "800" }}>Renew</Text>
                </View>
              )}
            </View>
          ) : (
            <PressCard onPress={() => router.push("/(tabs)/activate-token" as any)} style={{}}>
              <View style={{ backgroundColor: colors.warning + "14", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: colors.warning + "35", flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.warning + "22", justifyContent: "center", alignItems: "center" }}>
                  {tokenStatus?.hasPendingToken ? <Ticket size={22} color={colors.warning} /> : <AlertTriangle size={22} color={colors.warning} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.warning, fontWeight: "800", fontSize: 15 }}>
                    {tokenStatus?.hasPendingToken ? "Token Ready — Tap to Activate" : "No Active Token"}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>
                    {tokenStatus?.hasPendingToken ? "Your token is waiting!" : "Features are locked until you activate"}
                  </Text>
                </View>
                <ChevronRight size={22} color={colors.warning} />
              </View>
            </PressCard>
          )}
        </Animated.View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <View style={{ padding: 20 }}>

            {/* ── Quick tiles ─────────────────────────────────── */}
            <Animated.View entering={FadeIn.delay(60).duration(300)}>
              <Text style={{ color: colors.text, fontSize: 17, fontWeight: "800", letterSpacing: -0.3, marginBottom: 14 }}>Quick Access</Text>
            </Animated.View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 28, rowGap: 16 }}>
              {quickAccess.map((item, i) => (
                <QuickTile key={item.label} item={item} index={i} colors={colors} onPress={() => handleFeaturePress(item.route)} />
              ))}
            </View>

            {/* ── Search shortcut ──────────────────────────────── */}
            <Animated.View entering={FadeInDown.delay(180).duration(350)} style={{ marginBottom: 28 }}>
              <PressCard onPress={() => handleFeaturePress("/(tabs)/search")} style={{}}>
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
                  <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primary + "16", justifyContent: "center", alignItems: "center" }}>
                    <Search size={18} color={colors.primary} />
                  </View>
                  <Text style={{ color: colors.muted, fontSize: 14, flex: 1 }}>Search notes, papers, homework...</Text>
                  <ChevronRight size={16} color={colors.muted} />
                </View>
              </PressCard>
            </Animated.View>

            {/* ── Pinned announcements ─────────────────────────── */}
            {pinnedAnn.length > 0 && (
              <Animated.View entering={FadeInDown.delay(210).duration(350)} style={{ marginBottom: 28 }}>
                <SectionTitle
                  icon={Megaphone} iconColor={colors.primary}
                  title="Announcements"
                  onSeeAll={(announcements?.length ?? 0) > 2 ? () => router.push("/(tabs)/announcements") : undefined}
                  delay={200}
                />
                {pinnedAnn.map((a: any, i: number) => (
                  <Animated.View key={a.id} entering={SlideInRight.delay(220 + i * 60).duration(320)}>
                    <PressCard onPress={() => router.push("/(tabs)/announcements")} style={{ marginBottom: 10 }}>
                      <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.primary + "35", borderLeftWidth: 4, borderLeftColor: colors.primary }}>
                        <Text style={{ color: colors.text, fontWeight: "800", fontSize: 14, marginBottom: 5, letterSpacing: -0.2 }}>{a.title}</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }} numberOfLines={2}>{a.body}</Text>
                      </View>
                    </PressCard>
                  </Animated.View>
                ))}
              </Animated.View>
            )}

            {/* ── Upcoming homework ─────────────────────────────── */}
            <Animated.View entering={FadeInDown.delay(240).duration(350)} style={{ marginBottom: 28 }}>
              <SectionTitle
                icon={ClipboardList}
                title="Due Soon"
                onSeeAll={() => handleFeaturePress("/(tabs)/homework")}
                delay={230}
              />
              {hasHomework ? (
                feed.upcomingHomework.slice(0, 3).map((hw: any, i: number) => (
                  <Animated.View key={hw.id} entering={FadeInDown.delay(250 + i * 60).duration(320)} style={{ marginBottom: 10 }}>
                    <PressCard onPress={() => handleFeaturePress("/(tabs)/homework")} style={{}}>
                      <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ flex: 1, marginRight: 12 }}>
                          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15, letterSpacing: -0.2 }}>{hw.title}</Text>
                          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 3 }}>{hw.subject}</Text>
                        </View>
                        <View style={{ backgroundColor: urgencyColor(hw.urgency) + "18", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: urgencyColor(hw.urgency) + "40" }}>
                          <Text style={{ color: urgencyColor(hw.urgency), fontSize: 12, fontWeight: "900" }}>
                            {hw.daysUntilDue === 0 ? "Today!" : `${hw.daysUntilDue}d`}
                          </Text>
                        </View>
                      </View>
                    </PressCard>
                  </Animated.View>
                ))
              ) : (
                <EmptyCard icon={ClipboardList} title="All caught up!" desc="No homework due soon." color="#06b6d4" colors={colors} />
              )}
            </Animated.View>

            {/* ── Trending notes ────────────────────────────────── */}
            <Animated.View entering={FadeInDown.delay(300).duration(350)} style={{ marginBottom: 28 }}>
              <SectionTitle
                icon={Flame} iconColor={colors.warning}
                title="Trending Notes"
                onSeeAll={() => handleFeaturePress("/(tabs)/notes")}
                delay={290}
              />
              {hasTrending ? (
                feed.trendingNotes.slice(0, 3).map((note: any, i: number) => (
                  <Animated.View key={note.id} entering={FadeInDown.delay(310 + i * 60).duration(320)} style={{ marginBottom: 10 }}>
                    <PressCard onPress={() => handleFeaturePress("/(tabs)/notes")} style={{}}>
                      <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ flex: 1, marginRight: 12 }}>
                          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15, letterSpacing: -0.2 }}>{note.title}</Text>
                          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 3 }}>{note.subject}</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                          <TrendingUp size={13} color={colors.warning} />
                          <Text style={{ color: colors.warning, fontSize: 14, fontWeight: "900" }}>{note.upvotes}</Text>
                        </View>
                      </View>
                    </PressCard>
                  </Animated.View>
                ))
              ) : (
                <EmptyCard icon={FileText} title="No trending yet" desc="Be the first to upload and get upvoted." color="#6c63ff" colors={colors} />
              )}
            </Animated.View>

            {/* ── Recent uploads ────────────────────────────────── */}
            <Animated.View entering={FadeInDown.delay(360).duration(350)} style={{ marginBottom: 40 }}>
              <SectionTitle
                icon={Sparkles} iconColor={colors.primary}
                title="Recent Uploads"
                onSeeAll={() => handleFeaturePress("/(tabs)/notes")}
                delay={350}
              />
              {hasRecent ? (
                feed.recentUploads.slice(0, 3).map((note: any, i: number) => (
                  <Animated.View key={note.id} entering={FadeInDown.delay(370 + i * 60).duration(320)} style={{ marginBottom: 10 }}>
                    <PressCard onPress={() => handleFeaturePress("/(tabs)/notes")} style={{}}>
                      <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border }}>
                        <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15, letterSpacing: -0.2 }}>{note.title}</Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
                          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{note.subject}</Text>
                          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{format(new Date(note.createdAt), "MMM dd")}</Text>
                        </View>
                      </View>
                    </PressCard>
                  </Animated.View>
                ))
              ) : (
                <EmptyCard icon={GraduationCap} title="Nothing uploaded yet" desc="Notes and papers will show up here once uploaded." color="#10b981" colors={colors} />
              )}
            </Animated.View>

          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Empty card ──────────────────────────────────────────────────────────
function EmptyCard({ icon: Icon, title, desc, color, colors }: any) {
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: colors.border, alignItems: "center", gap: 8 }}>
      <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: color + "18", justifyContent: "center", alignItems: "center" }}>
        <Icon size={24} color={color} />
      </View>
      <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14 }}>{title}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: "center", lineHeight: 18 }}>{desc}</Text>
    </View>
  );
}
