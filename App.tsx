import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import './src/i18n/i18n';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (Constants.statusBarHeight || StatusBar.currentHeight || 24) : 0;
import { BatteryGauge } from './src/components/BatteryGauge';
import { StatsCard } from './src/components/StatsCard';
import { TrendChart } from './src/components/TrendChart';
import { HealthTips } from './src/components/HealthTips';
import { AIAdvisor } from './src/components/AIAdvisor';
import { LanguageSelector } from './src/components/LanguageSelector';
import { useBattery } from './src/hooks/useBattery';
import { COLORS, GRADIENTS } from './src/utils/constants';

type Tab = 'dashboard' | 'tips' | 'ai';

export default function App() {
  const { t } = useTranslation();
  const {
    batteryInfo,
    readings,
    health,
    temperature,
    voltage,
    chargeCycles,
    drainRate,
    drainRateMA,
    timeRemaining,
    designCapacity,
    isLoading,
    isNativeAvailable,
    refresh,
  } = useBattery();

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const getHealthColor = () => {
    switch (health) {
      case 'GOOD':
      case 'Excellent':
        return GRADIENTS.green;
      case 'Good':
        return GRADIENTS.cyan;
      case 'Fair':
      case 'COLD':
        return GRADIENTS.orange;
      case 'Poor':
      case 'OVERHEAT':
      case 'DEAD':
      case 'OVER_VOLTAGE':
        return GRADIENTS.red;
      default:
        return GRADIENTS.blue;
    }
  };

  const formatDrainRate = () => {
    if (drainRateMA > 0) {
      return `${Math.round(drainRateMA)} mA`;
    }
    if (drainRate > 0) {
      return `${drainRate}%/hr`;
    }
    return 'N/A';
  };

  const formatTemperature = () => {
    if (temperature > 0) {
      return `${temperature.toFixed(1)}°C`;
    }
    return 'N/A';
  };

  const formatVoltage = () => {
    if (voltage > 0) {
      return `${(voltage / 1000).toFixed(2)}V`;
    }
    return 'N/A';
  };

  const renderTab = (tab: Tab, icon: keyof typeof Feather.glyphMap, label: string) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tab, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Feather
        name={icon}
        size={20}
        color={activeTab === tab ? COLORS.primary : COLORS.textMuted}
      />
      <Text
        style={[
          styles.tabText,
          activeTab === tab && styles.activeTabText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderDashboard = () => (
    <>
      {/* Battery Gauge */}
      <View style={styles.gaugeContainer}>
        <BatteryGauge
          level={batteryInfo.level}
          isCharging={batteryInfo.isCharging}
          size={220}
        />
      </View>

      {/* Stats Grid - Row 1 */}
      <View style={styles.statsGrid}>
        <StatsCard
          title={t('dashboard.health')}
          value={health}
          subtitle={isNativeAvailable ? t('dashboard.fromSystem') : t('dashboard.requiresNativeBuild')}
          icon="heart"
          gradient={getHealthColor()}
        />
        <StatsCard
          title={t('dashboard.timeLeft')}
          value={timeRemaining}
          subtitle={batteryInfo.isCharging ? t('dashboard.pluggedIn') : isNativeAvailable ? t('dashboard.realTime') : t('dashboard.requiresNativeBuild')}
          icon="clock"
          gradient={GRADIENTS.blue}
        />
      </View>

      {/* Stats Grid - Row 2 */}
      <View style={styles.statsGrid}>
        <StatsCard
          title={t('dashboard.currentDraw')}
          value={formatDrainRate()}
          subtitle={drainRateMA > 0 ? t('dashboard.liveReading') : t('dashboard.requiresNativeBuild')}
          icon="activity"
          gradient={GRADIENTS.orange}
        />
        <StatsCard
          title={t('dashboard.cycles')}
          value={chargeCycles >= 0 ? chargeCycles.toString() : 'N/A'}
          subtitle={chargeCycles >= 0 ? t('dashboard.chargeCycles') : t('dashboard.requiresNativeBuild')}
          icon="refresh-cw"
          gradient={GRADIENTS.cyan}
        />
      </View>

      {/* Stats Grid - Row 3 (Native data) */}
      <View style={styles.statsGrid}>
        <StatsCard
          title={t('dashboard.temperature')}
          value={formatTemperature()}
          subtitle={temperature > 40 ? t('dashboard.runningHot') : temperature > 0 ? t('dashboard.normal') : t('dashboard.requiresNativeBuild')}
          icon="thermometer"
          gradient={temperature > 40 ? GRADIENTS.red : GRADIENTS.green}
        />
        <StatsCard
          title={t('dashboard.voltage')}
          value={formatVoltage()}
          subtitle={designCapacity > 0 ? t('dashboard.capacity', { capacity: designCapacity }) : t('dashboard.requiresNativeBuild')}
          icon="zap"
          gradient={GRADIENTS.purple}
        />
      </View>

      {/* Quick Status */}
      <View style={styles.quickStatus}>
        <View style={styles.statusItem}>
          <View style={[
            styles.statusDot,
            { backgroundColor: isNativeAvailable ? COLORS.primary : COLORS.warning }
          ]} />
          <Text style={styles.statusLabel}>
            {isNativeAvailable ? t('dashboard.nativeApi') : t('dashboard.basicMode')}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <View style={[
            styles.statusDot,
            { backgroundColor: batteryInfo.isCharging ? COLORS.primary : COLORS.textMuted }
          ]} />
          <Text style={styles.statusLabel}>
            {batteryInfo.batteryState.charAt(0).toUpperCase() + batteryInfo.batteryState.slice(1)}
          </Text>
        </View>
        {batteryInfo.lowPowerMode && (
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.warning }]} />
            <Text style={styles.statusLabel}>{t('dashboard.powerSaver')}</Text>
          </View>
        )}
      </View>

      {/* Trend Chart */}
      <TrendChart readings={readings} />

      {/* Native Mode Notice */}
      {!isNativeAvailable && (
        <View style={styles.noticeContainer}>
          <Feather name="info" size={16} color={COLORS.warning} />
          <Text style={styles.noticeText}>
            {t('dashboard.nativeNotice')}
          </Text>
        </View>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
        translucent={Platform.OS === 'android'}
      />

      {/* Header */}
      <LinearGradient
        colors={[COLORS.background, COLORS.cardBg]}
        style={[styles.header, { paddingTop: STATUS_BAR_HEIGHT + 12 }]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.appTitle}>{t('common.appTitle')}</Text>
            <Text style={styles.appSubtitle}>{t('common.appSubtitle')}</Text>
          </View>
          <View style={styles.headerButtons}>
            <LanguageSelector />
            <TouchableOpacity style={styles.refreshButton} onPress={refresh}>
              <Feather name="refresh-cw" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {renderTab('dashboard', 'grid', t('tabs.dashboard'))}
          {renderTab('tips', 'heart', t('tabs.tips'))}
          {renderTab('ai', 'cpu', t('tabs.aiAdvisor'))}
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'tips' && <HealthTips />}
        {activeTab === 'ai' && (
          <AIAdvisor batteryInfo={batteryInfo} readings={readings} />
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('dashboard.readings', { count: readings.length })}
          </Text>
          <Text style={styles.footerText}>•</Text>
          <Text style={styles.footerText}>
            {t('dashboard.updatesEvery')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  appSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.cardBgLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: COLORS.cardBg,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginLeft: 6,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginVertical: 4,
  },
  quickStatus: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    gap: 16,
    flexWrap: 'wrap',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    gap: 10,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
