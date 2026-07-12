import { useMemo, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Animated
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, BookOpen, Users } from "lucide-react-native";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// Maps js getDay() (0=Sun) → index into DAYS
const JS_DAY_TO_IDX: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 };

const PALETTE = [
  "#6c63ff", "#a855f7", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#6366f1", "#0284c7",
  "#ec4899", "#14b8a6",
];
const colorCache = new Map<string, string>();
let colorIdx = 0;
const subjectColor = (s: string) => {
  if (!colorCache.has(s)) colorCache.set(s, PALETTE[colorIdx++ % PALETTE.length]);
  return colorCache.get(s)!;
};

function PeriodCard({ slot, colors }: { slot: any; colors: any }) {
  const color = subjectColor(slot.subject);
  return (
    <View style={{
      backgroundColor: colors.card,
      borderRadius: 0, padding: 18,
      borderWidth: 1, borderColor: colors.border,
      flexDirection: "row", alignItems: "center", gap: 16,
      marginBottom: 10,
    }}>
      {/* Period circle */}
      <View style={{
        width: 52, height: 52, borderRadius: 0,
        backgroundColor: color + "22", justifyContent: "center", alignItems: "center",
        borderWidth: 1.5, borderColor: color + "44",
      }}>
        <Text style={{ color, fontWeight: "900", fontSize: 20 }}>{slot.period}</Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ color: colors.text, fontWeight: "800", fontSize: 16 }}>{slot.subject}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Clock size={11} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{slot.startTime} – {slot.endTime}</Text>
          </View>
          {slot.teacher && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Users size={11} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{slot.teacher}</Text>
            </View>
          )}
          {slot.room && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <BookOpen size={11} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>Room {slot.room}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Color accent bar */}
      <View style={{ width: 4, height: 44, borderRadius: 0, backgroundColor: color }} />
    </View>
  );
}

export default function TimetableScreen() {
  const { colors } = useThemeStore();
  const { user } = useAuthStore();

  // Auto-select today (default to Monday on weekend)
  const todayIdx = useMemo(() => {
    const d = new Date().getDay();
    return JS_DAY_TO_IDX[d] ?? 0;
  }, []);
  const [selectedIdx, setSelectedIdx] = useState(todayIdx);
  const selectedDay = DAYS[selectedIdx];

  const classLabel = user?.grade
    ? `Class ${user.grade}${user.section ?? ""}`
    : "";

  const { data, isLoading } = useQuery({
    queryKey: ["timetable", user?.grade, user?.section],
    queryFn: async () =>
      (await api.get(`/timetable?grade=${user?.grade}&section=${user?.section}`)).data,
    enabled: !!user?.grade,
  });

  const slots = useMemo(() =>
    (data ?? [])
      .filter((s: any) => s.day === selectedDay)
      .sort((a: any, b: any) => a.period - b.period),
    [data, selectedDay]);

  const totalPeriods = (data ?? []).filter((s: any) => s.day === selectedDay).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View
        style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{
              width: 40, height: 40, borderRadius: 0,
              backgroundColor: colors.primary + "20",
              justifyContent: "center", alignItems: "center",
            }}>
              <Calendar size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800", lineHeight: 26 }}>Timetable</Text>
              {classLabel ? (
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "700" }}>{classLabel}</Text>
              ) : null}
            </View>
          </View>

          {/* Day period count badge */}
          {!isLoading && (
            <View style={{
              backgroundColor: colors.primary + "18", borderRadius: 0,
              paddingHorizontal: 12, paddingVertical: 6,
              borderWidth: 1, borderColor: colors.primary + "30",
            }}>
              <Text style={{ color: colors.primary, fontWeight: "800", fontSize: 13 }}>
                {totalPeriods} Periods
              </Text>
            </View>
          )}
        </View>

        {/* ── Day Tabs ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {DAYS.map((day, i) => {
              const isToday = i === todayIdx;
              const isSelected = i === selectedIdx;
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => setSelectedIdx(i)}
                  style={{
                    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 0,
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderWidth: 1.5,
                    borderColor: isSelected
                      ? colors.primary
                      : isToday ? colors.primary + "60" : colors.border,
                  }}
                >
                  <Text style={{
                    color: isSelected ? "#fff" : isToday ? colors.primary : colors.textMuted,
                    fontWeight: "800", fontSize: 13,
                  }}>
                    {DAY_SHORT[i]}
                  </Text>
                  {isToday && !isSelected && (
                    <View style={{
                      width: 4, height: 4, borderRadius: 0,
                      backgroundColor: colors.primary, alignSelf: "center", marginTop: 3,
                    }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* ── Body ─────────────────────────────────────────────── */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>Loading schedule…</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* Day label */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>
              {selectedDay}
              {selectedIdx === todayIdx ? (
                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "600" }}> · Today</Text>
              ) : null}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </Text>
          </View>

          {slots.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
              <Text style={{ fontSize: 56 }}>🎉</Text>
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>Free Day!</Text>
              <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: "center" }}>
                No classes scheduled for {selectedDay}.{"\n"}Enjoy your time!
              </Text>
            </View>
          ) : (
            slots.map((slot: any) => (
              <PeriodCard key={slot.id} slot={slot} colors={colors} />
            ))
          )}

          {/* Weekly summary strip */}
          {slots.length > 0 && (
            <View style={{
              marginTop: 20, padding: 16,
              backgroundColor: colors.card, borderRadius: 0,
              borderWidth: 1, borderColor: colors.border,
            }}>
              <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 1, marginBottom: 10 }}>
                SUBJECTS TODAY
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {[...new Set(slots.map((s: any) => s.subject))].map((sub: any) => {
                  const c = subjectColor(sub);
                  return (
                    <View key={sub} style={{
                      flexDirection: "row", alignItems: "center", gap: 6,
                      backgroundColor: c + "18", borderRadius: 0,
                      paddingHorizontal: 10, paddingVertical: 5,
                      borderWidth: 1, borderColor: c + "40",
                    }}>
                      <View style={{ width: 6, height: 6, borderRadius: 0, backgroundColor: c }} />
                      <Text style={{ color: c, fontSize: 12, fontWeight: "700" }}>{sub}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
