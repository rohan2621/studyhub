import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learnApi } from '../../../../lib/api';
import { useThemeStore } from '../../../../stores/themeStore';
import { ScreenHeader } from '../../../../components/ui/ScreenHeader';
import { GradientButton } from '../../../../components/ui/GradientButton';
import Toast from 'react-native-toast-message';

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // This is the lessonId
  const { colors } = useThemeStore();
  const queryClient = useQueryClient();

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<any>(null);

  const { data: quiz, isLoading, error } = useQuery({
    queryKey: ['learn', 'quizzes', id],
    queryFn: () => learnApi.getQuizByLesson(id as string),
    enabled: !!id
  });

  const submitMutation = useMutation({
    mutationFn: (quizId: string) => learnApi.submitQuiz(quizId, answers),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['learn', 'progress'] });
      if (data.passed) {
        Toast.show({ type: 'success', text1: 'Quiz Passed! XP Awarded!' });
      } else {
        Toast.show({ type: 'error', text1: 'Quiz Failed. Try again!' });
      }
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Failed to submit quiz' });
    }
  });

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If no quiz, just go back
  if (error || !quiz) {
    return (
      <View className="flex-1 justify-center items-center p-4" style={{ backgroundColor: colors.background }}>
        <Text style={{ color: colors.error, marginBottom: 20 }}>No quiz available for this lesson.</Text>
        <GradientButton title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  if (result) {
    return (
      <View className="flex-1 justify-center items-center p-6" style={{ backgroundColor: colors.background }}>
        <Text className="text-3xl font-bold mb-4" style={{ color: colors.text }}>
          {result.passed ? 'Passed!' : 'Failed'}
        </Text>
        <Text className="text-xl mb-8" style={{ color: colors.textMuted }}>
          Score: {result.score}%
        </Text>
        
        <GradientButton 
          title="Back to Course" 
          onPress={() => router.navigate('/(tabs)/learn')} 
        />
      </View>
    );
  }

  const allAnswered = quiz.Questions.every((q: any) => answers[q.id] !== undefined);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader title={quiz.title} subtitle="Complete the quiz to earn XP" />
      
      <ScrollView className="flex-1 px-4 py-2">
        {quiz.Questions.map((q: any, idx: number) => (
          <View key={q.id} className="mb-6 bg-opacity-10 p-4 rounded-xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <Text className="text-base font-semibold mb-4" style={{ color: colors.text }}>
              {idx + 1}. {q.questionText}
            </Text>
            
            {q.options.map((opt: string, optIdx: number) => {
              const isSelected = answers[q.id] === optIdx;
              return (
                <TouchableOpacity
                  key={optIdx}
                  className={`p-3 mb-2 rounded-lg border ${isSelected ? 'border-primary' : ''}`}
                  style={{ 
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primary + '20' : 'transparent' 
                  }}
                  onPress={() => handleSelectOption(q.id, optIdx)}
                >
                  <Text style={{ color: colors.text }}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        <View className="mt-4 mb-12">
          <GradientButton 
            title={submitMutation.isPending ? "Submitting..." : "Submit Quiz"}
            onPress={() => submitMutation.mutate(quiz.id)}
            disabled={!allAnswered || submitMutation.isPending}
          />
        </View>
      </ScrollView>
    </View>
  );
}
