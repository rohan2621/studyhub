import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  RefreshControl, Modal, TextInput, KeyboardAvoidingView, Platform, Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { format } from "date-fns";
import { ArrowLeft, Megaphone, Plus, Trash2, Pin, Globe, School, X } from "lucide-react-native";
import { api } from "../../lib/api";
import { useThemeStore } from "../../stores/themeStore";

export default function AdminAnnouncementsScreen() {
  const { colors } = useThemeStore();
  const qc = useQueryClient();

  // Create form state
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [target, setTarget] = useState<"AllSchools" | "SpecificSchool">("AllSchools");
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [selectedSchoolName, setSelectedSchoolName] = useState("");
  const [schoolSearch, setSchoolSearch] = useState("");

  const { data: announcements, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["adminAnnouncements"],
    // Admin sees all announcements (we fetch from user endpoint — reuse existing)
    queryFn: async () => {
      // fetch from both "AllSchools" and try to get all via admin
      const res = await api.get("/announcements");
      return res.data as any[];
    },
  });

  const { data: schoolsData } = useQuery({
    queryKey: ["adminSchoolSearch", schoolSearch],
    queryFn: async () => (await api.get(`/admin/schools`)).data as any[],
    enabled: target === "SpecificSchool",
  });

  const schools: any[] = schoolsData ?? [];

  const resetForm = () => {
    setShowModal(false);
    setTitle(""); setBody(""); setIsPinned(false);
    setTarget("AllSchools");
    setSelectedSchoolId(""); setSelectedSchoolName(""); setSchoolSearch("");
  };

  const createMutation = useMutation({
    mutationFn: async () =>
      (await api.post("/announcements", {
        title,
        body,
        isPinned,
        target,
        schoolId: target === "SpecificSchool" ? selectedSchoolId : null,
      })).data,
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Announcement posted!" });
      resetForm();
      qc.invalidateQueries({ queryKey: ["adminAnnouncements"] });
    },
    onError: (e: any) => Toast.show({ type: "error", text1: e.response?.data?.error ?? "Failed" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/announcements/${id}`)).data,
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Deleted" });
      qc.invalidateQueries({ queryKey: ["adminAnnouncements"] });
    },
    onError: (e: any) => Toast.show({ type: "error", text1: e.response?.data?.error ?? "Failed" }),
  });

  const canCreate = title.trim() && body.trim() &&
    (target === "AllSchools" || (target === "SpecificSchool" && selectedSchoolId));

  const sorted = [...(announcements ?? [])].sort((a, b) =>
    Number(b.isPinned) - Number(a.isPinned) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={colors.backgroundGrad as any} style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 }}>
          <ArrowLeft size={18} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: "600" }}>Admin</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Megaphone size={22} color={colors.text} />
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800" }}>Announcements</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={{ backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <Plus size={16} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "700" }}>New</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 12 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        >
          {sorted.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Megaphone size={48} color={colors.muted} style={{ marginBottom: 16 }} />
              <Text style={{ color: colors.textMuted, fontSize: 16 }}>No announcements yet</Text>
              <TouchableOpacity
                onPress={() => setShowModal(true)}
                style={{ marginTop: 20, backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14, flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Plus size={16} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Post First Announcement</Text>
              </TouchableOpacity>
            </View>
          ) : (
            sorted.map((a: any) => (
              <View
                key={a.id}
                style={{
                  backgroundColor: colors.card, borderRadius: 20, padding: 18,
                  borderWidth: 1, borderColor: a.isPinned ? colors.warning + "60" : colors.border,
                  borderLeftWidth: a.isPinned ? 4 : 1, borderLeftColor: a.isPinned ? colors.warning : colors.border,
                }}
              >
                {/* Header row */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      {a.isPinned && (
                        <View style={{ backgroundColor: colors.warning + "22", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <Pin size={10} color={colors.warning} />
                          <Text style={{ color: colors.warning, fontSize: 10, fontWeight: "700" }}>Pinned</Text>
                        </View>
                      )}
                      <View style={{ backgroundColor: a.target === "AllSchools" ? colors.primary + "22" : colors.accent + "22", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, flexDirection: "row", alignItems: "center", gap: 4 }}>
                        {a.target === "AllSchools"
                          ? <Globe size={10} color={colors.primary} />
                          : <School size={10} color={colors.accent} />}
                        <Text style={{ color: a.target === "AllSchools" ? colors.primary : colors.accent, fontSize: 10, fontWeight: "700" }}>
                          {a.target === "AllSchools" ? "All Schools" : "Specific School"}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ color: colors.text, fontWeight: "800", fontSize: 16 }}>{a.title}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteMutation.mutate(a.id)}
                    style={{ backgroundColor: colors.danger + "18", borderRadius: 10, padding: 8 }}
                  >
                    <Trash2 size={15} color={colors.danger} />
                  </TouchableOpacity>
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20, marginBottom: 10 }}>{a.body}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  {a.createdAt ? format(new Date(a.createdAt), "MMM dd, yyyy · HH:mm") : ""}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* ── Create Announcement Modal ── */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={{ flex: 1, backgroundColor: "#000000cc", justifyContent: "flex-end" }}>
            <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "94%" }}>
              {/* Fixed header */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>New Announcement</Text>
                <TouchableOpacity onPress={resetForm} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: colors.inputBg, justifyContent: "center", alignItems: "center" }}>
                  <X size={18} color={colors.muted} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                {/* Title */}
                <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 8 }}>TITLE</Text>
                <TextInput
                  value={title} onChangeText={setTitle}
                  placeholder="e.g. School closes early Friday"
                  placeholderTextColor={colors.muted}
                  style={{ backgroundColor: colors.inputBg, borderRadius: 14, padding: 14, color: colors.text, borderWidth: 1, borderColor: title ? colors.primary : colors.border, marginBottom: 20, fontSize: 15 }}
                />

                {/* Body */}
                <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 8 }}>MESSAGE</Text>
                <TextInput
                  value={body} onChangeText={setBody}
                  placeholder="Write your announcement..."
                  placeholderTextColor={colors.muted}
                  multiline numberOfLines={4}
                  style={{ backgroundColor: colors.inputBg, borderRadius: 14, padding: 14, color: colors.text, borderWidth: 1, borderColor: body ? colors.primary : colors.border, marginBottom: 20, height: 100, textAlignVertical: "top", fontSize: 15 }}
                />

                {/* Target Audience */}
                <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 10 }}>TARGET AUDIENCE</Text>
                <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
                  {(["AllSchools", "SpecificSchool"] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => { setTarget(t); setSelectedSchoolId(""); setSelectedSchoolName(""); }}
                      style={{
                        flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: "center",
                        backgroundColor: target === t ? colors.primary : colors.inputBg,
                        borderWidth: 1.5, borderColor: target === t ? colors.primary : colors.border,
                        flexDirection: "row", justifyContent: "center", gap: 6,
                      }}
                    >
                      {t === "AllSchools"
                        ? <Globe size={14} color={target === t ? "#fff" : colors.textMuted} />
                        : <School size={14} color={target === t ? "#fff" : colors.textMuted} />}
                      <Text style={{ color: target === t ? "#fff" : colors.textMuted, fontWeight: "700", fontSize: 13 }}>
                        {t === "AllSchools" ? "All Schools" : "One School"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* School Picker (shown only when SpecificSchool) */}
                {target === "SpecificSchool" && (
                  <View style={{ marginBottom: 20 }}>
                    {selectedSchoolId ? (
                      <View style={{ backgroundColor: colors.success + "18", borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: colors.success + "40" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <School size={16} color={colors.success} />
                          <Text style={{ color: colors.success, fontWeight: "700" }}>{selectedSchoolName}</Text>
                        </View>
                        <TouchableOpacity onPress={() => { setSelectedSchoolId(""); setSelectedSchoolName(""); }}>
                          <X size={16} color={colors.success} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View>
                        <View style={{ backgroundColor: colors.inputBg, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: colors.border }}>
                          {schools.length === 0 ? (
                            <View style={{ padding: 16, alignItems: "center" }}>
                              <ActivityIndicator color={colors.primary} size="small" />
                              <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 8 }}>Loading schools...</Text>
                            </View>
                          ) : (
                            schools.map((s: any) => (
                              <TouchableOpacity
                                key={s.id}
                                onPress={() => { setSelectedSchoolId(s.id); setSelectedSchoolName(s.name); }}
                                style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", gap: 10 }}
                              >
                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />
                                <View>
                                  <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>{s.name}</Text>
                                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>{s.city}</Text>
                                </View>
                              </TouchableOpacity>
                            ))
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Pin toggle */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.inputBg, borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Pin size={18} color={isPinned ? colors.warning : colors.muted} />
                    <View>
                      <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14 }}>Pin Announcement</Text>
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>Shows at top of the list</Text>
                    </View>
                  </View>
                  <Switch
                    value={isPinned}
                    onValueChange={setIsPinned}
                    trackColor={{ false: colors.border, true: colors.warning + "66" }}
                    thumbColor={isPinned ? colors.warning : colors.muted}
                  />
                </View>

                {/* Preview summary */}
                {canCreate && (
                  <View style={{ backgroundColor: colors.primary + "10", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.primary + "30" }}>
                    <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 13, marginBottom: 4 }}>Preview</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>📢 {title}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
                      Target: {target === "AllSchools" ? "All Schools" : selectedSchoolName}
                      {isPinned ? " · 📌 Pinned" : ""}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => createMutation.mutate()}
                  disabled={!canCreate || createMutation.isPending}
                  style={{
                    backgroundColor: colors.primary, borderRadius: 16, padding: 18,
                    alignItems: "center", marginBottom: 12,
                    opacity: !canCreate ? 0.4 : 1,
                    flexDirection: "row", justifyContent: "center", gap: 8,
                  }}
                >
                  {createMutation.isPending
                    ? <ActivityIndicator color="#fff" />
                    : <>
                        <Megaphone size={18} color="#fff" />
                        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 17 }}>Post Announcement</Text>
                      </>
                  }
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={resetForm}
                  style={{ borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: colors.border, marginBottom: 8 }}
                >
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
