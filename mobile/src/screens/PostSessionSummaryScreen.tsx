import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/colors';
import { FONTS } from '../utils/typography';

interface SessionSummary {
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
  newLevel?: number;
}

interface PostSessionSummaryScreenProps {
  route: {
    params: {
      sessionData: SessionSummary;
    };
  };
  onContinue: () => void;
}

export default function PostSessionSummaryScreen({
  route,
  onContinue,
}: PostSessionSummaryScreenProps) {
  const { sessionData } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#071E35', '#0A2942', '#1a3a52']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Level Up Banner */}
          {sessionData.leveledUp && (
            <View style={styles.levelUpBanner}>
              <Text style={styles.levelUpEmoji}>🎉</Text>
              <Text style={styles.levelUpTitle}>LEVEL UP!</Text>
              <Text style={styles.levelUpText}>You're now Level {sessionData.newLevel}!</Text>
            </View>
          )}

          {/* Title */}
          <View style={styles.header}>
            <Text style={styles.title}>Exploration Complete!</Text>
            <Text style={styles.subtitle}>Here's what you achieved</Text>
          </View>

          {/* XP Breakdown */}
          <View style={styles.breakdownContainer}>
            {/* Distance */}
            <View style={styles.statCard}>
              <View style={styles.statRow}>
                <Text style={styles.statIcon}>🚗</Text>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Distance Traveled</Text>
                  <Text style={styles.statValue}>{sessionData.distance.toFixed(2)} km</Text>
                </View>
              </View>
              <View style={styles.xpRow}>
                <Text style={styles.xpCalculation}>
                  {sessionData.distance.toFixed(2)} km × 10 XP
                </Text>
                <Text style={styles.xpValue}>+{sessionData.xpBreakdown.distance} XP</Text>
              </View>
            </View>

            {/* New Cells */}
            <View style={styles.statCard}>
              <View style={styles.statRow}>
                <Text style={styles.statIcon}>🗺️</Text>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>New Cells Explored</Text>
                  <Text style={styles.statValue}>{sessionData.newCells} cells</Text>
                </View>
              </View>
              <View style={styles.xpRow}>
                <Text style={styles.xpCalculation}>
                  {sessionData.newCells} cells × 50 XP
                </Text>
                <Text style={styles.xpValue}>+{sessionData.xpBreakdown.cells} XP</Text>
              </View>
            </View>

            {/* Discoveries */}
            <View style={styles.statCard}>
              <View style={styles.statRow}>
                <Text style={styles.statIcon}>⭐</Text>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Discovery Moments</Text>
                  <Text style={styles.statValue}>{sessionData.discoveries}</Text>
                </View>
              </View>
              <View style={styles.xpRow}>
                <Text style={styles.xpCalculation}>
                  {sessionData.discoveries} × 100 XP
                </Text>
                <Text style={styles.xpValue}>+{sessionData.xpBreakdown.discoveries} XP</Text>
              </View>
            </View>
          </View>

          {/* Total XP */}
          <View style={styles.totalXPContainer}>
            <Text style={styles.totalXPLabel}>Total XP Earned</Text>
            <Text style={styles.totalXPValue}>+{sessionData.totalXP} XP</Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity style={styles.continueButton} onPress={onContinue} activeOpacity={0.8}>
            <Text style={styles.continueButtonText}>Continue Exploring</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  levelUpBanner: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  levelUpEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  levelUpTitle: {
    fontSize: 28,
    fontFamily: FONTS.heading,
    color: '#FFD700',
    marginBottom: 4,
  },
  levelUpText: {
    fontSize: 18,
    fontFamily: FONTS.body,
    color: COLORS.text.primary,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
  },
  breakdownContainer: {
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  xpCalculation: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
  },
  xpValue: {
    fontSize: 18,
    fontFamily: FONTS.button,
    color: COLORS.primary,
  },
  totalXPContainer: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  totalXPLabel: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: '#FFFFFF',
    marginBottom: 8,
    opacity: 0.9,
  },
  totalXPValue: {
    fontSize: 48,
    fontFamily: FONTS.heading,
    color: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontFamily: FONTS.button,
    color: COLORS.background.primary,
  },
});
