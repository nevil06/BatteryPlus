export interface BatteryInfo {
  level: number;
  isCharging: boolean;
  batteryState: BatteryState;
  lowPowerMode: boolean;
}

export type BatteryState = 'charging' | 'full' | 'unplugged' | 'unknown';

export interface BatteryReading {
  timestamp: number;
  level: number;
  isCharging: boolean;
  temperature?: number;
}

export interface BatteryTrend {
  readings: BatteryReading[];
  averageLevel: number;
  chargingCycles: number;
  lastFullCharge: number | null;
}

export interface HealthTip {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'charging' | 'temperature' | 'usage' | 'storage';
}

export interface AIResponse {
  suggestion: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
