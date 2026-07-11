import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { GradientBackground } from '@components/layout/GradientBackground';
import { GlassCard } from '@components/cards/GlassCard';
import { PrimaryButton } from '@components/buttons/PrimaryButton';
import { Colors, FontSize, FontWeight, Spacing } from '@constants/theme';

const STEPS = [
  { icon: '1️⃣', title: 'Browse for free', body: 'Explore note titles, homework listings, and past paper subjects without a subscription.' },
  { icon: '2️⃣', title: 'Contact us for a plan', body: 'Reach us on WhatsApp or Instagram. Choose 1 month, 3 months, 6 months, or 1 year.' },
  { icon: '3️⃣', title: 'Pay outside the app', body: 'We accept eSewa, Khalti, bank transfer, or cash. No in-app payments.' },
  { icon: '4️⃣', title: 'Receive your token', body: 'We\'ll link a token to your account. Open the app and tap Activate to unlock full access.' },
  { icon: '5️⃣', title: 'One device at a time', body: 'Your token works on one device. Need to switch? Contact us for a free reset.' },
];

export default function IntroScreen() {
  const router = useRouter();

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Account created!</Text>
          <Text style={styles.subtitle}>Here's how StudyHub works.</Text>
        </View>

        <View style={styles.stepsContainer}>
          {STEPS.map((step) => (
            <View key={step.icon} style={styles.step}>
              <Text style={styles.stepIcon}>{step.icon}</Text>
              <View style={styles.stepText}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepBody}>{step.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <GlassCard style={styles.contactCard}>
          <Text style={styles.contactTitle}>Ready to unlock full access?</Text>
          <Text style={styles.contactBody}>Message us to pick a plan:</Text>
          <View style={styles.btnRow}>
            <PrimaryButton label="📱 WhatsApp" onPress={() => Linking.openURL('https://wa.me/977XXXXXXXXXX')} style={styles.btn} />
            <PrimaryButton label="📸 Instagram" onPress={() => Linking.openURL('https://instagram.com/studyhub')} style={styles.btn} />
          </View>
        </GlassCard>

        <Text style={styles.skip} onPress={() => router.replace('/(tabs)')}>
          Skip for now — browse free content
        </Text>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, padding: Spacing.md, paddingTop: 60, paddingBottom: 32 },
  top:           { alignItems: 'center', marginBottom: 28 },
  emoji:         { fontSize: 52 },
  title:         { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.navy, marginTop: 10 },
  subtitle:      { fontSize: FontSize.md, color: Colors.textMuted, marginTop: 4 },
  stepsContainer:{ gap: 14, marginBottom: 24 },
  step:          { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepIcon:      { fontSize: 22, marginTop: 2 },
  stepText:      { flex: 1 },
  stepTitle:     { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.navy, marginBottom: 2 },
  stepBody:      { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  contactCard:   { marginBottom: 20 },
  contactTitle:  { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.navy, marginBottom: 4 },
  contactBody:   { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: 14 },
  btnRow:        { flexDirection: 'row', gap: 10 },
  btn:           { flex: 1 },
  skip:          { textAlign: 'center', color: Colors.textMuted, fontSize: FontSize.sm, textDecorationLine: 'underline' },
});
