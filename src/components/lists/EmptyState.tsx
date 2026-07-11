import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize } from '../../constants/theme';

interface Props {
  icon?:    string;
  title:    string;
  subtitle?:string;
}

export function EmptyState({ icon = '📭', title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 56, paddingHorizontal: 24 },
  icon:      { fontSize: 48, marginBottom: 12 },
  title:     { fontSize: FontSize.lg, color: Colors.navy, fontWeight: '600', textAlign: 'center', marginBottom: 6 },
  subtitle:  { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
