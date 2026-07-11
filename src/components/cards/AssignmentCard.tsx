import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassCard } from '../../components/cards/GlassCard';
import { Colors, FontSize, FontWeight, Radius } from '../../constants/theme';
import { dueDateSeverity, formatDueDate } from '../../utils/date';
import type { Homework } from '../../types/api.types';

const SEVERITY_COLORS = {
  red:     { bg: Colors.dueRed,    text: Colors.dueRedText },
  amber:   { bg: Colors.dueAmber,  text: Colors.dueAmberText },
  green:   { bg: Colors.dueGreen,  text: Colors.dueGreenText },
  overdue: { bg: '#FEE2E2',        text: '#B91C1C' },
};

interface Props {
  item:    Homework;
  onPress: () => void;
}

export function AssignmentCard({ item, onPress }: Props) {
  const severity = dueDateSeverity(item.due_at);
  const colors   = SEVERITY_COLORS[severity];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <GlassCard style={styles.card}>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>
              {severity === 'overdue' ? 'Overdue' : formatDueDate(item.due_at)}
            </Text>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:      { marginBottom: 10 },
  row:       { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  info:      { flex: 1 },
  subject:   { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  title:     { fontSize: FontSize.md, color: Colors.navy, fontWeight: FontWeight.medium, lineHeight: 22 },
  badge:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, alignSelf: 'flex-start' },
  badgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
});
