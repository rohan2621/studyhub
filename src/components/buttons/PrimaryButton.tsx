import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Radius, FontSize, FontWeight, Timing } from '../../constants/theme';

interface Props {
  label:      string;
  onPress:    () => void;
  loading?:   boolean;
  disabled?:  boolean;
  style?:     ViewStyle;
  fullWidth?: boolean;
}

export function PrimaryButton({ label, onPress, loading, disabled, style, fullWidth }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
      style={[fullWidth && styles.fullWidth, style]}
    >
      <LinearGradient
        colors={Gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, (disabled || loading) && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} size="small" />
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  gradient: {
    paddingVertical:   14,
    paddingHorizontal: 28,
    borderRadius:      Radius.md,
    alignItems:        'center',
    justifyContent:    'center',
  },
  disabled: { opacity: 0.55 },
  label: {
    color:      Colors.white,
    fontSize:   FontSize.md,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.3,
  },
});
