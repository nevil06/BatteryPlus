import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { BatteryInfo, BatteryReading, BatteryState as AppBatteryState } from '../types/battery';
import { saveReading, getAllReadings, clearReadings } from '../services/storageService';

// Import native module (only works after prebuild)
let BatteryNative: any = null;
try {
  BatteryNative = require('../../modules/battery-native/src').default;
} catch (e) {
  console.log('Native battery module not available, using fallback');
}

// Fallback to expo-battery if native module not available
import {
  useBatteryLevel,
  useBatteryState,
  useLowPowerMode,
  BatteryState,
} from 'expo-battery';

interface NativeBatteryInfo {
  level: number;
  health: string;
  temperature: number;
  voltage: number;
  chargingStatus: string;
  plugType: string;
  technology: string;
  currentNow: number;
  currentAverage: number;
  chargeCounter: number;
  energyCounter: number;
  designCapacity: number;
  chargeTimeRemaining: number;
  cycleCount: number;
  isCharging: boolean;
  isBatteryPresent: boolean;
}

interface UseBatteryReturn {
  batteryInfo: BatteryInfo;
  nativeInfo: NativeBatteryInfo | null;
  readings: BatteryReading[];
  health: string;
  temperature: number;
  voltage: number;
  chargeCycles: number;
  drainRate: number;
  drainRateMA: number;
  timeRemaining: string;
  designCapacity: number;
  isLoading: boolean;
  isNativeAvailable: boolean;
  refresh: () => Promise<void>;
  clearData: () => Promise<void>;
}

const mapBatteryState = (state: BatteryState): AppBatteryState => {
  switch (state) {
    case BatteryState.CHARGING:
      return 'charging';
    case BatteryState.FULL:
      return 'full';
    case BatteryState.UNPLUGGED:
      return 'unplugged';
    default:
      return 'unknown';
  }
};

export const useBattery = (): UseBatteryReturn => {
  // Expo battery hooks as fallback
  const expoBatteryLevel = useBatteryLevel();
  const expoBatteryState = useBatteryState();
  const expoLowPowerMode = useLowPowerMode();

  const [nativeInfo, setNativeInfo] = useState<NativeBatteryInfo | null>(null);
  const [readings, setReadings] = useState<BatteryReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const lastSavedLevel = useRef<number>(-1);
  const lastSavedTime = useRef<number>(0);

  const isNativeAvailable = BatteryNative !== null && Platform.OS === 'android';

  // Fetch native battery info
  const fetchNativeInfo = useCallback(() => {
    if (!isNativeAvailable) return null;

    try {
      const info = BatteryNative.getBatteryInfo();
      setNativeInfo(info);
      return info;
    } catch (e) {
      console.error('Error fetching native battery info:', e);
      return null;
    }
  }, [isNativeAvailable]);

  // Get battery level (prefer native)
  const level = isNativeAvailable && nativeInfo
    ? nativeInfo.level
    : (expoBatteryLevel >= 0 ? Math.round(expoBatteryLevel * 100) : 0);

  // Get charging status
  const isCharging = isNativeAvailable && nativeInfo
    ? nativeInfo.isCharging
    : (expoBatteryState === BatteryState.CHARGING || expoBatteryState === BatteryState.FULL);

  const appBatteryState: AppBatteryState = isNativeAvailable && nativeInfo
    ? (nativeInfo.chargingStatus === 'CHARGING' ? 'charging' :
       nativeInfo.chargingStatus === 'FULL' ? 'full' :
       nativeInfo.chargingStatus === 'DISCHARGING' ? 'unplugged' : 'unknown')
    : mapBatteryState(expoBatteryState);

  const batteryInfo: BatteryInfo = {
    level,
    isCharging,
    batteryState: appBatteryState,
    lowPowerMode: expoLowPowerMode,
  };

  // ONLY return real values from native module - NO FAKE DATA
  const health = nativeInfo?.health || 'N/A';
  const temperature = nativeInfo?.temperature ?? -1;
  const voltage = nativeInfo?.voltage ?? -1;
  const cycleCount = nativeInfo?.cycleCount ?? -1;
  const designCapacity = nativeInfo?.designCapacity ?? -1;

  // Real drain rate from native (in milliamps) - NO FAKE DATA
  const drainRateMA = nativeInfo
    ? Math.abs(nativeInfo.currentNow / 1000)
    : -1; // -1 means not available

  // Calculate drain rate % per hour from native - NO FAKE DATA
  const drainRate = (() => {
    if (!nativeInfo || designCapacity <= 0 || drainRateMA <= 0) return -1;
    return Math.round((drainRateMA / designCapacity) * 100 * 10) / 10;
  })();

  // Calculate time remaining - NO FAKE ESTIMATES
  const timeRemaining = (() => {
    // Without native module, we can't calculate real time
    if (!isNativeAvailable || !nativeInfo) {
      if (isCharging) return 'Charging';
      return 'N/A'; // Don't show fake estimates
    }

    if (isCharging) {
      if (nativeInfo.chargeTimeRemaining > 0) {
        const mins = Math.round(nativeInfo.chargeTimeRemaining / 60000);
        if (mins < 60) return `${mins}m to full`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h to full`;
      }
      return 'Charging';
    }

    // Calculate from current draw
    if (drainRateMA > 0 && nativeInfo.chargeCounter > 0) {
      const remainingMAh = nativeInfo.chargeCounter / 1000;
      const hours = remainingMAh / drainRateMA;

      if (hours < 1) return `${Math.round(hours * 60)}m`;
      if (hours < 24) {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
      }
      return `${Math.round(hours / 24)}d`;
    }

    // Fallback using design capacity
    if (drainRateMA > 0 && designCapacity > 0) {
      const remainingMAh = (level / 100) * designCapacity;
      const hours = remainingMAh / drainRateMA;

      if (hours < 1) return `${Math.round(hours * 60)}m`;
      if (hours < 24) {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
      }
      return `${Math.round(hours / 24)}d`;
    }

    return 'N/A';
  })();

  // Charge cycles - only from native or -1
  const chargeCycles = cycleCount;

  const loadReadings = useCallback(async () => {
    try {
      const stored = await getAllReadings();
      setReadings(stored);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading readings:', error);
      setIsLoading(false);
    }
  }, []);

  const saveCurrentReading = useCallback(async () => {
    if (level <= 0) return;

    const now = Date.now();
    const timeSinceLastSave = now - lastSavedTime.current;
    const levelChanged = level !== lastSavedLevel.current;

    if (!levelChanged && timeSinceLastSave < 10000) return;

    const reading: BatteryReading = {
      timestamp: now,
      level,
      isCharging,
      temperature: temperature > 0 ? temperature : undefined,
    };

    await saveReading(reading, true);
    lastSavedLevel.current = level;
    lastSavedTime.current = now;

    const updated = await getAllReadings();
    setReadings(updated);
  }, [level, isCharging, temperature]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    fetchNativeInfo();
    await saveCurrentReading();
    await loadReadings();
  }, [fetchNativeInfo, saveCurrentReading, loadReadings]);

  const clearData = useCallback(async () => {
    await clearReadings();
    setReadings([]);
    lastSavedLevel.current = -1;
    lastSavedTime.current = 0;
  }, []);

  // Initial load
  useEffect(() => {
    loadReadings();
    fetchNativeInfo();
  }, [loadReadings, fetchNativeInfo]);

  // Periodic refresh of native info
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNativeInfo();
      if (level > 0) saveCurrentReading();
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [fetchNativeInfo, saveCurrentReading, level]);

  // Save when level changes
  useEffect(() => {
    if (level > 0) saveCurrentReading();
  }, [level, isCharging]);

  return {
    batteryInfo,
    nativeInfo,
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
    clearData,
  };
};
