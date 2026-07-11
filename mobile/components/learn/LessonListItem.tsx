import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';
import { PlayCircle, CheckCircle2, Lock } from 'lucide-react-native';

interface LessonListItemProps {
  lesson: {
    id: string;
    title: string;
    durationMinutes?: number;
  };
  status: 'Completed' | 'InProgress' | 'Locked' | string;
  onPress: () => void;
}

export function LessonListItem({ lesson, status, onPress }: LessonListItemProps) {
  const { colors } = useThemeStore();
  const isLocked = status === 'Locked';
  const isCompleted = status === 'Completed';

  return (
    <TouchableOpacity
      className="p-4 mb-3 rounded-xl border flex-row items-center justify-between"
      style={{ 
        backgroundColor: colors.card, 
        borderColor: colors.border,
        opacity: isLocked ? 0.6 : 1 
      }}
      onPress={onPress}
      disabled={isLocked}
    >
      <View className="flex-row items-center flex-1">
        <View className="mr-3">
          {isCompleted ? (
            <CheckCircle2 color="#10B981" size={24} />
          ) : isLocked ? (
            <Lock color={colors.textMuted} size={24} />
          ) : (
            <PlayCircle color={colors.primary} size={24} />
          )}
        </View>
        <View className="flex-1">
          <Text 
            className="text-base font-medium" 
            style={{ color: colors.text }}
            numberOfLines={1}
          >
            {lesson.title}
          </Text>
          {lesson.durationMinutes && (
            <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>
              {lesson.durationMinutes} mins
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
