import React from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { learnApi } from '../../../../lib/api';
import { useThemeStore } from '../../../../stores/themeStore';
import { ScreenHeader } from '../../../../components/ui/ScreenHeader';
import { CourseCard } from '../../../../components/learn/CourseCard';

export default function DomainCoursesScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors } = useThemeStore();

  const { data: domain, isLoading, error } = useQuery({
    queryKey: ['learn', 'domains', slug],
    queryFn: () => learnApi.getDomainBySlug(slug as string),
    enabled: !!slug
  });

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader 
        title={domain?.name || 'Courses'} 
        subtitle={domain?.description || 'Loading...'}
      />
      
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error || !domain ? (
        <View className="flex-1 justify-center items-center p-4">
          <Text style={{ color: colors.error }}>Failed to load courses</Text>
        </View>
      ) : (
        <FlatList
          data={domain.courses || []}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 20 }}>
              No courses available in this domain yet.
            </Text>
          }
          renderItem={({ item }) => (
            <CourseCard 
              course={item}
              onPress={() => router.push(`/(tabs)/learn/courses/${item.slug}`)}
            />
          )}
        />
      )}
    </View>
  );
}
