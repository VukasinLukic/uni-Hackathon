import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import SensorDebugScreen from './src/screens/SensorDebugScreen';

export default function App() {
  const [count, setCount] = React.useState(0);
  const [showSensorDebug, setShowSensorDebug] = React.useState(false);

  if (showSensorDebug) {
    return <SensorDebugScreen navigation={{ goBack: () => setShowSensorDebug(false) }} />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.title}>RoadSense</Text>
          <Text style={styles.subtitle}>Timișoara</Text>
          <Text style={styles.description}>Smart pothole detection</Text>
        </View>

        {/* Demo Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            🎨 React Native App Working!
          </Text>
          <Text style={styles.cardDescription}>
            Expo SDK 54 + TypeScript + React Native
          </Text>

          {/* Counter */}
          <View style={styles.counter}>
            <TouchableOpacity
              onPress={() => setCount(count - 1)}
              style={styles.buttonOutline}
            >
              <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.countText}>{count}</Text>

            <TouchableOpacity
              onPress={() => setCount(count + 1)}
              style={styles.buttonPrimary}
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.feature}>
              <Text style={styles.emoji}>📱</Text>
              <Text style={styles.featureTitle}>Sensor Detection</Text>
              <Text style={styles.featureDesc}>Accelerometer + GPS</Text>
            </View>

            <View style={styles.feature}>
              <Text style={styles.emoji}>🗺️</Text>
              <Text style={styles.featureTitle}>Live Map</Text>
              <Text style={styles.featureDesc}>Real-time alerts</Text>
            </View>

            <View style={styles.feature}>
              <Text style={styles.emoji}>📸</Text>
              <Text style={styles.featureTitle}>Photo Capture</Text>
              <Text style={styles.featureDesc}>AI validation</Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionPrimary}
            onPress={() => setShowSensorDebug(true)}
          >
            <Text style={styles.actionText}>🔬 Sensor Debug</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionOutline}>
            <Text style={styles.actionText}>View Map</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          uni-Hackathon Project{'\n'}
          Vukasin • Nemanja • Teodora
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: '100%',
  },
  hero: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 60,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 24,
    color: '#2563eb',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 18,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    color: '#d1d5db',
    marginBottom: 24,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  countText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2563eb',
    minWidth: 80,
    textAlign: 'center',
  },
  features: {
    gap: 12,
  },
  feature: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  featureTitle: {
    fontWeight: '600',
    color: '#ffffff',
    fontSize: 16,
  },
  featureDesc: {
    fontSize: 14,
    color: '#9ca3af',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionPrimary: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  footer: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 48,
    textAlign: 'center',
  },
});
