import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { profileApi } from '../../src/api/profile';
import { GradientBackground } from '../../src/components/layout/GradientBackground';
import { AssignmentCard } from '../../src/components/cards/AssignmentCard';
import { NoteCard } from '../../src/components/cards/NoteCard';
import { ListSkeleton } from '../../src/components/loaders/CardSkeleton';
import { EmptyState } from '../../src/components/lists/EmptyState';
import { GlassCard } from '../../src/components/cards/GlassCard';
import { useTokenStore } from '../../src/store/tokenStore';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, FontSize, FontWeight, Spacing } from '../../src/constants/theme';
import { formatTokenExpiry } from '../../src/utils/date';
import { useOfflineQueueStore } from '../../src/store/offlineQueueStore';

export default function DashboardScreen() {
  const router      = useRouter();
  const { user }   = useAuthStore();
  const { tokenStatus, previewOnly } = useTokenStore();
  const isOffline   = useOfflineQueueStore((s) => s.isOffline);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['feed'],
    queryFn:  profileApi.getFeed,
    staleTime: 1000 * 60 * 2,
  });

  const onRefresh = useCallback(() => { refetch(); }, [refetch]);

  return (
    <GradientBackground>
      {/* Offline banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>📡 Offline — showing cached content</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.school}>{user?.school?.name}</Text>
          </View>
        </View>

        {/* Token status card */}
        {tokenStatus && (
          <GlassCard style={styles.tokenCard}>
            {tokenStatus.status === 'active' ? (
              <Text style={styles.tokenActive}>
                ✅ Token active · {formatTokenExpiry(tokenStatus.expires_at!)}
              </Text>
            ) : (
              <Text style={styles.tokenInactive}>
                🔒 No active token — <Text style={styles.unlockLink} onPress={() => router.push('/(tabs)/profile')}>Unlock access</Text>
              </Text>
            )}
          </GlassCard>
        )}

        {/* Feature tiles */}
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.tilesGrid}>
          {TILES.map((tile) => (
            <GlassCard
              key={tile.route}
              style={styles.tile}
              noPadding
              onPress={() => tile.route ? router.push(tile.route as any) : null}
            >
              <Text style={styles.tileEmoji}>{tile.icon}</Text>
              <Text style={styles.tileLabel}>{tile.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Upcoming Homework */}
        <Text style={styles.sectionTitle}>Today's Homework</Text>
        {isLoading ? <ListSkeleton count={3} /> : (
          data?.upcoming_homework?.length ? (
            data.upcoming_homework.slice(0, 5).map((hw) => (
              <AssignmentCard
                key={hw.id}
                item={hw}
                onPress={() => router.push(`/homework/${hw.id}`)}
              />
            ))
          ) : (
            <EmptyState icon="🎉" title="No upcoming homework!" />
          )
        )}

        {/* Trending Notes */}
        <Text style={styles.sectionTitle}>Trending Notes</Text>
        {isLoading ? <ListSkeleton count={3} /> : (
          data?.trending_notes?.length ? (
            data.trending_notes.slice(0, 5).map((note) => (
              <NoteCard
                key={note.id}
                item={note}
                onPress={() => router.push(`/notes/${note.id}`)}
              />
            ))
          ) : (
            <EmptyState icon="📚" title="No notes yet" subtitle="Check back soon!" />
          )
        )}

        {/* Custom request CTA */}
        <GlassCard style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Can't find what you need?</Text>
          <Text style={styles.ctaBody}>Request a specific note, homework, or past paper.</Text>
          <Text style={styles.ctaLink} onPress={() => router.push('/custom-request')}>
            Make a request →
          </Text>
        </GlassCard>

        <View style={{ height: 32 }} />
      </ScrollView>
    </GradientBackground>
  );
}

const TILES = [
  { label: 'Notes',        icon: '📄', route: '/(tabs)/notes' },
  { label: 'Topper Notes', icon: '⭐', route: '/(tabs)/notes' },
  { label: 'Homework',     icon: '📝', route: '/(tabs)/homework' },
  { label: 'Past Papers',  icon: '📋', route: null },
  { label: 'Timetable',    icon: '📅', route: null },
  { label: 'Discussions',  icon: '💬', route: '/(tabs)/discussions' },
];

const styles = StyleSheet.create({
  scroll:         { padding: Spacing.md, paddingTop: 60 },
  offlineBanner:  { backgroundColor: Colors.warning, paddingVertical: 8, alignItems: 'center' },
  offlineText:    { color: Colors.white, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  greeting:       { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.navy },
  school:         { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  tokenCard:      { marginBottom: Spacing.md },
  tokenActive:    { fontSize: FontSize.sm, color: Colors.success, fontWeight: FontWeight.medium },
  tokenInactive:  { fontSize: FontSize.sm, color: Colors.textSecondary },
  unlockLink:     { color: Colors.primary, fontWeight: FontWeight.semibold, textDecorationLine: 'underline' },
  sectionTitle:   { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.navy, marginVertical: 14 },
  tilesGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  tile:           { width: '30%', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 8 },
  tileEmoji:      { fontSize: 28, marginBottom: 6 },
  tileLabel:      { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.navy, textAlign: 'center' },
  ctaCard:        { marginTop: 8, marginBottom: 4, borderLeftWidth: 3, borderLeftColor: Colors.primary },
  ctaTitle:       { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.navy, marginBottom: 4 },
  ctaBody:        { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 10, lineHeight: 20 },
  ctaLink:        { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
});
