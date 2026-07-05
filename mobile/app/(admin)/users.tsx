import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Modal } from "react-native";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { ArrowLeft, Users, Search, Trash2, ShieldCheck } from "lucide-react-native";
import { api } from "../../lib/api";
import { useThemeStore } from "../../stores/themeStore";

const ROLES = ["Student", "Teacher", "Topper Contributor", "Admin"];

const ROLE_NAMES = [
  "Student",             // 0
  "Teacher",             // 1
  "Topper Contributor",  // 2
  "Admin",               // 3
];


export default function AdminUsersScreen() {
    const { colors } = useThemeStore();
    
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole] = useState("");
 
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["adminUsers", search, roleFilter],
    queryFn: async () => (await api.get(`/admin/users?search=${search}&role=${roleFilter}`)).data,
  });

  const changeRoleMutation = useMutation({
    mutationFn: async () => (await api.put(`/admin/users/${selectedUser.id}/role`, { role: newRole })).data,
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Role updated" });
      setSelectedUser(null);
      qc.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (e: any) => Toast.show({ type: "error", text1: e.response?.data?.error ?? "Failed" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/admin/users/${id}`)).data,
    onSuccess: () => { Toast.show({ type: "success", text1: "User deleted" }); qc.invalidateQueries({ queryKey: ["adminUsers"] }); },
    onError: (e: any) => Toast.show({ type: "error", text1: e.response?.data?.error ?? "Failed" }),
  });

  const users = data?.data ?? data ?? [];

  const ROLE_COLOR: Record<string, string> = { Admin: colors.danger, Teacher: colors.accent, Student: colors.primary, SuperAdmin: "#7c3aed" };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 }}>
          <ArrowLeft size={18} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: "600" }}>Admin</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Users size={22} color={colors.text} />
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800" }}>Users</Text>
        </View>
        <View style={{ flexDirection: "row", backgroundColor: colors.inputBg, borderRadius: 0, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: colors.border, alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Search size={16} color={colors.textMuted} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search by name or email..." placeholderTextColor={colors.muted}
            style={{ flex: 1, color: colors.text, fontSize: 14 }} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {["", ...ROLES].map((r) => (
              <TouchableOpacity key={r} onPress={() => setRoleFilter(r)}
                style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 0, backgroundColor: roleFilter === r ? colors.primary : colors.card, borderWidth: 1, borderColor: roleFilter === r ? colors.primary : colors.border }}>
                <Text style={{ color: roleFilter === r ? "#fff" : colors.textMuted, fontSize: 13, fontWeight: "600" }}>{r || "All"}</Text>
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
        <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}>
          {users.map((u: any) => (
            <View key={u.id} style={{ backgroundColor: colors.card, borderRadius: 0, padding: 16, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>{u.name}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{u.email}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
  {u.school?.name ?? "No School"} • Grade {u.grade ?? "N/A"}
</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 8 }}>
                  <View style={{ backgroundColor: (ROLE_COLOR[u.role] ?? colors.primary) + "22", borderRadius: 0, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text
  style={{
    color: ROLE_COLOR[u.role] ?? colors.primary,
    fontSize: 12,
    fontWeight: "700",
  }}
>
  {ROLE_NAMES[u.role] ?? "Unknown"}
</Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity onPress={() => {
  setSelectedUser(u);
  setNewRole(ROLE_NAMES[u.role]);
}}
                      style={{ backgroundColor: colors.primary + "18", borderRadius: 0, padding: 8 }}>
                      <ShieldCheck size={14} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteMutation.mutate(u.id)}
                      style={{ backgroundColor: colors.danger + "18", borderRadius: 0, padding: 8 }}>
                      <Trash2 size={14} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={!!selectedUser} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "#000000cc", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 0, borderTopRightRadius: 0, padding: 28 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800", marginBottom: 6 }}>Change Role</Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 20 }}>{selectedUser?.name}</Text>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
              {ROLES.map((r) => (
                <TouchableOpacity key={r} onPress={() => setNewRole(r)}
                  style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: 0, backgroundColor: newRole === r ? colors.primary : colors.inputBg, borderWidth: 1, borderColor: newRole === r ? colors.primary : colors.border }}>
                  <Text style={{ color: newRole === r ? "#fff" : colors.textMuted, fontWeight: "600" }}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => changeRoleMutation.mutate()} disabled={changeRoleMutation.isPending}
              style={{ backgroundColor: colors.primary, borderRadius: 0, padding: 16, alignItems: "center", marginBottom: 12 }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>{changeRoleMutation.isPending ? "Saving..." : "Save Role"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedUser(null)}
              style={{ borderRadius: 0, padding: 16, alignItems: "center", borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ color: colors.textMuted, fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
