import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import MapboxGamingMap, { Token, MapboxGamingMapRef } from '../components/MapboxGamingMap';
import { apiService } from '../services/apiService';
import socketService from '../services/socketService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MapGameScreenProps {
  onBack?: () => void;
}

export default function MapGameScreen({ onBack }: MapGameScreenProps) {
  const mapRef = useRef<any>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [exploredCells, setExploredCells] = useState<string[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [stats, setStats] = useState({
    xp: 0,
    cellsExplored: 0,
    tokensCollected: 0
  });

  useEffect(() => {
    initializeScreen();

    return () => {
      stopLocationTracking();
      socketService.disconnect();
    };
  }, []);

  const initializeScreen = async () => {
    const userId = await AsyncStorage.getItem('@user_id');
    if (userId) {
      socketService.connect(userId);
      setupSocketListeners();
    }
    loadUserData();
    loadNearbyTokens();
  };

  const setupSocketListeners = () => {
    // Listen for other users exploring cells
    socketService.onCellExploredByOthers((data) => {
      console.log('Other user explored:', data.cellId);
      // Could show notification or update shared map view
    });

    // Listen for level ups
    socketService.onLevelUp((data) => {
      console.log('Level up!', data);
      Alert.alert('Level Up!', `Congratulations! You reached level ${data.newLevel}!`);
    });

    // Listen for leaderboard updates
    socketService.onLeaderboardUpdate((data) => {
      console.log('Leaderboard updated:', data);
    });
  };

  const loadUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('@user_id');
      if (!userId) return;

      // Load user's explored cells from backend
      const response = await apiService.get(`/exploration/cells?userId=${userId}`);
      if (response.data.success && response.data.data) {
        const cellIds = response.data.data.map((cell: any) => cell.cellId);
        setExploredCells(cellIds);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadNearbyTokens = async () => {
    try {
      // Load nearby potholes/discoveries as tokens
      const response = await apiService.get('/potholes/nearby');
      if (response.data.success && response.data.data) {
        const tokenList: Token[] = response.data.data.map((pothole: any) => ({
          id: pothole._id,
          lat: pothole.location.coordinates[1],
          lng: pothole.location.coordinates[0],
          type: 'discovery',
          value: 100,
          collected: false
        }));
        setTokens(tokenList);
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  };

  const startLocationTracking = async () => {
    try {
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to track your movement.');
        return;
      }

      // Get current location first
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation
      });

      setCurrentLocation(location);

      // Update map with current location
      if (mapRef.current) {
        mapRef.current.updateLocation(
          location.coords.latitude,
          location.coords.longitude
        );
      }

      // Start watching location
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // Update every second
          distanceInterval: 5 // Update every 5 meters
        },
        (location) => {
          setCurrentLocation(location);

          // Update map
          if (mapRef.current) {
            mapRef.current.updateLocation(
              location.coords.latitude,
              location.coords.longitude
            );
          }
        }
      );

      setIsTracking(true);
    } catch (error) {
      console.error('Error starting location tracking:', error);
      Alert.alert('Error', 'Failed to start location tracking');
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    setIsTracking(false);
  };

  const handleAreaExplored = async (cellId: string, lat: number, lng: number) => {
    try {
      console.log('New area explored:', cellId);

      // Add to local state
      setExploredCells(prev => [...prev, cellId]);
      setStats(prev => ({ ...prev, cellsExplored: prev.cellsExplored + 1 }));

      // Send to backend
      const userId = await AsyncStorage.getItem('@user_id');
      if (!userId) return;

      const response = await apiService.post('/exploration/explore', {
        userId,
        cellId,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      });

      if (response.data.success) {
        const xpAwarded = response.data.data?.xpAwarded || 50;
        setStats(prev => ({ ...prev, xp: prev.xp + xpAwarded }));

        // Emit to socket for real-time updates
        socketService.emitCellExplored(cellId, lat, lng);

        // Show notification
        console.log(`+${xpAwarded} XP - New area explored!`);
      }
    } catch (error) {
      console.error('Error saving explored cell:', error);
    }
  };

  const handleTokenCollected = async (tokenId: string, type: string, value: number) => {
    try {
      console.log('Token collected:', tokenId, type, value);

      // Remove from tokens list
      setTokens(prev => prev.filter(t => t.id !== tokenId));
      setStats(prev => ({
        ...prev,
        tokensCollected: prev.tokensCollected + 1,
        xp: prev.xp + value
      }));

      // Award XP via backend
      const userId = await AsyncStorage.getItem('@user_id');
      if (userId) {
        await apiService.post('/xp/award', {
          userId,
          xpAmount: value,
          action: 'discovery_claimed'
        });
      }

      // Show notification
      console.log(`+${value} XP - Discovery collected!`);
    } catch (error) {
      console.error('Error handling token collection:', error);
    }
  };

  const handleMapReady = () => {
    console.log('Map is ready!');
    // Auto-start location tracking when map is ready
    startLocationTracking();
  };

  const handleMapError = (error: string) => {
    console.error('Map error:', error);
    Alert.alert('Map Error', error);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Stats */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.xp}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.cellsExplored}</Text>
            <Text style={styles.statLabel}>Areas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.tokensCollected}</Text>
            <Text style={styles.statLabel}>Tokens</Text>
          </View>
        </View>

        <View style={styles.statusIndicator}>
          {isTracking && (
            <View style={styles.trackingDot} />
          )}
        </View>
      </View>

      {/* Map */}
      <MapboxGamingMap
        ref={mapRef}
        onMapReady={handleMapReady}
        onAreaExplored={handleAreaExplored}
        onTokenCollected={handleTokenCollected}
        onError={handleMapError}
        tokens={tokens}
        exploredCells={exploredCells}
      />

      {/* Control Buttons */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, isTracking && styles.controlButtonActive]}
          onPress={isTracking ? stopLocationTracking : startLocationTracking}
        >
          <Text style={styles.controlButtonText}>
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 2,
    borderBottomColor: '#667eea',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 24,
    color: '#ffffff',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginLeft: 8,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  statValue: {
    fontFamily: 'Bakbak-One',
    fontSize: 18,
    color: '#FFD700',
  },
  statLabel: {
    fontFamily: 'Bakbak-One',
    fontSize: 10,
    color: '#ffffff',
    opacity: 0.7,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00ff00',
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  controls: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(102, 126, 234, 0.9)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  controlButtonActive: {
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    borderColor: '#ff3b30',
    shadowColor: '#ff3b30',
  },
  controlButtonText: {
    fontFamily: 'Bakbak-One',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
});
