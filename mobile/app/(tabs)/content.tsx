import { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Animated, {
  FadeInDown, useSharedValue, useAnimatedStyle,
  withSpring, withTiming,
} from "react-native-reanimated";
import {
  FileText, Star, ClipboardList, FileStack, Calendar,
  MessageCircle, Search, Megaphone, Bell, ChevronRight,
} from "lucide-react-native";
import { useThemeStore } from "../../stores/themeStore";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { StudyHubBrand } from "../../components/ui/StudyHubBrand";
import { BackgroundArt } from "../../components/ui/BackgroundArt";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function ContentCard({ item, index, colors }: any) {
  const scale = useSharedValue(1);
  const Icon = item.icon;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      entering={FadeInDown.delay(index * 70).springify().damping(14)}
      style={[animatedStyle]}
      onPressIn={() => (scale.value = withSpring(0.97, { damping: 15 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 12 }))}
      onPress={() => router.push(item.route)}
      activeOpacity={0.9}
    >
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 18,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          shadowColor: item.color,
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 2,
        }}
      >
        <LinearGradient
          colors={[item.color + "33", item.color + "11"]}
          style={{
            width: 54, height: 54, borderRadius: 17,
            justifyContent: "center", alignItems: "center",
            borderWidth: 1, borderColor: item.color + "30",
          }}
        >
          <Icon size={26} color={item.color} strokeWidth={2.2} />
        </LinearGradient>

        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontWeight: "800", fontSize: 16 }}>{item.label}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>{item.desc}</Text>
        </View>

        <View
          style={{
            width: 30, height: 30, borderRadius: 10,
            backgroundColor: colors.inputBg,
            justifyContent: "center", alignItems: "center",
          }}
        >
          <ChevronRight size={16} color={colors.muted} />
        </View>
      </View>
    </AnimatedTouchable>
  );
}

export default function ContentScreen() {
  const { colors } = useThemeStore();

  const sections = [
    { icon: FileText, label: "Notes", desc: "Study notes by subject & chapter", color: "#6c63ff", route: "/(tabs)/notes" },
    { icon: Star, label: "Topper Notes", desc: "Notes from top students", color: "#a855f7", route: "/(tabs)/notes" },
    { icon: ClipboardList, label: "Homework", desc: "Assignments & submissions", color: "#06b6d4", route: "/(tabs)/homework" },
    { icon: FileStack, label: "Past Papers", desc: "Previous exam papers", color: "#10b981", route: "/(tabs)/past-papers" },
    { icon: Calendar, label: "Timetable", desc: "Weekly class schedule", color: "#f59e0b", route: "/(tabs)/timetable" },
    { icon: MessageCircle, label: "Discussions", desc: "Ask questions & discuss", color: "#ef4444", route: "/(tabs)/discussions" },
    { icon: Search, label: "Search", desc: "Search all content", color: "#6366f1", route: "/(tabs)/search" },
    { icon: Megaphone, label: "Announcements", desc: "School announcements", color: "#0284c7", route: "/(tabs)/announcements" },
    { icon: Bell, label: "Notifications", desc: "Your notifications", color: "#7c3aed", route: "/(tabs)/notifications" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={colors.backgroundGrad}
        style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 22 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BackgroundArt />
        <Animated.View
          entering={FadeInDown.springify().damping(14)}
          style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
        >
          <View>
            <StudyHubBrand size="sm" showTagline={false} />
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: "900", marginTop: 10 }}>Content</Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 4 }}>All your study materials</Text>
          </View>
          <ThemeToggle />
        </Animated.View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {sections.map((s, i) => (
          <ContentCard key={s.label} item={s} index={i} colors={colors} />
        ))}
      </ScrollView>
    </View>
  );
}