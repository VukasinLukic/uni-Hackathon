import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SensorService } from '../services/sensorService';
import { LocationService } from '../services/locationService';
import { DetectionService } from '../services/detectionService';
import { APIService } from '../services/apiService';
import type { AccelerometerMeasurement, GyroscopeMeasurement } from 'expo-sensors';

interface SensorDebugScreenProps {
  onBack: () => void;
}

export default function SensorDebugScreen({ onBack }: SensorDebugScreenProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [testMode, setTestMode] = useState(false); // Test mode bypasses speed check

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
            type: 'Point', // GeoJSON type - REQUIRED!
            coordinates: [event.location.lng, event.location.lat], // [longitude, latitude]
          },
          accelerationData: {
            magnitude: event.magnitude,
            x: accelData.x,
            y: accelData.y,
            z: accelData.z,
          },
          gyroscopeData: {
            alpha: lastGyroData.z, // Z-axis rotation
            beta: lastGyroData.x, // X-axis rotation
            gamma: lastGyroData.y, // Y-axis rotation
          },
          deviceOrientation: {
            pitch: 0, // TODO: Calculate from gyroscope
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
        // Don't alert the user on error - just log it
        // Backend might not be running during testing
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

        // Calculate magnitude for display
        const mag = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
        setMagnitude(mag);

        const location = locationService.getCurrentLocation();
        const currentSpeed = locationService.getCurrentSpeed();

        // Check if speed is valid OR test mode is enabled
        const speedValid = currentSpeed >= 15 && currentSpeed <= 90;
        setIsValidSpeed(speedValid || testMode);

        if (location) {
          // Override speed for test mode (simulate 30 km/h)
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

        // Simple device stability check for display
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

  const testBackendConnection = async () => {
    try {
      console.log('🧪 Testing backend connection...');
      const isReachable = await APIService.healthCheck();
      if (isReachable) {
        Alert.alert('✅ Backend Connected!', 'Backend is reachable at http://10.0.10.157:5001');
      } else {
        Alert.alert(
          '❌ Backend Not Reachable',
          'Cannot connect to backend.\n\nCheck:\n1. Backend running? (npm run dev)\n2. IP correct? (10.0.10.157)\n3. Same WiFi network?\n4. Port is 5001?'
        );
      }
    } catch (error: any) {
      Alert.alert(
        '❌ Connection Error',
        `Failed to reach backend:\n${error.message}\n\nVerify:\n• Backend running on port 5001\n• Same WiFi network\n• Firewall not blocking`
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Sensor Debug Console</Text>
        <Text style={styles.subtitle}>Real-time sensor monitoring</Text>
      </View>

      {/* Control Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={toggleMonitoring}
          style={[styles.button, isMonitoring ? styles.buttonStop : styles.buttonStart]}
        >
          <Text style={styles.buttonText}>
            {isMonitoring ? '⏸️ Stop Monitoring' : '▶️ Start Monitoring'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={resetStats} style={styles.buttonReset}>
          <Text style={styles.buttonText}>🔄 Reset Stats</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={testBackendConnection} style={styles.buttonTest}>
          <Text style={styles.buttonText}>🔌 Test Backend</Text>
        </TouchableOpacity>
      </View>

      {/* Status Indicator */}
      <View style={[styles.card, isMonitoring ? styles.cardActive : styles.cardInactive]}>
        <Text style={styles.cardTitle}>
          {isMonitoring ? '✅ Monitoring Active' : '⏸️ Monitoring Paused'}
        </Text>
      </View>

      {/* Driving Warning with Test Mode Button */}
      {isMonitoring && !isValidSpeed && (
        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningTitle}>START DRIVING!</Text>
          <Text style={styles.warningText}>
            Detection only works while driving{'\n'}
            Speed must be between 15-90 km/h{'\n'}
            Current: {speed.toFixed(1)} km/h
          </Text>

          <TouchableOpacity
            onPress={() => {
              setTestMode(true);
              detectionServiceRef.current.enableTestMode(true);
              console.log('✅ Test Mode ENABLED - Easy detection active!');
            }}
            style={styles.testModeButton}
          >
            <Text style={styles.testModeButtonText}>
              🚗 I'm Driving (Test Mode)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Test Mode Indicator */}
      {testMode && (
        <View style={styles.testModeCard}>
          <Text style={styles.testModeTitle}>🧪 TEST MODE ACTIVE</Text>
          <Text style={styles.testModeText}>
            ✅ Speed check DISABLED{'\n'}
            ✅ Stability check DISABLED{'\n'}
            ⚠️ Need: Filtered {'>'} 1.2g AND Magnitude {'>'} 1.3g{'\n'}
            OR Magnitude {'>'} 2.0g{'\n'}
            Shake VERY HARD! Cooldown: 5 seconds
          </Text>
          <TouchableOpacity
            onPress={() => {
              setTestMode(false);
              detectionServiceRef.current.enableTestMode(false);
              console.log('❌ Test Mode DISABLED');
            }}
            style={styles.testModeDisableButton}
          >
            <Text style={styles.testModeDisableText}>Disable Test Mode</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Detection Stats */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🕳️ Detection Statistics</Text>
        <View style={styles.statsRow}>
          <Text style={styles.label}>Potholes Detected:</Text>
          <Text style={styles.value}>{potholesDetected}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.label}>Last Detection:</Text>
          <Text style={styles.value}>{lastDetection}</Text>
        </View>
      </View>

      {/* Context Checks */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎯 Context Validation</Text>
        <View style={styles.statsRow}>
          <Text style={styles.label}>Speed Valid (15-90 km/h):</Text>
          <Text style={[styles.value, isValidSpeed ? styles.valueGreen : styles.valueRed]}>
            {isValidSpeed ? '✅ YES' : '❌ NO'}
          </Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.label}>Device Stable:</Text>
          <Text style={[styles.value, isDeviceStable ? styles.valueGreen : styles.valueRed]}>
            {isDeviceStable ? '✅ YES' : '❌ NO'}
          </Text>
        </View>
      </View>

      {/* GPS Data */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📍 GPS & Location</Text>
        <View style={styles.statsRow}>
          <Text style={styles.label}>Speed:</Text>
          <Text style={styles.value}>{speed.toFixed(2)} km/h</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.label}>Latitude:</Text>
          <Text style={styles.value}>{latitude.toFixed(6)}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.label}>Longitude:</Text>
          <Text style={styles.value}>{longitude.toFixed(6)}</Text>
        </View>
      </View>

      {/* Accelerometer */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={styles.cardTitle}>📊 Accelerometer (g)</Text>
          {magnitude > 0.1 && (
            <View style={{ backgroundColor: '#22c55e', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>LIVE</Text>
            </View>
          )}
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.label}>X-axis:</Text>
          <Text style={styles.value}>{accelData.x.toFixed(4)}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.label}>Y-axis:</Text>
          <Text style={styles.value}>{accelData.y.toFixed(4)}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.label}>Z-axis:</Text>
          <Text style={styles.value}>{accelData.z.toFixed(4)}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.label}>Magnitude:</Text>
          <Text style={[
            styles.value,
            styles.valueBold,
            magnitude > 2.0 ? { color: '#10b981', fontWeight: '900' } : magnitude > 1.3 ? { color: '#f59e0b' } : {}
          ]}>
            {magnitude.toFixed(4)} {magnitude > 2.0 ? '🎯 PERFECT!' : magnitude > 1.3 ? '⚡ GOOD' : ''}
          </Text>
        </View>
      </View>

      {/* Gyroscope */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔄 Gyroscope (rad/s)</Text>
        <View style={styles.statsRow}>
          <Text style={styles.label}>X-rotation:</Text>
          <Text style={styles.value}>{gyroData.x.toFixed(4)}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.label}>Y-rotation:</Text>
          <Text style={styles.value}>{gyroData.y.toFixed(4)}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.label}>Z-rotation:</Text>
          <Text style={styles.value}>{gyroData.z.toFixed(4)}</Text>
        </View>
      </View>

      {/* Algorithm Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚙️ Detection Algorithm</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mode:</Text>
          <Text style={[styles.infoValue, { color: testMode ? '#22c55e' : '#94a3b8' }]}>
            {testMode ? '🧪 TEST MODE' : '🚗 REAL MODE'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Threshold:</Text>
          <Text style={styles.infoValue}>{testMode ? '1.2g/1.3g/2.0g' : '1.5g'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Pattern Check:</Text>
          <Text style={styles.infoValue}>{testMode ? 'DISABLED' : 'DOWN-UP only'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cooldown:</Text>
          <Text style={styles.infoValue}>{testMode ? '5 seconds' : '2 seconds'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Update Rate:</Text>
          <Text style={styles.infoValue}>50 Hz (20ms)</Text>
        </View>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1e293b',
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonStart: {
    backgroundColor: '#22c55e',
  },
  buttonStop: {
    backgroundColor: '#ef4444',
  },
  buttonReset: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#6366f1',
  },
  buttonTest: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardActive: {
    backgroundColor: '#064e3b',
    borderColor: '#22c55e',
  },
  cardInactive: {
    backgroundColor: '#1e293b',
    borderColor: '#475569',
  },
  warningCard: {
    margin: 16,
    marginTop: 8,
    padding: 20,
    backgroundColor: '#7c2d12',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f97316',
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#fed7aa',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  testModeButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  testModeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testModeCard: {
    margin: 16,
    marginTop: 8,
    padding: 20,
    backgroundColor: '#065f46',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#22c55e',
    alignItems: 'center',
  },
  testModeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  testModeText: {
    fontSize: 13,
    color: '#d1fae5',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  testModeDisableButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  testModeDisableText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  label: {
    fontSize: 14,
    color: '#94a3b8',
  },
  value: {
    fontSize: 14,
    color: '#e2e8f0',
    fontWeight: '600',
  },
  valueBold: {
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  valueGreen: {
    color: '#22c55e',
  },
  valueRed: {
    color: '#ef4444',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 13,
    color: '#cbd5e1',
    fontFamily: 'monospace',
  },
  spacer: {
    height: 40,
  },
});
