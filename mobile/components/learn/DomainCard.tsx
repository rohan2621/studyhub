import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';

interface DomainCardProps {
  domain: {
    id: string;
    name: string;
    slug: string;
    description: string;
  };
  onPress: () => void;
}

export function DomainCard({ domain, onPress }: DomainCardProps) {
  const { colors } = useThemeStore();

  return (
    <TouchableOpacity
      className="p-4 mb-4 rounded-2xl shadow-sm flex-row items-center border"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
      onPress={onPress}
    >
      <View className="flex-1">
        <Text className="text-xl font-bold mb-1" style={{ color: colors.text }}>
          {domain.name}
        </Text>
        <Text className="text-sm" style={{ color: colors.textMuted }} numberOfLines={2}>
          {domain.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
