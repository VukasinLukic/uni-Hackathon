import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './apiService';

const BACKGROUND_LOCATION_TASK = 'background-location-task';
const LOCATION_TRACKING_KEY = '@location_tracking_active';

interface BackgroundLocationData {
  locations: Location.LocationObject[];
}

// Define the background task
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }

  if (data) {
    const { locations } = data as BackgroundLocationData;
    const location = locations[0];

    if (location) {
      try {
        // Get user ID from storage
        const userId = await AsyncStorage.getItem('@user_id');
        if (!userId) return;

        // Calculate cell ID
        const cellId = getCellId(location.coords.latitude, location.coords.longitude);

        // Get previously explored cells
        const exploredCellsJson = await AsyncStorage.getItem('@explored_cells');
        const exploredCells: Set<string> = exploredCellsJson
          ? new Set(JSON.parse(exploredCellsJson))
          : new Set();

        // If this is a new cell, send to backend
        if (!exploredCells.has(cellId)) {
          exploredCells.add(cellId);

          // Save to local storage
          await AsyncStorage.setItem('@explored_cells', JSON.stringify(Array.from(exploredCells)));

          // Send to backend
          await apiService.post('/exploration/explore', {
            userId,
            cellId,
            location: {
              type: 'Point',
              coordinates: [location.coords.longitude, location.coords.latitude]
            }
          });

          console.log('Background: New cell explored:', cellId);
        }

        // Update current drive session if active
        const sessionId = await AsyncStorage.getItem('@active_session_id');
        if (sessionId) {
          await apiService.post(`/drives/${sessionId}/update`, {
            location: {
              type: 'Point',
              coordinates: [location.coords.longitude, location.coords.latitude]
            },
            speed: location.coords.speed || 0
          });
        }
      } catch (error) {
        console.error('Error processing background location:', error);
      }
    }
  }
});

function getCellId(lat: number, lng: number): string {
  const CELL_SIZE = 0.001;
  const cellLat = Math.floor(lat / CELL_SIZE);
  const cellLng = Math.floor(lng / CELL_SIZE);
  return `${cellLat}_${cellLng}`;
}

class BackgroundLocationService {
  async startTracking() {
    try {
      console.log('📍 [BackgroundLocation] Requesting foreground location permission...');

      // Request background permissions
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      console.log(`📍 [BackgroundLocation] Foreground permission status: ${foregroundStatus}`);

      if (foregroundStatus !== 'granted') {
        const error = new Error('Foreground location permission not granted');
        console.error('❌ [BackgroundLocation] ERROR:', error.message);
        throw error;
      }

      console.log('📍 [BackgroundLocation] Requesting background location permission...');
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      console.log(`📍 [BackgroundLocation] Background permission status: ${backgroundStatus}`);

      if (backgroundStatus !== 'granted') {
        console.warn('⚠️ [BackgroundLocation] Background location permission not granted - will track in foreground only');
        // Can still track in foreground
      }

      // Check if task is already running
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
      console.log(`📍 [BackgroundLocation] Task registration status: ${isRegistered ? 'Already registered' : 'Not registered'}`);

      if (isRegistered) {
        console.log('✅ [BackgroundLocation] Background location task already registered');
        return;
      }

      console.log('📍 [BackgroundLocation] Starting location updates...');

      // Start background location updates
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.Balanced, // Save battery in background
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Update every 10 meters
        foregroundService: {
          notificationTitle: 'PavePatrol',
          notificationBody: 'Tracking your exploration',
          notificationColor: '#667eea',
        },
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
      });

      await AsyncStorage.setItem(LOCATION_TRACKING_KEY, 'true');
      console.log('✅ [BackgroundLocation] Background location tracking started successfully!');
    } catch (error: any) {
      console.error('❌ [BackgroundLocation] CRITICAL ERROR starting background tracking:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      throw error;
    }
  }

  async stopTracking() {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        console.log('Background location tracking stopped');
      }
      await AsyncStorage.setItem(LOCATION_TRACKING_KEY, 'false');
    } catch (error) {
      console.error('Error stopping background tracking:', error);
    }
  }

  async isTracking(): Promise<boolean> {
    try {
      const tracking = await AsyncStorage.getItem(LOCATION_TRACKING_KEY);
      return tracking === 'true';
    } catch (error) {
      return false;
    }
  }

  async getTaskStatus() {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
      return {
        isRegistered,
        isTracking: await this.isTracking()
      };
    } catch (error) {
      console.error('Error getting task status:', error);
      return { isRegistered: false, isTracking: false };
    }
  }
}

export default new BackgroundLocationService();
