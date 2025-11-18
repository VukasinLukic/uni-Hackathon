import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';

// Onboarding Screens
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import FeaturesScreen from '../screens/onboarding/FeaturesScreen';
import AuthScreen from '../screens/onboarding/AuthScreen';
import PermissionsScreen from '../screens/onboarding/PermissionsScreen';

// Main App Screens
import HomeScreen from '../screens/HomeScreenWithMap';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PrizesScreen } from '../screens/PrizesScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PostSessionSummaryScreen from '../screens/PostSessionSummaryScreen';
import DrivingModeScreen from '../screens/DrivingModeScreen';
import WalkingModeScreen from '../screens/WalkingModeScreen';

// Test/Debug Screens
import TestModeScreen from '../screens/TestModeScreen';
import SensorDebugScreen from '../screens/SensorDebugScreen';
import ViewGraphsScreen from '../screens/ViewGraphsScreen';
import TestBackendScreen from '../screens/TestBackendScreen';
import HomeScreenLegacy from '../screens/HomeScreenLegacy';
import MapGameScreen from '../screens/MapGameScreen';

export type RootStackParamList = {
  // Onboarding
  Welcome: undefined;
  Features: undefined;
  Auth: undefined;
  Permissions: undefined;

  // Main App
  Home: undefined;
  Profile: { userId?: string };
  Prizes: undefined;
  Achievements: undefined;
  Leaderboard: undefined;
  Settings: undefined;
  PostSessionSummary: {
    sessionData: {
      distance: number;
      newCells: number;
      discoveries: number;
      xpBreakdown: {
        distance: number;
        cells: number;
        discoveries: number;
      };
      totalXP: number;
      leveledUp: boolean;
    };
  };
  DrivingMode: undefined;
  WalkingMode: undefined;
  MapGame: undefined;

  // Test/Debug
  TestMode: undefined;
  SensorDebug: undefined;
  ViewGraphs: undefined;
  TestBackend: undefined;
  LegacyHome: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

interface AppNavigatorProps {
  initialRouteName?: keyof RootStackParamList;
}

export default function AppNavigator({ initialRouteName = 'Welcome' }: AppNavigatorProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        {/* Onboarding Screens */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Features" component={FeaturesScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Permissions" component={PermissionsScreen} />

        {/* Main App Screens */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Prizes" component={PrizesScreen} />
        <Stack.Screen name="Achievements" component={AchievementsScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen
          name="PostSessionSummary"
          component={PostSessionSummaryScreen}
          options={{
            gestureEnabled: false, // Prevent swipe back on summary screen
          }}
        />
        <Stack.Screen name="DrivingMode" component={DrivingModeScreen} />
        <Stack.Screen name="WalkingMode" component={WalkingModeScreen} />
        <Stack.Screen name="MapGame" component={MapGameScreen} />

        {/* Test/Debug Screens */}
        <Stack.Screen name="TestMode" component={TestModeScreen} />
        <Stack.Screen name="SensorDebug" component={SensorDebugScreen} />
        <Stack.Screen name="ViewGraphs" component={ViewGraphsScreen} />
        <Stack.Screen name="TestBackend" component={TestBackendScreen} />
        <Stack.Screen name="LegacyHome" component={HomeScreenLegacy} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
