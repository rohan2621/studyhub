import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  FileText, Star, ClipboardList, FileStack, Calendar,
  MessageCircle, Search, Megaphone, Bell, ChevronRight,
} from "lucide-react-native";
import { useThemeStore } from "../../stores/themeStore";
import { ThemeToggle } from "../../components/ui/ThemeToggle";

export default function ContentScreen() {
  const { colors } = useThemeStore();

  const sections = [
    { icon: FileText,      label: "Notes",         desc: "Study notes by subject",       color: "#6c63ff", route: "/(tabs)/notes" },
    { icon: Star,          label: "Topper Notes",  desc: "Notes from top students",      color: "#a855f7", route: "/(tabs)/notes" },
    { icon: ClipboardList, label: "Homework",       desc: "Assignments & submissions",    color: "#06b6d4", route: "/(tabs)/homework" },
    { icon: FileStack,     label: "Past Papers",    desc: "Previous exam papers",         color: "#10b981", route: "/(tabs)/past-papers" },
    { icon: Calendar,      label: "Timetable",      desc: "Weekly class schedule",        color: "#f59e0b", route: "/(tabs)/timetable" },
    { icon: MessageCircle, label: "Discussions",    desc: "Ask questions & discuss",      color: "#ef4444", route: "/(tabs)/discussions" },
    { icon: Search,        label: "Search",         desc: "Search all content",           color: "#6366f1", route: "/(tabs)/search" },
    { icon: Megaphone,     label: "Announcements",  desc: "School announcements",         color: "#0284c7", route: "/(tabs)/announcements" },
    { icon: Bell,          label: "Notifications",  desc: "Your notifications",           color: "#7c3aed", route: "/(tabs)/notifications" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={colors.backgroundGrad as any} style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 22 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ color: colors.text, fontSize: 26, fontWeight: "900" }}>Content</Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 4 }}>All your study materials</Text>
          </View>
          <ThemeToggle />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <TouchableOpacity
              key={s.label}
              onPress={() => router.push(s.route as any)}
              style={{
                backgroundColor: colors.card, borderRadius: 20, padding: 18,
                marginBottom: 12, borderWidth: 1, borderColor: colors.border,
                flexDirection: "row", alignItems: "center", gap: 16,
              }}
            >
              <LinearGradient
                colors={[s.color + "33", s.color + "11"]}
                style={{ width: 54, height: 54, borderRadius: 17, justifyContent: "center", alignItems: "center" }}
              >
                <Icon size={26} color={s.color} />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: "800", fontSize: 16 }}>{s.label}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>{s.desc}</Text>
              </View>
              <ChevronRight size={18} color={colors.muted} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
