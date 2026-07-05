import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { ArrowLeft, ClipboardList, CheckCircle2, XCircle } from "lucide-react-native";
import { api } from "../../lib/api";
import { useThemeStore } from "../../stores/themeStore";
import { format } from "date-fns";

const STATUS_COLOR: Record<string, string> = { Pending: "#f59e0b", Fulfilled: "#10b981", Rejected: "#ef4444" };

export default function AdminCustomRequestsScreen() {
  const { colors } = useThemeStore();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["adminCustomRequests", statusFilter],
    queryFn: async () => (await api.get(`/admin/custom-requests${statusFilter ? `?status=${statusFilter}` : ""}`)).data,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      (await api.patch(`/admin/custom-requests/${id}`, { status })).data,
    onSuccess: () => { Toast.show({ type: "success", text1: "Status updated" }); qc.invalidateQueries({ queryKey: ["adminCustomRequests"] }); },
    onError: (e: any) => Toast.show({ type: "error", text1: e.response?.data?.error ?? "Failed" }),
  });

  const requests = data?.data ?? data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 }}>
          <ArrowLeft size={18} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: "600" }}>Admin</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <ClipboardList size={22} color={colors.text} />
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800" }}>Custom Requests</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {["", "Pending", "Fulfilled", "Rejected"].map((s) => (
              <TouchableOpacity key={s} onPress={() => setStatusFilter(s)}
                style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 0, backgroundColor: statusFilter === s ? colors.primary : colors.card, borderWidth: 1, borderColor: statusFilter === s ? colors.primary : colors.border }}>
                <Text style={{ color: statusFilter === s ? "#fff" : colors.textMuted, fontSize: 13, fontWeight: "600" }}>{s || "All"}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}>
          {requests.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <ClipboardList size={48} color={colors.muted} style={{ marginBottom: 16 }} />
              <Text style={{ color: colors.textMuted, fontSize: 16 }}>No requests found</Text>
            </View>
          ) : requests.map((r: any) => {
            const statusColor = STATUS_COLOR[r.status] ?? colors.muted;
            return (
              <View key={r.id} style={{ backgroundColor: colors.card, borderRadius: 0, padding: 18, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>{r.type}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>{r.subject} {r.chapter ? `• ${r.chapter}` : ""}</Text>
                    <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>By {r.userName} • {format(new Date(r.createdAt), "MMM dd")}</Text>
                  </View>
                  <View style={{ backgroundColor: statusColor + "22", borderRadius: 0, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" }}>
                    <Text style={{ color: statusColor, fontSize: 12, fontWeight: "700" }}>{r.status}</Text>
                  </View>
                </View>
                {r.note && <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 12, fontStyle: "italic" }}>"{r.note}"</Text>}
                {r.status === "Pending" && (
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity onPress={() => updateMutation.mutate({ id: r.id, status: "Fulfilled" })}
                      style={{ flex: 1, backgroundColor: colors.success + "18", borderRadius: 0, padding: 10, alignItems: "center", borderWidth: 1, borderColor: colors.success + "40", flexDirection: "row", justifyContent: "center", gap: 6 }}>
                      <CheckCircle2 size={14} color={colors.success} />
                      <Text style={{ color: colors.success, fontSize: 13, fontWeight: "700" }}>Fulfill</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => updateMutation.mutate({ id: r.id, status: "Rejected" })}
                      style={{ flex: 1, backgroundColor: colors.danger + "18", borderRadius: 0, padding: 10, alignItems: "center", borderWidth: 1, borderColor: colors.danger + "40", flexDirection: "row", justifyContent: "center", gap: 6 }}>
                      <XCircle size={14} color={colors.danger} />
                      <Text style={{ color: colors.danger, fontSize: 13, fontWeight: "700" }}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
