import { HealthTip } from '../types/battery';

export const COLORS = {
  background: '#0f0f1a',
  cardBg: '#1a1a2e',
  cardBgLight: '#252540',
  primary: '#4ade80',
  secondary: '#22d3ee',
  accent: '#a78bfa',
  warning: '#fbbf24',
  danger: '#f87171',
  text: '#ffffff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  border: '#334155',
};

export const GRADIENTS: Record<string, [string, string]> = {
  green: ['#22c55e', '#16a34a'],
  blue: ['#3b82f6', '#2563eb'],
  purple: ['#8b5cf6', '#7c3aed'],
  orange: ['#f97316', '#ea580c'],
  red: ['#ef4444', '#dc2626'],
  cyan: ['#06b6d4', '#0891b2'],
};

export const HEALTH_TIPS: HealthTip[] = [
  {
    id: '1',
    title: 'Avoid Extreme Temperatures',
    description: 'Keep your device between 20°C and 35°C. Extreme heat damages battery cells permanently.',
    icon: 'thermometer',
    category: 'temperature',
  },
  {
    id: '2',
    title: 'Optimal Charging Range',
    description: 'Keep battery between 20-80% for longest lifespan. Avoid full 0-100% cycles regularly.',
    icon: 'battery-charging',
    category: 'charging',
  },
  {
    id: '3',
    title: 'Use Original Charger',
    description: 'Original or certified chargers ensure proper voltage and current for safe charging.',
    icon: 'zap',
    category: 'charging',
  },
  {
    id: '4',
    title: 'Avoid Overnight Charging',
    description: 'Modern phones handle this, but unplugging at 80-90% extends battery longevity.',
    icon: 'moon',
    category: 'charging',
  },
  {
    id: '5',
    title: 'Reduce Screen Brightness',
    description: 'Display is the biggest power consumer. Use auto-brightness or keep it moderate.',
    icon: 'sun',
    category: 'usage',
  },
  {
    id: '6',
    title: 'Close Background Apps',
    description: 'Apps running in background drain battery. Regularly close unused applications.',
    icon: 'x-circle',
    category: 'usage',
  },
  {
    id: '7',
    title: 'Store at 50% Charge',
    description: 'If storing device long-term, keep battery at 50% in a cool, dry place.',
    icon: 'archive',
    category: 'storage',
  },
  {
    id: '8',
    title: 'Enable Battery Saver',
    description: 'Use battery saver mode when below 20% to extend usage time significantly.',
    icon: 'shield',
    category: 'usage',
  },
];

export const STORAGE_KEYS = {
  BATTERY_READINGS: 'battery_readings',
  GROQ_API_KEY: 'groq_api_key',
  LAST_AI_SUGGESTION: 'last_ai_suggestion',
};

export const GROQ_CONFIG = {
  MODEL: 'llama-3.3-70b-versatile',
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7,
};
