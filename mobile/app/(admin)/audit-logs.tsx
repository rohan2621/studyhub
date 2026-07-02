import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Activity } from "lucide-react-native";
import { api } from "../../lib/api";
import { useThemeStore } from "../../stores/themeStore";

export default function AuditLogsScreen() {
  const { colors } = useThemeStore();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: async () => (await api.get("/admin/audit-logs")).data,
  });

  const logs = data?.data ?? data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={colors.backgroundGrad as any} style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 }}>
          <ArrowLeft size={18} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: "600" }}>Admin</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Activity size={22} color={colors.text} />
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800" }}>Audit Logs</Text>
        </View>
      </LinearGradient>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}>
          {logs.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Activity size={48} color={colors.muted} style={{ marginBottom: 16 }} />
              <Text style={{ color: colors.textMuted, fontSize: 16 }}>No audit logs</Text>
            </View>
          ) : logs.map((log: any) => (
            <View key={log.id} style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border, flexDirection: "row", gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary + "18", justifyContent: "center", alignItems: "center" }}>
                <Activity size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14 }}>{log.action}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>By {log.actorName}</Text>
                {log.details && <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{log.details}</Text>}
                <Text style={{ color: colors.muted, fontSize: 11, marginTop: 6 }}>
                  {log.createdAt ? format(new Date(log.createdAt), "MMM dd, yyyy HH:mm") : ""}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
