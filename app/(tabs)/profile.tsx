import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { tokenApi } from '../../src/api/token';
import { GradientBackground } from '../../src/components/layout/GradientBackground';
import { GlassCard } from '../../src/components/cards/GlassCard';
import { PrimaryButton } from '../../src/components/buttons/PrimaryButton';
import { useAuthStore } from '../../src/store/authStore';
import { useTokenStore } from '../../src/store/tokenStore';
import { storage } from '../../src/utils/storage';
import { queryClient } from '../../src/lib/queryClient';
import { Colors, FontSize, FontWeight, Spacing } from '../../src/constants/theme';
import { formatTokenExpiry, formatDueDate } from '../../src/utils/date';
import { analytics } from '../../src/services/analyticsService';

const WHATSAPP = 'https://wa.me/977XXXXXXXXXX';
const INSTAGRAM = 'https://instagram.com/studyhub';

export default function ProfileScreen() {
  const { user, logout }            = useAuthStore();
  const { tokenStatus, previewOnly } = useTokenStore();

  const { data: freshToken } = useQuery({
    queryKey: ['token-status'],
    queryFn:  tokenApi.getStatus,
  });

  async function handleLogout() {
    analytics.track('logout');
    await storage.clearAll();
    logout();
    queryClient.clear();
  }

  function handleRenew() {
    analytics.track('renew_token_tap');
    Linking.openURL(WHATSAPP);
  }

  const ts = freshToken ?? tokenStatus;

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User info */}
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.grade}>Grade {user?.grade} · {user?.school?.name}</Text>
          </View>
        </View>

        {/* Subscription */}
        <Text style={styles.sectionTitle}>Subscription</Text>
        <GlassCard style={styles.card}>
          {ts?.status === 'active' ? (
            <>
              <Text style={styles.planLabel}>Plan: <Text style={styles.planValue}>{ts.plan?.toUpperCase()}</Text></Text>
              <Text style={styles.expires}>Expires: {formatDueDate(ts.expires_at!)}</Text>
              <Text style={styles.daysLeft}>{formatTokenExpiry(ts.expires_at!)}</Text>
              <PrimaryButton label="Renew via WhatsApp" onPress={handleRenew} style={{ marginTop: 12 }} />
            </>
          ) : (
            <>
              <Text style={styles.noToken}>No active subscription</Text>
              <Text style={styles.noTokenSub}>Contact us on WhatsApp or Instagram to get a plan.</Text>
              <View style={styles.contactRow}>
                <PrimaryButton label="WhatsApp" onPress={() => Linking.openURL(WHATSAPP)} />
                <PrimaryButton label="Instagram" onPress={() => Linking.openURL(INSTAGRAM)} />
              </View>
            </>
          )}
        </GlassCard>

        {/* Device */}
        {ts?.device_info && (
          <>
            <Text style={styles.sectionTitle}>Device</Text>
            <GlassCard style={styles.card}>
              <Text style={styles.deviceLabel}>Active on: <Text style={styles.deviceValue}>{ts.device_info.platform}</Text></Text>
              <Text style={styles.deviceSince}>Since: {formatDueDate(ts.device_info.first_seen_at)}</Text>
              <Text style={styles.deviceNote}>To switch devices, contact support to reset your device binding.</Text>
            </GlassCard>
          </>
        )}

        {/* Logout */}
        <View style={styles.logoutRow}>
          <Text style={styles.logoutBtn} onPress={handleLogout}>Log out</Text>
        </View>

        {/* App Info */}
        <View style={styles.appInfoBox}>
          <Text style={styles.appInfoText}>App Version: {Application.nativeApplicationVersion || '1.0.0'}</Text>
          <Text style={styles.appInfoText}>Device: {Device.modelName || 'Unknown Device'}</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll:       { padding: Spacing.md, paddingTop: 60 },
  avatarRow:    { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  avatar:       { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { color: Colors.white, fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  name:         { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.navy },
  email:        { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  grade:        { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.navy, marginBottom: 10, marginTop: 8 },
  card:         { marginBottom: 16 },
  planLabel:    { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
  planValue:    { fontWeight: FontWeight.bold, color: Colors.primary },
  expires:      { fontSize: FontSize.sm, color: Colors.textMuted },
  daysLeft:     { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.success, marginTop: 4 },
  noToken:      { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.navy, marginBottom: 4 },
  noTokenSub:   { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: 12, lineHeight: 20 },
  contactRow:   { flexDirection: 'row', gap: 10 },
  deviceLabel:  { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 2 },
  deviceValue:  { fontWeight: FontWeight.semibold, color: Colors.navy },
  deviceSince:  { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: 6 },
  deviceNote:   { fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 18 },
  logoutRow:    { alignItems: 'center', marginTop: 20 },
  logoutBtn:    { fontSize: FontSize.md, color: Colors.error, fontWeight: FontWeight.semibold },
  appInfoBox:   { alignItems: 'center', marginTop: 30 },
  appInfoText:  { fontSize: FontSize.xs, color: Colors.textMuted },
});
