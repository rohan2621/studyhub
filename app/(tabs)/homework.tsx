import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { homeworkApi, HomeworkTab } from '../../src/api/homework';
import { GradientBackground } from '../../src/components/layout/GradientBackground';
import { AssignmentCard } from '../../src/components/cards/AssignmentCard';
import { ListSkeleton } from '../../src/components/loaders/CardSkeleton';
import { EmptyState } from '../../src/components/lists/EmptyState';
import { Colors, FontSize, FontWeight, Spacing } from '../../src/constants/theme';

const TABS: { label: string; value: HomeworkTab; icon: string }[] = [
  { label: 'Upcoming',  value: 'upcoming',  icon: '📅' },
  { label: 'Submitted', value: 'submitted', icon: '✅' },
  { label: 'Completed', value: 'completed', icon: '🏆' },
  { label: 'Overdue',   value: 'overdue',   icon: '⚠️' },
];

export default function HomeworkScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<HomeworkTab>('upcoming');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['homework', activeTab],
    queryFn:  ({ pageParam }) => homeworkApi.list(activeTab, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (p) => p.next_cursor ?? undefined,
  });

  const items = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Text style={styles.title}>Homework</Text>

        {/* Tab bar */}
        <View style={styles.tabRow}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[styles.tab, activeTab === t.value && styles.activeTab]}
              onPress={() => setActiveTab(t.value)}
            >
              <Text style={[styles.tabText, activeTab === t.value && styles.activeTabText]}>
                {t.icon} {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.pad}><ListSkeleton count={5} /></View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.pad}
            renderItem={({ item }) => (
              <AssignmentCard item={item} onPress={() => router.push(`/homework/${item.id}`)} />
            )}
            ListEmptyComponent={<EmptyState icon="🎉" title={`No ${activeTab} homework`} />}
            onEndReached={() => hasNextPage && fetchNextPage()}
            onEndReachedThreshold={0.4}
            ListFooterComponent={isFetchingNextPage ? <ListSkeleton count={2} /> : null}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title:     { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.navy, paddingHorizontal: Spacing.md, paddingTop: 60, marginBottom: 12 },
  tabRow:    { flexDirection: 'row', paddingHorizontal: Spacing.md, marginBottom: 12, gap: 6, flexWrap: 'wrap' },
  tab:       { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: Colors.glass, borderWidth: 1, borderColor: Colors.glassBorder },
  activeTab: { backgroundColor: Colors.primary },
  tabText:   { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  activeTabText: { color: Colors.white },
  pad:       { padding: Spacing.md, paddingTop: 4 },
});
