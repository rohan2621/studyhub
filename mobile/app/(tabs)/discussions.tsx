import { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal, KeyboardAvoidingView, Platform } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as signalR from "@microsoft/signalr";
import { format } from "date-fns";
import { MessageCircle, Send, Plus, ArrowLeft, X } from "lucide-react-native";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";
import { storage } from "../../lib/storage";
import { API_URL } from "../../constants/Api";
import Toast from "react-native-toast-message";

export default function DiscussionsScreen() {
  const { colors } = useThemeStore();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [newReply, setNewReply] = useState("");
  const [showNewThread, setShowNewThread] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [rtReplies, setRtReplies] = useState<any[]>([]);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["discussions"],
    queryFn: async () => (await api.get("/discussions")).data,
  });

  const { data: replies, refetch: refetchReplies } = useQuery({
    queryKey: ["replies", selectedThread?.id],
    queryFn: async () => (await api.get(`/discussions/${selectedThread.id}/replies`)).data,
    enabled: !!selectedThread,
  });

  useEffect(() => {
    if (!selectedThread) return;
    setRtReplies([]);
    const connect = async () => {
      const token = await storage.get("accessToken");
      const conn = new signalR.HubConnectionBuilder()
        .withUrl(`${API_URL}/hubs/discussions?access_token=${token}`)
        .withAutomaticReconnect().build();
      conn.on("NewReply", (r: any) => {
        setRtReplies((prev) => [...prev, r]);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      });
      await conn.start();
      await conn.invoke("JoinThread", selectedThread.id);
      connectionRef.current = conn;
    };
    connect().catch(console.error);
    return () => {
      connectionRef.current?.invoke("LeaveThread", selectedThread.id).catch(() => {});
      connectionRef.current?.stop();
    };
  }, [selectedThread?.id]);

  const replyMutation = useMutation({
    mutationFn: async () => (await api.post(`/discussions/${selectedThread.id}/replies`, { body: newReply })).data,
    onSuccess: () => { setNewReply(""); refetchReplies(); },
    onError: (e: any) => Toast.show({ type: "error", text1: e.response?.data?.error ?? "Failed" }),
  });

  const threadMutation = useMutation({
    mutationFn: async () => (await api.post("/discussions", { subject: newSubject, title: newTitle, body: newBody })).data,
    onSuccess: () => {
      setShowNewThread(false); setNewTitle(""); setNewBody(""); setNewSubject("");
      refetch(); Toast.show({ type: "success", text1: "Thread created!" });
    },
    onError: (e: any) => Toast.show({ type: "error", text1: e.response?.data?.error ?? "Failed" }),
  });

  const allReplies = [...(replies ?? []), ...rtReplies];

  if (selectedThread) {
    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
          <TouchableOpacity onPress={() => setSelectedThread(null)} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <ArrowLeft size={18} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: "600" }}>Back</Text>
          </TouchableOpacity>
          <View style={{ backgroundColor: colors.primary + "22", borderRadius: 0, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 8 }}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" }}>{selectedThread.subject}</Text>
          </View>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>{selectedThread.title}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>By {selectedThread.author}</Text>
        </View>
        <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 20, gap: 12 }}>
          <View style={{ backgroundColor: colors.primary + "18", borderRadius: 0, padding: 16, borderWidth: 1, borderColor: colors.primary + "44" }}>
            <Text style={{ color: colors.text, lineHeight: 22 }}>{selectedThread.body}</Text>
          </View>
          {allReplies.map((r: any, i: number) => (
            <View key={r.id ?? i} style={{ backgroundColor: colors.card, borderRadius: 0, padding: 16, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 13 }}>{r.author ?? "You"}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>{r.createdAt ? format(new Date(r.createdAt), "MMM dd, HH:mm") : "Just now"}</Text>
              </View>
              <Text style={{ color: colors.text, lineHeight: 20 }}>{r.body}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={{
          padding: 16,
          paddingBottom: Platform.OS === "ios" ? 78 + 16 : 60 + 16,
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          flexDirection: "row",
          gap: 12,
          alignItems: "flex-end"
        }}>
          <TextInput value={newReply} onChangeText={setNewReply} placeholder="Write a reply..." placeholderTextColor={colors.muted} multiline
            style={{ flex: 1, backgroundColor: colors.inputBg, borderRadius: 0, padding: 12, color: colors.text, borderWidth: 1, borderColor: colors.border, maxHeight: 100 }} />
          <TouchableOpacity onPress={() => replyMutation.mutate()} disabled={!newReply.trim() || replyMutation.isPending}
            style={{ backgroundColor: colors.primary, borderRadius: 0, width: 48, height: 48, justifyContent: "center", alignItems: "center", opacity: !newReply.trim() ? 0.5 : 1 }}>
            <Send size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <MessageCircle size={24} color={colors.text} />
            <Text style={{ color: colors.text, fontSize: 26, fontWeight: "800" }}>Discussions</Text>
          </View>
          <TouchableOpacity onPress={() => setShowNewThread(true)}
            style={{ backgroundColor: colors.primary, borderRadius: 0, paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Plus size={16} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === "ios" ? 78 + 20 : 60 + 20, gap: 12 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}>
          {(data ?? []).map((thread: any) => (
            <TouchableOpacity key={thread.id} onPress={() => setSelectedThread(thread)}
              style={{ backgroundColor: colors.card, borderRadius: 0, padding: 18, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <View style={{ backgroundColor: colors.primary + "22", borderRadius: 0, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "700" }}>{thread.subject}</Text>
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>💬 {thread.replyCount}</Text>
              </View>
              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16, marginBottom: 6 }}>{thread.title}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }} numberOfLines={2}>{thread.body}</Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 10 }}>
                By {thread.author} • {format(new Date(thread.createdAt), "MMM dd")}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Modal visible={showNewThread} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={{ flex: 1, backgroundColor: "#000000bb", justifyContent: "flex-end" }}>
            <View style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 0, borderTopRightRadius: 0,
              maxHeight: "92%"
            }}>
              {/* Header */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>New Discussion</Text>
                <TouchableOpacity onPress={() => setShowNewThread(false)} style={{ padding: 4 }}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Form Body inside ScrollView */}
              <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {[["Subject", newSubject, setNewSubject, "e.g. Mathematics"],
                  ["Title", newTitle, setNewTitle, "What's your question?"]].map(([label, val, setter, ph]: any) => (
                  <View key={label}>
                    <Text style={{ color: colors.textMuted, marginBottom: 6, fontSize: 14 }}>{label}</Text>
                    <TextInput value={val} onChangeText={setter} placeholder={ph} placeholderTextColor={colors.muted}
                      style={{ backgroundColor: colors.inputBg, borderRadius: 0, padding: 14, color: colors.text, borderWidth: 1, borderColor: colors.border, marginBottom: 16 }} />
                  </View>
                ))}
                <Text style={{ color: colors.textMuted, marginBottom: 6, fontSize: 14 }}>Details</Text>
                <TextInput value={newBody} onChangeText={setNewBody} placeholder="Describe in detail..." placeholderTextColor={colors.muted}
                  multiline numberOfLines={4}
                  style={{ backgroundColor: colors.inputBg, borderRadius: 0, padding: 14, color: colors.text, borderWidth: 1, borderColor: colors.border, marginBottom: 20, height: 100, textAlignVertical: "top" }} />
                <TouchableOpacity onPress={() => threadMutation.mutate()} disabled={!newTitle || !newBody || !newSubject || threadMutation.isPending}
                  style={{ backgroundColor: colors.primary, borderRadius: 0, padding: 16, alignItems: "center", marginBottom: 12, opacity: !newTitle || !newBody || !newSubject ? 0.5 : 1 }}>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>{threadMutation.isPending ? "Posting..." : "Post Discussion"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowNewThread(false)}
                  style={{ borderRadius: 0, padding: 16, alignItems: "center", borderWidth: 1, borderColor: colors.border, marginBottom: 16 }}>
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
