# BatteryPlus

AI-powered battery monitoring app built with React Native and Expo.

## Features

- **Real-time Battery Stats** - Level, health, temperature, voltage, current draw
- **Native Android Integration** - Uses BatteryManager API for accurate data
- **24h Trend Chart** - Track battery usage over time
- **AI Battery Advisor** - Personalized tips using Groq AI
- **Health Tips** - Battery care recommendations
- **Dark Theme UI** - Modern gradient-based design

## Screenshots

| Dashboard | Tips | AI Advisor |
|-----------|------|------------|
| Battery gauge, stats cards, trend chart | Expandable health tips | AI-powered suggestions |

## Tech Stack

- React Native + Expo SDK 54
- TypeScript
- Native Android Module (Kotlin)
- Groq AI API
- AsyncStorage for persistence
- react-native-svg + react-native-chart-kit

## Getting Started

### Prerequisites

- Node.js 20+
- Expo CLI
- Android device or emulator

### Installation

```bash
# Clone the repo
git clone https://github.com/mithun50/BatteryPlus.git
cd BatteryPlus

# Install dependencies
npm install

# Start development server
npm start
```

### Running on Device

**Expo Go (Basic Mode):**
```bash
npm start
# Scan QR code with Expo Go app
```

**Native Build (Full Features):**
```bash
# Generate native project
npx expo prebuild

# Build and run
npx expo run:android
```

## Native Module

The app includes a custom native module (`modules/battery-native`) that provides:

| Function | Description |
|----------|-------------|
| `getCurrentNow()` | Real-time current draw (μA) |
| `getTemperature()` | Battery temperature (°C) |
| `getVoltage()` | Battery voltage (mV) |
| `getHealthStatus()` | GOOD, OVERHEAT, COLD, etc. |
| `getCycleCount()` | Charge cycles (if available) |
| `getChargeCounter()` | Remaining charge (μAh) |
| `getDesignCapacity()` | Battery capacity (mAh) |

> Note: Native features require building the app (`expo prebuild`). Expo Go shows basic data only.

## AI Advisor Setup

1. Get API key from [Groq Console](https://console.groq.com)
2. Open app → AI Advisor tab → Enter API key
3. Get personalized battery care suggestions

## Building APK/AAB

### Local Build
```bash
# Preview APK
eas build --platform android --profile preview --local

# Production AAB
eas build --platform android --profile production --local
```

### GitHub Actions

Push to `main` branch triggers automatic build. Add these secrets:

| Secret | Description |
|--------|-------------|
| `EXPO_TOKEN` | Expo access token |
| `ANDROID_KEYSTORE_BASE64` | Base64 encoded keystore |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias |
| `ANDROID_KEY_PASSWORD` | Key password |

## Project Structure

```
BatteryPlus/
├── App.tsx                 # Main app component
├── src/
│   ├── components/         # UI components
│   ├── hooks/              # useBattery hook
│   ├── services/           # API & storage services
│   ├── types/              # TypeScript types
│   └── utils/              # Constants & helpers
├── modules/
│   └── battery-native/     # Native Android module
└── .github/workflows/      # CI/CD
```

## License

MIT

## Author

[@mithun50](https://github.com/mithun50)
