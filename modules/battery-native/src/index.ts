import { requireNativeModule } from 'expo-modules-core';

export interface BatteryInfo {
  currentNow: number;
  currentAverage: number;
  chargeCounter: number;
  capacity: number;
  energyCounter: number;
  health: string;
  temperature: number;
  voltage: number;
  technology: string;
  plugType: string;
  status: string;
  level: number;
  scale: number;
  chargeTimeRemaining: number;
  cycleCount: number;
  designCapacity: number;
}

interface BatteryNativeModule {
  getBatteryInfo(): BatteryInfo;
  getCycleCount(): number;
  getDesignCapacity(): number;
  getChargeTimeRemaining(): number;
}

const BatteryNative = requireNativeModule<BatteryNativeModule>('BatteryNative');

export default BatteryNative;

// Helper functions
export function getDrainRateMA(info: BatteryInfo): number {
  // currentNow is in microamps, convert to milliamps
  // Negative means discharging, positive means charging
  return Math.abs(info.currentNow / 1000);
}

export function getTimeRemainingMinutes(info: BatteryInfo): number {
  if (info.chargeCounter <= 0 || info.currentNow >= 0) {
    return -1;
  }
  // chargeCounter is in μAh, currentNow is in μA
  // Time = capacity / current (in hours), then convert to minutes
  const hours = Math.abs(info.chargeCounter / info.currentNow);
  return Math.round(hours * 60);
}

export function formatTimeRemaining(minutes: number): string {
  if (minutes < 0) return 'N/A';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getBatteryHealthPercent(info: BatteryInfo): number {
  // Estimate based on design capacity vs current full charge
  // This requires the device to be at 100% for accuracy
  if (info.designCapacity <= 0 || info.chargeCounter <= 0 || info.capacity < 95) {
    return -1;
  }
  const currentFullCapacity = (info.chargeCounter / info.capacity) * 100;
  const healthPercent = (currentFullCapacity / (info.designCapacity * 1000)) * 100;
  return Math.min(100, Math.round(healthPercent));
}
