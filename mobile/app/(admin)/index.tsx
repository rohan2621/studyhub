import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Ticket, School, FileText, ArrowLeft, Shield,
  ClipboardList, Activity, Megaphone, BookOpen, LogOut,
} from "lucide-react-native";
import { api } from "../../lib/api";
import { useThemeStore } from "../../stores/themeStore";
import { useAuthStore } from "../../stores/authStore";

export default function AdminDashboard() {
  const { logout } = useAuthStore();
  const { colors } = useThemeStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => (await api.get("/admin/stats")).data,
  });

  const tiles = stats ? [
    { label: "Total Users",       value: stats.totalUsers,          color: "#6c63ff", icon: Users },
    { label: "Active Tokens",     value: stats.activeTokens,        color: "#10b981", icon: Ticket },
    { label: "Schools",           value: stats.totalSchools,        color: "#0284c7", icon: School },
    { label: "Pending Renewals",  value: stats.pendingRenewalCount, color: "#f59e0b", icon: FileText },
    { label: "Open Requests",     value: stats.pendingRequests,     color: "#ef4444", icon: ClipboardList },
    { label: "Expired Tokens",    value: stats.expiredTokens,       color: "#a855f7", icon: Activity },
    { label: "New Users (month)", value: stats.newUsersThisMonth,   color: "#06b6d4", icon: Users },
    { label: "Expiring in 7d",    value: stats.tokensExpiringIn7Days, color: "#f97316", icon: Ticket },
  ] : [];

  const navItems = [
    { label: "Users",           desc: "Manage accounts & roles",   icon: Users,         route: "/(admin)/users",           color: "#6c63ff" },
    { label: "Tokens",          desc: "Issue, revoke & manage",    icon: Ticket,         route: "/(admin)/tokens",          color: "#10b981" },
    { label: "Schools",         desc: "Manage schools",            icon: School,         route: "/(admin)/schools",         color: "#0284c7" },
    { label: "Content Manager", desc: "Notes, HW, papers, slots",  icon: BookOpen,       route: "/(admin)/content",         color: "#7c3aed" },
    { label: "Announcements",   desc: "Post school announcements", icon: Megaphone,      route: "/(admin)/announcements",   color: "#f59e0b" },
    { label: "Custom Requests", desc: "Student content requests",  icon: ClipboardList,  route: "/(admin)/custom-requests", color: "#ef4444" },
    { label: "Audit Logs",      desc: "Admin activity history",    icon: Activity,       route: "/(admin)/audit-logs",      color: "#64748b" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={colors.backgroundGrad as any} style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: colors.primary + "22", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.primary + "40" }}>
              <Shield size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: "900" }}>Admin Panel</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>StudyHub management</Text>
            </View>
          </View>

          {/* Quick Announce button */}
          <TouchableOpacity
            onPress={() => router.push("/(admin)/announcements" as any)}
            style={{
              backgroundColor: "#f59e0b",
              borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
              flexDirection: "row", alignItems: "center", gap: 6,
              shadowColor: "#f59e0b", shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            }}
          >
            <Megaphone size={16} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>Announce</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* Stats grid */}
        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginBottom: 20 }} />
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
            {tiles.map((t) => {
              const Icon = t.icon;
              return (
                <View key={t.label} style={{ width: "47%", backgroundColor: colors.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.border }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: t.color + "22", justifyContent: "center", alignItems: "center", marginBottom: 10 }}>
                    <Icon size={18} color={t.color} />
                  </View>
                  <Text style={{ color: colors.text, fontSize: 26, fontWeight: "900" }}>{t.value ?? "—"}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>{t.label}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* School isolation notice */}
        <View style={{ backgroundColor: colors.primary + "12", borderRadius: 18, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.primary + "30", flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
          <School size={20} color={colors.primary} style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.primary, fontWeight: "800", fontSize: 14, marginBottom: 4 }}>School Isolation Active</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>
              All content (notes, homework, papers, timetable) is scoped per school. Students only see their school's data. Use Content Manager to post to specific schools.
            </Text>
          </View>
        </View>

        {/* Nav items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity key={item.label} onPress={() => router.push(item.route as any)}
              style={{ backgroundColor: colors.card, borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <LinearGradient colors={[item.color + "33", item.color + "11"]} style={{ width: 54, height: 54, borderRadius: 17, justifyContent: "center", alignItems: "center" }}>
                <Icon size={26} color={item.color} />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: "800", fontSize: 16 }}>{item.label}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>{item.desc}</Text>
              </View>
              <Text style={{ color: colors.muted, fontSize: 22 }}>›</Text>
            </TouchableOpacity>
          );
        })}

        {/* Logout */}
        <TouchableOpacity
          onPress={async () => {
            try { await api.post("/auth/logout"); } catch {}
            await logout();
            router.replace("/(auth)/login");
          }}
          style={{ backgroundColor: colors.danger + "18", borderRadius: 20, padding: 18, marginTop: 8, marginBottom: 40, borderWidth: 1, borderColor: colors.danger + "40", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 }}
        >
          <LogOut size={20} color={colors.danger} />
          <Text style={{ color: colors.danger, fontSize: 16, fontWeight: "800" }}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
