import React from 'react';
import { View, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { learnApi } from '../../../lib/api';
import { useThemeStore } from '../../../stores/themeStore';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';
import { XpBar } from '../../../components/learn/XpBar';
import { Flame } from 'lucide-react-native';

export default function ProgressScreen() {
  const { colors } = useThemeStore();

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['learn', 'progress', 'overview'],
    queryFn: learnApi.getProgressOverview
  });

  const { data: streak, isLoading: streakLoading } = useQuery({
    queryKey: ['learn', 'progress', 'streak'],
    queryFn: learnApi.getStreak
  });

  const isLoading = overviewLoading || streakLoading;

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader title="My Progress" />
      
      <ScrollView className="flex-1 px-4 py-4">
        {/* Level and XP */}
        {overview?.level && (
          <View className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>Current Level</Text>
            <XpBar 
              level={overview.level.currentLevel} 
              currentXp={overview.level.currentXp} 
              nextLevelXp={overview.level.nextLevelXp} 
            />
            <Text className="text-sm mt-2 text-center" style={{ color: colors.textMuted }}>
              Total XP: {overview.level.totalXp}
            </Text>
          </View>
        )}

        {/* Streak */}
        {streak && (
          <View className="mb-6 p-4 rounded-xl border flex-row items-center justify-between" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <View>
              <Text className="text-lg font-bold mb-1" style={{ color: colors.text }}>Learning Streak</Text>
              <Text className="text-sm" style={{ color: colors.textMuted }}>
                Keep it up every day!
              </Text>
            </View>
            <View className="items-center flex-row">
              <Flame color="#F97316" size={28} />
              <Text className="text-2xl font-bold ml-2" style={{ color: '#F97316' }}>
                {streak.currentStreak}
              </Text>
            </View>
          </View>
        )}

        {/* Enrolled Courses */}
        <View className="mb-6">
          <Text className="text-xl font-bold mb-4" style={{ color: colors.text }}>Enrolled Courses</Text>
          {overview?.enrolledCourses?.length > 0 ? (
            overview.enrolledCourses.map((c: any) => (
              <View key={c.id} className="mb-3 p-3 rounded-lg border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <Text className="text-base font-semibold" style={{ color: colors.text }}>{c.course.title}</Text>
                <Text className="text-sm mt-1" style={{ color: colors.textMuted }}>Status: {c.status}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: colors.textMuted }}>No enrolled courses yet.</Text>
          )}
        </View>

      </ScrollView>
    </View>
  );
}
