import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import { notesApi } from '../../src/api/notes';
import { GradientBackground } from '../../src/components/layout/GradientBackground';
import { GlassCard } from '../../src/components/cards/GlassCard';
import { PrimaryButton } from '../../src/components/buttons/PrimaryButton';
import { ListSkeleton } from '../../src/components/loaders/CardSkeleton';
import { useTokenStore } from '../../src/store/tokenStore';
import { Colors, FontSize, FontWeight, Spacing } from '../../src/constants/theme';
import { analytics } from '../../src/services/analyticsService';
import { relativeTime } from '../../src/utils/date';

export default function NoteDetailScreen() {
  const { id }         = useLocalSearchParams<{ id: string }>();
  const { previewOnly } = useTokenStore();
  const router          = useRouter();

  // Protect premium content
  ScreenCapture.usePreventScreenCapture();

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn:  () => notesApi.getById(id),
    enabled:  !!id,
  });

  function handleOpen() {
    analytics.track('open_note', { note_id: id, subject: note?.subject });
    if (note?.file_url) Linking.openURL(note.file_url);
  }

  if (isLoading) return (
    <GradientBackground>
      <View style={styles.pad}><ListSkeleton count={4} /></View>
    </GradientBackground>
  );

  if (!note) return null;

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <GlassCard style={styles.headerCard}>
          <View style={styles.badgeRow}>
            <View style={[styles.typeBadge, note.type === 'topper_note' && styles.topperBadge]}>
              <Text style={[styles.typeText, note.type === 'topper_note' && styles.topperText]}>
                {note.type === 'topper_note' ? '⭐ Topper Note' : '📄 Note'}
              </Text>
            </View>
            <Text style={styles.upvotes}>▲ {note.upvotes}</Text>
          </View>

          <Text style={styles.title}>{note.title}</Text>
          <Text style={styles.meta}>{note.subject} · {note.chapter}</Text>
          <Text style={styles.uploadedBy}>By {note.uploaded_by} · {relativeTime(note.created_at)}</Text>
        </GlassCard>

        {/* Content gate */}
        {previewOnly || note.preview_only ? (
          <GlassCard style={styles.lockedCard}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.lockTitle}>Unlock to view full content</Text>
            <Text style={styles.lockBody}>
              This note is available to subscribers. Contact us on WhatsApp or Instagram to get a plan and receive your access token.
            </Text>
            <PrimaryButton
              label="📱 Contact on WhatsApp"
              onPress={() => Linking.openURL('https://wa.me/977XXXXXXXXXX')}
              fullWidth
              style={{ marginTop: 16 }}
            />
            <Text style={styles.alreadyHave} onPress={() => router.push('/(tabs)/profile')}>
              Already have a token? Go to Profile →
            </Text>
          </GlassCard>
        ) : (
          <GlassCard style={styles.openCard}>
            <Text style={styles.openTitle}>Full access unlocked ✅</Text>
            <Text style={styles.openBody}>Tap below to open or download the note.</Text>
            <PrimaryButton
              label="📄 Open Note"
              onPress={handleOpen}
              fullWidth
              style={{ marginTop: 12 }}
            />
            <PrimaryButton
              label="💾 Download to Device"
              onPress={() => {
                if (note?.file_url) {
                  analytics.track('download_note', { note_id: id });
                  Linking.openURL(note.file_url);
                }
              }}
              fullWidth
              style={{ marginTop: 12 }}
            />
            <TouchableOpacity
              style={styles.bookmarkBtn}
              onPress={() => {
                notesApi.bookmark(note.id);
                analytics.track('bookmark_note', { note_id: id });
              }}
            >
              <Text style={styles.bookmarkText}>🔖 Bookmark this note</Text>
            </TouchableOpacity>
          </GlassCard>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  pad:          { padding: Spacing.md, paddingTop: 20 },
  scroll:       { padding: Spacing.md, paddingTop: 20, gap: 14 },
  headerCard:   {},
  badgeRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  typeBadge:    { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  topperBadge:  { backgroundColor: '#FEF3C7' },
  typeText:     { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },
  topperText:   { color: '#B45309' },
  upvotes:      { fontSize: FontSize.sm, color: Colors.textMuted },
  title:        { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.navy, lineHeight: 28, marginBottom: 6 },
  meta:         { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium, marginBottom: 4 },
  uploadedBy:   { fontSize: FontSize.xs, color: Colors.textMuted },
  lockedCard:   { alignItems: 'center' },
  lockIcon:     { fontSize: 48, marginBottom: 12 },
  lockTitle:    { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.navy, marginBottom: 8, textAlign: 'center' },
  lockBody:     { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  alreadyHave:  { marginTop: 14, fontSize: FontSize.sm, color: Colors.primary, textDecorationLine: 'underline', textAlign: 'center' },
  openCard:     {},
  openTitle:    { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.success, marginBottom: 4 },
  openBody:     { fontSize: FontSize.sm, color: Colors.textSecondary },
  bookmarkBtn:  { marginTop: 14, alignItems: 'center' },
  bookmarkText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
});
