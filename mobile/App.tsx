import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/contexts/AuthContext';

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

// Onboarding Screens
import WelcomeScreen from './src/screens/onboarding/WelcomeScreen';
import FeaturesScreen from './src/screens/onboarding/FeaturesScreen';
import AuthScreen from './src/screens/onboarding/AuthScreen';
import PermissionsScreen from './src/screens/onboarding/PermissionsScreen';

// Main App Screens (lazy loaded to avoid permission requests before onboarding)
import HomeScreen from './src/screens/HomeScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PostSessionSummaryScreen from './src/screens/PostSessionSummaryScreen';

// Lazy import screens that use LocationService to prevent early permission requests
let DrivingModeScreen: any = null;
let WalkingModeScreen: any = null;

type Screen =
  | 'welcome'
  | 'features'
  | 'auth'
  | 'permissions'
  | 'home'
  | 'driving'
  | 'walking'
  | 'profile'
  | 'achievements'
  | 'leaderboard'
  | 'settings'
  | 'postSessionSummary';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Load fonts
  const [fontsLoaded] = useFonts({
    'Gajraj-One': require('./assets/fonts/GajrajOne-Regular.ttf'),
    'Bakbak-One': require('./assets/fonts/BakbakOne-Regular.ttf'),
  });

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

  // Check if user has completed onboarding
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  // Hide splash screen when fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

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
            onProfile={() => setCurrentScreen('profile')}
          />
        );

      case 'profile':
        return (
          <ProfileScreen
            onBack={() => setCurrentScreen('home')}
          />
        );

      case 'achievements':
        return <AchievementsScreen onBack={() => setCurrentScreen('profile')} />;

      case 'leaderboard':
        return <LeaderboardScreen onBack={() => setCurrentScreen('home')} />;

      case 'settings':
        return <SettingsScreen onBack={() => setCurrentScreen('profile')} />;

      case 'postSessionSummary':
        return (
          <PostSessionSummaryScreen
            route={{
              params: {
                sessionData: {
                  distance: 5.2,
                  newCells: 12,
                  discoveries: 3,
                  xpBreakdown: { distance: 52, cells: 600, discoveries: 300 },
                  totalXP: 952,
                  leveledUp: false,
                },
              },
            }}
            onContinue={() => setCurrentScreen('home')}
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
            onSessionEnd={(sessionData: any) => {
              // Navigate to summary screen with session data
              setCurrentScreen('postSessionSummary');
            }}
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
    <AuthProvider>
      <SafeAreaProvider>
        <View style={styles.container}>{renderScreen()}</View>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
