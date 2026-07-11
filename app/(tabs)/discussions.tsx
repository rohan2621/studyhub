import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { discussionApi, DiscussionTab } from '../../src/api/discussion';
import { GradientBackground } from '../../src/components/layout/GradientBackground';
import { GlassCard } from '../../src/components/cards/GlassCard';
import { PrimaryButton } from '../../src/components/buttons/PrimaryButton';
import { ListSkeleton } from '../../src/components/loaders/CardSkeleton';
import { EmptyState } from '../../src/components/lists/EmptyState';
import { useTokenStore } from '../../src/store/tokenStore';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants/theme';
import { relativeTime } from '../../src/utils/date';

const TABS: { label: string; value: DiscussionTab }[] = [
  { label: '🔥 Trending', value: 'trending' },
  { label: '📌 Pinned',   value: 'pinned' },
  { label: '✍️ My Posts', value: 'my_posts' },
  { label: '🔖 Saved',    value: 'bookmarks' },
];

export default function DiscussionsScreen() {
  const router = useRouter();
  const { previewOnly } = useTokenStore();
  const [activeTab, setActiveTab] = useState<DiscussionTab>('trending');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['discussions', activeTab],
    queryFn:  ({ pageParam }) => discussionApi.listThreads(activeTab, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (p) => p.next_cursor ?? undefined,
  });

  const threads = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <Text style={styles.title}>Discussions</Text>
          {!previewOnly && (
            <PrimaryButton label="+ New" onPress={() => router.push('/discussions/new')} style={styles.newBtn} />
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map((t) => (
            <TouchableOpacity key={t.value}
              style={[styles.tab, activeTab === t.value && styles.activeTab]}
              onPress={() => setActiveTab(t.value)}
            >
              <Text style={[styles.tabText, activeTab === t.value && styles.activeTabText]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.pad}><ListSkeleton count={5} /></View>
        ) : (
          <FlatList
            data={threads}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.pad}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => router.push(`/discussions/${item.id}`)}>
                <GlassCard style={styles.card}>
                  {item.is_pinned && <Text style={styles.pinBadge}>📌 Pinned</Text>}
                  <Text style={styles.subject}>{item.subject}</Text>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.cardMeta}>
                    <Text style={styles.metaText}>{item.author?.name}</Text>
                    <Text style={styles.metaText}>💬 {item.reply_count} replies</Text>
                    <Text style={styles.metaText}>{relativeTime(item.created_at)}</Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<EmptyState icon="💬" title="No discussions yet" subtitle="Be the first to start a conversation!" />}
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
  container:   { flex: 1 },
  topRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: 60, marginBottom: 12 },
  title:       { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.navy },
  newBtn:      { paddingVertical: 8, paddingHorizontal: 16 },
  tabRow:      { flexDirection: 'row', paddingHorizontal: Spacing.md, marginBottom: 12, gap: 6, flexWrap: 'wrap' },
  tab:         { paddingVertical: 8, paddingHorizontal: 10, borderRadius: Radius.md, backgroundColor: Colors.glass, borderWidth: 1, borderColor: Colors.glassBorder },
  activeTab:   { backgroundColor: Colors.primary },
  tabText:     { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  activeTabText:{ color: Colors.white },
  pad:         { padding: Spacing.md, paddingTop: 4, gap: 10 },
  card:        {},
  pinBadge:    { fontSize: FontSize.xs, color: Colors.amber, fontWeight: FontWeight.semibold, marginBottom: 4 },
  subject:     { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
  cardTitle:   { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.navy, marginBottom: 8, lineHeight: 22 },
  cardMeta:    { flexDirection: 'row', gap: 12 },
  metaText:    { fontSize: FontSize.xs, color: Colors.textMuted },
});
