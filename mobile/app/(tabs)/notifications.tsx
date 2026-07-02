import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Bell } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { api } from "../../lib/api";
import { useThemeStore } from "../../stores/themeStore";

const TYPE_ICONS: Record<string, string> = {
  NewHomework: "📋", HomeworkDue: "⏰", TokenActivated: "🎟️",
  TokenExpiringSoon: "⚠️", TokenExpired: "❌", NewNote: "📝",
  NewAnnouncement: "📢", HomeworkGraded: "🎯", CustomRequestFulfilled: "✅",
};

export default function NotificationsScreen() {
  const { colors } = useThemeStore();
  const qc = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/notifications")).data,
  });

  const readAllMutation = useMutation({
    mutationFn: async () => (await api.post("/notifications/read-all")).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); Toast.show({ type: "success", text1: "All marked as read" }); },
  });

  const readMutation = useMutation({
    mutationFn: async (id: string) => (await api.post(`/notifications/${id}/read`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = data?.data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={colors.backgroundGrad as any} style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Bell size={24} color={colors.text} />
            <Text style={{ color: colors.text, fontSize: 26, fontWeight: "800" }}>Notifications</Text>
          </View>
          {(data?.unreadCount ?? 0) > 0 && (
            <TouchableOpacity onPress={() => readAllMutation.mutate()}
              style={{ backgroundColor: colors.primary + "22", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" }}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
        {(data?.unreadCount ?? 0) > 0 && (
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 6 }}>{data.unreadCount} unread</Text>
        )}
      </LinearGradient>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 10 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        >
          {notifications.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Bell size={48} color={colors.muted} style={{ marginBottom: 16 }} />
              <Text style={{ color: colors.textMuted, fontSize: 16 }}>No notifications yet</Text>
            </View>
          ) : notifications.map((n: any) => (
            <TouchableOpacity key={n.id} onPress={() => !n.isRead && readMutation.mutate(n.id)}
              style={{
                backgroundColor: colors.card, borderRadius: 18, padding: 16,
                borderWidth: 1, borderColor: n.isRead ? colors.border : colors.primary + "44",
                borderLeftWidth: n.isRead ? 1 : 4, borderLeftColor: n.isRead ? colors.border : colors.primary,
                flexDirection: "row", gap: 14,
              }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primary + "18", justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 22 }}>{TYPE_ICONS[n.type] ?? "🔔"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: n.isRead ? "500" : "700", fontSize: 15, marginBottom: 4 }}>{n.title}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>{n.body}</Text>
                <Text style={{ color: colors.muted, fontSize: 11, marginTop: 6 }}>
                  {format(new Date(n.createdAt), "MMM dd, HH:mm")}
                </Text>
              </View>
              {!n.isRead && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 4 }} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
