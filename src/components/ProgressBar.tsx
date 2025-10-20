import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const defaultColor = '#10B981';

interface ProgressBarProps {
  current: number;
  target: number;
  label: string;
  color?: string;
  unit?: string;
}

/**
 * Animated Progress Bar Component
 * Shows progress towards a goal with smooth animation
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  label,
  color = defaultColor,
  unit = '',
}) => {
  const [animatedWidth] = useState(new Animated.Value(0));
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isOverTarget = current > target;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, isOverTarget && styles.overTarget]}>
          {current}{unit} / {target}{unit}
        </Text>
      </View>
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: widthInterpolated,
              backgroundColor: isOverTarget ? '#FF9800' : color,
            },
          ]}
        />
      </View>
      <Text style={styles.percentage}>{percentage.toFixed(0)}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#495057',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10B981',
  },
  overTarget: {
    color: '#F59E0B',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  percentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    textAlign: 'right',
  },
});

export default ProgressBar;

