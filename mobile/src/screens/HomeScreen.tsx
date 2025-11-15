import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeActionButton from '../components/HomeActionButton';

interface HomeScreenProps {
  onDrivingMode: () => void;
  onWalkingMode: () => void;
}

export default function HomeScreen({ onDrivingMode, onWalkingMode }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        {/* Logo Placeholder */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>PAVЕPATROL</Text>
            <Text style={styles.logoSubtext}>Road Quality Mapping</Text>
          </View>
        </View>

        {/* Tagline */}
        <View style={styles.taglineContainer}>
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
  logoPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -2,
    marginBottom: 8,
  },
  logoSubtext: {
    fontSize: 17,
    fontWeight: '500',
    color: '#8e8e93',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  taglineContainer: {
    alignItems: 'center',
    paddingVertical: 32,
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
