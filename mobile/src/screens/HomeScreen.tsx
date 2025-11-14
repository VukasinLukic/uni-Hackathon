import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';

interface HomeScreenProps {
  onDrivingMode: () => void;
  onWalkingMode: () => void;
}

export default function HomeScreen({ onDrivingMode, onWalkingMode }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>RoadSense</Text>
          <Text style={styles.subtitle}>Pothole Detection System</Text>
        </View>

        {/* Mode Selection */}
        <View style={styles.modeContainer}>
          <Text style={styles.modeTitle}>Choose Mode</Text>

          <View style={styles.buttonGroup}>
            {/* Driving Mode */}
            <Button
              title="Driving Mode"
              icon="🚗"
              variant="primary"
              onPress={onDrivingMode}
              style={styles.modeButton}
            />

            {/* Walking Mode */}
            <Button
              title="Walking Mode"
              icon="🚶"
              variant="secondary"
              onPress={onWalkingMode}
              style={styles.modeButton}
            />
          </View>

          {/* Info Cards */}
          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🚗</Text>
              <Text style={styles.infoTitle}>Driving Mode</Text>
              <Text style={styles.infoText}>
                Automatic pothole detection using sensors while driving
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🚶</Text>
              <Text style={styles.infoTitle}>Walking Mode</Text>
              <Text style={styles.infoText}>
                Manually report potholes by taking photos
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>uni-Hackathon 2024</Text>
          <Text style={styles.footerSubtext}>Vukasin • Nemanja • Teodora</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: '#8e8e93',
    letterSpacing: -0.4,
  },
  modeContainer: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  buttonGroup: {
    gap: 16,
    marginBottom: 40,
  },
  modeButton: {
    paddingVertical: 20,
  },
  infoContainer: {
    gap: 16,
  },
  infoCard: {
    backgroundColor: '#f5f5f7',
    borderRadius: 16,
    padding: 20,
  },
  infoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 15,
    color: '#8e8e93',
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#8e8e93',
    letterSpacing: -0.2,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#c7c7cc',
    marginTop: 4,
    letterSpacing: -0.1,
  },
});
