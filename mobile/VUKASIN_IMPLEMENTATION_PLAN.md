# 📱 VUKASIN - Mobile App Implementation Plan

**Role**: Mobile Developer - iOS Driver App
**Tech Stack**: React Native + Expo + TypeScript + Sensors + Auth0 + Mapbox
**Timeline**: 7 days (phased approach for hackathon)

---

## 🎯 OVERVIEW

Vukašinova zaduženja:
- iOS mobilna aplikacija za vozače
- Automatska detekcija rupa pomoću senzora
- Real-time upozorenja za vozače
- Mapa sa vizualizacijom rupa
- Camera integration za fotografisanje rupa
- GPS tracking i location services
- Auth0 authentication

---

## 📅 PHASE 1: Setup & Foundation (Day 1-2)

### ✅ Day 1 Morning: Expo Project Setup

**Tasks:**
1. Initialize Expo project
   ```bash
   cd mobile
   npx create-expo-app . --template blank-typescript

   # ili ako praviš od nule:
   expo init . --template expo-template-blank-typescript
   ```

2. Install dependencies
   ```bash
   # Core
   npm install expo-sensors expo-location expo-camera
   npm install @react-navigation/native @react-navigation/stack
   npm install react-native-maps
   npm install zustand axios
   npm install react-native-auth0
   npm install socket.io-client

   # UI
   npm install nativewind
   npm install react-native-safe-area-context
   npm install react-native-screens
   npm install expo-av  # za audio alerts

   # Utils
   npm install date-fns
   ```

3. Setup NativeWind (Tailwind for RN)
   ```bash
   npm install -D tailwindcss
   npx tailwindcss init
   ```

   `tailwind.config.js`:
   ```js
   module.exports = {
     content: [
       "./App.{js,jsx,ts,tsx}",
       "./src/**/*.{js,jsx,ts,tsx}"
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

   `babel.config.js`:
   ```js
   module.exports = {
     presets: ['babel-preset-expo'],
     plugins: ['nativewind/babel'],
   };
   ```

4. Create folder structure
   ```bash
   mkdir -p src/{screens,components,services,utils,store,navigation,types}
   ```

**Deliverable**: ✅ Expo project sa Tailwind

---

### ✅ Day 1 Afternoon: Navigation & Auth Setup

**Tasks:**
1. Setup React Navigation
   `src/navigation/AppNavigator.tsx`:
   ```typescript
   import React from 'react';
   import { NavigationContainer } from '@react-navigation/native';
   import { createStackNavigator } from '@react-navigation/stack';
   import HomeScreen from '../screens/HomeScreen';
   import DrivingScreen from '../screens/DrivingScreen';
   import MapScreen from '../screens/MapScreen';
   import AuthScreen from '../screens/AuthScreen';

   const Stack = createStackNavigator();

   export default function AppNavigator() {
     return (
       <NavigationContainer>
         <Stack.Navigator initialRouteName="Auth">
           <Stack.Screen
             name="Auth"
             component={AuthScreen}
             options={{ headerShown: false }}
           />
           <Stack.Screen name="Home" component={HomeScreen} />
           <Stack.Screen
             name="Driving"
             component={DrivingScreen}
             options={{ headerShown: false }}
           />
           <Stack.Screen name="Map" component={MapScreen} />
         </Stack.Navigator>
       </NavigationContainer>
     );
   }
   ```

2. Create Auth0 service
   `src/services/authService.ts`:
   ```typescript
   import Auth0 from 'react-native-auth0';

   const auth0 = new Auth0({
     domain: process.env.EXPO_PUBLIC_AUTH0_DOMAIN!,
     clientId: process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID!,
   });

   export class AuthService {
     static async login() {
       try {
         const credentials = await auth0.webAuth.authorize({
           scope: 'openid profile email',
         });

         return {
           accessToken: credentials.accessToken,
           idToken: credentials.idToken,
         };
       } catch (error) {
         console.error('Login error:', error);
         throw error;
       }
     }

     static async logout() {
       try {
         await auth0.webAuth.clearSession();
       } catch (error) {
         console.error('Logout error:', error);
       }
     }

     static async getUserInfo(accessToken: string) {
       try {
         const user = await auth0.auth.userInfo({ token: accessToken });
         return user;
       } catch (error) {
         console.error('Get user info error:', error);
         throw error;
       }
     }
   }
   ```

3. Create Zustand store
   `src/store/useAppStore.ts`:
   ```typescript
   import create from 'zustand';

   interface Pothole {
     _id: string;
     location: { lat: number; lng: number };
     severity: number;
     status: string;
   }

   interface TripData {
     isActive: boolean;
     startTime: Date | null;
     detectedPotholes: number;
   }

   interface AppState {
     // Auth
     isAuthenticated: boolean;
     accessToken: string | null;
     user: any;
     setAuth: (token: string, user: any) => void;
     logout: () => void;

     // Trip
     trip: TripData;
     startTrip: () => void;
     endTrip: () => void;
     incrementPotholes: () => void;

     // Potholes
     nearbyPotholes: Pothole[];
     setNearbyPotholes: (potholes: Pothole[]) => void;
   }

   export const useAppStore = create<AppState>((set) => ({
     isAuthenticated: false,
     accessToken: null,
     user: null,
     setAuth: (token, user) => set({ isAuthenticated: true, accessToken: token, user }),
     logout: () => set({ isAuthenticated: false, accessToken: null, user: null }),

     trip: {
       isActive: false,
       startTime: null,
       detectedPotholes: 0,
     },
     startTrip: () => set({
       trip: {
         isActive: true,
         startTime: new Date(),
         detectedPotholes: 0,
       },
     }),
     endTrip: () => set({
       trip: {
         isActive: false,
         startTime: null,
         detectedPotholes: 0,
       },
     }),
     incrementPotholes: () => set((state) => ({
       trip: {
         ...state.trip,
         detectedPotholes: state.trip.detectedPotholes + 1,
       },
     })),

     nearbyPotholes: [],
     setNearbyPotholes: (potholes) => set({ nearbyPotholes: potholes }),
   }));
   ```

4. Create Auth Screen
   `src/screens/AuthScreen.tsx`:
   ```typescript
   import React from 'react';
   import { View, Text, TouchableOpacity, Image } from 'react-native';
   import { AuthService } from '../services/authService';
   import { useAppStore } from '../store/useAppStore';

   export default function AuthScreen({ navigation }: any) {
     const setAuth = useAppStore((state) => state.setAuth);

     const handleLogin = async () => {
       try {
         const { accessToken, idToken } = await AuthService.login();
         const user = await AuthService.getUserInfo(accessToken);

         setAuth(accessToken, user);
         navigation.replace('Home');
       } catch (error) {
         console.error('Login failed:', error);
       }
     };

     return (
       <View className="flex-1 bg-blue-600 items-center justify-center px-8">
         <Image
           source={require('../../assets/icon.png')}
           className="w-24 h-24 mb-8"
         />
         <Text className="text-white text-4xl font-bold mb-4">
           RoadSense
         </Text>
         <Text className="text-white text-center mb-12">
           Detect potholes automatically and help make roads safer
         </Text>

         <TouchableOpacity
           onPress={handleLogin}
           className="bg-white px-8 py-4 rounded-full"
         >
           <Text className="text-blue-600 font-bold text-lg">
             Sign In to Continue
           </Text>
         </TouchableOpacity>
       </View>
     );
   }
   ```

**Deliverable**: ✅ Navigation + Auth0 login

---

## 📅 PHASE 2: Sensor Integration & Detection (Day 2-3)

### ✅ Day 2: Sensor Service Setup

**Tasks:**
1. Create sensor service
   `src/services/sensorService.ts`:
   ```typescript
   import {
     Accelerometer,
     Gyroscope,
     AccelerometerMeasurement,
     GyroscopeMeasurement,
   } from 'expo-sensors';

   export class SensorService {
     private accelerometerSubscription: any;
     private gyroscopeSubscription: any;
     private isMonitoring = false;

     // Callbacks
     private onAccelerometerData?: (data: AccelerometerMeasurement) => void;
     private onGyroscopeData?: (data: GyroscopeMeasurement) => void;

     async startMonitoring(callbacks: {
       onAccelerometer: (data: AccelerometerMeasurement) => void;
       onGyroscope: (data: GyroscopeMeasurement) => void;
     }) {
       if (this.isMonitoring) return;

       this.onAccelerometerData = callbacks.onAccelerometer;
       this.onGyroscopeData = callbacks.onGyroscope;

       // Set update interval (50 Hz = 20ms)
       Accelerometer.setUpdateInterval(20);
       Gyroscope.setUpdateInterval(20);

       // Start subscriptions
       this.accelerometerSubscription = Accelerometer.addListener((data) => {
         this.onAccelerometerData?.(data);
       });

       this.gyroscopeSubscription = Gyroscope.addListener((data) => {
         this.onGyroscopeData?.(data);
       });

       this.isMonitoring = true;
       console.log('✅ Sensors started');
     }

     stopMonitoring() {
       if (!this.isMonitoring) return;

       this.accelerometerSubscription?.remove();
       this.gyroscopeSubscription?.remove();

       this.isMonitoring = false;
       console.log('🛑 Sensors stopped');
     }

     isActive() {
       return this.isMonitoring;
     }
   }
   ```

2. Create location service
   `src/services/locationService.ts`:
   ```typescript
   import * as Location from 'expo-location';

   export class LocationService {
     private locationSubscription: any;
     private currentLocation: Location.LocationObject | null = null;
     private currentSpeed: number = 0; // km/h

     async requestPermissions(): Promise<boolean> {
       const { status } = await Location.requestForegroundPermissionsAsync();

       if (status !== 'granted') {
         console.error('Location permission denied');
         return false;
       }

       return true;
     }

     async startTracking(callback: (location: Location.LocationObject) => void) {
       const hasPermission = await this.requestPermissions();
       if (!hasPermission) return;

       this.locationSubscription = await Location.watchPositionAsync(
         {
           accuracy: Location.Accuracy.BestForNavigation,
           timeInterval: 1000, // 1 second
           distanceInterval: 5, // 5 meters
         },
         (location) => {
           this.currentLocation = location;

           // Calculate speed in km/h
           if (location.coords.speed !== null && location.coords.speed >= 0) {
             this.currentSpeed = location.coords.speed * 3.6; // m/s to km/h
           }

           callback(location);
         }
       );

       console.log('✅ Location tracking started');
     }

     stopTracking() {
       this.locationSubscription?.remove();
       console.log('🛑 Location tracking stopped');
     }

     getCurrentLocation() {
       return this.currentLocation;
     }

     getCurrentSpeed() {
       return this.currentSpeed;
     }
   }
   ```

**Deliverable**: ✅ Sensor + Location services

---

### ✅ Day 3: Pothole Detection Algorithm

**Tasks:**
1. Create signal processing utilities
   `src/utils/signalProcessing.ts`:
   ```typescript
   import { AccelerometerMeasurement } from 'expo-sensors';

   export class SignalProcessing {
     private accelBuffer: number[] = [];
     private readonly BUFFER_SIZE = 10;

     // High-pass filter to isolate spikes
     private lastFiltered = 0;
     private readonly FILTER_ALPHA = 0.8;

     calculateMagnitude(data: AccelerometerMeasurement): number {
       const { x, y, z } = data;
       return Math.sqrt(x * x + y * y + z * z);
     }

     // Extract vertical component (assuming phone is relatively stable)
     getVerticalAcceleration(data: AccelerometerMeasurement): number {
       // Simplified: use z-axis as vertical
       // In production, would use gyro data to transform to earth frame
       return Math.abs(data.z);
     }

     // High-pass filter to remove smooth changes
     applyHighPassFilter(value: number): number {
       const filtered = this.FILTER_ALPHA * (this.lastFiltered + value - (this.accelBuffer[0] || value));
       this.lastFiltered = filtered;

       // Add to buffer
       this.accelBuffer.push(value);
       if (this.accelBuffer.length > this.BUFFER_SIZE) {
         this.accelBuffer.shift();
       }

       return Math.abs(filtered);
     }

     // Detect spike pattern
     isSpikePattern(filteredValue: number, threshold: number): boolean {
       return filteredValue > threshold;
     }

     reset() {
       this.accelBuffer = [];
       this.lastFiltered = 0;
     }
   }
   ```

2. Create context checks
   `src/utils/contextChecks.ts`:
   ```typescript
   import { GyroscopeMeasurement } from 'expo-sensors';

   export class ContextChecks {
     private orientationBuffer: GyroscopeMeasurement[] = [];
     private readonly BUFFER_SIZE = 30; // 30 samples @ 50Hz = 0.6 seconds

     // Check if speed is in valid range for driving
     isValidSpeed(speed: number): boolean {
       return speed >= 15 && speed <= 90; // km/h
     }

     // Check if device is stable (not being waved around)
     isDeviceStable(gyroData: GyroscopeMeasurement): boolean {
       this.orientationBuffer.push(gyroData);

       if (this.orientationBuffer.length > this.BUFFER_SIZE) {
         this.orientationBuffer.shift();
       }

       if (this.orientationBuffer.length < this.BUFFER_SIZE) {
         return false; // Not enough data yet
       }

       // Calculate variance
       const variance = this.calculateVariance(
         this.orientationBuffer.map((d) =>
           Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z)
         )
       );

       // Low variance = stable device
       return variance < 0.5;
     }

     private calculateVariance(values: number[]): number {
       const mean = values.reduce((a, b) => a + b, 0) / values.length;
       const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
       return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
     }

     reset() {
       this.orientationBuffer = [];
     }
   }
   ```

3. Create detection service
   `src/services/detectionService.ts`:
   ```typescript
   import { AccelerometerMeasurement, GyroscopeMeasurement } from 'expo-sensors';
   import { SignalProcessing } from '../utils/signalProcessing';
   import { ContextChecks } from '../utils/contextChecks';

   interface PotholeEvent {
     timestamp: Date;
     location: { lat: number; lng: number };
     magnitude: number;
     speed: number;
   }

   export class DetectionService {
     private signalProcessor = new SignalProcessing();
     private contextChecker = new ContextChecks();

     private readonly POTHOLE_THRESHOLD = 1.5; // 1.5g spike
     private readonly COOLDOWN_MS = 2000; // 2 seconds between detections
     private lastDetectionTime = 0;

     private onPotholeDetected?: (event: PotholeEvent) => void;

     setCallback(callback: (event: PotholeEvent) => void) {
       this.onPotholeDetected = callback;
     }

     processAccelerometerData(
       accelData: AccelerometerMeasurement,
       gyroData: GyroscopeMeasurement,
       location: { lat: number; lng: number },
       speed: number
     ) {
       // Context checks
       if (!this.contextChecker.isValidSpeed(speed)) {
         return; // Not driving speed
       }

       if (!this.contextChecker.isDeviceStable(gyroData)) {
         return; // Device not stable
       }

       // Cooldown check
       const now = Date.now();
       if (now - this.lastDetectionTime < this.COOLDOWN_MS) {
         return;
       }

       // Signal processing
       const magnitude = this.signalProcessor.calculateMagnitude(accelData);
       const vertical = this.signalProcessor.getVerticalAcceleration(accelData);
       const filtered = this.signalProcessor.applyHighPassFilter(vertical);

       // Detection
       if (this.signalProcessor.isSpikePattern(filtered, this.POTHOLE_THRESHOLD)) {
         console.log('🕳️ POTHOLE DETECTED!', { magnitude, filtered, speed });

         this.lastDetectionTime = now;

         const event: PotholeEvent = {
           timestamp: new Date(),
           location,
           magnitude: filtered,
           speed,
         };

         this.onPotholeDetected?.(event);
       }
     }

     reset() {
       this.signalProcessor.reset();
       this.contextChecker.reset();
       this.lastDetectionTime = 0;
     }
   }
   ```

**Deliverable**: ✅ Pothole detection algorithm

---

## 📅 PHASE 3: API Integration & Driving Screen (Day 3-4)

### ✅ Day 3 Afternoon: API Service

**Tasks:**
1. Create API service
   `src/services/apiService.ts`:
   ```typescript
   import axios from 'axios';
   import { useAppStore } from '../store/useAppStore';

   const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

   const api = axios.create({
     baseURL: API_BASE_URL,
     headers: {
       'Content-Type': 'application/json',
     },
   });

   // Add auth token to requests
   api.interceptors.request.use((config) => {
     const token = useAppStore.getState().accessToken;
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });

   export class APIService {
     // Send pothole event
     static async sendPotholeEvent(eventData: {
       location: { coordinates: [number, number] };
       accelerationData: {
         magnitude: number;
         x: number;
         y: number;
         z: number;
       };
       speed: number;
       timestamp: Date;
     }) {
       try {
         const response = await api.post('/events', eventData);
         return response.data;
       } catch (error) {
         console.error('Send event error:', error);
         throw error;
       }
     }

     // Get nearby potholes
     static async getNearbyPotholes(lat: number, lng: number, radius = 1000) {
       try {
         const response = await api.get('/potholes/nearby', {
           params: { lat, lng, radius },
         });
         return response.data.potholes;
       } catch (error) {
         console.error('Get nearby potholes error:', error);
         return [];
       }
     }

     // Upload photo
     static async uploadPhoto(potholeId: string, base64Image: string) {
       try {
         const response = await api.post('/upload/photo', {
           potholeId,
           image: base64Image,
         });
         return response.data;
       } catch (error) {
         console.error('Upload photo error:', error);
         throw error;
       }
     }
   }
   ```

**Deliverable**: ✅ API service

---

### ✅ Day 4 Morning: Driving Screen

**Tasks:**
1. Create Driving Screen
   `src/screens/DrivingScreen.tsx`:
   ```typescript
   import React, { useEffect, useState } from 'react';
   import { View, Text, TouchableOpacity } from 'react-native';
   import { SensorService } from '../services/sensorService';
   import { LocationService } from '../services/locationService';
   import { DetectionService } from '../services/detectionService';
   import { APIService } from '../services/apiService';
   import { useAppStore } from '../store/useAppStore';

   export default function DrivingScreen({ navigation }: any) {
     const [isMonitoring, setIsMonitoring] = useState(false);
     const [speed, setSpeed] = useState(0);
     const incrementPotholes = useAppStore((state) => state.incrementPotholes);
     const endTrip = useAppStore((state) => state.endTrip);

     const sensorService = new SensorService();
     const locationService = new LocationService();
     const detectionService = new DetectionService();

     useEffect(() => {
       startDriving();

       return () => {
         stopDriving();
       };
     }, []);

     const startDriving = async () => {
       // Setup detection callback
       detectionService.setCallback(async (event) => {
         console.log('Pothole detected:', event);

         // Play alert sound (implement later)
         // playAlertSound();

         // Send to backend
         try {
           await APIService.sendPotholeEvent({
             location: {
               coordinates: [event.location.lng, event.location.lat],
             },
             accelerationData: {
               magnitude: event.magnitude,
               x: 0,
               y: 0,
               z: event.magnitude,
             },
             speed: event.speed,
             timestamp: event.timestamp,
           });

           incrementPotholes();
         } catch (error) {
           console.error('Failed to send event:', error);
         }
       });

       // Start location tracking
       await locationService.startTracking((location) => {
         setSpeed(locationService.getCurrentSpeed());
       });

       // Start sensors
       let lastGyroData: any = { x: 0, y: 0, z: 0 };

       await sensorService.startMonitoring({
         onAccelerometer: (accelData) => {
           const location = locationService.getCurrentLocation();
           const currentSpeed = locationService.getCurrentSpeed();

           if (location) {
             detectionService.processAccelerometerData(
               accelData,
               lastGyroData,
               {
                 lat: location.coords.latitude,
                 lng: location.coords.longitude,
               },
               currentSpeed
             );
           }
         },
         onGyroscope: (gyroData) => {
           lastGyroData = gyroData;
         },
       });

       setIsMonitoring(true);
     };

     const stopDriving = () => {
       sensorService.stopMonitoring();
       locationService.stopTracking();
       setIsMonitoring(false);
     };

     const handleEndTrip = () => {
       stopDriving();
       endTrip();
       navigation.navigate('Home');
     };

     return (
       <View className="flex-1 bg-gray-900 items-center justify-center px-8">
         <View className="bg-white rounded-full w-64 h-64 items-center justify-center mb-12">
           <Text className="text-6xl font-bold text-blue-600">{speed.toFixed(0)}</Text>
           <Text className="text-gray-500 text-lg">km/h</Text>
         </View>

         <Text className="text-white text-xl mb-4">Monitoring...</Text>
         <View className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />

         <TouchableOpacity
           onPress={handleEndTrip}
           className="absolute bottom-12 bg-red-500 px-12 py-4 rounded-full"
         >
           <Text className="text-white font-bold text-lg">End Trip</Text>
         </TouchableOpacity>
       </View>
     );
   }
   ```

**Deliverable**: ✅ Driving mode sa detekcijom

---

## 📅 PHASE 4: Map & Alerts (Day 4-5)

### ✅ Day 4 Afternoon: Map Screen

**Tasks:**
1. Create Map Screen
   `src/screens/MapScreen.tsx`:
   ```typescript
   import React, { useEffect, useState } from 'react';
   import { View, StyleSheet } from 'react-native';
   import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
   import { APIService } from '../services/apiService';
   import * as Location from 'expo-location';

   export default function MapScreen() {
     const [region, setRegion] = useState({
       latitude: 45.7489,
       longitude: 21.2257,
       latitudeDelta: 0.05,
       longitudeDelta: 0.05,
     });
     const [potholes, setPotholes] = useState<any[]>([]);

     useEffect(() => {
       getCurrentLocation();
       fetchNearbyPotholes();
     }, []);

     const getCurrentLocation = async () => {
       const location = await Location.getCurrentPositionAsync({});
       setRegion({
         latitude: location.coords.latitude,
         longitude: location.coords.longitude,
         latitudeDelta: 0.05,
         longitudeDelta: 0.05,
       });
     };

     const fetchNearbyPotholes = async () => {
       const data = await APIService.getNearbyPotholes(
         region.latitude,
         region.longitude
       );
       setPotholes(data);
     };

     const getMarkerColor = (severity: number) => {
       if (severity >= 70) return '#ef4444'; // red
       if (severity >= 40) return '#f59e0b'; // orange
       return '#10b981'; // green
     };

     return (
       <View style={styles.container}>
         <MapView
           provider={PROVIDER_GOOGLE}
           style={styles.map}
           region={region}
           showsUserLocation
           showsMyLocationButton
         >
           {potholes.map((pothole) => (
             <Marker
               key={pothole._id}
               coordinate={{
                 latitude: pothole.location.coordinates[1],
                 longitude: pothole.location.coordinates[0],
               }}
               pinColor={getMarkerColor(pothole.severity)}
               title={`Severity: ${pothole.severity}`}
               description={`Reports: ${pothole.reports}`}
             />
           ))}
         </MapView>
       </View>
     );
   }

   const styles = StyleSheet.create({
     container: { flex: 1 },
     map: { flex: 1 },
   });
   ```

**Deliverable**: ✅ Map sa pothole markerima

---

### ✅ Day 5: Real-time Alerts

**Tasks:**
1. Create alert service
   `src/services/alertService.ts`:
   ```typescript
   import * as Speech from 'expo-speech';
   import { Audio } from 'expo-av';

   export class AlertService {
     private static sound: Audio.Sound | null = null;

     // Voice alert
     static async speakAlert(message: string) {
       await Speech.speak(message, {
         language: 'en-US',
         pitch: 1.0,
         rate: 1.0,
       });
     }

     // Play beep sound
     static async playBeep() {
       try {
         if (!this.sound) {
           const { sound } = await Audio.Sound.createAsync(
             require('../../assets/beep.mp3')
           );
           this.sound = sound;
         }

         await this.sound.replayAsync();
       } catch (error) {
         console.error('Play sound error:', error);
       }
     }

     static async cleanup() {
       if (this.sound) {
         await this.sound.unloadAsync();
         this.sound = null;
       }
     }
   }
   ```

2. Add proximity checking to Driving Screen
   ```typescript
   // In DrivingScreen, add interval to check nearby potholes
   useEffect(() => {
     const interval = setInterval(async () => {
       const location = locationService.getCurrentLocation();
       if (!location) return;

       const nearby = await APIService.getNearbyPotholes(
         location.coords.latitude,
         location.coords.longitude,
         200 // 200m ahead
       );

       // Alert for high severity potholes
       nearby.forEach((pothole) => {
         if (pothole.severity >= 70) {
           AlertService.speakAlert('Caution: severe pothole ahead!');
           AlertService.playBeep();
         }
       });
     }, 5000); // Check every 5 seconds

     return () => clearInterval(interval);
   }, []);
   ```

**Deliverable**: ✅ Real-time alerts

---

## 📅 PHASE 5: Camera & Polish (Day 6-7)

### ✅ Day 6: Photo Capture

**Tasks:**
1. Create Camera Screen
   `src/screens/CameraScreen.tsx`:
   ```typescript
   import React, { useState, useRef } from 'react';
   import { View, Text, TouchableOpacity, Image } from 'react-native';
   import { Camera } from 'expo-camera';
   import { APIService } from '../services/apiService';

   export default function CameraScreen({ route, navigation }: any) {
     const { potholeId } = route.params;
     const [hasPermission, setHasPermission] = useState<boolean | null>(null);
     const [photo, setPhoto] = useState<string | null>(null);
     const cameraRef = useRef<Camera>(null);

     useEffect(() => {
       (async () => {
         const { status } = await Camera.requestCameraPermissionsAsync();
         setHasPermission(status === 'granted');
       })();
     }, []);

     const takePicture = async () => {
       if (!cameraRef.current) return;

       const photo = await cameraRef.current.takePictureAsync({
         base64: true,
       });

       setPhoto(photo.uri);
     };

     const uploadPhoto = async () => {
       if (!photo) return;

       try {
         await APIService.uploadPhoto(potholeId, photo);
         navigation.goBack();
       } catch (error) {
         console.error('Upload failed:', error);
       }
     };

     if (hasPermission === null) {
       return <View />;
     }

     if (hasPermission === false) {
       return <Text>No camera access</Text>;
     }

     if (photo) {
       return (
         <View className="flex-1">
           <Image source={{ uri: photo }} className="flex-1" />
           <View className="absolute bottom-8 w-full px-8 flex-row gap-4">
             <TouchableOpacity
               onPress={() => setPhoto(null)}
               className="flex-1 bg-gray-500 py-4 rounded-lg"
             >
               <Text className="text-white text-center font-bold">Retake</Text>
             </TouchableOpacity>
             <TouchableOpacity
               onPress={uploadPhoto}
               className="flex-1 bg-blue-600 py-4 rounded-lg"
             >
               <Text className="text-white text-center font-bold">Upload</Text>
             </TouchableOpacity>
           </View>
         </View>
       );
     }

     return (
       <View className="flex-1">
         <Camera ref={cameraRef} className="flex-1" type={Camera.Constants.Type.back} />
         <TouchableOpacity
           onPress={takePicture}
           className="absolute bottom-8 self-center bg-white w-20 h-20 rounded-full"
         />
       </View>
     );
   }
   ```

**Deliverable**: ✅ Camera integration

---

### ✅ Day 7: Final Polish

**Tasks:**
1. Create Home Screen
   `src/screens/HomeScreen.tsx`:
   ```typescript
   import React from 'react';
   import { View, Text, TouchableOpacity } from 'react-native';
   import { useAppStore } from '../store/useAppStore';

   export default function HomeScreen({ navigation }: any) {
     const { user, trip, startTrip } = useAppStore();

     const handleStartDrive = () => {
       startTrip();
       navigation.navigate('Driving');
     };

     return (
       <View className="flex-1 bg-white px-8 pt-12">
         <Text className="text-3xl font-bold mb-2">Welcome back,</Text>
         <Text className="text-2xl text-gray-600 mb-12">{user?.name || 'Driver'}</Text>

         <TouchableOpacity
           onPress={handleStartDrive}
           className="bg-blue-600 py-6 rounded-xl mb-6"
         >
           <Text className="text-white text-center text-xl font-bold">
             Start Driving
           </Text>
         </TouchableOpacity>

         <TouchableOpacity
           onPress={() => navigation.navigate('Map')}
           className="bg-gray-200 py-6 rounded-xl"
         >
           <Text className="text-gray-800 text-center text-xl font-bold">
             View Pothole Map
           </Text>
         </TouchableOpacity>

         <View className="mt-12 bg-gray-100 p-6 rounded-xl">
           <Text className="text-lg font-bold mb-4">Your Stats</Text>
           <Text className="text-gray-600">Total Reports: {user?.stats?.totalReports || 0}</Text>
           <Text className="text-gray-600">Points: {user?.stats?.points || 0}</Text>
         </View>
       </View>
     );
   }
   ```

2. **Testing & Bug Fixes:**
   - Test on real device (iOS)
   - Calibrate detection threshold
   - Fix any crashes
   - Optimize battery usage

3. **Loading States & Error Handling:**
   - Add loading spinners
   - Error messages
   - Offline mode handling

4. **Permissions Handling:**
   - Proper permission requests
   - Explain why permissions needed

**Deliverable**: ✅ Polished mobile app

---

## 🎯 PRIORITY CHECKLIST

### MUST HAVE
- [x] Auth0 login
- [x] Sensor monitoring (accelerometer + gyro)
- [x] GPS tracking
- [x] Pothole detection algorithm
- [x] Send events to backend
- [x] Driving screen

### SHOULD HAVE
- [x] Map sa nearby potholes
- [x] Real-time alerts
- [x] Camera za fotografije
- [x] Home screen sa stats

### NICE TO HAVE
- [ ] Trip history
- [ ] Gamification (badges, leaderboard)
- [ ] Offline mode (cache events)
- [ ] Settings screen

---

## 🐛 COMMON ISSUES

### Sensors not working in simulator
```typescript
// Sensors only work on real device!
// Test on physical iPhone
```

### Location permissions denied
```typescript
// Request in app.json:
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We need your location to detect potholes",
        "NSMotionUsageDescription": "We use motion sensors to detect potholes"
      }
    }
  }
}
```

### Detection too sensitive
```typescript
// Adjust POTHOLE_THRESHOLD in detectionService.ts
private readonly POTHOLE_THRESHOLD = 2.0; // Increase to reduce false positives
```

---

## 📚 RESOURCES

- [Expo Sensors Docs](https://docs.expo.dev/versions/latest/sdk/sensors/)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Auth0 React Native](https://auth0.com/docs/quickstart/native/react-native)

---

**Vukašine, srećno! 💪 Testiraj na stvarnom iPhone-u što prije, jer senzori ne rade u simulatoru!**
