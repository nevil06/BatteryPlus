import AsyncStorage from '@react-native-async-storage/async-storage';
import { BatteryReading } from '../types/battery';
import { STORAGE_KEYS } from '../utils/constants';

const MAX_READINGS = 500;
const READING_INTERVAL = 30 * 1000; // Save every 30 seconds for responsive data

export const saveReading = async (reading: BatteryReading, force: boolean = false): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEYS.BATTERY_READINGS);
    let readings: BatteryReading[] = existingData ? JSON.parse(existingData) : [];

    if (!force && readings.length > 0) {
      const lastReading = readings[readings.length - 1];
      if (reading.timestamp - lastReading.timestamp < READING_INTERVAL) {
        return;
      }
    }

    readings.push(reading);

    if (readings.length > MAX_READINGS) {
      readings = readings.slice(-MAX_READINGS);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.BATTERY_READINGS, JSON.stringify(readings));
  } catch (error) {
    console.error('Error saving battery reading:', error);
  }
};

export const getReadings = async (hours: number = 24): Promise<BatteryReading[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BATTERY_READINGS);
    if (!data) return [];

    const readings: BatteryReading[] = JSON.parse(data);
    const cutoff = Date.now() - hours * 60 * 60 * 1000;

    return readings.filter(r => r.timestamp >= cutoff);
  } catch (error) {
    console.error('Error getting battery readings:', error);
    return [];
  }
};

export const getAllReadings = async (): Promise<BatteryReading[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BATTERY_READINGS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting all readings:', error);
    return [];
  }
};

export const clearReadings = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.BATTERY_READINGS);
  } catch (error) {
    console.error('Error clearing readings:', error);
  }
};

export const saveGroqApiKey = async (apiKey: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.GROQ_API_KEY, apiKey);
  } catch (error) {
    console.error('Error saving API key:', error);
  }
};

export const getGroqApiKey = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.GROQ_API_KEY);
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
};

export const saveLastAISuggestion = async (suggestion: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_AI_SUGGESTION, JSON.stringify({
      suggestion,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error('Error saving AI suggestion:', error);
  }
};

export const getLastAISuggestion = async (): Promise<{ suggestion: string; timestamp: number } | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LAST_AI_SUGGESTION);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting AI suggestion:', error);
    return null;
  }
};
