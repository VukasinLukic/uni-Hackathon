import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Card from '../components/Card';
import ActionButton from '../components/ActionButton';
import { SensorService } from '../services/sensorService';
import { LocationService } from '../services/locationService';
import { DetectionService } from '../services/detectionService';
import { APIService } from '../services/apiService';
import type { AccelerometerMeasurement, GyroscopeMeasurement } from 'expo-sensors';

interface DrivingModeScreenProps {
  onBack: () => void;
  onTestMode: () => void;
  onTestBackend: () => void;
  onViewGraphs: () => void;
  onLegacyDemo?: () => void;
}

export default function DrivingModeScreen({
  onBack,
  onTestMode,
  onTestBackend,
  onViewGraphs,
  onLegacyDemo,
}: DrivingModeScreenProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [potholesDetected, setPotholesDetected] = useState(0);
  const [lastDetection, setLastDetection] = useState<string>('None');

  // Services
  const sensorServiceRef = useRef(new SensorService());
  const locationServiceRef = useRef(new LocationService());
  const detectionServiceRef = useRef(new DetectionService());

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, []);

  const startMonitoring = async () => {
    const sensorService = sensorServiceRef.current;
    const locationService = locationServiceRef.current;
    const detectionService = detectionServiceRef.current;

    // Setup detection callback
    detectionService.setCallback(async (event) => {
      setPotholesDetected((prev) => prev + 1);
      setLastDetection(new Date().toLocaleTimeString());
      console.log('🕳️ POTHOLE DETECTED!', event);

      // Send event to backend
      try {
        console.log('📤 Sending pothole event to backend...');
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
          '🕳️ Pothole Detected!',
          `Saved to database!\nSeverity: ${response.severity || 'N/A'}`,
          [{ text: 'OK' }]
        );
      } catch (error: any) {
        console.error('❌ Failed to send event to backend:', error);
      }
    });

    // Start location tracking
    await locationService.startTracking((location) => {
      setSpeed(locationService.getCurrentSpeed());
    });

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

  const stopMonitoring = () => {
    sensorServiceRef.current.stopMonitoring();
    locationServiceRef.current.stopTracking();
    detectionServiceRef.current.reset();
    setIsMonitoring(false);
  };

  const handleBack = () => {
    stopMonitoring();
    onBack();
  };

  const isValidSpeed = speed >= 15 && speed <= 90;

  // Auto-start monitoring when screen loads
  useEffect(() => {
    if (!isMonitoring) {
      startMonitoring();
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Button
            title="← Back"
            variant="outline"
            onPress={handleBack}
            style={styles.backButton}
          />
          <Text style={styles.title}>Driving Mode</Text>
          <Text style={styles.subtitle}>Automatic pothole detection</Text>
        </View>

        {/* Status Card */}
        <Card style={[styles.statusCard, isMonitoring && styles.statusCardActive]}>
          <View style={styles.statusIconContainer}>
            <Text style={styles.statusIcon}>{isMonitoring ? '🚗' : '⏸️'}</Text>
          </View>
          <Text style={styles.statusTitle}>
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
          </Text>
          <Text style={styles.statusSubtitle}>
            {isMonitoring
              ? 'Sensors are actively detecting potholes'
              : 'Press Start to begin monitoring'}
          </Text>
        </Card>

        {/* Speed Warning */}
        {isMonitoring && !isValidSpeed && (
          <Card style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningTitle}>Speed Check</Text>
            <Text style={styles.warningText}>
              Detection requires speed between 15-90 km/h
            </Text>
            <Text style={styles.warningSpeed}>{speed.toFixed(1)} km/h</Text>
          </Card>
        )}

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Speed</Text>
            <Text style={styles.statValue}>{speed.toFixed(0)}</Text>
            <Text style={styles.statUnit}>km/h</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Detected</Text>
            <Text style={styles.statValue}>{potholesDetected}</Text>
            <Text style={styles.statUnit}>potholes</Text>
          </Card>
        </View>

        {/* Last Detection */}
        {lastDetection !== 'None' && (
          <Card>
            <Text style={styles.detectionLabel}>Last Detection</Text>
            <Text style={styles.detectionTime}>{lastDetection}</Text>
          </Card>
        )}

      </View>

      {/* Floating Action Button - Always visible */}
      <ActionButton
        onTestMode={onTestMode}
        onTestBackend={onTestBackend}
        onViewGraphs={onViewGraphs}
        onLegacyDemo={onLegacyDemo}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
  },
  backButton: {
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
