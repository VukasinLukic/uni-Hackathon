import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import Button from '../components/Button';
import Card from '../components/Card';
import ActionButton from '../components/ActionButton';
import MapboxGamingMap, { Token, MapboxGamingMapRef } from '../components/MapboxGamingMap';
import { SensorService } from '../services/sensorService';
import { LocationService } from '../services/locationService';
import { DetectionService } from '../services/detectionService';
import { APIService } from '../services/apiService';
import { apiService } from '../services/apiService';
import socketService from '../services/socketService';
import backgroundLocationService from '../services/backgroundLocationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AccelerometerMeasurement, GyroscopeMeasurement } from 'expo-sensors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DrivingModeScreenProps {
  onBack?: () => void;
  onTestMode?: () => void;
  onTestBackend?: () => void;
  onViewGraphs?: () => void;
  onLegacyDemo?: () => void;
}

export default function DrivingModeScreen({
  onBack,
  onTestMode,
  onTestBackend,
  onViewGraphs,
  onLegacyDemo,
}: DrivingModeScreenProps) {
  const navigation = useNavigation<NavigationProp>();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [discoveriesDetected, setDiscoveriesDetected] = useState(0);
  const [lastDetection, setLastDetection] = useState<string>('None');
  const [showTestingOverlay, setShowTestingOverlay] = useState(false);
  const [exploredCells, setExploredCells] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stats, setStats] = useState({ xp: 0, cellsExplored: 0, distance: 0 });

  // Services
  const sensorServiceRef = useRef(new SensorService());
  const locationServiceRef = useRef(new LocationService());
  const detectionServiceRef = useRef(new DetectionService());
  const mapRef = useRef<any>(null);

  // Navigation callbacks - use provided callbacks or navigate directly
  const handleTestMode = onTestMode || (() => navigation.navigate('TestMode'));
  const handleTestBackend = onTestBackend || (() => navigation.navigate('TestBackend'));
  const handleViewGraphs = onViewGraphs || (() => navigation.navigate('ViewGraphs'));
  const handleLegacyDemo = onLegacyDemo || (() => navigation.navigate('LegacyHome'));

  useEffect(() => {
    initializeSession();
    return () => {
      stopMonitoring();
      endDriveSession();
    };
  }, []);

  const initializeSession = async () => {
    const userId = await AsyncStorage.getItem('@user_id');
    if (userId) {
      socketService.connect(userId);
      await loadUserData();
      await startDriveSession();
    }
  };

  const loadUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('@user_id');
      if (!userId) return;

      const response = await apiService.get(`/exploration/cells?userId=${userId}`);
      if (response.data.success && response.data.data) {
        const cellIds = response.data.data.map((cell: any) => cell.cellId);
        setExploredCells(cellIds);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const startDriveSession = async () => {
    try {
      const userId = await AsyncStorage.getItem('@user_id');
      if (!userId) return;

      const response = await apiService.post('/drives/start', { userId });
      if (response.data.success && response.data.data) {
        const newSessionId = response.data.data._id;
        setSessionId(newSessionId);
        await AsyncStorage.setItem('@active_session_id', newSessionId);
        console.log('Drive session started:', newSessionId);
      }
    } catch (error) {
      console.error('Error starting drive session:', error);
    }
  };

  const endDriveSession = async () => {
    try {
      if (!sessionId) return;

      const response = await apiService.post(`/drives/${sessionId}/end`, {
        distance: stats.distance,
        cellsExplored: stats.cellsExplored,
        potholesDetected: discoveriesDetected
      });

      await AsyncStorage.removeItem('@active_session_id');
      console.log('Drive session ended:', response.data);
    } catch (error) {
      console.error('Error ending drive session:', error);
    }
  };

  const startMonitoring = async () => {
    const sensorService = sensorServiceRef.current;
    const locationService = locationServiceRef.current;
    const detectionService = detectionServiceRef.current;

    // Setup detection callback
    detectionService.setCallback(async (event) => {
      setDiscoveriesDetected((prev) => prev + 1);
      setLastDetection(new Date().toLocaleTimeString());
      console.log('🌟 DISCOVERY MOMENT DETECTED!', event);

      // Send event to backend
      try {
        console.log('📤 Sending discovery event to backend...');
        const response = await APIService.sendPotholeEvent({
          location: {
            type: 'Point',
            coordinates: [event.location.lng, event.location.lat],
          },
          accelerationData: {
            magnitude: event.magnitude,
            x: 0,
            y: 0,
            z: 0,
          },
          gyroscopeData: {
            alpha: 0,
            beta: 0,
            gamma: 0,
          },
          deviceOrientation: {
            pitch: 0,
            roll: 0,
            yaw: 0,
          },
          speed: event.speed,
          timestamp: event.timestamp,
        });

        console.log('✅ Event sent successfully!', response);

        // Show success notification
        Alert.alert(
          '🌟 Discovery Moment!',
          `Interesting area detected!\nSeverity: ${response.severity || 'N/A'}`,
          [{ text: 'OK' }]
        );
      } catch (error: any) {
        console.error('❌ Failed to send event to backend:', error);
      }
    });

    // Start location tracking
    await locationService.startTracking((location) => {
      setSpeed(locationService.getCurrentSpeed());

      // Update map with current location
      if (mapRef.current && location) {
        mapRef.current.updateLocation(
          location.coords.latitude,
          location.coords.longitude
        );
      }
    });

    // Start background location tracking
    await backgroundLocationService.startTracking();

    // Start sensors
    let lastGyroData: GyroscopeMeasurement = { x: 0, y: 0, z: 0, timestamp: 0 };

    await sensorService.startMonitoring({
      onAccelerometer: (data: AccelerometerMeasurement) => {
        const location = locationService.getCurrentLocation();
        const currentSpeed = locationService.getCurrentSpeed();

        if (location) {
          detectionService.processAccelerometerData(
            data,
            lastGyroData,
            {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            },
            currentSpeed
          );
        }
      },
      onGyroscope: (data: GyroscopeMeasurement) => {
        lastGyroData = data;
      },
    });

    setIsMonitoring(true);
  };

  const stopMonitoring = async () => {
    sensorServiceRef.current.stopMonitoring();
    locationServiceRef.current.stopTracking();
    detectionServiceRef.current.reset();
    await backgroundLocationService.stopTracking();
    setIsMonitoring(false);
  };

  const handleAreaExplored = async (cellId: string, lat: number, lng: number) => {
    try {
      setExploredCells(prev => [...prev, cellId]);
      setStats(prev => ({ ...prev, cellsExplored: prev.cellsExplored + 1, xp: prev.xp + 50 }));

      // Emit to socket
      socketService.emitCellExplored(cellId, lat, lng);

      console.log('New cell explored:', cellId);
    } catch (error) {
      console.error('Error handling area explored:', error);
    }
  };

  const handleBack = () => {
    stopMonitoring();
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const isValidSpeed = speed >= 15 && speed <= 90;

  // Auto-start monitoring when screen loads
  useEffect(() => {
    if (!isMonitoring) {
      startMonitoring();
    }
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Full-screen Gaming Map */}
      <MapboxGamingMap
        ref={mapRef}
        onMapReady={() => console.log('Map ready in driving mode')}
        onAreaExplored={handleAreaExplored}
        onTokenCollected={() => {}}
        onError={(error) => console.error('Map error:', error)}
        exploredCells={exploredCells}
        tokens={[]}
      />

      {/* Top Stats Overlay */}
      <View style={styles.topOverlay}>
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.xp}</Text>
                <Text style={styles.statLabel}>XP</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.cellsExplored}</Text>
                <Text style={styles.statLabel}>Areas</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{speed.toFixed(0)}</Text>
                <Text style={styles.statLabel}>km/h</Text>
              </View>
            </View>

            {/* Monitoring Status */}
            <View style={styles.statusIndicator}>
              {isMonitoring && <View style={styles.trackingDot} />}
              <Text style={styles.statusText}>
                {isMonitoring ? 'Exploring' : 'Paused'}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Testing Overlay (for debugging) */}
      {showTestingOverlay && discoveriesDetected > 0 && (
        <View style={styles.testingOverlay}>
          <TouchableOpacity
            style={styles.closeTestOverlay}
            onPress={() => setShowTestingOverlay(false)}
          >
            <Text style={styles.closeTestOverlayText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.testingTitle}>🌟 TESTING MODE</Text>
          <Text style={styles.testingText}>Discoveries: {discoveriesDetected}</Text>
          <Text style={styles.testingText}>Last: {lastDetection}</Text>
          {!isValidSpeed && (
            <Text style={styles.testingWarning}>
              Speed: {speed.toFixed(1)} km/h (Need 15-90)
            </Text>
          )}
        </View>
      )}

      {/* Toggle Testing Overlay Button */}
      <TouchableOpacity
        style={styles.testingToggle}
        onPress={() => setShowTestingOverlay(!showTestingOverlay)}
      >
        <Text style={styles.testingToggleText}>
          {showTestingOverlay ? '🔍' : '🐛'}
        </Text>
      </TouchableOpacity>

      {/* Floating Action Button - always show with navigation callbacks */}
      <ActionButton
        onTestMode={handleTestMode}
        onTestBackend={handleTestBackend}
        onViewGraphs={handleViewGraphs}
        onLegacyDemo={handleLegacyDemo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#ffffff',
    fontFamily: 'Bakbak-One',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    marginLeft: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
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
    fontSize: 9,
    color: '#ffffff',
    opacity: 0.7,
    marginTop: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00ff00',
    marginRight: 6,
  },
  statusText: {
    fontFamily: 'Bakbak-One',
    fontSize: 10,
    color: '#ffffff',
  },
  testingOverlay: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.95)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#ff3b30',
  },
  closeTestOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeTestOverlayText: {
    fontSize: 18,
    color: '#ffffff',
  },
  testingTitle: {
    fontFamily: 'Bakbak-One',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
  },
  testingText: {
    fontFamily: 'Bakbak-One',
    fontSize: 12,
    color: '#ffffff',
    marginBottom: 4,
  },
  testingWarning: {
    fontFamily: 'Bakbak-One',
    fontSize: 11,
    color: '#FFD700',
    marginTop: 4,
  },
  testingToggle: {
    position: 'absolute',
    top: 100,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff3b30',
  },
  testingToggleText: {
    fontSize: 20,
  },
  oldBackButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 17,
    color: '#8e8e93',
    letterSpacing: -0.4,
  },
  statusCard: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
  },
  statusCardActive: {
    backgroundColor: '#e8f5e9',
  },
  statusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    fontSize: 40,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  statusSubtitle: {
    fontSize: 15,
    color: '#8e8e93',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  warningCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 24,
    backgroundColor: '#fff3cd',
  },
  warningIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 15,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 12,
  },
  warningSpeed: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ff9500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 24,
  },
  statLabel: {
    fontSize: 13,
    color: '#8e8e93',
    marginBottom: 8,
    letterSpacing: -0.1,
  },
  statValue: {
    fontSize: 40,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -1.5,
    marginBottom: 4,
  },
  statUnit: {
    fontSize: 13,
    color: '#8e8e93',
    letterSpacing: -0.1,
  },
  detectionLabel: {
    fontSize: 13,
    color: '#8e8e93',
    marginBottom: 8,
  },
  detectionTime: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  controlContainer: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
  },
  controlButton: {
    paddingVertical: 20,
  },
});
