import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  RefreshControl, Modal, TextInput
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { format, formatDistanceToNow } from "date-fns";
import {
  ClipboardList, CheckCircle2, Upload, Clock,
  BookOpen, X, AlertCircle, CalendarDays, ChevronRight, Eye
} from "lucide-react-native";
import { api } from "../../lib/api";
import { useThemeStore } from "../../stores/themeStore";
import { useAuthStore } from "../../stores/authStore";
import InAppViewerModal from "../../components/InAppViewerModal";

const urgencyColor = (colors: any, u: string) =>
  ({ red: colors.danger, amber: colors.warning, green: colors.success }[u] ?? colors.muted);

const urgencyLabel = (hw: any) => {
  if (hw.daysUntilDue === 0) return "Due Today!";
  if (hw.daysUntilDue < 0)  return "Overdue";
  if (hw.daysUntilDue === 1) return "Due Tomorrow";
  return `${hw.daysUntilDue}d left`;
};

function HwCard({ hw, colors, onSubmit, onViewFile }: { hw: any; colors: any; onSubmit: () => void; onViewFile: (url: string, title: string) => void }) {
  const uc = urgencyColor(colors, hw.urgency ?? "green");
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => setExpanded(v => !v)}
      style={{
        backgroundColor: colors.card, borderRadius: 0,
        borderWidth: 1, borderColor: colors.border,
        marginBottom: 12, overflow: "hidden",
      }}
    >
      {/* Top urgency bar */}
      <View style={{ height: 3, backgroundColor: uc, width: "100%" }} />

      <View style={{ padding: 18 }}>
        {/* Title row */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ color: colors.text, fontWeight: "800", fontSize: 16, marginBottom: 3 }}>{hw.title}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <BookOpen size={11} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{hw.subject}</Text>
              </View>
              {hw.grade && (
                <View style={{
                  backgroundColor: colors.primary + "18", borderRadius: 0,
                  paddingHorizontal: 7, paddingVertical: 2,
                  borderWidth: 1, borderColor: colors.primary + "30",
                }}>
                  <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "800" }}>
                    Class {hw.grade}{hw.section ?? ""}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Urgency badge */}
          <View style={{
            backgroundColor: uc + "18", borderRadius: 0,
            paddingHorizontal: 10, paddingVertical: 6,
            borderWidth: 1, borderColor: uc + "44",
            alignItems: "center",
          }}>
            <Text style={{ color: uc, fontSize: 11, fontWeight: "900" }}>{urgencyLabel(hw)}</Text>
          </View>
        </View>

        {/* Due date row */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <CalendarDays size={13} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>
            Due {format(new Date(hw.dueAt), "EEE, MMM dd 'at' h:mm a")}
          </Text>
        </View>

        {/* Description (expandable) */}
        {hw.description && expanded && (
          <View style={{
            backgroundColor: colors.inputBg, borderRadius: 0, padding: 14,
            marginBottom: 12, borderWidth: 1, borderColor: colors.border,
          }}>
            <Text style={{ color: colors.text, fontSize: 14, lineHeight: 22 }}>{hw.description}</Text>
          </View>
        )}

        {/* Attachment link */}
        {hw.attachmentUrl && expanded && (
          <TouchableOpacity
            onPress={() => onViewFile(hw.attachmentUrl, `${hw.title} Attachment`)}
            style={{
              flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12,
              backgroundColor: colors.primary + "15", borderRadius: 0, padding: 12,
              borderWidth: 1, borderColor: colors.primary + "40",
            }}
          >
            <Eye size={14} color={colors.primary} />
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "700" }}>View Attachment</Text>
          </TouchableOpacity>
        )}

        {/* Submit / Submitted */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <ChevronRight size={14} color={colors.muted}
              style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }} />
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              {expanded ? "Collapse" : "View details"}
            </Text>
          </View>

          {hw.hasSubmitted ? (
            <View style={{
              backgroundColor: colors.success + "18", borderRadius: 0,
              paddingHorizontal: 14, paddingVertical: 8,
              flexDirection: "row", alignItems: "center", gap: 6,
              borderWidth: 1, borderColor: colors.success + "40",
            }}>
              <CheckCircle2 size={13} color={colors.success} />
              <Text style={{ color: colors.success, fontSize: 13, fontWeight: "800" }}>Submitted</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={onSubmit}
              style={{
                backgroundColor: colors.primary, borderRadius: 0,
                paddingHorizontal: 16, paddingVertical: 8,
                flexDirection: "row", alignItems: "center", gap: 6,
              }}>
              <Upload size={13} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "800" }}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeworkScreen() {
  const { colors } = useThemeStore();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const [tab, setTab] = useState<"pending" | "submitted">("pending");
  const [submitModal, setSubmitModal] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState("");

  const [viewerUrl, setViewerUrl] = useState("");
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerVisible, setViewerVisible] = useState(false);

  const onViewFile = (url: string, title: string) => {
    setViewerUrl(url);
    setViewerTitle(title);
    setViewerVisible(true);
  };

  const classLabel = user?.grade ? `Class ${user.grade}${user.section ?? ""}` : "";

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["homework", user?.grade, user?.section],
    queryFn: async () => (await api.get("/homework")).data,
  });

  const submitMutation = useMutation({
    mutationFn: async ({ id, fileUrl }: { id: string; fileUrl: string }) =>
      (await api.post(`/homework/${id}/submit`, { fileUrl })).data,
    onSuccess: () => {
      Toast.show({ type: "success", text1: "✅ Submitted!", text2: "Your homework has been submitted." });
      setSubmitModal(null);
      setFileUrl("");
      qc.invalidateQueries({ queryKey: ["homework"] });
    },
    onError: (e: any) => Toast.show({ type: "error", text1: "Failed", text2: e.response?.data?.error ?? "Please try again" }),
  });

  const homeworks: any[] = data?.data ?? [];
  const pending   = homeworks.filter((h: any) => !h.hasSubmitted);
  const submitted = homeworks.filter((h: any) => h.hasSubmitted);
  const filtered  = tab === "pending" ? pending : submitted;

  // Stats
  const overdue = pending.filter((h: any) => h.daysUntilDue < 0).length;
  const dueToday = pending.filter((h: any) => h.daysUntilDue === 0).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{
              width: 40, height: 40, borderRadius: 0,
              backgroundColor: colors.primary + "20", justifyContent: "center", alignItems: "center",
            }}>
              <ClipboardList size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800" }}>Homework</Text>
              {classLabel ? (
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" }}>{classLabel}</Text>
              ) : null}
            </View>
          </View>

          {/* Alert badges */}
          <View style={{ flexDirection: "row", gap: 6 }}>
            {dueToday > 0 && (
              <View style={{
                backgroundColor: colors.warning + "20", borderRadius: 0,
                paddingHorizontal: 10, paddingVertical: 5,
                borderWidth: 1, borderColor: colors.warning + "40",
                flexDirection: "row", alignItems: "center", gap: 4,
              }}>
                <Clock size={11} color={colors.warning} />
                <Text style={{ color: colors.warning, fontWeight: "800", fontSize: 11 }}>{dueToday} Today</Text>
              </View>
            )}
            {overdue > 0 && (
              <View style={{
                backgroundColor: colors.danger + "20", borderRadius: 0,
                paddingHorizontal: 10, paddingVertical: 5,
                borderWidth: 1, borderColor: colors.danger + "40",
                flexDirection: "row", alignItems: "center", gap: 4,
              }}>
                <AlertCircle size={11} color={colors.danger} />
                <Text style={{ color: colors.danger, fontWeight: "800", fontSize: 11 }}>{overdue} Overdue</Text>
              </View>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: "row", backgroundColor: colors.card, borderRadius: 0, padding: 4, borderWidth: 1, borderColor: colors.border }}>
          {([
            { key: "pending", label: `Pending (${pending.length})` },
            { key: "submitted", label: `Submitted (${submitted.length})` },
          ] as const).map(({ key, label }) => (
            <TouchableOpacity key={key} onPress={() => setTab(key)}
              style={{ flex: 1, borderRadius: 0, padding: 10, alignItems: "center", backgroundColor: tab === key ? colors.primary : "transparent" }}>
              <Text style={{ color: tab === key ? "#fff" : colors.textMuted, fontWeight: "700", fontSize: 13 }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── List ─────────────────────────────────────────────── */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={{ color: colors.textMuted }}>Loading homework…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        >
          {filtered.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
              <Text style={{ fontSize: 52 }}>{tab === "submitted" ? "🏆" : "📋"}</Text>
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>
                {tab === "submitted" ? "No submissions yet" : "All caught up!"}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: "center" }}>
                {tab === "submitted"
                  ? "Submit your first homework to see it here."
                  : "No pending homework for your class."}
              </Text>
            </View>
          ) : (
            filtered.map((hw: any) => (
              <HwCard
                key={hw.id}
                hw={hw}
                onSubmit={() => { setSubmitModal(hw.id); setFileUrl(""); }}
                onViewFile={onViewFile}
              />
            ))
          )}
        </ScrollView>
      )}

      {/* ── Submit Modal ─────────────────────────────────────── */}
      <Modal visible={!!submitModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "#000000bb", justifyContent: "flex-end" }}>
          <View style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 0, borderTopRightRadius: 0, padding: 28,
          }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>Submit Homework</Text>
              <TouchableOpacity onPress={() => setSubmitModal(null)}>
                <X size={22} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 1, marginBottom: 8 }}>FILE URL</Text>
            <TextInput
              value={fileUrl}
              onChangeText={setFileUrl}
              placeholder="https://drive.google.com/... or any URL"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              style={{
                backgroundColor: colors.inputBg, borderRadius: 0, padding: 16,
                color: colors.text, borderWidth: 1,
                borderColor: fileUrl ? colors.primary : colors.border,
                marginBottom: 8, fontSize: 14,
              }}
            />
            <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 20 }}>
              Upload your file to Google Drive, OneDrive, or any storage and paste the link.
            </Text>

            <TouchableOpacity
              onPress={() => submitMutation.mutate({ id: submitModal!, fileUrl })}
              disabled={!fileUrl.trim() || submitMutation.isPending}
              style={{
                backgroundColor: colors.primary, borderRadius: 0, padding: 16,
                alignItems: "center", marginBottom: 12,
                opacity: !fileUrl.trim() ? 0.5 : 1,
                flexDirection: "row", justifyContent: "center", gap: 8,
              }}
            >
              <Upload size={16} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
                {submitMutation.isPending ? "Submitting…" : "Submit Homework"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSubmitModal(null)}
              style={{ borderRadius: 0, padding: 14, alignItems: "center", borderWidth: 1, borderColor: colors.border }}
            >
              <Text style={{ color: colors.textMuted, fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <InAppViewerModal
        visible={viewerVisible}
        url={viewerUrl}
        title={viewerTitle}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
}
