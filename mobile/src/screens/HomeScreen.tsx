import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import HomeActionButton from '../components/HomeActionButton';
import FogOfWarMap from '../components/FogOfWarMap';
import type { ExplorationCell } from '../services/fogOfWarService';
import { getCellId, getActivityLevel } from '../services/fogOfWarService';
import { FONTS } from '../utils/typography';

interface HomeScreenProps {
  onDrivingMode: () => void;
  onWalkingMode: () => void;
  onProfile?: () => void;
}

export default function HomeScreen({ onDrivingMode, onWalkingMode, onProfile }: HomeScreenProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [exploredCells, setExploredCells] = useState<ExplorationCell[]>([]);
  const [todayStats, setTodayStats] = useState({
    distance: 0,
    cellsExplored: 0,
    discoveries: 0,
  });

  useEffect(() => {
    initializeLocation();
    loadExploredCells();
  }, []);

  const initializeLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadExploredCells = async () => {
    try {
      const savedCells = await AsyncStorage.getItem('@explored_cells');
      if (savedCells) {
        const cells = JSON.parse(savedCells);
        setExploredCells(cells);
        setTodayStats(prev => ({ ...prev, cellsExplored: cells.length }));
      }
    } catch (error) {
      console.error('Error loading explored cells:', error);
    }
  };

  const resetOnboarding = async () => {
    await AsyncStorage.removeItem('@onboarding_completed');
    alert('Onboarding reset! Restart app (press R) to see Welcome screen.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={onProfile}
          activeOpacity={0.7}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>P</Text>
          </View>
          <View>
            <Text style={styles.levelText}>Level 1</Text>
            <View style={styles.xpBar}>
              <View style={[styles.xpProgress, { width: '30%' }]} />
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <Text style={styles.xpText}>150 / 500 XP</Text>
        </View>
      </View>

      {/* Map Section */}
      <FogOfWarMap
        exploredCells={exploredCells}
        userLocation={userLocation || undefined}
        style={styles.map}
      />

      {/* Quick Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{todayStats.distance.toFixed(1)} km</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{todayStats.cellsExplored}</Text>
          <Text style={styles.statLabel}>Cells Today</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{todayStats.discoveries}</Text>
          <Text style={styles.statLabel}>Discoveries</Text>
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
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  xpBar: {
    width: 120,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpProgress: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 3,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  xpText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  map: {
    flex: 1,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 12,
  },
});
