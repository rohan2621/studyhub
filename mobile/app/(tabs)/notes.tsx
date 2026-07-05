import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, {
  FadeInDown, useSharedValue, useAnimatedStyle, withSpring,
} from "react-native-reanimated";
import {
  FileText, Star, Heart, Eye, Lock, Folder, ChevronLeft
} from "lucide-react-native";
import { api } from "../../lib/api";
import { useThemeStore } from "../../stores/themeStore";
import { useAuthStore } from "../../stores/authStore";
import InAppViewerModal from "../../components/InAppViewerModal";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function NoteCard({ note, type, index, colors, onUpvote, onViewFile }: any) {
  const heartScale = useSharedValue(1);
  const animatedHeart = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify().damping(14)}
      style={{ backgroundColor: colors.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16, marginBottom: 4 }}>{note.title}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{note.chapter}</Text>
          </View>
        </View>
        <View style={{
          backgroundColor: type === "TopperNote" ? colors.warning + "20" : colors.primary + "20",
          borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
          flexDirection: "row", alignItems: "center", gap: 4,
        }}>
          {type === "TopperNote" ? <Star size={12} color={colors.warning} /> : <FileText size={12} color={colors.primary} />}
          <Text style={{ color: type === "TopperNote" ? colors.warning : colors.primary, fontSize: 11, fontWeight: "700" }}>
            {type === "TopperNote" ? "Topper" : "Note"}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
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
            <TouchableOpacity
              onPress={() => onViewFile(note.fileUrl, note.title)}
              style={{ backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Eye size={13} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>View</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ backgroundColor: colors.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }}>
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
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const [viewLevel, setViewLevel] = useState<"subjects" | "files">("subjects");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const [viewerUrl, setViewerUrl] = useState("");
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerVisible, setViewerVisible] = useState(false);

  const onViewFile = (url: string, title: string) => {
    setViewerUrl(url);
    setViewerTitle(title);
    setViewerVisible(true);
  };

  const classLabel = user?.grade ? `Class ${user.grade}${user.section ?? ""}` : "";

  const { data: catalog, isLoading: isCatalogLoading, refetch: refetchCatalog } = useQuery({
    queryKey: ["catalog"],
    queryFn: async () => (await api.get(`/catalog?schoolId=${user?.schoolId}`)).data,
  });

  const { data: notes, isLoading: isNotesLoading, refetch: refetchNotes } = useQuery({
    queryKey: ["notes", selectedSubject],
    queryFn: async () => (await api.get(`/notes?type=Note&schoolId=${user?.schoolId}&grade=${user?.grade}&section=${user?.section || ""}&subject=${selectedSubject}`)).data?.data,
    enabled: viewLevel === "files" && !!selectedSubject
  });

  const upvoteMutation = useMutation({
    mutationFn: async (id: string) => (await api.post(`/notes/${id}/upvote`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });

  const mySubjects = catalog?.filter((c: any) => c.grade === user?.grade && (c.section === user?.section || !c.section)) || [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        
        {viewLevel === "files" ? (
          <TouchableOpacity onPress={() => { setViewLevel("subjects"); setSelectedSubject(null); }} style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
             <ChevronLeft size={24} color={colors.text} />
             <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700", marginLeft: 4 }}>{selectedSubject}</Text>
          </TouchableOpacity>
        ) : (
          <Animated.View entering={FadeInDown.springify().damping(14)} style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Folder size={24} color={colors.text} />
            <View>
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800", lineHeight: 28 }}>
                Subjects
              </Text>
              {classLabel ? (
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" }}>{classLabel}</Text>
              ) : null}
            </View>
          </Animated.View>
        )}

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={isCatalogLoading || isNotesLoading} onRefresh={() => { refetchCatalog(); if (viewLevel === 'files') refetchNotes(); }} tintColor={colors.primary} />}
        >
          {viewLevel === "subjects" && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 10 }}>
               {mySubjects.length === 0 && !isCatalogLoading && (
                  <View style={{ width: "100%", alignItems: "center", paddingVertical: 40 }}>
                     <Folder size={48} color={colors.border} />
                     <Text style={{ color: colors.textMuted, marginTop: 10, fontWeight: "600" }}>No subjects available</Text>
                  </View>
               )}
               {mySubjects.map((sub: any, idx: number) => (
                 <AnimatedTouchable
                   key={idx}
                   entering={FadeInDown.delay(idx * 50).springify()}
                   onPress={() => { setSelectedSubject(sub.subject); setViewLevel("files"); }}
                   style={{
                     width: "48%", backgroundColor: colors.card, borderRadius: 16, padding: 16,
                     borderWidth: 2, borderColor: colors.border, marginBottom: 16,
                   }}
                 >
                   <View style={{ backgroundColor: colors.primary + "15", alignSelf: "flex-start", padding: 10, borderRadius: 12, marginBottom: 12 }}>
                     <Folder size={24} color={colors.primary} />
                   </View>
                   <Text style={{ color: colors.text, fontSize: 16, fontWeight: "800", marginBottom: 6 }} numberOfLines={2}>
                     {sub.subject.toUpperCase()} NOTES
                   </Text>
                   <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "600" }}>{sub.itemCount} items</Text>
                   <Text style={{ color: colors.accent, fontSize: 10, fontWeight: "800", marginTop: 6 }}>ACTIVE</Text>
                 </AnimatedTouchable>
               ))}
            </View>
          )}

          {viewLevel === "files" && (
            <View style={{ marginTop: 10 }}>
              {notes?.length === 0 && !isNotesLoading ? (
                 <View style={{ width: "100%", alignItems: "center", paddingVertical: 40 }}>
                    <FileText size={48} color={colors.border} />
                    <Text style={{ color: colors.textMuted, marginTop: 10, fontWeight: "600" }}>Folder is empty</Text>
                 </View>
              ) : (
                notes?.map((n: any, idx: number) => (
                  <NoteCard
                    key={n.id} note={n} type={n.type} index={idx}
                    colors={colors}
                    onUpvote={(id: string) => upvoteMutation.mutate(id)}
                    onViewFile={onViewFile}
                  />
                ))
              )}
            </View>
          )}
        </ScrollView>
      </View>

      <InAppViewerModal
        visible={viewerVisible}
        url={viewerUrl}
        title={viewerTitle}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
}
