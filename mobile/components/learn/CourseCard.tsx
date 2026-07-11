import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
  };
  onPress: () => void;
}

export function CourseCard({ course, onPress }: CourseCardProps) {
  const { colors } = useThemeStore();

  return (
    <TouchableOpacity
      className="p-5 mb-4 rounded-xl border flex-col"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
      onPress={onPress}
    >
      <Text className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
        {course.title}
      </Text>
      <Text className="text-sm leading-5" style={{ color: colors.textMuted }} numberOfLines={3}>
        {course.description}
      </Text>
    </TouchableOpacity>
  );
}
