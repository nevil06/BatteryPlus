import { requireNativeModule } from 'expo-modules-core';

export interface BatteryInfo {
  level: number;                    // 0-100
  health: BatteryHealth;            // GOOD, OVERHEAT, DEAD, etc.
  temperature: number;              // Celsius
  voltage: number;                  // millivolts
  chargingStatus: ChargingStatus;   // CHARGING, DISCHARGING, FULL, etc.
  plugType: PlugType;               // AC, USB, WIRELESS, NONE
  technology: string;               // Li-ion, Li-poly, etc.
  currentNow: number;               // microamperes (negative = discharging)
  currentAverage: number;           // microamperes average
  chargeCounter: number;            // microampere-hours remaining
  energyCounter: number;            // nanowatt-hours
  designCapacity: number;           // mAh (battery design capacity)
  chargeTimeRemaining: number;      // milliseconds (-1 if not charging)
  cycleCount: number;               // charge cycles (-1 if unavailable)
  isCharging: boolean;
  isBatteryPresent: boolean;
}

export type BatteryHealth = 'GOOD' | 'OVERHEAT' | 'DEAD' | 'OVER_VOLTAGE' | 'COLD' | 'FAILURE' | 'UNKNOWN';
export type ChargingStatus = 'CHARGING' | 'DISCHARGING' | 'FULL' | 'NOT_CHARGING' | 'UNKNOWN';
export type PlugType = 'AC' | 'USB' | 'WIRELESS' | 'NONE';

interface BatteryNativeModule {
  getBatteryInfo(): BatteryInfo;
  getBatteryLevel(): number;
  getHealthStatus(): BatteryHealth;
  getTemperature(): number;
  getVoltage(): number;
  getChargingStatus(): ChargingStatus;
  getPlugType(): PlugType;
  getTechnology(): string;
  getCurrentNow(): number;
  getCurrentAverage(): number;
  getChargeCounter(): number;
  getEnergyCounter(): number;
  getDesignCapacity(): number;
  getChargeTimeRemaining(): number;
  getCycleCount(): number;
  isBatteryPresent(): boolean;
}

const BatteryNative: BatteryNativeModule = requireNativeModule('BatteryNative');

export default BatteryNative;

// Helper functions

/**
 * Get drain rate in mA (milliamperes)
 * Positive = draining, Negative = charging
 */
export function getDrainRateMA(): number {
  const currentMicroA = BatteryNative.getCurrentNow();
  // Convert microamperes to milliamperes
  // Note: On most devices, negative = charging, positive = discharging
  // But some devices report opposite, so we use absolute value
  return Math.abs(currentMicroA / 1000);
}

/**
 * Get estimated time remaining in minutes
 */
export function getTimeRemainingMinutes(): number {
  const info = BatteryNative.getBatteryInfo();

  if (info.isCharging) {
    // Use system's charge time if available
    if (info.chargeTimeRemaining > 0) {
      return Math.round(info.chargeTimeRemaining / 60000);
    }
    return -1;
  }

  // Calculate discharge time
  const currentMA = Math.abs(info.currentNow / 1000);
  if (currentMA <= 0) return -1;

  // Remaining charge in mAh
  const remainingMAh = info.chargeCounter / 1000;
  if (remainingMAh <= 0) {
    // Fallback: estimate from level and design capacity
    if (info.designCapacity > 0) {
      const estimatedRemaining = (info.level / 100) * info.designCapacity;
      return Math.round((estimatedRemaining / currentMA) * 60);
    }
    return -1;
  }

  // Time = Charge / Current (in hours), convert to minutes
  return Math.round((remainingMAh / currentMA) * 60);
}

/**
 * Format time remaining as string
 */
export function formatTimeRemaining(): string {
  const info = BatteryNative.getBatteryInfo();

  if (info.isCharging) {
    if (info.chargeTimeRemaining > 0) {
      const minutes = Math.round(info.chargeTimeRemaining / 60000);
      if (minutes < 60) return `${minutes}m to full`;
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m to full` : `${hours}h to full`;
    }
    return 'Charging';
  }

  const minutes = getTimeRemainingMinutes();
  if (minutes < 0) return '--';
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${Math.round(hours / 24)}d`;
}

/**
 * Get battery health percentage estimate
 */
export function getBatteryHealthPercent(): number {
  const info = BatteryNative.getBatteryInfo();

  if (info.designCapacity <= 0 || info.chargeCounter <= 0) {
    return -1;
  }

  // When at 100%, chargeCounter should equal designCapacity
  // Calculate current full charge capacity vs design capacity
  if (info.level >= 95) {
    const currentFullCapacity = (info.chargeCounter / 1000) / (info.level / 100);
    const healthPercent = (currentFullCapacity / info.designCapacity) * 100;
    return Math.min(100, Math.max(0, Math.round(healthPercent)));
  }

  return -1; // Need full charge to estimate
}
