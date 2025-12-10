import { BatteryReading } from '../types/battery';

export const getBatteryHealth = (readings: BatteryReading[], currentLevel: number): string => {
  // With few readings, estimate based on current level
  if (readings.length < 2) {
    if (currentLevel >= 80) return 'Good';
    if (currentLevel >= 50) return 'Good';
    if (currentLevel >= 20) return 'Fair';
    return 'Low';
  }

  const avgDrainRate = calculateDrainRate(readings);

  // If we have drain data
  if (avgDrainRate > 0) {
    if (avgDrainRate < 3) return 'Excellent';
    if (avgDrainRate < 6) return 'Good';
    if (avgDrainRate < 12) return 'Fair';
    return 'Poor';
  }

  // Fallback based on level
  if (currentLevel >= 80) return 'Good';
  if (currentLevel >= 40) return 'Good';
  return 'Fair';
};

export const countChargeCycles = (readings: BatteryReading[]): number => {
  if (readings.length < 2) return 0;

  let cycles = 0;
  let wasCharging = readings[0]?.isCharging || false;

  for (let i = 1; i < readings.length; i++) {
    const reading = readings[i];
    // Count when we START charging (transition from not charging to charging)
    if (reading.isCharging && !wasCharging) {
      cycles++;
    }
    wasCharging = reading.isCharging;
  }

  return cycles;
};

export const calculateDrainRate = (readings: BatteryReading[]): number => {
  if (readings.length < 2) return 0;

  const nonChargingReadings = readings.filter(r => !r.isCharging);
  if (nonChargingReadings.length < 2) return 0;

  let totalDrain = 0;
  let drainCount = 0;

  for (let i = 1; i < nonChargingReadings.length; i++) {
    const timeDiffMs = nonChargingReadings[i].timestamp - nonChargingReadings[i-1].timestamp;
    const timeDiffHours = timeDiffMs / (1000 * 60 * 60); // Convert to hours
    const levelDiff = nonChargingReadings[i-1].level - nonChargingReadings[i].level;

    // Only count if battery actually drained and time passed
    if (levelDiff > 0 && timeDiffHours > 0.01) { // At least ~36 seconds
      const drainPerHour = levelDiff / timeDiffHours;
      // Sanity check: drain rate should be reasonable (0.1% to 50% per hour)
      if (drainPerHour > 0.1 && drainPerHour < 50) {
        totalDrain += drainPerHour;
        drainCount++;
      }
    }
  }

  return drainCount > 0 ? totalDrain / drainCount : 0;
};

export const getEstimatedTimeRemaining = (level: number, drainRate: number, isCharging: boolean): string => {
  if (isCharging) return 'Charging';

  if (drainRate <= 0) {
    // Estimate based on typical usage (~5% per hour)
    const estimatedHours = level / 5;
    if (estimatedHours < 1) return `~${Math.round(estimatedHours * 60)} min`;
    return `~${Math.round(estimatedHours)} hr`;
  }

  const hoursRemaining = level / drainRate;

  if (hoursRemaining < 1) {
    return `${Math.round(hoursRemaining * 60)} min`;
  } else if (hoursRemaining < 24) {
    const hours = Math.floor(hoursRemaining);
    const mins = Math.round((hoursRemaining - hours) * 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hr`;
  } else {
    return `${Math.round(hoursRemaining / 24)} days`;
  }
};
