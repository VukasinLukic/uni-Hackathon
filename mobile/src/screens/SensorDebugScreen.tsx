import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SensorService } from '../services/sensorService';
import { LocationService } from '../services/locationService';
import { DetectionService } from '../services/detectionService';
import type { AccelerometerMeasurement, GyroscopeMeasurement } from 'expo-sensors';

export default function SensorDebugScreen({ navigation }: any) {
  const [isMonitoring, setIsMonitoring] = useState(false);

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
    detectionService.setCallback((event) => {
      setPotholesDetected((prev) => prev + 1);
      setLastDetection(new Date().toLocaleTimeString());
      console.log('🕳️ POTHOLE DETECTED!', event);
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

        // Check if speed is valid
        setIsValidSpeed(currentSpeed >= 15 && currentSpeed <= 90);

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
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
      </View>

      {/* Status Indicator */}
      <View style={[styles.card, isMonitoring ? styles.cardActive : styles.cardInactive]}>
        <Text style={styles.cardTitle}>
          {isMonitoring ? '✅ Monitoring Active' : '⏸️ Monitoring Paused'}
        </Text>
      </View>

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
        <Text style={styles.cardTitle}>📊 Accelerometer (g)</Text>
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
          <Text style={[styles.value, styles.valueBold]}>{magnitude.toFixed(4)}</Text>
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
          <Text style={styles.infoLabel}>Threshold:</Text>
          <Text style={styles.infoValue}>1.5g spike</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cooldown:</Text>
          <Text style={styles.infoValue}>2 seconds</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Update Rate:</Text>
          <Text style={styles.infoValue}>50 Hz (20ms)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Filter Type:</Text>
          <Text style={styles.infoValue}>High-pass (α=0.8)</Text>
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
