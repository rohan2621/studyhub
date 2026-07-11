import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Linking } from 'react-native';
import { GradientBackground } from '../../src/components/layout/GradientBackground';
import { GlassCard } from '../../src/components/cards/GlassCard';
import { useSettingsStore } from '../../src/store/settingsStore';
import { Colors, FontSize, FontWeight, Spacing } from '../../src/constants/theme';

export default function SettingsScreen() {
  const { notificationsEnabled, setNotifications, theme, setTheme } = useSettingsStore();

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Enable notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotifications}
              trackColor={{ true: Colors.primary, false: Colors.border }}
            />
          </View>
        </GlassCard>

        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Text style={styles.link} onPress={() => Linking.openURL('https://wa.me/977XXXXXXXXXX')}>
            📱 WhatsApp Support
          </Text>
          <Text style={styles.link} onPress={() => Linking.openURL('https://instagram.com/studyhub')}>
            📸 Instagram
          </Text>
        </GlassCard>

        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.about}>StudyHub v1.0.0</Text>
          <Text style={styles.about}>© 2025 StudyHub. All rights reserved.</Text>
          <Text style={styles.link} onPress={() => Linking.openURL('https://studyhub.app/privacy')}>
            Privacy Policy
          </Text>
        </GlassCard>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll:       { padding: Spacing.md, paddingTop: 20, gap: 14 },
  section:      {},
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.navy, marginBottom: 14 },
  row:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel:     { fontSize: FontSize.md, color: Colors.textSecondary },
  link:         { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.medium, paddingVertical: 8 },
  about:        { fontSize: FontSize.sm, color: Colors.textMuted, paddingVertical: 3 },
});
