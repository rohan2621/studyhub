import React from 'react';
import { View, Text } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';

interface XpBarProps {
  currentXp: number;
  nextLevelXp: number;
  level: number;
}

export function XpBar({ currentXp, nextLevelXp, level }: XpBarProps) {
  const { colors } = useThemeStore();
  
  // Calculate percentage, capping at 100%
  const percentage = Math.min(Math.max((currentXp / nextLevelXp) * 100, 0), 100);

  return (
    <View className="mb-4">
      <View className="flex-row justify-between mb-2">
        <Text className="font-bold" style={{ color: colors.primary }}>
          Level {level}
        </Text>
        <Text className="text-sm" style={{ color: colors.textMuted }}>
          {currentXp} / {nextLevelXp} XP
        </Text>
      </View>
      <View 
        className="h-3 w-full rounded-full overflow-hidden"
        style={{ backgroundColor: colors.border }}
      >
        <View 
          className="h-full rounded-full"
          style={{ 
            backgroundColor: colors.primary, 
            width: `${percentage}%` 
          }}
        />
      </View>
    </View>
  );
}
