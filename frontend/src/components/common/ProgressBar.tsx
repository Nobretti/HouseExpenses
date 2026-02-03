import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  backgroundColor?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color,
  backgroundColor = colors.border,
  height = 8,
  showLabel = false,
  label,
  style,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const getProgressColor = () => {
    if (color) return color;
    if (clampedProgress >= 100) return colors.danger;
    if (clampedProgress >= 80) return colors.warning;
    return colors.success;
  };

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          <Text style={[styles.percentage, { color: getProgressColor() }]}>
            {clampedProgress.toFixed(0)}%
          </Text>
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor }]}>
        <View
          style={[
            styles.progress,
            {
              width: `${clampedProgress}%`,
              backgroundColor: getProgressColor(),
              height,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  track: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 4,
  },
});
