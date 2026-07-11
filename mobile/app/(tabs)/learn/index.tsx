import React from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { learnApi } from '../../../lib/api';
import { useThemeStore } from '../../../stores/themeStore';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';
import { DomainCard } from '../../../components/learn/DomainCard';
import { GradientButton } from '../../../components/ui/GradientButton';

export default function LearnDomainsScreen() {
  const { colors } = useThemeStore();

  const { data: domains, isLoading, error } = useQuery({
    queryKey: ['learn', 'domains'],
    queryFn: learnApi.getDomains
  });

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader 
        title="Learn" 
        subtitle="Master new subjects" 
        rightElement={
          // F1 fix: removed invalid size="sm" prop — GradientButton has no size prop
          <GradientButton 
            title="My Progress" 
            onPress={() => router.push('/(tabs)/learn/progress')} 
          />
        }
      />
      
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center p-4">
          <Text style={{ color: colors.error }}>Failed to load domains</Text>
        </View>
      ) : (
        <FlatList
          data={domains}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <DomainCard 
              domain={item}
              onPress={() => router.push(`/(tabs)/learn/domains/${item.slug}`)}
            />
          )}
        />
      )}
    </View>
  );
}
