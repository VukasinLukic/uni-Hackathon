# 📱 RoadSense Mobile App

iOS aplikacija za automatsku detekciju rupa na putu.

## 🚀 Setup

```bash
npm install
npm start
```

## 📖 Documentation

Za detaljan plan implementacije, pogledaj:
- [VUKASIN_IMPLEMENTATION_PLAN.md](VUKASIN_IMPLEMENTATION_PLAN.md)

## 🏗️ Folder Structure

```
src/
├── screens/       # Screen components
├── components/    # Reusable components
├── services/      # Business logic & API calls
├── utils/         # Utilities & helpers
├── store/         # Zustand state management
├── navigation/    # React Navigation setup
└── types/         # TypeScript types
```

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in values:

```
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_AUTH0_DOMAIN=...
EXPO_PUBLIC_AUTH0_CLIENT_ID=...
```

## 📦 Key Dependencies

- **expo-sensors**: Accelerometer & Gyroscope
- **expo-location**: GPS tracking
- **expo-camera**: Photo capture
- **react-native-maps**: Map visualization
- **zustand**: State management
- **react-native-auth0**: Authentication

## 🧪 Testing

**IMPORTANT**: Sensors only work on real iPhone device, not in simulator!

```bash
# Build for iOS device
expo run:ios --device
```

## 👨‍💻 Developer: Vukasin
