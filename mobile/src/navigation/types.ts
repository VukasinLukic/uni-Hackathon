import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  // Onboarding
  Welcome: undefined;
  Features: undefined;
  Auth: undefined;
  Permissions: undefined;

  // Main App
  Home: undefined;
  Profile: { userId?: string };
  Achievements: undefined;
  Leaderboard: undefined;
  Settings: undefined;
  Prizes: undefined;
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

  // Test/Debug
  TestMode: undefined;
  SensorDebug: undefined;
  ViewGraphs: undefined;
  TestBackend: undefined;
  LegacyHome: undefined;
};

export type NavigationProp<T extends keyof RootStackParamList> = StackNavigationProp<
  RootStackParamList,
  T
>;

export type ScreenRouteProp<T extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  T
>;
