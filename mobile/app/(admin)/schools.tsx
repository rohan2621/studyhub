import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { ArrowLeft, School, Plus, ToggleLeft, ToggleRight } from "lucide-react-native";
import { api } from "../../lib/api";
import { useThemeStore } from "../../stores/themeStore";

export default function AdminSchoolsScreen() {
  const { colors } = useThemeStore();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["adminSchools"],
    queryFn: async () => (await api.get("/admin/schools")).data,
  });

  const createMutation = useMutation({
    mutationFn: async () => (await api.post("/admin/schools", { name, city })).data,
    onSuccess: () => {
      Toast.show({ type: "success", text1: "School created!" });
      setShowModal(false); setName(""); setCity("");
      qc.invalidateQueries({ queryKey: ["adminSchools"] });
    },
    onError: (e: any) => Toast.show({ type: "error", text1: e.response?.data?.error ?? "Failed" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => (await api.patch(`/admin/schools/${id}/toggle`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminSchools"] }),
    onError: (e: any) => Toast.show({ type: "error", text1: e.response?.data?.error ?? "Failed" }),
  });

  const schools = data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={colors.backgroundGrad as any} style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 }}>
          <ArrowLeft size={18} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: "600" }}>Admin</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <School size={22} color={colors.text} />
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800" }}>Schools</Text>
          </View>
          <TouchableOpacity onPress={() => setShowModal(true)}
            style={{ backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Plus size={16} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "700" }}>Add</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}>
          {schools.map((s: any) => (
            <View key={s.id} style={{ backgroundColor: colors.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>{s.name}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>{s.city}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{s.userCount ?? 0} students</Text>
                </View>
                <TouchableOpacity onPress={() => toggleMutation.mutate(s.id)} style={{ padding: 4 }}>
                  {s.isActive
                    ? <ToggleRight size={32} color={colors.success} />
                    : <ToggleLeft size={32} color={colors.muted} />}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "#000000cc", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28 }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800", marginBottom: 20 }}>Add School</Text>
            <Text style={{ color: colors.textMuted, marginBottom: 8 }}>School Name</Text>
            <TextInput value={name} onChangeText={setName} placeholder="e.g. Sunrise Academy" placeholderTextColor={colors.muted}
              style={{ backgroundColor: colors.inputBg, borderRadius: 14, padding: 14, color: colors.text, borderWidth: 1, borderColor: colors.border, marginBottom: 16 }} />
            <Text style={{ color: colors.textMuted, marginBottom: 8 }}>City</Text>
            <TextInput value={city} onChangeText={setCity} placeholder="e.g. Kathmandu" placeholderTextColor={colors.muted}
              style={{ backgroundColor: colors.inputBg, borderRadius: 14, padding: 14, color: colors.text, borderWidth: 1, borderColor: colors.border, marginBottom: 24 }} />
            <TouchableOpacity onPress={() => createMutation.mutate()} disabled={!name || !city || createMutation.isPending}
              style={{ backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: "center", marginBottom: 12, opacity: !name || !city ? 0.5 : 1 }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>{createMutation.isPending ? "Creating..." : "Create School"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowModal(false)}
              style={{ borderRadius: 14, padding: 16, alignItems: "center", borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ color: colors.textMuted, fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
