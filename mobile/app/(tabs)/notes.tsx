import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown, useSharedValue, useAnimatedStyle, withSpring,
} from "react-native-reanimated";
import {
  Search, FileText, Star, Heart, Download, Lock,
} from "lucide-react-native";
import { api } from "../../lib/api";
import { useThemeStore } from "../../stores/themeStore";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function NoteCard({ note, type, index, colors, onUpvote }: any) {
  const heartScale = useSharedValue(1);
  const animatedHeart = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify().damping(14)}
      style={{ backgroundColor: colors.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.border }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16, marginBottom: 4 }}>{note.title}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{note.subject} • {note.chapter}</Text>
        </View>
        <View style={{
          backgroundColor: type === "TopperNote" ? colors.warning + "20" : colors.primary + "20",
          borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
          flexDirection: "row", alignItems: "center", gap: 4,
        }}>
          {type === "TopperNote" ? <Star size={12} color={colors.warning} /> : <FileText size={12} color={colors.primary} />}
          <Text style={{ color: type === "TopperNote" ? colors.warning : colors.primary, fontSize: 11, fontWeight: "700" }}>
            {type === "TopperNote" ? "Topper" : "Note"}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>By {note.uploader}</Text>
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <AnimatedTouchable
            onPress={() => {
              heartScale.value = withSpring(1.3, { damping: 6 }, () => {
                heartScale.value = withSpring(1, { damping: 8 });
              });
              onUpvote(note.id);
            }}
            style={[{ flexDirection: "row", alignItems: "center", gap: 4 }, animatedHeart]}
          >
            <Heart size={16} color={note.hasUpvoted ? colors.danger : colors.muted} fill={note.hasUpvoted ? colors.danger : "transparent"} />
            <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: "600" }}>{note.upvotes}</Text>
          </AnimatedTouchable>

          {note.fileUrl ? (
            <TouchableOpacity style={{ backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Download size={13} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>Download</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ backgroundColor: colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Lock size={13} color={colors.muted} />
              <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "700" }}>Locked</Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export default function NotesScreen() {
  const { colors } = useThemeStore();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState<"Note" | "TopperNote">("Note");

  const { data: notes, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["notes", type, subject],
    queryFn: async () => (await api.get(`/notes?type=${type}${subject ? `&subject=${subject}` : ""}`)).data,
  });

  const { data: subjects } = useQuery({
    queryKey: ["noteSubjects"],
    queryFn: async () => (await api.get("/notes/subjects")).data,
  });

  const upvoteMutation = useMutation({
    mutationFn: async (id: string) => (await api.post(`/notes/${id}/upvote`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });

  const filtered = notes?.data?.filter((n: any) =>
    !search || n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.subject.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={colors.backgroundGrad} style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        <Animated.View entering={FadeInDown.springify().damping(14)} style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
          {type === "Note" ? <FileText size={24} color={colors.text} /> : <Star size={24} color={colors.text} />}
          <Text style={{ color: colors.text, fontSize: 26, fontWeight: "800" }}>
            {type === "Note" ? "Notes" : "Topper Notes"}
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(80).springify().damping(14)}
          style={{ flexDirection: "row", backgroundColor: colors.card, borderRadius: 14, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}
        >
          {(["Note", "TopperNote"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setType(t)}
              style={{
                flex: 1, borderRadius: 10, padding: 10, alignItems: "center",
                backgroundColor: type === t ? colors.primary : "transparent",
                flexDirection: "row", justifyContent: "center", gap: 6,
              }}
            >
              {t === "Note"
                ? <FileText size={14} color={type === t ? "#fff" : colors.textMuted} />
                : <Star size={14} color={type === t ? "#fff" : colors.textMuted} />}
              <Text style={{ color: type === t ? "#fff" : colors.textMuted, fontWeight: "700", fontSize: 13 }}>
                {t === "Note" ? "Notes" : "Topper"}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(140).springify().damping(14)}
          style={{ flexDirection: "row", backgroundColor: colors.inputBg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: colors.border, alignItems: "center", gap: 10 }}
        >
          <Search size={18} color={colors.textMuted} />
          <TextInput
            value={search} onChangeText={setSearch}
            placeholder="Search notes..." placeholderTextColor={colors.muted}
            style={{ flex: 1, color: colors.text, fontSize: 15 }}
          />
        </Animated.View>
      </LinearGradient>

      {subjects && subjects.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 50 }} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8, gap: 8 }}>
          <TouchableOpacity
            onPress={() => setSubject("")}
            style={{ paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: !subject ? colors.primary : colors.card, borderWidth: 1, borderColor: !subject ? colors.primary : colors.border }}
          >
            <Text style={{ color: !subject ? "#fff" : colors.textMuted, fontSize: 13, fontWeight: "600" }}>All</Text>
          </TouchableOpacity>
          {subjects.map((s: string) => (
            <TouchableOpacity
              key={s} onPress={() => setSubject(subject === s ? "" : s)}
              style={{ paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: subject === s ? colors.primary : colors.card, borderWidth: 1, borderColor: subject === s ? colors.primary : colors.border }}
            >
              <Text style={{ color: subject === s ? "#fff" : colors.textMuted, fontSize: 13, fontWeight: "600" }}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 12 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        >
          {filtered.length === 0 ? (
            <Animated.View entering={FadeInDown} style={{ alignItems: "center", paddingTop: 60 }}>
              <FileText size={48} color={colors.muted} style={{ marginBottom: 16 }} />
              <Text style={{ color: colors.textMuted, fontSize: 16 }}>No notes found</Text>
            </Animated.View>
          ) : (
            filtered.map((note: any, i: number) => (
              <NoteCard key={note.id} note={note} type={type} index={i} colors={colors} onUpvote={upvoteMutation.mutate} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}