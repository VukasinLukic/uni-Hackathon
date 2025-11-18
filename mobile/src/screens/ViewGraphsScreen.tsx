import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Line, Circle, Path, G, Text as SvgText } from 'react-native-svg';
import Button from '../components/Button';
import Card from '../components/Card';
import { SensorService } from '../services/sensorService';
import type { AccelerometerMeasurement } from 'expo-sensors';

interface ViewGraphsScreenProps {
  onBack: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRAPH_WIDTH = SCREEN_WIDTH - 48; // 24px padding on each side
const GRAPH_HEIGHT = 200;
const MAX_DATA_POINTS = 100;

export default function ViewGraphsScreen({ onBack }: ViewGraphsScreenProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [dataPoints, setDataPoints] = useState<number[]>([]);
  const [maxValue, setMaxValue] = useState(2.0);
  const [currentMagnitude, setCurrentMagnitude] = useState(0);
  const [peakDetected, setPeakDetected] = useState(false);
  const [peakCount, setPeakCount] = useState(0);
  const [minMagnitude, setMinMagnitude] = useState(0);
  const [maxMagnitude, setMaxMagnitude] = useState(0);
  const [accelX, setAccelX] = useState(0);
  const [accelY, setAccelY] = useState(0);
  const [accelZ, setAccelZ] = useState(0);
  const [gyroX, setGyroX] = useState(0);
  const [gyroY, setGyroY] = useState(0);
  const [gyroZ, setGyroZ] = useState(0);

  const sensorServiceRef = useRef(new SensorService());

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, []);

  const startMonitoring = async () => {
    const sensorService = sensorServiceRef.current;

    await sensorService.startMonitoring({
      onAccelerometer: (data: AccelerometerMeasurement) => {
        const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
        setCurrentMagnitude(magnitude);

        // Update individual accelerometer values
        setAccelX(data.x);
        setAccelY(data.y);
        setAccelZ(data.z);

        // Detect peaks (potential potholes)
        if (magnitude > 1.5) {
          setPeakDetected(true);
          setPeakCount(prev => prev + 1);
          setTimeout(() => setPeakDetected(false), 500);
        }

        // Update min/max
        setMinMagnitude(prev => prev === 0 ? magnitude : Math.min(prev, magnitude));
        setMaxMagnitude(prev => Math.max(prev, magnitude));

        setDataPoints((prev) => {
          const newData = [...prev, magnitude];
          if (newData.length > MAX_DATA_POINTS) {
            newData.shift();
          }

          // Update max value for scaling
          const max = Math.max(...newData, 2.0);
          setMaxValue(max);

          return newData;
        });
      },
      onGyroscope: (data: any) => {
        setGyroX(data.x);
        setGyroY(data.y);
        setGyroZ(data.z);
      },
    });

    setIsMonitoring(true);
  };

  const stopMonitoring = () => {
    sensorServiceRef.current.stopMonitoring();
    setIsMonitoring(false);
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  const clearGraph = () => {
    setDataPoints([]);
    setMaxValue(2.0);
    setPeakDetected(false);
    setPeakCount(0);
    setMinMagnitude(0);
    setMaxMagnitude(0);
    setAccelX(0);
    setAccelY(0);
    setAccelZ(0);
    setGyroX(0);
    setGyroY(0);
    setGyroZ(0);
  };

  // Generate SVG path from data points
  const generatePath = () => {
    if (dataPoints.length < 2) return '';

    const points = dataPoints.map((value, index) => {
      const x = (index / MAX_DATA_POINTS) * GRAPH_WIDTH;
      const y = GRAPH_HEIGHT - (value / maxValue) * GRAPH_HEIGHT;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
          <Button
            title="← Back"
            variant="outline"
            onPress={onBack}
            style={styles.backButton}
          />
          <Text style={styles.title}>View Graphs</Text>
          <Text style={styles.subtitle}>Real-time sensor oscillations</Text>
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
            title="Clear"
            icon="🗑️"
            variant="outline"
            onPress={clearGraph}
            style={{ flex: 1 }}
          />
        </View>

        {/* Current Magnitude Display */}
        <Card style={[styles.magnitudeCard, peakDetected && styles.magnitudeCardPeak]}>
          <Text style={styles.magnitudeLabel}>Current Magnitude</Text>
          <Text style={[styles.magnitudeValue, peakDetected && styles.magnitudeValuePeak]}>
            {currentMagnitude.toFixed(3)} g
          </Text>
          {peakDetected && <Text style={styles.peakIndicator}>🎯 PEAK DETECTED!</Text>}
        </Card>

        {/* Graph Card */}
        <Card style={styles.graphCard}>
          <Text style={styles.graphTitle}>Accelerometer Magnitude</Text>

          <View style={styles.graphContainer}>
            <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
              {/* Grid lines */}
              <G>
                {[0, 0.5, 1.0, 1.5, 2.0].map((value) => {
                  const y = GRAPH_HEIGHT - (value / maxValue) * GRAPH_HEIGHT;
                  return (
                    <G key={value}>
                      <Line
                        x1="0"
                        y1={y}
                        x2={GRAPH_WIDTH}
                        y2={y}
                        stroke="#e5e5ea"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                      />
                      <SvgText
                        x="5"
                        y={y - 5}
                        fontSize="10"
                        fill="#8e8e93"
                      >
                        {value.toFixed(1)}g
                      </SvgText>
                    </G>
                  );
                })}
              </G>

              {/* Threshold line (1.5g - pothole detection threshold) */}
              {maxValue >= 1.5 && (
                <Line
                  x1="0"
                  y1={GRAPH_HEIGHT - (1.5 / maxValue) * GRAPH_HEIGHT}
                  x2={GRAPH_WIDTH}
                  y2={GRAPH_HEIGHT - (1.5 / maxValue) * GRAPH_HEIGHT}
                  stroke="#ff3b30"
                  strokeWidth="2"
                  strokeDasharray="6,3"
                />
              )}

              {/* Data path */}
              {dataPoints.length >= 2 && (
                <Path
                  d={generatePath()}
                  stroke="#007AFF"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Current point indicator */}
              {dataPoints.length > 0 && (
                <Circle
                  cx={(dataPoints.length - 1) / MAX_DATA_POINTS * GRAPH_WIDTH}
                  cy={GRAPH_HEIGHT - (dataPoints[dataPoints.length - 1] / maxValue) * GRAPH_HEIGHT}
                  r="5"
                  fill={peakDetected ? '#ff3b30' : '#007AFF'}
                />
              )}
            </Svg>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#007AFF' }]} />
              <Text style={styles.legendText}>Acceleration</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#ff3b30' }]} />
              <Text style={styles.legendText}>Threshold (1.5g)</Text>
            </View>
          </View>
        </Card>

        {/* Statistics Card */}
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Data Points</Text>
              <Text style={styles.statValue}>{dataPoints.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Peaks Detected</Text>
              <Text style={styles.statValue}>{peakCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Min Value</Text>
              <Text style={styles.statValue}>{minMagnitude.toFixed(2)}g</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Max Value</Text>
              <Text style={styles.statValue}>{maxMagnitude.toFixed(2)}g</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Average</Text>
              <Text style={styles.statValue}>
                {dataPoints.length > 0
                  ? (dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length).toFixed(2)
                  : '0.00'}g
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Current</Text>
              <Text style={styles.statValue}>{currentMagnitude.toFixed(2)}g</Text>
            </View>
          </View>
        </Card>

        {/* Accelerometer Values Card */}
        <Card style={styles.sensorCard}>
          <Text style={styles.sensorTitle}>📱 Accelerometer</Text>
          <View style={styles.sensorTable}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>X:</Text>
              <Text style={styles.tableValue}>{accelX.toFixed(3)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Y:</Text>
              <Text style={styles.tableValue}>{accelY.toFixed(3)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Z:</Text>
              <Text style={styles.tableValue}>{accelZ.toFixed(3)}</Text>
            </View>
          </View>
        </Card>

        {/* Gyroscope Values Card */}
        <Card style={styles.sensorCard}>
          <Text style={styles.sensorTitle}>🔄 Gyroscope</Text>
          <View style={styles.sensorTable}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>X:</Text>
              <Text style={styles.tableValue}>{gyroX.toFixed(3)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Y:</Text>
              <Text style={styles.tableValue}>{gyroY.toFixed(3)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Z:</Text>
              <Text style={styles.tableValue}>{gyroZ.toFixed(3)}</Text>
            </View>
          </View>
        </Card>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 How to Use</Text>
          <Text style={styles.infoText}>
            • Press Start to begin monitoring{'\n'}
            • Graph shows real-time acceleration{'\n'}
            • Red line indicates pothole threshold{'\n'}
            • Peaks above red line = potential pothole{'\n'}
            • Shake device to simulate bumps
          </Text>
        </Card>
        </View>
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
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
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
    gap: 12,
    marginBottom: 24,
  },
  magnitudeCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 24,
  },
  magnitudeCardPeak: {
    backgroundColor: '#ffebee',
  },
  magnitudeLabel: {
    fontSize: 15,
    color: '#8e8e93',
    marginBottom: 8,
  },
  magnitudeValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -2,
  },
  magnitudeValuePeak: {
    color: '#ff3b30',
  },
  peakIndicator: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ff3b30',
    marginTop: 8,
  },
  graphCard: {
    marginBottom: 24,
  },
  graphTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  graphContainer: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    fontSize: 13,
    color: '#8e8e93',
  },
  statsCard: {
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#f0f0f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: '#8e8e93',
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  sensorCard: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
  },
  sensorTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  sensorTable: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tableLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    width: 40,
  },
  tableValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'monospace',
    textAlign: 'right',
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#e8f5e9',
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#000000',
    lineHeight: 22,
  },
});
