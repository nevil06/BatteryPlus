import { BatteryInfo, BatteryReading, GroqMessage } from '../types/battery';
import { GROQ_CONFIG } from '../utils/constants';
import { countChargeCycles, calculateDrainRate } from './batteryService';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const generateBatterySuggestion = async (
  apiKey: string,
  batteryInfo: BatteryInfo,
  readings: BatteryReading[]
): Promise<string> => {
  const context = buildBatteryContext(batteryInfo, readings);

  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: `You are a friendly battery health advisor for smartphones. Provide concise, actionable advice (2-3 sentences max) based on the user's current battery status and usage patterns. Be specific and practical. Focus on one key recommendation at a time. Use a warm, helpful tone.`,
    },
    {
      role: 'user',
      content: context,
    },
  ];

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_CONFIG.MODEL,
        messages,
        max_tokens: GROQ_CONFIG.MAX_TOKENS,
        temperature: GROQ_CONFIG.TEMPERATURE,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get AI suggestion');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Unable to generate suggestion.';
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
};

const buildBatteryContext = (info: BatteryInfo, readings: BatteryReading[]): string => {
  const chargeCycles = countChargeCycles(readings);
  const drainRate = calculateDrainRate(readings);
  const avgLevel = readings.length > 0
    ? readings.reduce((sum, r) => sum + r.level, 0) / readings.length
    : info.level;

  const recentChargingHours = readings.filter(r => r.isCharging).length * 0.25;
  const totalHours = readings.length * 0.25;
  const chargingPercentage = totalHours > 0 ? (recentChargingHours / totalHours) * 100 : 0;

  let context = `Current battery status:
- Level: ${info.level}%
- State: ${info.batteryState}
- Low Power Mode: ${info.lowPowerMode ? 'ON' : 'OFF'}

Usage patterns (last ${Math.round(totalHours)} hours):
- Average battery level: ${Math.round(avgLevel)}%
- Charging sessions: ${chargeCycles}
- Time spent charging: ${Math.round(chargingPercentage)}%
- Average drain rate: ${drainRate.toFixed(1)}% per hour`;

  if (info.level < 20) {
    context += '\n\nNote: Battery is critically low.';
  } else if (info.level > 90 && info.isCharging) {
    context += '\n\nNote: Battery is nearly full while still charging.';
  }

  if (drainRate > 10) {
    context += '\n\nNote: Battery is draining faster than usual.';
  }

  context += '\n\nProvide a personalized tip to help maintain better battery health.';

  return context;
};

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_CONFIG.MODEL,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      }),
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};
