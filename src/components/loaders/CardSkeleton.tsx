import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, FontSize } from '../../constants/theme';

interface Props {
  message?: string;
}

export function CardSkeleton({ message }: Props) {
  return (
    <View style={styles.skeleton}>
      <View style={styles.line} />
      <View style={[styles.line, styles.short]} />
      <View style={[styles.line, styles.shorter]} />
      {message && <Text style={styles.msg}>{message}</Text>}
    </View>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.glass,
    borderRadius:    Radius.lg,
    padding:         16,
    marginBottom:    12,
    borderWidth:     1,
    borderColor:     Colors.glassBorder,
  },
  line: {
    height:          14,
    backgroundColor: '#E2EAF8',
    borderRadius:    6,
    marginBottom:    10,
  },
  short:   { width: '70%' },
  shorter: { width: '45%' },
  msg:     { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 },
});
