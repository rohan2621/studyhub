import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  RefreshControl, Modal, TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { format } from "date-fns";
import { ArrowLeft, Ticket, Plus, XCircle, Smartphone, X } from "lucide-react-native";
import { api } from "../../lib/api";
import { useThemeStore } from "../../stores/themeStore";
import { PLANS } from "../../constants/Api";

const STATUS_COLOR: Record<string, string> = {
  Active: "#10b981", Pending: "#f59e0b", Expired: "#ef4444", Revoked: "#6b7280",
};
const CHANNELS = ["eSewa", "Khalti", "Cash", "Bank", "WhatsApp"];

export default function AdminTokensScreen() {
  const { colors } = useThemeStore();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserName, setSelectedUserName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [amount, setAmount] = useState("");
  const [channel, setChannel] = useState("");

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["adminTokens", statusFilter],
    queryFn: async () => (await api.get(`/admin/tokens${statusFilter ? `?status=${statusFilter}` : ""}`)).data,
  });

  const { data: userSearch } = useQuery({
    queryKey: ["userSearch", userEmail],
    queryFn: async () => (await api.get(`/admin/users?search=${userEmail}`)).data,
    enabled: userEmail.length > 2 && !selectedUserId,
  });

  const resetForm = () => {
    setShowIssueModal(false);
    setUserEmail(""); setSelectedUserId(""); setSelectedUserName("");
    setSelectedPlan(""); setAmount(""); setChannel("");
  };

  const issueMutation = useMutation({
    mutationFn: async () =>
      (await api.post("/admin/tokens", {
        userId: selectedUserId,
        plan: selectedPlan,
        amount: Number(amount),
        channel,
      })).data,
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Token issued!", text2: `Issued to ${selectedUserName}` });
      resetForm();
      qc.invalidateQueries({ queryKey: ["adminTokens"] });
    },
    onError: (e: any) => {
      const msg = e.response?.data?.error ?? e.response?.data?.title ?? "Failed to issue token";
      Toast.show({ type: "error", text1: "Issue Failed", text2: msg });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => (await api.post(`/admin/tokens/${id}/revoke`)).data,
    onSuccess: () => { Toast.show({ type: "success", text1: "Token revoked" }); qc.invalidateQueries({ queryKey: ["adminTokens"] }); },
    onError: (e: any) => Toast.show({ type: "error", text1: e.response?.data?.error ?? "Failed" }),
  });

  const resetDeviceMutation = useMutation({
    mutationFn: async (id: string) => (await api.post(`/admin/tokens/${id}/reset-device`)).data,
    onSuccess: () => { Toast.show({ type: "success", text1: "Device reset" }); qc.invalidateQueries({ queryKey: ["adminTokens"] }); },
    onError: (e: any) => Toast.show({ type: "error", text1: e.response?.data?.error ?? "Failed" }),
  });

  const tokens = data?.data ?? data ?? [];
  const canIssue = selectedUserId && selectedPlan && amount && channel;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 }}>
          <ArrowLeft size={18} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: "600" }}>Admin</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ticket size={22} color={colors.text} />
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800" }}>Tokens</Text>
          </View>
          <TouchableOpacity onPress={() => setShowIssueModal(true)}
            style={{ backgroundColor: colors.primary, borderRadius: 0, paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Plus size={16} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "700" }}>Issue Token</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {["", "Active", "Pending", "Expired", "Revoked"].map((s) => (
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
          {tokens.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Ticket size={48} color={colors.muted} style={{ marginBottom: 16 }} />
              <Text style={{ color: colors.textMuted, fontSize: 16 }}>No tokens found</Text>
            </View>
          ) : tokens.map((t: any) => {
            const sc = STATUS_COLOR[t.status] ?? colors.muted;
            return (
              <View key={t.id} style={{ backgroundColor: colors.card, borderRadius: 0, padding: 18, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>{t.userName ?? t.user ?? "—"}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{t.userEmail}</Text>
                  </View>
                  <View style={{ backgroundColor: sc + "22", borderRadius: 0, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: sc + "60" }}>
                    <Text style={{ color: sc, fontSize: 12, fontWeight: "700" }}>{t.status}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", gap: 20, marginBottom: 14 }}>
                  {[["Plan", t.plan], ["Expires", t.expiresAt ? format(new Date(t.expiresAt), "MMM dd, yyyy") : "—"], ["Code", t.code ?? "—"]].map(([label, val]) => (
                    <View key={label as string}>
                      <Text style={{ color: colors.muted, fontSize: 11 }}>{label}</Text>
                      <Text style={{ color: colors.text, fontWeight: "600", fontSize: 12, marginTop: 2 }}>{val}</Text>
                    </View>
                  ))}
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity onPress={() => resetDeviceMutation.mutate(t.id)}
                    style={{ flex: 1, backgroundColor: colors.accent + "18", borderRadius: 0, padding: 10, alignItems: "center", borderWidth: 1, borderColor: colors.accent + "40", flexDirection: "row", justifyContent: "center", gap: 6 }}>
                    <Smartphone size={14} color={colors.accent} />
                    <Text style={{ color: colors.accent, fontSize: 13, fontWeight: "700" }}>Reset Device</Text>
                  </TouchableOpacity>
                  {t.status === "Active" && (
                    <TouchableOpacity onPress={() => revokeMutation.mutate(t.id)}
                      style={{ flex: 1, backgroundColor: colors.danger + "18", borderRadius: 0, padding: 10, alignItems: "center", borderWidth: 1, borderColor: colors.danger + "40", flexDirection: "row", justifyContent: "center", gap: 6 }}>
                      <XCircle size={14} color={colors.danger} />
                      <Text style={{ color: colors.danger, fontSize: 13, fontWeight: "700" }}>Revoke</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* ── Issue Token Modal ── */}
      <Modal visible={showIssueModal} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={{ flex: 1, backgroundColor: "#000000cc", justifyContent: "flex-end" }}>
            <View style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 0, borderTopRightRadius: 0,
              maxHeight: "92%",
            }}>
              {/* Fixed header */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>Issue Token</Text>
                <TouchableOpacity onPress={resetForm} style={{ width: 36, height: 36, borderRadius: 0, backgroundColor: colors.inputBg, justifyContent: "center", alignItems: "center" }}>
                  <X size={18} color={colors.muted} />
                </TouchableOpacity>
              </View>

              {/* Scrollable body */}
              <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                {/* Step 1 — User */}
                <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 8 }}>STEP 1 — SELECT USER</Text>
                <TextInput
                  value={userEmail}
                  onChangeText={(v) => { setUserEmail(v); setSelectedUserId(""); setSelectedUserName(""); }}
                  placeholder="Search by name or email..."
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  style={{
                    backgroundColor: colors.inputBg, borderRadius: 0, padding: 14,
                    color: colors.text, fontSize: 15,
                    borderWidth: 1.5, borderColor: selectedUserId ? colors.success : colors.border,
                    marginBottom: 8,
                  }}
                />

                {/* Dropdown results */}
                {userEmail.length > 2 && !selectedUserId && (
                  <View style={{ backgroundColor: colors.card, borderRadius: 0, marginBottom: 12, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
                    {(userSearch?.users ?? []).slice(0, 6).map((u: any) => (
                      <TouchableOpacity key={u.id}
                        onPress={() => { setSelectedUserId(u.id); setSelectedUserName(u.name); setUserEmail(`${u.name} (${u.email})`); }}
                        style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <Text style={{ color: colors.text, fontWeight: "600" }}>{u.name}</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>{u.email} • Grade {u.grade}</Text>
                      </TouchableOpacity>
                    ))}
                    {(userSearch?.users ?? []).length === 0 && userEmail.length > 2 && (
                      <Text style={{ color: colors.textMuted, padding: 14, textAlign: "center" }}>No users found</Text>
                    )}
                  </View>
                )}

                {selectedUserId && (
                  <View style={{ backgroundColor: colors.success + "18", borderRadius: 0, padding: 12, marginBottom: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: colors.success + "40" }}>
                    <Text style={{ color: colors.success, fontWeight: "700" }}>✓ {selectedUserName}</Text>
                    <TouchableOpacity onPress={() => { setSelectedUserId(""); setSelectedUserName(""); setUserEmail(""); }}>
                      <X size={16} color={colors.success} />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Step 2 — Plan */}
                <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 10 }}>STEP 2 — SELECT PLAN</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                  {PLANS.map((p) => (
                    <TouchableOpacity key={p.key} onPress={() => setSelectedPlan(p.key)}
                      style={{
                        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 0,
                        backgroundColor: selectedPlan === p.key ? colors.primary : colors.inputBg,
                        borderWidth: 1.5, borderColor: selectedPlan === p.key ? colors.primary : colors.border,
                      }}>
                      <Text style={{ color: selectedPlan === p.key ? "#fff" : colors.textMuted, fontSize: 13, fontWeight: "700" }}>{p.label}</Text>
                      <Text style={{ color: selectedPlan === p.key ? "#ffffffaa" : colors.muted, fontSize: 11, textAlign: "center" }}>{p.days} days</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Step 3 — Amount */}
                <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 8 }}>STEP 3 — AMOUNT PAID (NPR)</Text>
                <TextInput
                  value={amount} onChangeText={setAmount}
                  placeholder="e.g. 500"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: colors.inputBg, borderRadius: 0, padding: 14,
                    color: colors.text, fontSize: 16, fontWeight: "600",
                    borderWidth: 1.5, borderColor: amount ? colors.primary : colors.border,
                    marginBottom: 20,
                  }}
                />

                {/* Step 4 — Channel */}
                <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 10 }}>STEP 4 — PAYMENT CHANNEL</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
                  {CHANNELS.map((c) => (
                    <TouchableOpacity key={c} onPress={() => setChannel(c)}
                      style={{
                        paddingHorizontal: 18, paddingVertical: 10, borderRadius: 0,
                        backgroundColor: channel === c ? colors.accent : colors.inputBg,
                        borderWidth: 1.5, borderColor: channel === c ? colors.accent : colors.border,
                      }}>
                      <Text style={{ color: channel === c ? "#fff" : colors.textMuted, fontSize: 14, fontWeight: "600" }}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Summary before submit */}
                {canIssue && (
                  <View style={{ backgroundColor: colors.primary + "12", borderRadius: 0, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.primary + "30" }}>
                    <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 13, marginBottom: 4 }}>Summary</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>User: {selectedUserName}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>Plan: {PLANS.find(p => p.key === selectedPlan)?.label}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>Amount: NPR {amount} via {channel}</Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => issueMutation.mutate()}
                  disabled={!canIssue || issueMutation.isPending}
                  style={{
                    backgroundColor: colors.primary, borderRadius: 0, padding: 18,
                    alignItems: "center", marginBottom: 12,
                    opacity: !canIssue ? 0.4 : 1,
                    flexDirection: "row", justifyContent: "center", gap: 8,
                  }}
                >
                  {issueMutation.isPending
                    ? <ActivityIndicator color="#fff" />
                    : <>
                        <Ticket size={18} color="#fff" />
                        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 17 }}>Issue Token</Text>
                      </>
                  }
                </TouchableOpacity>
                <TouchableOpacity onPress={resetForm} style={{ borderRadius: 0, padding: 16, alignItems: "center", borderWidth: 1, borderColor: colors.border, marginBottom: 8 }}>
                  <Text style={{ color: colors.textMuted, fontWeight: "600" }}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
