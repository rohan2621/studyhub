import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors, Radius, Shadows } from '../../constants/theme';

interface Props {
  children:  React.ReactNode;
  style?:    ViewStyle;
  noPadding?:boolean;
  onPress?:  () => void;
}

export function GlassCard({ children, style, noPadding, onPress }: Props) {
  const content = (
    <View style={[styles.card, !noPadding && styles.padding, style]}>
      {children}
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.82}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor:  Colors.glass,
    borderRadius:     Radius.lg,
    borderWidth:      1,
    borderColor:      Colors.glassBorder,
    ...Shadows.card,
  },
  padding: {
    padding: 16,
  },
});
