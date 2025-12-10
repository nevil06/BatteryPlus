import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

interface BatteryGaugeProps {
  level: number;
  isCharging: boolean;
  size?: number;
}

export const BatteryGauge: React.FC<BatteryGaugeProps> = ({
  level,
  isCharging,
  size = 200,
}) => {
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (level / 100) * circumference;

  const getGradientColors = () => {
    if (level <= 20) return ['#ef4444', '#dc2626'];
    if (level <= 50) return ['#f97316', '#ea580c'];
    if (level <= 80) return ['#22c55e', '#16a34a'];
    return ['#4ade80', '#22c55e'];
  };

  const [startColor, endColor] = getGradientColors();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="batteryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={startColor} />
            <Stop offset="100%" stopColor={endColor} />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.cardBgLight}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#batteryGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeDashoffset={circumference / 4}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.content}>
        <Text style={styles.percentage}>{level}%</Text>
        <View style={styles.statusContainer}>
          {isCharging ? (
            <>
              <Feather name="zap" size={16} color={COLORS.warning} />
              <Text style={styles.statusText}>Charging</Text>
            </>
          ) : (
            <Text style={styles.statusText}>
              {level <= 20 ? 'Low Battery' : 'On Battery'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
  },
  percentage: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
});
