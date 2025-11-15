import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Onboarding Screens
import WelcomeScreen from './src/screens/onboarding/WelcomeScreen';
import FeaturesScreen from './src/screens/onboarding/FeaturesScreen';
import AuthScreen from './src/screens/onboarding/AuthScreen';
import PermissionsScreen from './src/screens/onboarding/PermissionsScreen';

// Main App Screens (lazy loaded to avoid permission requests before onboarding)
import HomeScreen from './src/screens/HomeScreen';
import HomeScreenLegacy from './src/screens/HomeScreenLegacy';
import TestBackendScreen from './src/screens/TestBackendScreen';
import ViewGraphsScreen from './src/screens/ViewGraphsScreen';

// Lazy import screens that use LocationService to prevent early permission requests
let DrivingModeScreen: any = null;
let WalkingModeScreen: any = null;
let TestModeScreen: any = null;

type Screen =
  | 'welcome'
  | 'features'
  | 'auth'
  | 'permissions'
  | 'home'
  | 'legacyDemo'
  | 'driving'
  | 'walking'
  | 'testMode'
  | 'testBackend'
  | 'viewGraphs';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Check if user has completed onboarding
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem('@onboarding_completed');
      if (completed === 'true') {
        setHasCompletedOnboarding(true);
        setCurrentScreen('home');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_completed', 'true');
      setHasCompletedOnboarding(true);
      setCurrentScreen('home');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      // Onboarding Screens
      case 'welcome':
        return <WelcomeScreen onGetStarted={() => setCurrentScreen('features')} />;

      case 'features':
        return (
          <FeaturesScreen
            onNext={() => setCurrentScreen('auth')}
            onSkip={() => setCurrentScreen('auth')}
          />
        );

      case 'auth':
        return (
          <AuthScreen
            onAuthComplete={() => setCurrentScreen('permissions')}
            onSkip={() => setCurrentScreen('permissions')}
          />
        );

      case 'permissions':
        return <PermissionsScreen onComplete={completeOnboarding} />;

      // Main App Screens
      case 'home':
        return (
          <HomeScreen
            onDrivingMode={() => setCurrentScreen('driving')}
            onWalkingMode={() => setCurrentScreen('walking')}
          />
        );

      case 'legacyDemo':
        return (
          <HomeScreenLegacy
            onDrivingMode={() => setCurrentScreen('driving')}
            onWalkingMode={() => setCurrentScreen('walking')}
          />
        );

      case 'driving':
        // Lazy load DrivingModeScreen only when needed
        if (!DrivingModeScreen) {
          DrivingModeScreen = require('./src/screens/DrivingModeScreen').default;
        }
        return (
          <DrivingModeScreen
            onBack={() => setCurrentScreen('home')}
            onTestMode={() => setCurrentScreen('testMode')}
            onTestBackend={() => setCurrentScreen('testBackend')}
            onViewGraphs={() => setCurrentScreen('viewGraphs')}
            onLegacyDemo={() => setCurrentScreen('legacyDemo')}
          />
        );

      case 'walking':
        // Lazy load WalkingModeScreen only when needed
        if (!WalkingModeScreen) {
          WalkingModeScreen = require('./src/screens/WalkingModeScreen').default;
        }
        return (
          <WalkingModeScreen
            onBack={() => setCurrentScreen('home')}
          />
        );

      case 'testMode':
        // Lazy load TestModeScreen only when needed
        if (!TestModeScreen) {
          TestModeScreen = require('./src/screens/TestModeScreen').default;
        }
        return (
          <TestModeScreen
            onBack={() => setCurrentScreen('driving')}
          />
        );

      case 'testBackend':
        return (
          <TestBackendScreen
            onBack={() => setCurrentScreen('driving')}
          />
        );

      case 'viewGraphs':
        return (
          <ViewGraphsScreen
            onBack={() => setCurrentScreen('driving')}
          />
        );

      default:
        return (
          <HomeScreen
            onDrivingMode={() => setCurrentScreen('driving')}
            onWalkingMode={() => setCurrentScreen('walking')}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>{renderScreen()}</View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
