import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions, ScrollView, Animated, PanResponder, Modal, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import MapboxGamingMap, { MapboxGamingMapRef } from '../components/MapboxGamingMap';
import ActionButton from '../components/ActionButton';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import backgroundLocationService from '../services/backgroundLocationService';
import { SensorService } from '../services/sensorService';
import { DetectionService } from '../services/detectionService';
import { APIService } from '../services/apiService';

const { width, height } = Dimensions.get('window');
const API_URL = 'http://10.0.10.156:7392';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HomeScreenProps {
  onProfile?: () => void;
  onSettings?: () => void;
}

interface LeaderboardPlayer {
  rank: number;
  name: string;
  points: number;
  avatar: number;
  level?: number;
  licensePlate?: string;
}

const SNAP_POINTS = {
  MIN: height * 0.15,  // 15% - collapsed
  MID: height * 0.6,   // 60% - mid
  MAX: height * 0.9,   // 90% - expanded
};

export default function HomeScreenWithMap({ onProfile, onSettings }: HomeScreenProps) {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardPlayer[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [exploredCells, setExploredCells] = useState<string[]>([]);
  const [tokens, setTokens] = useState<Array<{ id: string; lat: number; lng: number; value: number }>>([]);
  const [pathHistory, setPathHistory] = useState<Array<[number, number]>>([]);
  const mapRef = useRef<MapboxGamingMapRef>(null);

  // Driving mode detection states
  const [isDrivingModeActive, setIsDrivingModeActive] = useState(false);
  const [showDrivingModePopup, setShowDrivingModePopup] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [potholeCount, setPotholeCount] = useState(0);
  const sensorServiceRef = useRef(new SensorService());
  const detectionServiceRef = useRef(new DetectionService());

  // Bottom modal animation
  const modalHeight = useRef(new Animated.Value(SNAP_POINTS.MIN)).current;
  const [currentSnapPoint, setCurrentSnapPoint] = useState(SNAP_POINTS.MIN);

  // Current user data
  const currentUser = user || { name: 'simica', avatarNumber: 3 };
  const userPoints = 0; // Will be fetched from leaderboard data

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      setIsLoadingLeaderboard(true);
      const response = await fetch(`${API_URL}/api/users/leaderboard?limit=10`);
      const data = await response.json();

      if (data.success && data.leaderboard) {
        setLeaderboardData(data.leaderboard);
      }
    } catch (error) {
      console.error('❌ Error fetching leaderboard:', error);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  // Load path history from storage on mount
  useEffect(() => {
    const loadPathHistory = async () => {
      try {
        const savedPath = await AsyncStorage.getItem('@path_history');
        if (savedPath) {
          const parsed = JSON.parse(savedPath);
          setPathHistory(parsed);
          console.log(`📍 Loaded ${parsed.length} path points from storage`);
        }
      } catch (error) {
        console.error('Error loading path history:', error);
      }
    };
    loadPathHistory();
  }, []);

  // Save path history whenever it changes
  useEffect(() => {
    const savePath = async () => {
      if (pathHistory.length > 0) {
        try {
          await AsyncStorage.setItem('@path_history', JSON.stringify(pathHistory));
          console.log(`💾 Saved ${pathHistory.length} path points to storage`);
        } catch (error) {
          console.error('Error saving path history:', error);
        }
      }
    };
    savePath();
  }, [pathHistory]);

  // Fetch leaderboard on mount
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const generateTestTokens = (currentLocation?: { latitude: number; longitude: number }) => {
    // Use provided location, or user's location, or Temisvar center
    const centerLat = currentLocation?.latitude || userLocation?.latitude || 45.7489;
    const centerLng = currentLocation?.longitude || userLocation?.longitude || 21.2087;

    console.log(`🪙 Generating tokens around: ${centerLat}, ${centerLng}`);

    // Generate more tokens in various directions (within ~300m)
    const testTokens = [
      // TOKEN AT EXACT USER LOCATION - should be collected immediately!
      { id: 'token-instant', lat: centerLat, lng: centerLng, value: 500 },

      // Very close tokens (~5-10m) - easy to collect
      { id: 'token-nearby-1', lat: centerLat + 0.00005, lng: centerLng + 0.00005, value: 200 },
      { id: 'token-nearby-2', lat: centerLat - 0.00005, lng: centerLng - 0.00005, value: 200 },

      // Close tokens (~50-100m)
      { id: 'token-1', lat: centerLat + 0.0005, lng: centerLng + 0.0007, value: 100 },
      { id: 'token-2', lat: centerLat - 0.0006, lng: centerLng + 0.0005, value: 150 },
      { id: 'token-3', lat: centerLat + 0.0007, lng: centerLng - 0.0004, value: 200 },
      { id: 'token-4', lat: centerLat - 0.0004, lng: centerLng - 0.0008, value: 100 },

      // Medium distance tokens (~100-150m)
      { id: 'token-5', lat: centerLat + 0.0010, lng: centerLng + 0.0012, value: 250 },
      { id: 'token-6', lat: centerLat - 0.0012, lng: centerLng + 0.0010, value: 300 },
      { id: 'token-7', lat: centerLat + 0.0012, lng: centerLng - 0.0010, value: 100 },
      { id: 'token-8', lat: centerLat - 0.0010, lng: centerLng - 0.0013, value: 200 },

      // Further tokens (~150-200m)
      { id: 'token-9', lat: centerLat + 0.0015, lng: centerLng + 0.0018, value: 150 },
      { id: 'token-10', lat: centerLat - 0.0018, lng: centerLng + 0.0015, value: 250 },
      { id: 'token-11', lat: centerLat + 0.0017, lng: centerLng - 0.0016, value: 300 },
      { id: 'token-12', lat: centerLat - 0.0016, lng: centerLng - 0.0017, value: 100 },

      // Distant tokens (~200-300m)
      { id: 'token-13', lat: centerLat + 0.0022, lng: centerLng + 0.0025, value: 200 },
      { id: 'token-14', lat: centerLat - 0.0025, lng: centerLng + 0.0022, value: 150 },
      { id: 'token-15', lat: centerLat + 0.0024, lng: centerLng - 0.0023, value: 250 },
      { id: 'token-16', lat: centerLat - 0.0023, lng: centerLng - 0.0024, value: 300 },

      // Bonus diagonal tokens
      { id: 'token-17', lat: centerLat + 0.0020, lng: centerLng, value: 200 },
      { id: 'token-18', lat: centerLat - 0.0020, lng: centerLng, value: 200 },
      { id: 'token-19', lat: centerLat, lng: centerLng + 0.0020, value: 200 },
      { id: 'token-20', lat: centerLat, lng: centerLng - 0.0020, value: 200 },
    ];

    setTokens(testTokens);
    console.log('🪙 Generated test tokens near you:', testTokens.length);
  };

  const handleTokenCollected = async (tokenId: string, type: string, value: number) => {
    console.log(`🪙 Token collected! ID: ${tokenId}, Value: ${value}`);

    // Remove collected token from UI immediately
    setTokens(prev => prev.filter(t => t.id !== tokenId));

    // Update user XP via API
    try {
      const userId = user?.username || user?.licensePlate;
      if (!userId) {
        console.warn('⚠️ No user ID for token collection');
        return;
      }

      console.log(`📤 Sending XP to backend for user: ${userId}`);
      const response = await fetch(`${API_URL}/api/users/${userId}/xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          xp: value,
          reason: `Collected token: ${tokenId}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ XP awarded: +${value} XP`);
        console.log(`📊 User stats:`, data.user);

        // Refresh leaderboard to show updated scores
        await fetchLeaderboard();
        console.log('🔄 Leaderboard refreshed!');
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to award XP:', errorText);
      }
    } catch (error) {
      console.error('❌ Error awarding XP:', error);
    }
  };

  // Start location tracking
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startLocationTracking = async () => {
      try {
        // Request permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Location permission denied');
          return;
        }

        // Get initial location
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const initialPos = {
          latitude: initialLocation.coords.latitude,
          longitude: initialLocation.coords.longitude,
        };

        console.log('📍 Initial location:', initialPos);
        setUserLocation(initialPos);

        // Generate tokens around user's actual location
        generateTestTokens(initialPos);

        // Update map with initial location
        if (mapRef.current) {
          mapRef.current.updateLocation(initialPos.latitude, initialPos.longitude);
        }

        // Start watching location
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10, // Update every 10 meters
            timeInterval: 3000, // Update every 3 seconds
          },
          (location) => {
            const newPos = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };

            console.log('📍 Location update:', newPos);
            setUserLocation(newPos);

            // Add to path history
            setPathHistory(prev => {
              const newPath = [...prev, [newPos.longitude, newPos.latitude]];
              // Keep only last 1000 points to avoid memory issues
              if (newPath.length > 1000) {
                return newPath.slice(-1000);
              }
              return newPath;
            });

            // Get speed in km/h (speed is in m/s)
            const speedKmh = (location.coords.speed || 0) * 3.6;
            setCurrentSpeed(speedKmh);

            // Detect driving mode: speed > 15 km/h indicates vehicle
            if (speedKmh > 15 && !isDrivingModeActive) {
              console.log('🚗 Driving mode detected! Speed:', speedKmh.toFixed(1), 'km/h');
              setShowDrivingModePopup(true);
            } else if (speedKmh <= 15 && isDrivingModeActive) {
              console.log('🚶 Walking speed detected. Speed:', speedKmh.toFixed(1), 'km/h');
              stopDrivingMode();
            }

            // Update map
            if (mapRef.current) {
              mapRef.current.updateLocation(newPos.latitude, newPos.longitude);
            }
          }
        );
      } catch (error) {
        console.error('Error starting location tracking:', error);
      }
    };

    startLocationTracking();

    // Cleanup
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  // Driving mode control functions
  const startDrivingMode = async () => {
    try {
      console.log('🚗 Starting driving mode with pothole detection...');
      setIsDrivingModeActive(true);
      setShowDrivingModePopup(false);

      // Start background location tracking
      await backgroundLocationService.startTracking();

      // Start sensor monitoring for pothole detection
      await sensorServiceRef.current.startMonitoring();

      // Listen for pothole detections
      detectionServiceRef.current.onPotholeDetected(async (severity: string, confidence: number) => {
        console.log(`🕳️ Pothole detected! Severity: ${severity}, Confidence: ${confidence}`);
        setPotholeCount(prev => prev + 1);

        // Send pothole to backend
        if (userLocation) {
          try {
            console.log('📤 Sending pothole event to backend...');
            const response = await APIService.sendPotholeEvent({
              location: {
                type: 'Point',
                coordinates: [userLocation.longitude, userLocation.latitude],
              },
              accelerationData: {
                magnitude: confidence * 10, // Approximate magnitude from confidence
                x: 0,
                y: 0,
                z: 0,
              },
              gyroscopeData: {
                alpha: 0,
                beta: 0,
                gamma: 0,
              },
              deviceOrientation: {
                pitch: 0,
                roll: 0,
                yaw: 0,
              },
              speed: currentSpeed,
              timestamp: new Date(),
              severity,
              confidence,
            });

            console.log('✅ Pothole event sent successfully!', response.data);
          } catch (error) {
            console.error('❌ Failed to send pothole event:', error);
          }
        }

        // Show notification (for testing)
        Alert.alert(
          '🕳️ Pothole Detected!',
          `Severity: ${severity}\nConfidence: ${confidence.toFixed(2)}`,
          [{ text: 'OK' }],
          { cancelable: true }
        );
      });

      console.log('✅ Driving mode activated with background monitoring');
    } catch (error) {
      console.error('Error starting driving mode:', error);
      Alert.alert('Error', 'Failed to start driving mode');
    }
  };

  const stopDrivingMode = async () => {
    try {
      console.log('🛑 Stopping driving mode...');
      setIsDrivingModeActive(false);

      // Stop background location tracking
      await backgroundLocationService.stopTracking();

      // Stop sensor monitoring
      sensorServiceRef.current.stopMonitoring();

      console.log('✅ Driving mode deactivated');
    } catch (error) {
      console.error('Error stopping driving mode:', error);
    }
  };

  // Handle area exploration from Mapbox map
  const handleAreaExplored = (cellId: string) => {
    setExploredCells((prev) => {
      if (!prev.includes(cellId)) {
        return [...prev, cellId];
      }
      return prev;
    });
    console.log('🗺️ New area explored:', cellId);
  };

  const handleSettings = () => {
    if (onSettings) {
      onSettings();
    } else {
      navigation.navigate('Settings');
    }
  };

  const handleProfileClick = () => {
    if (onProfile) {
      onProfile();
    } else {
      navigation.navigate('Profile');
    }
  };

  const getAvatarColor = (avatarNumber: number) => {
    const colors: { [key: number]: string } = {
      1: '#FF6B6B',
      2: '#4ECDC4',
      3: '#FFD93D',
      4: '#6C5CE7',
      5: '#A8E6CF',
    };
    return colors[avatarNumber] || colors[1];
  };

  const getAvatarInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // PanResponder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newHeight = currentSnapPoint - gestureState.dy;
        if (newHeight >= SNAP_POINTS.MIN && newHeight <= SNAP_POINTS.MAX) {
          modalHeight.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const velocity = gestureState.vy;
        let targetSnapPoint = currentSnapPoint;

        // Determine snap point based on velocity and position
        if (velocity < -0.5) {
          // Fast upward swipe
          if (currentSnapPoint === SNAP_POINTS.MIN) {
            targetSnapPoint = SNAP_POINTS.MID;
          } else if (currentSnapPoint === SNAP_POINTS.MID) {
            targetSnapPoint = SNAP_POINTS.MAX;
          }
        } else if (velocity > 0.5) {
          // Fast downward swipe
          if (currentSnapPoint === SNAP_POINTS.MAX) {
            targetSnapPoint = SNAP_POINTS.MID;
          } else if (currentSnapPoint === SNAP_POINTS.MID) {
            targetSnapPoint = SNAP_POINTS.MIN;
          }
        } else {
          // Slow drag - snap to nearest
          const newHeight = currentSnapPoint - gestureState.dy;
          const distances = [
            { point: SNAP_POINTS.MIN, distance: Math.abs(newHeight - SNAP_POINTS.MIN) },
            { point: SNAP_POINTS.MID, distance: Math.abs(newHeight - SNAP_POINTS.MID) },
            { point: SNAP_POINTS.MAX, distance: Math.abs(newHeight - SNAP_POINTS.MAX) },
          ];
          targetSnapPoint = distances.sort((a, b) => a.distance - b.distance)[0].point;
        }

        setCurrentSnapPoint(targetSnapPoint);
        Animated.spring(modalHeight, {
          toValue: targetSnapPoint,
          useNativeDriver: false,
          tension: 50,
          friction: 8,
        }).start();
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Mapbox Gaming Map with Fog of War - Full Screen Background */}
      <MapboxGamingMap
        ref={mapRef}
        style={styles.map}
        onMapReady={() => {
          console.log('🗺️ Mapbox map ready in HomeScreen');
          // Send current location if available
          if (userLocation && mapRef.current) {
            console.log('🗺️ Sending initial location to map:', userLocation);
            mapRef.current.updateLocation(userLocation.latitude, userLocation.longitude);
          }
        }}
        onAreaExplored={handleAreaExplored}
        onTokenCollected={handleTokenCollected}
        onError={(error) => console.error('🗺️ Mapbox error:', error)}
        exploredCells={exploredCells}
        tokens={tokens}
        pathHistory={pathHistory}
      />

      {/* Top Bar - Search + Settings */}
      <View style={styles.topBar}>
        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar} activeOpacity={0.9}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search location...</Text>
        </TouchableOpacity>

        {/* Settings Icon */}
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettings} activeOpacity={0.8}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Modal - Animated */}
      <Animated.View style={[styles.bottomModal, { height: modalHeight }]}>
        {/* Handle Indicator - Draggable */}
        <View style={styles.handleContainer} {...panResponder.panHandlers}>
          <View style={styles.handleIndicator} />
        </View>

        <ScrollView style={styles.bottomSheetScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.bottomSheetContent}>
            {/* User Info Row - Clickable to open Profile */}
            <TouchableOpacity style={styles.userInfoRow} onPress={handleProfileClick} activeOpacity={0.8}>
              <View style={styles.userAvatarContainer}>
                <View style={[styles.userAvatar, { backgroundColor: getAvatarColor(currentUser.avatarNumber || 3) }]}>
                  <Text style={styles.avatarInitial}>{getAvatarInitial(currentUser.name)}</Text>
                </View>
              </View>

              <View style={styles.userTextInfo}>
                <Text style={styles.userName}>{currentUser.name}</Text>
                <View style={styles.pointsRow}>
                  <Text style={styles.userPoints}>{userPoints}</Text>
                  <Text style={styles.tokenIcon}>🪙</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Prizes Section */}
            <View style={styles.prizesSection}>
              <TouchableOpacity style={styles.prizesButton} activeOpacity={0.8}>
                <Text style={styles.prizesButtonText}>Your prizes</Text>
              </TouchableOpacity>

              {/* Medal Display - Golden Gradient Background */}
              <View style={styles.goldGradientBg}>
                {/* Diagonal stripes (black) */}
                <View style={[styles.diagonalStripe, styles.leftStripe]} />
                <View style={[styles.diagonalStripe, styles.rightStripe]} />

                <View style={styles.medalsRow}>
                  {/* Third place */}
                  <View style={styles.medalContainer}>
                    <Text style={styles.medalIcon}>🥉</Text>
                    <Text style={styles.medalLabel}>Cash</Text>
                  </View>

                  {/* First place (larger, higher) */}
                  <View style={[styles.medalContainer, styles.firstPlace]}>
                    <Text style={[styles.medalIcon, styles.firstPlaceMedal]}>🥇</Text>
                    <Text style={styles.medalLabel}>Cash</Text>
                  </View>

                  {/* Second place */}
                  <View style={styles.medalContainer}>
                    <Text style={styles.medalIcon}>🥈</Text>
                    <Text style={styles.medalLabel}>Cash</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Leaderboard Section */}
            <View style={styles.leaderboardSection}>
              {isLoadingLeaderboard ? (
                <Text style={styles.loadingText}>Loading leaderboard...</Text>
              ) : leaderboardData.length === 0 ? (
                <Text style={styles.emptyText}>No leaderboard data yet</Text>
              ) : (
                leaderboardData.map((player) => {
                  const isCurrentUser = player.name === currentUser.name;
                  const avatarSize = player.rank <= 3 ? 42 : 30;
                  const medal = player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : '';

                  return (
                    <View
                      key={`${player.rank}-${player.name}`}
                      style={[
                        styles.leaderboardRow,
                        isCurrentUser && styles.currentUserRow,
                      ]}
                    >
                    {/* Avatar */}
                    <View style={[
                      styles.leaderboardAvatar,
                      { width: avatarSize, height: avatarSize, backgroundColor: getAvatarColor(player.avatar) }
                    ]}>
                      <Text style={[styles.leaderboardAvatarInitial, { fontSize: avatarSize * 0.5 }]}>
                        {getAvatarInitial(player.name)}
                      </Text>
                    </View>

                    {/* Name */}
                    <Text style={[
                      styles.leaderboardName,
                      player.rank <= 3 && styles.topThreeName
                    ]}>
                      {player.name}
                    </Text>

                    {/* Points */}
                    <Text style={[
                      styles.leaderboardPoints,
                      player.rank <= 3 && styles.topThreePoints
                    ]}>
                      {player.points}
                    </Text>

                    {/* Medal */}
                    {medal ? (
                      <Text style={styles.leaderboardMedal}>{medal}</Text>
                    ) : (
                      <Text style={styles.tokenIconSmall}>🪙</Text>
                    )}
                  </View>
                  );
                })
              )}
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Driving Mode Detection Popup */}
      <Modal
        visible={showDrivingModePopup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDrivingModePopup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.drivingModeModal}>
            <Text style={styles.drivingModeIcon}>🚗</Text>
            <Text style={styles.drivingModeTitle}>Driving Detected!</Text>
            <Text style={styles.drivingModeMessage}>
              You're in a vehicle. Activate driving mode to detect potholes automatically?
            </Text>
            <Text style={styles.drivingModeSpeed}>
              Speed: {currentSpeed.toFixed(1)} km/h
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.activateButton]}
                onPress={startDrivingMode}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonText}>Activate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.dismissButton]}
                onPress={() => setShowDrivingModePopup(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonText}>Dismiss</Text>
              </TouchableOpacity>
            </View>

            {isDrivingModeActive && (
              <View style={styles.statusIndicator}>
                <View style={styles.activeIndicator} />
                <Text style={styles.statusText}>Driving Mode Active</Text>
                <Text style={styles.potholeCounter}>Potholes: {potholeCount}</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Floating Action Button for Testing/Debug Tools */}
      <ActionButton
        onTestMode={() => navigation.navigate('TestMode')}
        onTestBackend={() => navigation.navigate('TestBackend')}
        onViewGraphs={() => navigation.navigate('ViewGraphs')}
        onLegacyDemo={() => navigation.navigate('WalkingMode')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1, // Map is at the back
  },
  topBar: {
    position: 'absolute',
    top: 60,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(101, 99, 99, 0.85)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 10,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchPlaceholder: {
    fontFamily: 'Bakbak-One',
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  settingsButton: {
    width: 55,
    height: 55,
    borderRadius: 20,
    backgroundColor: 'rgba(156, 156, 156, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 26,
  },
  bottomModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    zIndex: 100,
  },
  handleContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  handleIndicator: {
    backgroundColor: '#FFFFFF',
    width: 50,
    height: 5,
    borderRadius: 3,
  },
  bottomSheetScroll: {
    flex: 1,
  },
  bottomSheetContent: {
    paddingHorizontal: 17,
    paddingBottom: 40,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 5,
  },
  userAvatarContainer: {
    marginRight: 14,
  },
  userAvatar: {
    width: 54,
    height: 54,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarInitial: {
    fontFamily: 'Bakbak-One',
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  userTextInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: 'Gajraj-One',
    fontSize: 25,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userPoints: {
    fontFamily: 'Bakbak-One',
    fontSize: 25,
    color: '#FFFFFF',
  },
  tokenIcon: {
    fontSize: 22,
  },
  prizesSection: {
    marginBottom: 20,
  },
  prizesButton: {
    backgroundColor: '#FFD975',
    opacity: 0.8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    marginBottom: 16,
    alignSelf: 'center',
    paddingHorizontal: 35,
  },
  prizesButtonText: {
    fontFamily: 'Bakbak-One',
    fontSize: 25,
    color: '#071E35',
    textAlign: 'center',
  },
  goldGradientBg: {
    backgroundColor: '#F2D589',
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  diagonalStripe: {
    position: 'absolute',
    backgroundColor: '#000000',
    width: 82,
    height: 354,
  },
  leftStripe: {
    left: -49,
    top: 591,
    transform: [{ rotate: '-10.48deg' }],
  },
  rightStripe: {
    right: -66,
    top: 596,
    transform: [{ rotate: '10.96deg' }],
  },
  medalsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 24,
    zIndex: 1,
  },
  medalContainer: {
    alignItems: 'center',
  },
  firstPlace: {
    marginBottom: 20,
  },
  medalIcon: {
    fontSize: 64,
    marginBottom: 6,
  },
  firstPlaceMedal: {
    fontSize: 93,
  },
  medalLabel: {
    fontFamily: 'Bakbak-One',
    fontSize: 25,
    color: '#FFFFFF',
  },
  leaderboardSection: {
    marginTop: 16,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 4,
    borderRadius: 7,
  },
  currentUserRow: {
    backgroundColor: 'rgba(232, 243, 79, 0.2)',
  },
  leaderboardAvatar: {
    borderRadius: 7,
    marginRight: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardAvatarInitial: {
    fontFamily: 'Bakbak-One',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  leaderboardName: {
    fontFamily: 'Gajraj-One',
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  topThreeName: {
    fontSize: 19,
  },
  leaderboardPoints: {
    fontFamily: 'Bakbak-One',
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 10,
  },
  topThreePoints: {
    fontSize: 19,
  },
  leaderboardMedal: {
    fontSize: 30,
  },
  tokenIconSmall: {
    fontSize: 20,
  },
  loadingText: {
    fontFamily: 'Bakbak-One',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingVertical: 20,
    opacity: 0.6,
  },
  emptyText: {
    fontFamily: 'Bakbak-One',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingVertical: 20,
    opacity: 0.6,
  },
  // Driving mode popup styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drivingModeModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: width * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#FFD975',
  },
  drivingModeIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  drivingModeTitle: {
    fontFamily: 'Gajraj-One',
    fontSize: 26,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  drivingModeMessage: {
    fontFamily: 'Bakbak-One',
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
  },
  drivingModeSpeed: {
    fontFamily: 'Bakbak-One',
    fontSize: 18,
    color: '#FFD975',
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  activateButton: {
    backgroundColor: '#4ECDC4',
  },
  dismissButton: {
    backgroundColor: '#666',
  },
  modalButtonText: {
    fontFamily: 'Bakbak-One',
    fontSize: 16,
    color: '#FFFFFF',
  },
  statusIndicator: {
    marginTop: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 15,
    width: '100%',
  },
  activeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4ECDC4',
    marginBottom: 8,
  },
  statusText: {
    fontFamily: 'Bakbak-One',
    fontSize: 14,
    color: '#4ECDC4',
    marginBottom: 5,
  },
  potholeCounter: {
    fontFamily: 'Bakbak-One',
    fontSize: 16,
    color: '#FFD975',
  },
});
