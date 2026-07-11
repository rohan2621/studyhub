import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassCard } from '../../components/cards/GlassCard';
import { Colors, FontSize, FontWeight } from '../../constants/theme';
import { Image } from 'expo-image';
import type { Note } from '../../types/api.types';

interface Props {
  item:    Note;
  onPress: () => void;
}

export function NoteCard({ item, onPress }: Props) {
  const isTopper = item.type === 'topper_note';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.typeBadge, isTopper && styles.topperBadge]}>
            <Text style={[styles.typeText, isTopper && styles.topperText]}>
              {isTopper ? '⭐ Topper' : '📄 Note'}
            </Text>
          </View>
          <Text style={styles.upvotes}>▲ {item.upvotes}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={`https://ui-avatars.com/api/?name=${item.uploaded_by}&background=random`}
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
            contentFit="cover"
            transition={200}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.meta}>{item.subject} · {item.chapter}</Text>
          </View>
        </View>
        {item.preview_only && (
          <View style={styles.lockedBanner}>
            <Text style={styles.lockedText}>🔒 Unlock to view full content</Text>
          </View>
        )}
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:        { marginBottom: 10 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  typeBadge:   { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  topperBadge: { backgroundColor: '#FEF3C7' },
  typeText:    { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },
  topperText:  { color: Colors.amber },
  upvotes:     { fontSize: FontSize.xs, color: Colors.textMuted },
  title:       { fontSize: FontSize.md, color: Colors.navy, fontWeight: FontWeight.semibold, marginBottom: 4, lineHeight: 22 },
  meta:        { fontSize: FontSize.sm, color: Colors.textMuted },
  lockedBanner:{ marginTop: 10, backgroundColor: '#EFF6FF', borderRadius: 8, padding: 8 },
  lockedText:  { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium, textAlign: 'center' },
});
