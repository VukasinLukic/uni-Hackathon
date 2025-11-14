import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import DrivingModeScreen from './src/screens/DrivingModeScreen';
import WalkingModeScreen from './src/screens/WalkingModeScreen';
import TestModeScreen from './src/screens/TestModeScreen';
import TestBackendScreen from './src/screens/TestBackendScreen';
import ViewGraphsScreen from './src/screens/ViewGraphsScreen';

type Screen =
  | 'home'
  | 'driving'
  | 'walking'
  | 'testMode'
  | 'testBackend'
  | 'viewGraphs';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            onDrivingMode={() => setCurrentScreen('driving')}
            onWalkingMode={() => setCurrentScreen('walking')}
          />
        );

      case 'driving':
        return (
          <DrivingModeScreen
            onBack={() => setCurrentScreen('home')}
            onTestMode={() => setCurrentScreen('testMode')}
            onTestBackend={() => setCurrentScreen('testBackend')}
            onViewGraphs={() => setCurrentScreen('viewGraphs')}
          />
        );

      case 'walking':
        return (
          <WalkingModeScreen
            onBack={() => setCurrentScreen('home')}
          />
        );

      case 'testMode':
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
