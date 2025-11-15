import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeActionButton from '../components/HomeActionButton';

interface HomeScreenProps {
  onDrivingMode: () => void;
  onWalkingMode: () => void;
}

export default function HomeScreen({ onDrivingMode, onWalkingMode }: HomeScreenProps) {
  const resetOnboarding = async () => {
    await AsyncStorage.removeItem('@onboarding_completed');
    alert('Onboarding reset! Restart app (press R) to see Welcome screen.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        {/* Main content area - clean minimal design */}
        <View style={styles.logoContainer}>
          <Text style={styles.tagline}>Explore. Detect. Earn.</Text>
          <Text style={styles.description}>
            Turn every drive into an adventure
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>uni-Hackathon 2024</Text>
          <Text style={styles.footerSubtext}>Vukasin • Nemanja • Teodora</Text>
        </View>
      </View>

      {/* Floating Action Button */}
      <HomeActionButton
        onDrivingMode={onDrivingMode}
        onWalkingMode={onWalkingMode}
        onResetOnboarding={resetOnboarding}
      />
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
    justifyContent: 'space-between',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagline: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  description: {
    fontSize: 17,
    color: '#8e8e93',
    letterSpacing: -0.4,
    textAlign: 'center',
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
