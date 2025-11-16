import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SensorService } from '../services/sensorService';
import { LocationService } from '../services/locationService';
import { DetectionService } from '../services/detectionService';
import { APIService } from '../services/apiService';
import type { AccelerometerMeasurement, GyroscopeMeasurement } from 'expo-sensors';
import Card from '../components/Card';
import Button from '../components/Button';

interface TestModeScreenProps {
  onBack: () => void;
}

export default function TestModeScreen({ onBack }: TestModeScreenProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [testMode, setTestMode] = useState(true); // Test mode enabled by default

  // Sensor data
  const [accelData, setAccelData] = useState<AccelerometerMeasurement>({ x: 0, y: 0, z: 0, timestamp: 0 });
  const [gyroData, setGyroData] = useState<GyroscopeMeasurement>({ x: 0, y: 0, z: 0, timestamp: 0 });
  const [speed, setSpeed] = useState(0);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  // Detection stats
  const [potholesDetected, setPotholesDetected] = useState(0);
  const [lastDetection, setLastDetection] = useState<string>('None');
  const [magnitude, setMagnitude] = useState(0);
  const [isValidSpeed, setIsValidSpeed] = useState(false);
  const [isDeviceStable, setIsDeviceStable] = useState(false);

  // Services
  const sensorServiceRef = useRef(new SensorService());
  const locationServiceRef = useRef(new LocationService());
  const detectionServiceRef = useRef(new DetectionService());

  useEffect(() => {
    // Enable test mode by default
    detectionServiceRef.current.enableTestMode(true);

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
            x: accelData.x,
            y: accelData.y,
            z: accelData.z,
          },
          gyroscopeData: {
            alpha: lastGyroData.z,
            beta: lastGyroData.x,
            gamma: lastGyroData.y,
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
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    });

    // Start sensors
    let lastGyroData: GyroscopeMeasurement = { x: 0, y: 0, z: 0, timestamp: 0 };

    await sensorService.startMonitoring({
      onAccelerometer: (data) => {
        setAccelData(data);

        const mag = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
        setMagnitude(mag);

        const location = locationService.getCurrentLocation();
        const currentSpeed = locationService.getCurrentSpeed();

        const speedValid = currentSpeed >= 15 && currentSpeed <= 90;
        setIsValidSpeed(speedValid || testMode);

        if (location) {
          const effectiveSpeed = testMode ? 30 : currentSpeed;

          detectionService.processAccelerometerData(
            data,
            lastGyroData,
            {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            },
            effectiveSpeed
          );
        }
      },
      onGyroscope: (data) => {
        setGyroData(data);
        lastGyroData = data;

        const gyroMag = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
        setIsDeviceStable(gyroMag < 1.0);
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

  const toggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  const resetStats = () => {
    setPotholesDetected(0);
    setLastDetection('None');
    detectionServiceRef.current.reset();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Button
            title="← Back"
            variant="outline"
            onPress={onBack}
            style={styles.backButton}
          />
          <Text style={styles.title}>Test Mode</Text>
          <Text style={styles.subtitle}>Sensor debugging & testing</Text>
        </View>

        {/* Control Buttons */}
        <View style={styles.buttonRow}>
          <Button
            title={isMonitoring ? 'Stop' : 'Start'}
            icon={isMonitoring ? '⏸️' : '▶️'}
            variant={isMonitoring ? 'secondary' : 'primary'}
            onPress={toggleMonitoring}
            style={{ flex: 1 }}
          />
          <Button
            title="Reset"
            icon="🔄"
            variant="outline"
            onPress={resetStats}
            style={{ flex: 1 }}
          />
        </View>

        {/* Status Card */}
        <Card style={[styles.statusCard, isMonitoring && styles.statusCardActive]}>
          <Text style={styles.statusTitle}>
            {isMonitoring ? '✅ Monitoring Active' : '⏸️ Monitoring Paused'}
          </Text>
        </Card>

        {/* Test Mode Info */}
        <Card style={styles.testModeCard}>
          <Text style={styles.cardTitle}>🧪 Test Mode Active</Text>
          <Text style={styles.testModeText}>
            • Speed check disabled{'\n'}
            • Stability check disabled{'\n'}
            • Threshold: 1.2g / 1.3g / 2.0g{'\n'}
            • Cooldown: 5 seconds
          </Text>
          <Text style={styles.testModeHint}>
            💡 Shake device HARD to simulate pothole
          </Text>
        </Card>

        {/* Detection Stats */}
        <Card>
          <Text style={styles.cardTitle}>🕳️ Detection Statistics</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Potholes Detected:</Text>
            <Text style={styles.statValue}>{potholesDetected}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Last Detection:</Text>
            <Text style={styles.statValue}>{lastDetection}</Text>
          </View>
        </Card>

        {/* GPS Data */}
        <Card>
          <Text style={styles.cardTitle}>📍 GPS & Location</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Speed:</Text>
            <Text style={styles.statValue}>{speed.toFixed(2)} km/h</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Latitude:</Text>
            <Text style={styles.statValue}>{latitude.toFixed(6)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Longitude:</Text>
            <Text style={styles.statValue}>{longitude.toFixed(6)}</Text>
          </View>
        </Card>

        {/* Accelerometer */}
        <Card>
          <Text style={styles.cardTitle}>📊 Accelerometer (g)</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>X-axis:</Text>
            <Text style={styles.statValue}>{accelData.x.toFixed(4)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Y-axis:</Text>
            <Text style={styles.statValue}>{accelData.y.toFixed(4)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Z-axis:</Text>
            <Text style={styles.statValue}>{accelData.z.toFixed(4)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Magnitude:</Text>
            <Text
              style={[
                styles.statValue,
                magnitude > 2.0
                  ? styles.valueGreen
                  : magnitude > 1.3
                  ? styles.valueYellow
                  : {},
              ]}
            >
              {magnitude.toFixed(4)}
              {magnitude > 2.0 ? ' 🎯' : magnitude > 1.3 ? ' ⚡' : ''}
            </Text>
          </View>
        </Card>

        {/* Gyroscope */}
        <Card>
          <Text style={styles.cardTitle}>🔄 Gyroscope (rad/s)</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>X-rotation:</Text>
            <Text style={styles.statValue}>{gyroData.x.toFixed(4)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Y-rotation:</Text>
            <Text style={styles.statValue}>{gyroData.y.toFixed(4)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Z-rotation:</Text>
            <Text style={styles.statValue}>{gyroData.z.toFixed(4)}</Text>
          </View>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
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
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  statusCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statusCardActive: {
    backgroundColor: '#e8f5e9',
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  testModeCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#fff9e6',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  testModeText: {
    fontSize: 15,
    color: '#000000',
    lineHeight: 22,
    marginBottom: 12,
  },
  testModeHint: {
    fontSize: 13,
    color: '#8e8e93',
    fontStyle: 'italic',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f7',
  },
  statLabel: {
    fontSize: 15,
    color: '#8e8e93',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'monospace',
  },
  valueGreen: {
    color: '#34c759',
    fontWeight: '700',
  },
  valueYellow: {
    color: '#ff9500',
    fontWeight: '700',
  },
});
