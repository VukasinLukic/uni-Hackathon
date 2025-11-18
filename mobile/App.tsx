import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<'Welcome' | 'Home'>('Welcome');

  // Load fonts
  const [fontsLoaded] = useFonts({
    'Gajraj-One': require('./assets/fonts/GajrajOne-Regular.ttf'),
    'Bakbak-One': require('./assets/fonts/BakbakOne-Regular.ttf'),
  });

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem('@onboarding_completed');
      if (completed === 'true') {
        setInitialRoute('Home');
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

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <AppNavigator initialRouteName={initialRoute} />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
