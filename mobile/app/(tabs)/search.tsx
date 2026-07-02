import { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react-native";
import { api } from "../../lib/api";
import { useThemeStore } from "../../stores/themeStore";

export default function SearchScreen() {
  const { colors } = useThemeStore();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["search", query, type],
    queryFn: async () => (await api.get(`/search?q=${query}${type ? `&type=${type}` : ""}`)).data,
    enabled: query.length > 1,
  });

  const kindColor = (k: string) =>
    ({ note: colors.primary, homework: colors.accent, pastpaper: colors.success }[k] ?? colors.muted);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={colors.backgroundGrad as any} style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: "800", marginBottom: 16 }}>Search</Text>
        <View style={{ flexDirection: "row", backgroundColor: colors.inputBg, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: query ? colors.primary : colors.border, alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            value={query} onChangeText={setQuery}
            placeholder="Search notes, homework, papers..."
            placeholderTextColor={colors.muted}
            style={{ flex: 1, color: colors.text, fontSize: 15 }}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <X size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[["", "All"], ["note", "Notes"], ["homework", "Homework"], ["pastpaper", "Past Papers"]].map(([key, label]) => (
              <TouchableOpacity key={key} onPress={() => setType(key)}
                style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: type === key ? colors.primary : colors.card, borderWidth: 1, borderColor: type === key ? colors.primary : colors.border }}>
                <Text style={{ color: type === key ? "#fff" : colors.textMuted, fontSize: 13, fontWeight: "600" }}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110, gap: 12 }}>
        {query.length < 2 ? (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Search size={48} color={colors.muted} style={{ marginBottom: 16 }} />
            <Text style={{ color: colors.textMuted, fontSize: 16 }}>Type at least 2 characters</Text>
          </View>
        ) : isLoading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : (data?.data?.length ?? 0) === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Text style={{ color: colors.textMuted, fontSize: 16 }}>No results found</Text>
          </View>
        ) : data?.data?.map((item: any) => (
          <View key={item.id} style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border, flexDirection: "row", gap: 14, alignItems: "center" }}>
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: kindColor(item.kind) + "22", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: kindColor(item.kind), fontSize: 11, fontWeight: "800" }}>{item.kind?.toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15, marginBottom: 4 }}>{item.title}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{item.subject}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
