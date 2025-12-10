import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { BatteryReading } from '../types/battery';
import { COLORS } from '../utils/constants';

interface TrendChartProps {
  readings: BatteryReading[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ readings }) => {
  const chartData = useMemo(() => {
    if (readings.length < 2) {
      return {
        labels: ['Now'],
        datasets: [{ data: [50] }],
      };
    }

    const last24h = readings.filter(
      (r) => r.timestamp > Date.now() - 24 * 60 * 60 * 1000
    );

    const sampledReadings = last24h.length > 12
      ? last24h.filter((_, i) => i % Math.ceil(last24h.length / 12) === 0)
      : last24h;

    if (sampledReadings.length < 2) {
      return {
        labels: ['Now'],
        datasets: [{ data: [readings[readings.length - 1]?.level || 50] }],
      };
    }

    const labels = sampledReadings.map((r) => {
      const date = new Date(r.timestamp);
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    });

    return {
      labels: labels.length > 6 ? labels.filter((_, i) => i % 2 === 0) : labels,
      datasets: [
        {
          data: sampledReadings.map((r) => r.level),
          strokeWidth: 2,
        },
      ],
    };
  }, [readings]);

  const screenWidth = Dimensions.get('window').width - 48;

  if (readings.length < 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Battery Trend (24h)</Text>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Collecting data... Check back in 30 minutes.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Battery Trend (24h)</Text>
      <LineChart
        data={chartData}
        width={screenWidth}
        height={180}
        chartConfig={{
          backgroundColor: COLORS.cardBg,
          backgroundGradientFrom: COLORS.cardBg,
          backgroundGradientTo: COLORS.cardBgLight,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(74, 222, 128, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: COLORS.primary,
          },
          propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: COLORS.border,
            strokeOpacity: 0.3,
          },
        }}
        bezier
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
        yAxisSuffix="%"
        yAxisInterval={1}
        fromZero={false}
        segments={4}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 16,
    marginLeft: -16,
  },
  placeholder: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
