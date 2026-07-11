import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { GradientBackground } from '../../src/components/layout/GradientBackground';
import { GlassCard } from '../../src/components/cards/GlassCard';
import { EmptyState } from '../../src/components/lists/EmptyState';
import { Colors, FontSize, FontWeight, Spacing } from '../../src/constants/theme';

// Placeholder — will be replaced by real push notifications via EAS
const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'New note uploaded', body: 'Mathematics Ch.5 – Integration notes are now available.', time: '2 min ago' },
  { id: '2', title: 'Reply on your discussion', body: 'Someone replied to your thread "Tips for Physics exam?"', time: '1 hr ago' },
  { id: '3', title: 'Token expiring soon', body: 'Your access token expires in 5 days. Renew now.', time: '3 hr ago' },
];

export default function NotificationsScreen() {
  return (
    <GradientBackground>
      <View style={{ flex: 1 }}>
        <FlashList
          data={MOCK_NOTIFICATIONS}
          keyExtractor={(i) => i.id}
        contentContainerStyle={styles.pad}
        renderItem={({ item }) => (
          <GlassCard style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </GlassCard>
        )}
          ListEmptyComponent={<EmptyState icon="🔔" title="No notifications" subtitle="You're all caught up!" />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  pad:   { padding: Spacing.md, gap: 10 },
  card:  {},
  title: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.navy, marginBottom: 4 },
  body:  { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: 6 },
  time:  { fontSize: FontSize.xs, color: Colors.textMuted },
});
