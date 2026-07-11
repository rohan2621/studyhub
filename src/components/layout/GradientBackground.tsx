import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  style?:   ViewStyle;
}

export function GradientBackground({ children, style }: Props) {
  return (
    <LinearGradient
      colors={Gradients.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.fill, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
