import React, { useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WebView } from 'react-native-webview';
import { learnApi } from '../../../../lib/api';
import { useThemeStore } from '../../../../stores/themeStore';
import { ScreenHeader } from '../../../../components/ui/ScreenHeader';
import { GradientButton } from '../../../../components/ui/GradientButton';
import Toast from 'react-native-toast-message';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useThemeStore();
  const queryClient = useQueryClient();

  const { data: lesson, isLoading, error } = useQuery({
    queryKey: ['learn', 'lessons', id],
    queryFn: () => learnApi.getLesson(id as string),
    enabled: !!id
  });

  const completeMutation = useMutation({
    mutationFn: () => learnApi.completeLesson(id as string),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Lesson completed! +XP' });
      queryClient.invalidateQueries({ queryKey: ['learn', 'progress'] });
      // Proceed to quiz if available, or just go back
      router.push(`/(tabs)/learn/quiz/${id}`);
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Failed to complete lesson' });
    }
  });

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !lesson) {
    return (
      <View className="flex-1 justify-center items-center p-4" style={{ backgroundColor: colors.background }}>
        <Text style={{ color: colors.error }}>Failed to load lesson</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader title={lesson.title} />
      
      <ScrollView className="flex-1 px-4 py-2">
        <View className="mb-6">
          <Text className="text-base leading-relaxed" style={{ color: colors.text }}>
            {lesson.content}
          </Text>
        </View>

        {lesson.videoUrl && (
          <View className="h-64 mb-6 rounded-xl overflow-hidden bg-black">
            <WebView
              source={{ uri: lesson.videoUrl }}
              style={{ flex: 1 }}
              allowsInlineMediaPlayback
            />
          </View>
        )}

        <View className="mt-8 mb-12">
          <GradientButton 
            title={completeMutation.isPending ? "Completing..." : "Complete & Continue"}
            onPress={() => completeMutation.mutate()}
            disabled={completeMutation.isPending}
          />
        </View>
      </ScrollView>
    </View>
  );
}
