import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { FileStack, Eye, Lock } from "lucide-react-native";
import { api } from "../../lib/api";
import { useThemeStore } from "../../stores/themeStore";
import InAppViewerModal from "../../components/InAppViewerModal";

export default function PastPapersScreen() {
  const { colors } = useThemeStore();
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");

  const [viewerUrl, setViewerUrl] = useState("");
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerVisible, setViewerVisible] = useState(false);

  const onViewFile = (url: string, title: string) => {
    setViewerUrl(url);
    setViewerTitle(title);
    setViewerVisible(true);
  };

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["pastpapers", subject, year],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (subject) params.append("subject", subject);
      if (year) params.append("year", year);
      return (await api.get(`/past-papers?${params}`)).data;
    },
  });

  const years = Array.from({ length: 8 }, (_, i) => String(new Date().getFullYear() - i));
  const papers = data ?? [];
  const subjects = [...new Set(papers.map((p: any) => p.subject))] as string[];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <FileStack size={24} color={colors.text} />
          <Text style={{ color: colors.text, fontSize: 26, fontWeight: "800" }}>Past Papers</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity onPress={() => setYear("")}
              style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 0, backgroundColor: !year ? colors.primary : colors.card, borderWidth: 1, borderColor: !year ? colors.primary : colors.border }}>
              <Text style={{ color: !year ? "#fff" : colors.textMuted, fontSize: 13, fontWeight: "600" }}>All Years</Text>
            </TouchableOpacity>
            {years.map((y) => (
              <TouchableOpacity key={y} onPress={() => setYear(year === y ? "" : y)}
                style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 0, backgroundColor: year === y ? colors.primary : colors.card, borderWidth: 1, borderColor: year === y ? colors.primary : colors.border }}>
                <Text style={{ color: year === y ? "#fff" : colors.textMuted, fontSize: 13, fontWeight: "600" }}>{y}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        {subjects.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={() => setSubject("")}
                style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 0, backgroundColor: !subject ? colors.accent : colors.card, borderWidth: 1, borderColor: !subject ? colors.accent : colors.border }}>
                <Text style={{ color: !subject ? "#fff" : colors.textMuted, fontSize: 13, fontWeight: "600" }}>All Subjects</Text>
              </TouchableOpacity>
              {subjects.map((s) => (
                <TouchableOpacity key={s} onPress={() => setSubject(subject === s ? "" : s)}
                  style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 0, backgroundColor: subject === s ? colors.accent : colors.card, borderWidth: 1, borderColor: subject === s ? colors.accent : colors.border }}>
                  <Text style={{ color: subject === s ? "#fff" : colors.textMuted, fontSize: 13, fontWeight: "600" }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}>
          {papers.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <FileStack size={48} color={colors.muted} style={{ marginBottom: 16 }} />
              <Text style={{ color: colors.textMuted, fontSize: 16 }}>No past papers found</Text>
            </View>
          ) : papers.map((paper: any) => (
            <View key={paper.id} style={{ backgroundColor: colors.card, borderRadius: 0, padding: 18, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <View>
                  <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>{paper.subject}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>{paper.year} • {paper.term}</Text>
                </View>
                <View style={{ backgroundColor: colors.success + "22", borderRadius: 0, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ color: colors.success, fontSize: 12, fontWeight: "700" }}>{paper.year}</Text>
                </View>
              </View>
              {paper.fileUrl ? (
                <TouchableOpacity
                  onPress={() => onViewFile(paper.fileUrl, `${paper.subject} (${paper.year} ${paper.term})`)}
                  style={{ backgroundColor: colors.primary, borderRadius: 0, padding: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
                >
                  <Eye size={16} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "700" }}>View Paper</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ backgroundColor: colors.border, borderRadius: 0, padding: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}>
                  <Lock size={16} color={colors.muted} />
                  <Text style={{ color: colors.muted, fontWeight: "700" }}>Unlock to View</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      <InAppViewerModal
        visible={viewerVisible}
        url={viewerUrl}
        title={viewerTitle}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
}
