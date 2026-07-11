import React from 'react';
import { View, FlatList, ActivityIndicator, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learnApi } from '../../../../lib/api';
import { useThemeStore } from '../../../../stores/themeStore';
import { ScreenHeader } from '../../../../components/ui/ScreenHeader';
import { LessonListItem } from '../../../../components/learn/LessonListItem';
import { GradientButton } from '../../../../components/ui/GradientButton';
import Toast from 'react-native-toast-message';

export default function CourseDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors } = useThemeStore();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['learn', 'courses', slug],
    queryFn: () => learnApi.getCourseBySlug(slug as string),
    enabled: !!slug
  });

  const enrollMutation = useMutation({
    mutationFn: (id: string) => learnApi.enrollCourse(id),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Enrolled successfully!' });
      queryClient.invalidateQueries({ queryKey: ['learn', 'courses', slug] });
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Failed to enroll' });
    }
  });

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View className="flex-1 justify-center items-center p-4" style={{ backgroundColor: colors.background }}>
        <Text style={{ color: colors.error }}>Failed to load course details</Text>
      </View>
    );
  }

  const { course, enrolled, progress } = data;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader 
        title={course.title} 
        subtitle={course.description}
      />
      
      {!enrolled && (
        <View className="p-5 border-b" style={{ borderColor: colors.border }}>
          <Text className="text-base mb-4" style={{ color: colors.text }}>
            Enroll in this course to track your progress and access all lessons.
          </Text>
          <GradientButton 
            title={enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
            onPress={() => enrollMutation.mutate(course.id)}
            disabled={enrollMutation.isPending}
          />
        </View>
      )}

      <FlatList
        data={course.lessons || []}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 20 }}
        ListHeaderComponent={
          <Text className="text-xl font-bold mb-4" style={{ color: colors.text }}>
            Lessons
          </Text>
        }
        renderItem={({ item, index }) => {
          // Simplistic locking logic: if enrolled, all unlocked. If not, only first is unlocked.
          const isLocked = !enrolled && index > 0;
          let status = isLocked ? 'Locked' : 'InProgress';
          // Would normally check progress state here
          
          return (
            <LessonListItem 
              lesson={item}
              status={status}
              onPress={() => {
                if (!isLocked) {
                  router.push(`/(tabs)/learn/lesson/${item.id}`);
                }
              }}
            />
          );
        }}
      />
    </View>
  );
}
