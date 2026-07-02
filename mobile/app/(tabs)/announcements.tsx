import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Megaphone, Pin } from "lucide-react-native";
import { api } from "../../lib/api";
import { useThemeStore } from "../../stores/themeStore";

export default function AnnouncementsScreen() {
  const { colors } = useThemeStore();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => (await api.get("/announcements")).data,
  });

  const all = data ?? [];
  const sorted = [...all.filter((a: any) => a.isPinned), ...all.filter((a: any) => !a.isPinned)];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={colors.backgroundGrad as any} style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Megaphone size={24} color={colors.text} />
          <Text style={{ color: colors.text, fontSize: 26, fontWeight: "800" }}>Announcements</Text>
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
            </View>
          ) : sorted.map((a: any) => (
            <View key={a.id} style={{
              backgroundColor: colors.card, borderRadius: 20, padding: 18,
              borderWidth: 1, borderColor: a.isPinned ? colors.warning + "60" : colors.border,
              borderLeftWidth: a.isPinned ? 4 : 1, borderLeftColor: a.isPinned ? colors.warning : colors.border,
            }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <Text style={{ color: colors.text, fontWeight: "800", fontSize: 16, flex: 1, marginRight: 10 }}>{a.title}</Text>
                {a.isPinned && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.warning + "20", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Pin size={11} color={colors.warning} />
                    <Text style={{ color: colors.warning, fontSize: 11, fontWeight: "700" }}>Pinned</Text>
                  </View>
                )}
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20, marginBottom: 10 }}>{a.body}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>
                {a.createdAt ? format(new Date(a.createdAt), "MMM dd, yyyy") : ""}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
