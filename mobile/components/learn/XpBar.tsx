import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Progress from '@rn-primitives/progress';
import { useThemeStore } from '../../stores/themeStore';

interface XpBarProps {
  currentXp: number;
  nextLevelXp: number;
  level: number;
}

export function XpBar({ currentXp, nextLevelXp, level }: XpBarProps) {
  const { colors } = useThemeStore();

  // Calculate percentage, capping at 100%
  const percentage = Math.min(Math.max((currentXp / nextLevelXp) * 100, 0), 100);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.levelText, { color: colors.primary }]}>
          Level {level}
        </Text>
        <Text style={[styles.xpText, { color: colors.textMuted }]}>
          {currentXp} / {nextLevelXp} XP
        </Text>
      </View>
      {/* F2 fix: use @rn-primitives/progress for accessible progress semantics */}
      <Progress.Root
        value={percentage}
        style={[styles.track, { backgroundColor: colors.border }]}
        accessibilityLabel={`XP Progress: ${Math.round(percentage)}%`}
      >
        <Progress.Indicator
          style={[
            styles.indicator,
            {
              backgroundColor: colors.primary,
              width: `${percentage}%`,
            },
          ]}
        />
      </Progress.Root>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelText: { fontWeight: 'bold' },
  xpText: { fontSize: 12 },
  track: {
    height: 12,
    width: '100%',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  indicator: {
    height: '100%',
    borderRadius: 9999,
  },
});
