import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radius, FontSize, FontWeight } from '../../constants/theme';

interface Props {
  message:    string;
  onContact?: () => void;
}

export function DeviceMismatchDialog({ message, onContact }: Props) {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.emoji}>📵</Text>
        <Text style={styles.title}>Token Active on Another Device</Text>
        <Text style={styles.body}>{message}</Text>
        {onContact && (
          <TouchableOpacity style={styles.button} onPress={onContact}>
            <Text style={styles.buttonText}>Contact Support</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex:            1,
    backgroundColor: 'rgba(14,42,77,0.6)',
    alignItems:      'center',
    justifyContent:  'center',
    padding:         24,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius:    Radius.lg,
    padding:         28,
    alignItems:      'center',
    width:           '100%',
    maxWidth:        360,
  },
  emoji:       { fontSize: 40, marginBottom: 12 },
  title:       { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.navy, marginBottom: 10, textAlign: 'center' },
  body:        { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  button:      { backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: Radius.md },
  buttonText:  { color: Colors.white, fontWeight: FontWeight.semibold, fontSize: FontSize.md },
});
