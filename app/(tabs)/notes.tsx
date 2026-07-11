import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { notesApi } from '../../src/api/notes';
import { GradientBackground } from '../../src/components/layout/GradientBackground';
import { NoteCard } from '../../src/components/cards/NoteCard';
import { ListSkeleton } from '../../src/components/loaders/CardSkeleton';
import { EmptyState } from '../../src/components/lists/EmptyState';
import { Colors, FontSize, FontWeight, Spacing } from '../../src/constants/theme';
import type { NoteType } from '../../src/types/api.types';

const TABS: { label: string; type: NoteType }[] = [
  { label: '📄 Notes',       type: 'note' },
  { label: '⭐ Topper Notes', type: 'topper_note' },
];

export default function NotesScreen() {
  const router                  = useRouter();
  const [activeTab, setActiveTab] = useState<NoteType>('note');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['notes', activeTab],
    queryFn:  ({ pageParam }) => notesApi.list({ type: activeTab, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });

  const notes = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.title}>Notes</Text>

        {/* Tab toggle */}
        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.type}
              style={[styles.tab, activeTab === tab.type && styles.activeTab]}
              onPress={() => setActiveTab(tab.type)}
            >
              <Text style={[styles.tabText, activeTab === tab.type && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        {isLoading ? (
          <View style={styles.listPad}><ListSkeleton count={5} /></View>
        ) : (
          <FlatList
            data={notes}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.listPad}
            renderItem={({ item }) => (
              <NoteCard item={item} onPress={() => router.push(`/notes/${item.id}`)} />
            )}
            ListEmptyComponent={<EmptyState icon="📚" title="No notes found" subtitle="Check back after the next upload." />}
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
  tabRow:    { flexDirection: 'row', paddingHorizontal: Spacing.md, marginBottom: 12, gap: 8 },
  tab:       { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.glass, borderWidth: 1, borderColor: Colors.glassBorder, alignItems: 'center' },
  activeTab: { backgroundColor: Colors.primary },
  tabText:   { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  activeTabText: { color: Colors.white },
  listPad:   { padding: Spacing.md, paddingTop: 4 },
});
