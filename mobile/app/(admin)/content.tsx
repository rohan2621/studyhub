import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  RefreshControl, Modal, TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { format } from "date-fns";
import {
  ArrowLeft, BookOpen, ClipboardList, FileStack, Calendar,
  Plus, Trash2, School, X, CheckCircle2,
} from "lucide-react-native";
import { api } from "../../lib/api";
import { useThemeStore } from "../../stores/themeStore";

const TABS = ["Notes", "Homework", "Papers", "Timetable"] as const;
type Tab = typeof TABS[number];

const NOTE_TYPES = ["Regular", "Topper"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TERMS = ["First", "Second", "Third", "Final"];

// Reusable school picker component
function SchoolPicker({ schools, selectedId, selectedName, onSelect, colors }: any) {
  if (selectedId) {
    return (
      <View style={{ backgroundColor: colors.success + "18", borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: colors.success + "40", marginBottom: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <School size={16} color={colors.success} />
          <Text style={{ color: colors.success, fontWeight: "700" }}>{selectedName}</Text>
        </View>
        <TouchableOpacity onPress={() => onSelect("", "")}>
          <X size={16} color={colors.success} />
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={{ backgroundColor: colors.inputBg, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: colors.border, marginBottom: 16 }}>
      {schools.length === 0 ? (
        <View style={{ padding: 14, alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} size="small" />
        </View>
      ) : (
        schools.slice(0, 8).map((s: any) => (
          <TouchableOpacity
            key={s.id}
            onPress={() => onSelect(s.id, s.name)}
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
  );
}

export default function AdminContentScreen() {
  const { colors } = useThemeStore();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("Notes");
  const [viewSchoolId, setViewSchoolId] = useState("");
  const [viewSchoolName, setViewSchoolName] = useState("");

  // ── Create form ──
  const [showModal, setShowModal] = useState(false);
  const [targetSchoolId, setTargetSchoolId] = useState("");
  const [targetSchoolName, setTargetSchoolName] = useState("");

  // Note fields
  const [noteTitle, setNoteTitle] = useState("");
  const [noteSubject, setNoteSubject] = useState("");
  const [noteChapter, setNoteChapter] = useState("");
  const [noteFileUrl, setNoteFileUrl] = useState("");
  const [noteType, setNoteType] = useState("Regular");

  // Homework fields
  const [hwTitle, setHwTitle] = useState("");
  const [hwSubject, setHwSubject] = useState("");
  const [hwDesc, setHwDesc] = useState("");
  const [hwDue, setHwDue] = useState("");

  // Past Paper fields
  const [ppSubject, setPpSubject] = useState("");
  const [ppYear, setPpYear] = useState(String(new Date().getFullYear()));
  const [ppTerm, setPpTerm] = useState("Final");
  const [ppFileUrl, setPpFileUrl] = useState("");

  // Timetable fields
  const [ttGrade, setTtGrade] = useState("");
  const [ttDay, setTtDay] = useState("Monday");
  const [ttPeriod, setTtPeriod] = useState("1");
  const [ttSubject, setTtSubject] = useState("");
  const [ttStart, setTtStart] = useState("08:00");
  const [ttEnd, setTtEnd] = useState("09:00");

  const { data: schools } = useQuery({
    queryKey: ["adminSchools"],
    queryFn: async () => (await api.get("/admin/schools")).data as any[],
  });

  // Content queries — keyed by viewSchoolId
  const { data: notes, isLoading: notesLoading, refetch: refetchNotes } = useQuery({
    queryKey: ["adminNotes", viewSchoolId],
    queryFn: async () => {
      const params = viewSchoolId ? `?schoolId=${viewSchoolId}` : "";
      return (await api.get(`/notes${params}`)).data?.data ?? [];
    },
    enabled: activeTab === "Notes",
  });

  const { data: homeworks, isLoading: hwLoading, refetch: refetchHw } = useQuery({
    queryKey: ["adminHomework", viewSchoolId],
    queryFn: async () => {
      const params = viewSchoolId ? `?schoolId=${viewSchoolId}` : "";
      return (await api.get(`/homework${params}`)).data?.data ?? [];
    },
    enabled: activeTab === "Homework",
  });

  const { data: papers, isLoading: papersLoading, refetch: refetchPapers } = useQuery({
    queryKey: ["adminPapers", viewSchoolId],
    queryFn: async () => (await api.get("/past-papers")).data ?? [],
    enabled: activeTab === "Papers",
  });

  const { data: slots, isLoading: slotsLoading, refetch: refetchSlots } = useQuery({
    queryKey: ["adminSlots", viewSchoolId],
    queryFn: async () => {
      const params = viewSchoolId ? `?grade=` : "";
      return (await api.get(`/timetable`)).data ?? [];
    },
    enabled: activeTab === "Timetable",
  });

  const isLoading = { Notes: notesLoading, Homework: hwLoading, Papers: papersLoading, Timetable: slotsLoading }[activeTab];
  const refetch = { Notes: refetchNotes, Homework: refetchHw, Papers: refetchPapers, Timetable: refetchSlots }[activeTab];

  const resetModal = () => {
    setShowModal(false);
    setTargetSchoolId(""); setTargetSchoolName("");
    setNoteTitle(""); setNoteSubject(""); setNoteChapter(""); setNoteFileUrl(""); setNoteType("Regular");
    setHwTitle(""); setHwSubject(""); setHwDesc(""); setHwDue("");
    setPpSubject(""); setPpYear(String(new Date().getFullYear())); setPpTerm("Final"); setPpFileUrl("");
    setTtGrade(""); setTtDay("Monday"); setTtPeriod("1"); setTtSubject(""); setTtStart("08:00"); setTtEnd("09:00");
  };

  const createNoteMutation = useMutation({
    mutationFn: async () => (await api.post("/notes", {
      title: noteTitle, subject: noteSubject, chapter: noteChapter, fileUrl: noteFileUrl, type: noteType,
      targetSchoolId: targetSchoolId || null,
    })).data,
    onSuccess: () => { Toast.show({ type: "success", text1: "Note created!" }); resetModal(); refetchNotes(); },
    onError: (e: any) => Toast.show({ type: "error", text1: e.response?.data?.error ?? "Failed" }),
  });

  const createHwMutation = useMutation({
    mutationFn: async () => (await api.post("/homework", {
      title: hwTitle, subject: hwSubject, description: hwDesc,
      dueAt: new Date(hwDue).toISOString(), attachmentUrl: null,
      targetSchoolId: targetSchoolId || null,
    })).data,
    onSuccess: () => { Toast.show({ type: "success", text1: "Homework created!" }); resetModal(); refetchHw(); },
    onError: (e: any) => Toast.show({ type: "error", text1: e.response?.data?.error ?? "Failed" }),
  });

  const createPaperMutation = useMutation({
    mutationFn: async () => (await api.post("/past-papers", {
      subject: ppSubject, year: parseInt(ppYear), term: ppTerm, fileUrl: ppFileUrl,
      targetSchoolId: targetSchoolId || null,
    })).data,
    onSuccess: () => { Toast.show({ type: "success", text1: "Past paper added!" }); resetModal(); refetchPapers(); },
    onError: (e: any) => Toast.show({ type: "error", text1: e.response?.data?.error ?? "Failed" }),
  });

  const createSlotMutation = useMutation({
    mutationFn: async () => (await api.post("/timetable", {
      grade: ttGrade, day: ttDay, period: parseInt(ttPeriod), subject: ttSubject,
      startTime: ttStart + ":00", endTime: ttEnd + ":00",
      targetSchoolId: targetSchoolId || null,
    })).data,
    onSuccess: () => { Toast.show({ type: "success", text1: "Slot added!" }); resetModal(); refetchSlots(); },
    onError: (e: any) => Toast.show({ type: "error", text1: e.response?.data?.error ?? "Failed" }),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/notes/${id}`)).data,
    onSuccess: () => { Toast.show({ type: "success", text1: "Deleted" }); refetchNotes(); },
  });
  const deleteHwMutation = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/homework/${id}`)).data,
    onSuccess: () => { Toast.show({ type: "success", text1: "Deleted" }); refetchHw(); },
  });
  const deletePaperMutation = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/past-papers/${id}`)).data,
    onSuccess: () => { Toast.show({ type: "success", text1: "Deleted" }); refetchPapers(); },
  });
  const deleteSlotMutation = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/timetable/${id}`)).data,
    onSuccess: () => { Toast.show({ type: "success", text1: "Deleted" }); refetchSlots(); },
  });

  const handleCreate = () => {
    if (activeTab === "Notes") createNoteMutation.mutate();
    else if (activeTab === "Homework") createHwMutation.mutate();
    else if (activeTab === "Papers") createPaperMutation.mutate();
    else createSlotMutation.mutate();
  };

  const isPending = createNoteMutation.isPending || createHwMutation.isPending || createPaperMutation.isPending || createSlotMutation.isPending;

  const TAB_ICONS: Record<Tab, any> = {
    Notes: BookOpen, Homework: ClipboardList, Papers: FileStack, Timetable: Calendar,
  };
  const TAB_COLORS: Record<Tab, string> = {
    Notes: "#6c63ff", Homework: "#06b6d4", Papers: "#10b981", Timetable: "#f59e0b",
  };

  const renderContent = () => {
    if (isLoading) return <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} size="large" />;

    if (activeTab === "Notes") {
      const list: any[] = notes ?? [];
      return list.length === 0
        ? <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 60 }}>No notes found</Text>
        : list.map((n: any) => (
          <View key={n.id} style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>{n.title}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{n.subject} · {n.chapter}</Text>
                <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{n.type} · {n.upvotes ?? 0} upvotes</Text>
              </View>
              <TouchableOpacity onPress={() => deleteNoteMutation.mutate(n.id)} style={{ backgroundColor: colors.danger + "18", borderRadius: 10, padding: 8 }}>
                <Trash2 size={14} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ));
    }

    if (activeTab === "Homework") {
      const list: any[] = homeworks ?? [];
      return list.length === 0
        ? <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 60 }}>No homework found</Text>
        : list.map((h: any) => (
          <View key={h.id} style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>{h.title}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{h.subject}</Text>
                <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>Due: {h.dueAt ? format(new Date(h.dueAt), "MMM dd, yyyy") : "—"}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteHwMutation.mutate(h.id)} style={{ backgroundColor: colors.danger + "18", borderRadius: 10, padding: 8 }}>
                <Trash2 size={14} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ));
    }

    if (activeTab === "Papers") {
      const list: any[] = papers ?? [];
      return list.length === 0
        ? <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 60 }}>No papers found</Text>
        : list.map((p: any) => (
          <View key={p.id} style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>{p.subject}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{p.year} · {p.term}</Text>
              </View>
              <TouchableOpacity onPress={() => deletePaperMutation.mutate(p.id)} style={{ backgroundColor: colors.danger + "18", borderRadius: 10, padding: 8 }}>
                <Trash2 size={14} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ));
    }

    // Timetable
    const list: any[] = slots ?? [];
    return list.length === 0
      ? <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 60 }}>No slots found</Text>
      : list.map((s: any) => (
        <View key={s.id} style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>{s.subject}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{s.day} · Period {s.period} · Grade {s.grade}</Text>
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{s.startTime} – {s.endTime}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteSlotMutation.mutate(s.id)} style={{ backgroundColor: colors.danger + "18", borderRadius: 10, padding: 8 }}>
              <Trash2 size={14} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      ));
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={colors.backgroundGrad as any} style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 }}>
          <ArrowLeft size={18} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: "600" }}>Admin</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800" }}>Content Manager</Text>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={{ backgroundColor: TAB_COLORS[activeTab], borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <Plus size={16} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "700" }}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Tab bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {TABS.map((tab) => {
              const Icon = TAB_ICONS[tab];
              const active = activeTab === tab;
              return (
                <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: active ? TAB_COLORS[tab] : colors.card, borderWidth: 1, borderColor: active ? TAB_COLORS[tab] : colors.border }}>
                  <Icon size={14} color={active ? "#fff" : colors.textMuted} />
                  <Text style={{ color: active ? "#fff" : colors.textMuted, fontSize: 13, fontWeight: "700" }}>{tab}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </LinearGradient>

      {/* School filter for viewing */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => { setViewSchoolId(""); setViewSchoolName(""); }}
            style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: !viewSchoolId ? TAB_COLORS[activeTab] : colors.card, borderWidth: 1, borderColor: !viewSchoolId ? TAB_COLORS[activeTab] : colors.border }}
          >
            <Text style={{ color: !viewSchoolId ? "#fff" : colors.textMuted, fontSize: 13, fontWeight: "600" }}>All Schools</Text>
          </TouchableOpacity>
          {(schools ?? []).map((s: any) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => { setViewSchoolId(s.id); setViewSchoolName(s.name); }}
              style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: viewSchoolId === s.id ? TAB_COLORS[activeTab] : colors.card, borderWidth: 1, borderColor: viewSchoolId === s.id ? TAB_COLORS[activeTab] : colors.border }}
            >
              <Text style={{ color: viewSchoolId === s.id ? "#fff" : colors.textMuted, fontSize: 13, fontWeight: "600" }}>{s.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4 }}>
        {renderContent()}
      </ScrollView>

      {/* ── Create Modal ── */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={{ flex: 1, backgroundColor: "#000000cc", justifyContent: "flex-end" }}>
            <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "94%" }}>
              {/* Header */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>
                  Add {activeTab === "Notes" ? "Note" : activeTab === "Homework" ? "Homework" : activeTab === "Papers" ? "Past Paper" : "Timetable Slot"}
                </Text>
                <TouchableOpacity onPress={resetModal} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: colors.inputBg, justifyContent: "center", alignItems: "center" }}>
                  <X size={18} color={colors.muted} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                {/* School target selector */}
                <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 8 }}>TARGET SCHOOL (optional — defaults to yours)</Text>
                <SchoolPicker
                  schools={schools ?? []}
                  selectedId={targetSchoolId}
                  selectedName={targetSchoolName}
                  onSelect={(id: string, name: string) => { setTargetSchoolId(id); setTargetSchoolName(name); }}
                  colors={colors}
                />

                {/* ── NOTES FORM ── */}
                {activeTab === "Notes" && (
                  <>
                    <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 8 }}>TYPE</Text>
                    <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                      {NOTE_TYPES.map((t) => (
                        <TouchableOpacity key={t} onPress={() => setNoteType(t)}
                          style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center", backgroundColor: noteType === t ? TAB_COLORS.Notes : colors.inputBg, borderWidth: 1, borderColor: noteType === t ? TAB_COLORS.Notes : colors.border }}>
                          <Text style={{ color: noteType === t ? "#fff" : colors.textMuted, fontWeight: "700" }}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {[["Title", noteTitle, setNoteTitle, "Note title"], ["Subject", noteSubject, setNoteSubject, "e.g. Mathematics"], ["Chapter", noteChapter, setNoteChapter, "e.g. Algebra"], ["File URL", noteFileUrl, setNoteFileUrl, "https://drive.google.com/..."]].map(([label, val, setter, ph]: any) => (
                      <View key={label}>
                        <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 6 }}>{(label as string).toUpperCase()}</Text>
                        <TextInput value={val} onChangeText={setter} placeholder={ph} placeholderTextColor={colors.muted}
                          style={{ backgroundColor: colors.inputBg, borderRadius: 12, padding: 14, color: colors.text, borderWidth: 1, borderColor: val ? TAB_COLORS.Notes : colors.border, marginBottom: 16, fontSize: 14 }} />
                      </View>
                    ))}
                  </>
                )}

                {/* ── HOMEWORK FORM ── */}
                {activeTab === "Homework" && (
                  <>
                    {[["Title", hwTitle, setHwTitle, "e.g. Chapter 5 exercises"], ["Subject", hwSubject, setHwSubject, "e.g. Mathematics"], ["Description", hwDesc, setHwDesc, "Describe the homework..."]].map(([label, val, setter, ph]: any) => (
                      <View key={label}>
                        <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 6 }}>{(label as string).toUpperCase()}</Text>
                        <TextInput value={val} onChangeText={setter} placeholder={ph} placeholderTextColor={colors.muted}
                          multiline={label === "Description"}
                          style={{ backgroundColor: colors.inputBg, borderRadius: 12, padding: 14, color: colors.text, borderWidth: 1, borderColor: val ? TAB_COLORS.Homework : colors.border, marginBottom: 16, height: label === "Description" ? 80 : undefined, textAlignVertical: label === "Description" ? "top" : "auto", fontSize: 14 }} />
                      </View>
                    ))}
                    <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 6 }}>DUE DATE (YYYY-MM-DD)</Text>
                    <TextInput value={hwDue} onChangeText={setHwDue} placeholder={format(new Date(), "yyyy-MM-dd")} placeholderTextColor={colors.muted}
                      style={{ backgroundColor: colors.inputBg, borderRadius: 12, padding: 14, color: colors.text, borderWidth: 1, borderColor: hwDue ? TAB_COLORS.Homework : colors.border, marginBottom: 16, fontSize: 14 }} />
                  </>
                )}

                {/* ── PAST PAPERS FORM ── */}
                {activeTab === "Papers" && (
                  <>
                    <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 6 }}>SUBJECT</Text>
                    <TextInput value={ppSubject} onChangeText={setPpSubject} placeholder="e.g. Mathematics" placeholderTextColor={colors.muted}
                      style={{ backgroundColor: colors.inputBg, borderRadius: 12, padding: 14, color: colors.text, borderWidth: 1, borderColor: ppSubject ? TAB_COLORS.Papers : colors.border, marginBottom: 16, fontSize: 14 }} />
                    <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 6 }}>YEAR</Text>
                    <TextInput value={ppYear} onChangeText={setPpYear} placeholder="2024" placeholderTextColor={colors.muted} keyboardType="numeric"
                      style={{ backgroundColor: colors.inputBg, borderRadius: 12, padding: 14, color: colors.text, borderWidth: 1, borderColor: TAB_COLORS.Papers, marginBottom: 16, fontSize: 14 }} />
                    <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 8 }}>TERM</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                      {TERMS.map((t) => (
                        <TouchableOpacity key={t} onPress={() => setPpTerm(t)}
                          style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: ppTerm === t ? TAB_COLORS.Papers : colors.inputBg, borderWidth: 1, borderColor: ppTerm === t ? TAB_COLORS.Papers : colors.border }}>
                          <Text style={{ color: ppTerm === t ? "#fff" : colors.textMuted, fontWeight: "600", fontSize: 13 }}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 6 }}>FILE URL</Text>
                    <TextInput value={ppFileUrl} onChangeText={setPpFileUrl} placeholder="https://drive.google.com/..." placeholderTextColor={colors.muted}
                      style={{ backgroundColor: colors.inputBg, borderRadius: 12, padding: 14, color: colors.text, borderWidth: 1, borderColor: ppFileUrl ? TAB_COLORS.Papers : colors.border, marginBottom: 16, fontSize: 14 }} />
                  </>
                )}

                {/* ── TIMETABLE FORM ── */}
                {activeTab === "Timetable" && (
                  <>
                    <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 8 }}>DAY</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        {DAYS.map((d) => (
                          <TouchableOpacity key={d} onPress={() => setTtDay(d)}
                            style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: ttDay === d ? TAB_COLORS.Timetable : colors.inputBg, borderWidth: 1, borderColor: ttDay === d ? TAB_COLORS.Timetable : colors.border }}>
                            <Text style={{ color: ttDay === d ? "#fff" : colors.textMuted, fontWeight: "600", fontSize: 13 }}>{d.slice(0, 3)}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                    {[["Grade", ttGrade, setTtGrade, "e.g. 10"], ["Period #", ttPeriod, setTtPeriod, "e.g. 1"], ["Subject", ttSubject, setTtSubject, "e.g. Mathematics"], ["Start (HH:MM)", ttStart, setTtStart, "08:00"], ["End (HH:MM)", ttEnd, setTtEnd, "09:00"]].map(([label, val, setter, ph]: any) => (
                      <View key={label}>
                        <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 6 }}>{(label as string).toUpperCase()}</Text>
                        <TextInput value={val} onChangeText={setter} placeholder={ph} placeholderTextColor={colors.muted}
                          keyboardType={label === "Period #" ? "numeric" : "default"}
                          style={{ backgroundColor: colors.inputBg, borderRadius: 12, padding: 14, color: colors.text, borderWidth: 1, borderColor: val ? TAB_COLORS.Timetable : colors.border, marginBottom: 16, fontSize: 14 }} />
                      </View>
                    ))}
                  </>
                )}

                {/* School isolation note */}
                <View style={{ backgroundColor: colors.accent + "12", borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: colors.accent + "30", flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                  <CheckCircle2 size={16} color={colors.accent} style={{ marginTop: 1 }} />
                  <Text style={{ color: colors.textMuted, fontSize: 12, flex: 1, lineHeight: 18 }}>
                    Content is isolated per school. Students only see content from their own school.
                    {targetSchoolId ? ` This will be posted to "${targetSchoolName}".` : " Defaulting to your school."}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleCreate}
                  disabled={isPending}
                  style={{ backgroundColor: TAB_COLORS[activeTab], borderRadius: 16, padding: 18, alignItems: "center", marginBottom: 12, flexDirection: "row", justifyContent: "center", gap: 8 }}
                >
                  {isPending ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <Plus size={18} color="#fff" />
                      <Text style={{ color: "#fff", fontWeight: "800", fontSize: 17 }}>Create {activeTab === "Notes" ? "Note" : activeTab === "Homework" ? "Homework" : activeTab === "Papers" ? "Paper" : "Slot"}</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={resetModal} style={{ borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: colors.border, marginBottom: 8 }}>
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
