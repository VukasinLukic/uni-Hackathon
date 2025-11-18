import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions, ScrollView, Animated, PanResponder, Modal, Alert, Image } from 'react-native';
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
const API_URL = 'http://10.0.10.156:7392'; // Regular WiFi IP

// Helper to get avatar image
const getAvatarImage = (avatarNumber: number = 1) => {
  const avatarImages: { [key: number]: any } = {
    1: require('../../assets/images/1.png'),
    2: require('../../assets/images/2.png'),
    3: require('../../assets/images/3.png'),
    4: require('../../assets/images/4.png'),
    5: require('../../assets/images/5.png'),
    6: require('../../assets/images/6.png'),
    7: require('../../assets/images/7.png'),
    8: require('../../assets/images/8.png'),
    9: require('../../assets/images/9.png'),
    10: require('../../assets/images/10.png'),
    11: require('../../assets/images/11.png'),
    12: require('../../assets/images/12.png'),
    13: require('../../assets/images/13.png'),
    14: require('../../assets/images/14.png'),
    15: require('../../assets/images/15.png'),
    16: require('../../assets/images/16.png'),
    17: require('../../assets/images/17.png'),
    18: require('../../assets/images/18.png'),
    19: require('../../assets/images/19.png'),
    20: require('../../assets/images/20.png'),
    21: require('../../assets/images/21.png'),
    22: require('../../assets/images/22.png'),
  };
  return avatarImages[avatarNumber] || avatarImages[1];
};

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
  const [collectedTokenIds, setCollectedTokenIds] = useState<Set<string>>(new Set());
  const [popupDismissedUntil, setPopupDismissedUntil] = useState<number>(0);
  const [potholeNotification, setPotholeNotification] = useState<{ visible: boolean; severity: number | null }>({ visible: false, severity: null });
  const sensorServiceRef = useRef(new SensorService());
  const detectionServiceRef = useRef(new DetectionService());
  const userLocationRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const currentSpeedRef = useRef<number>(0);

  // Bottom modal animation
  const modalHeight = useRef(new Animated.Value(SNAP_POINTS.MIN)).current;
  const [currentSnapPoint, setCurrentSnapPoint] = useState(SNAP_POINTS.MIN);

  // Current user data - Show username and token count
  const currentUser = {
    username: user?.username || user?.licensePlate || 'Player',
    avatarNumber: user?.avatarNumber || 1,
  };
  const userTokenCount = tokens.length; // Number of tokens user has collected

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

  // Load path history, explored cells, and collected tokens from storage on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Load path history
        const savedPath = await AsyncStorage.getItem('@path_history');
        if (savedPath) {
          const parsed = JSON.parse(savedPath);
          setPathHistory(parsed);
          console.log(`📍 Loaded ${parsed.length} path points from storage`);
        }

        // Load explored cells
        const savedCells = await AsyncStorage.getItem('@explored_cells');
        if (savedCells) {
          const parsedCells = JSON.parse(savedCells);
          setExploredCells(parsedCells);
          console.log(`🗺️ Loaded ${parsedCells.length} explored cells from storage`);
        }

        // Load collected token IDs
        const savedTokens = await AsyncStorage.getItem('@collected_tokens');
        if (savedTokens) {
          const parsedTokens = JSON.parse(savedTokens);
          setCollectedTokenIds(new Set(parsedTokens));
          console.log(`🪙 Loaded ${parsedTokens.length} collected token IDs from storage`);
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };
    loadSavedData();
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

  // Save explored cells whenever they change
  useEffect(() => {
    const saveCells = async () => {
      if (exploredCells.length > 0) {
        try {
          await AsyncStorage.setItem('@explored_cells', JSON.stringify(exploredCells));
          console.log(`💾 Saved ${exploredCells.length} explored cells to storage`);
        } catch (error) {
          console.error('Error saving explored cells:', error);
        }
      }
    };
    saveCells();
  }, [exploredCells]);

  // Save collected token IDs whenever they change
  useEffect(() => {
    const saveTokens = async () => {
      if (collectedTokenIds.size > 0) {
        try {
          await AsyncStorage.setItem('@collected_tokens', JSON.stringify(Array.from(collectedTokenIds)));
          console.log(`💾 Saved ${collectedTokenIds.size} collected token IDs to storage`);
        } catch (error) {
          console.error('Error saving collected tokens:', error);
        }
      }
    };
    saveTokens();
  }, [collectedTokenIds]);

  // Fetch leaderboard on mount
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const generateTestTokens = (currentLocation?: { latitude: number; longitude: number }) => {
    // Timisoara center coordinates
    const timisoareCenter = { lat: 45.7489, lng: 21.2087 };

    console.log(`🪙 Generating 100 tokens across all of Timisoara`);

    const newTokens: Array<{ id: string; lat: number; lng: number; value: number }> = [];

    // Cover entire Timisoara area: approximately 10km x 10km
    // 1 degree latitude ≈ 111km, 1 degree longitude ≈ 78km (at this latitude)
    const cityRadiusLat = 0.045; // ~5km north-south (10km total)
    const cityRadiusLng = 0.064; // ~5km east-west (10km total)

    // Grid spacing to generate approximately 100 tokens
    // Grid will be ~10x10 = 100 potential positions
    const gridSpacing = 0.009; // ~1km between grid points

    for (let latOffset = -cityRadiusLat; latOffset <= cityRadiusLat; latOffset += gridSpacing) {
      for (let lngOffset = -cityRadiusLng; lngOffset <= cityRadiusLng; lngOffset += gridSpacing) {
        const lat = timisoareCenter.lat + latOffset;
        const lng = timisoareCenter.lng + lngOffset;

        // Create unique ID based on grid position (deterministic)
        const gridLat = Math.round(lat * 1000); // Grid precision
        const gridLng = Math.round(lng * 1000);
        const tokenId = `token-${gridLat}-${gridLng}`;

        // Skip if this token was already collected
        if (collectedTokenIds.has(tokenId)) {
          continue;
        }

        // Skip if token already exists in current list
        if (tokens.find(t => t.id === tokenId)) {
          continue;
        }

        // Random seed based on grid position (deterministic but appears random)
        const seedValue = (gridLat * 7919 + gridLng * 6571) % 100;

        // Generate token 100% of the time (all grid positions have tokens)
        // Vary token values based on seed
        const value = [50, 100, 150, 200, 250][seedValue % 5];

        newTokens.push({
          id: tokenId,
          lat,
          lng,
          value,
        });
      }
    }

    // Filter out already collected tokens
    const validTokens = newTokens.filter(token => !collectedTokenIds.has(token.id));

    setTokens(validTokens);
    console.log(`🪙 Generated ${validTokens.length} tokens across Timisoara. Collected: ${collectedTokenIds.size}`);
  };

  const handleTokenCollected = async (tokenId: string, type: string, value: number) => {
    console.log(`🪙 Token collected! ID: ${tokenId}, Value: ${value}`);

    // Mark token as collected permanently
    setCollectedTokenIds(prev => new Set(prev).add(tokenId));

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

            // Update tokens in 500m radius around new location
            generateTestTokens(newPos);

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
            currentSpeedRef.current = speedKmh;
            userLocationRef.current = newPos;

            // Detect driving mode: speed > 15 km/h indicates vehicle
            if (speedKmh > 15 && !isDrivingModeActive) {
              console.log('🚗 Driving mode detected! Speed:', speedKmh.toFixed(1), 'km/h');

              // Auto-activate driving mode without popup
              const now = Date.now();
              if (now > popupDismissedUntil) {
                console.log('✅ Auto-activating driving mode');
                startDrivingMode();
              } else {
                const remainingMinutes = Math.ceil((popupDismissedUntil - now) / 60000);
                console.log(`⏰ Driving mode in cooldown. ${remainingMinutes} minutes remaining.`);
              }
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
      console.log('🚗 [DrivingMode] Starting pothole detection...');

      // Check if location is available
      if (!userLocation) {
        console.warn('⚠️ Cannot start driving mode: No location available yet');
        return;
      }

      setIsDrivingModeActive(true);
      setShowDrivingModePopup(false);
      console.log('📍 Starting driving mode with location:', userLocation);

      // Setup pothole detection callback (like TestMode)
      detectionServiceRef.current.setCallback(async (event) => {
        console.log('🕳️ POTHOLE DETECTED!', event);
        setPotholeCount(prev => prev + 1);

        // Send pothole to backend with current location
        try {
          console.log('📤 Sending pothole event to backend...');
          const response = await APIService.sendPotholeEvent({
            location: {
              type: 'Point',
              coordinates: [event.location.lng, event.location.lat],
            },
            accelerationData: {
              magnitude: event.magnitude,
              x: 0,
              y: 0,
              z: 0,
            },
            gyroscopeData: {
              alpha: 0,
              beta: 0,
              gamma: 0,
            },
            speed: event.speed,
          });

          console.log('🕳️ Event sent successfully!', response);

          // Show minimalistic notification
          const severity = response?.pothole?.severity || response?.severity || 0;
          console.log('📢 Showing pothole notification with severity:', severity);
          setPotholeNotification({ visible: true, severity });

          // Auto-hide after 3 seconds
          setTimeout(() => {
            console.log('⏱️ Hiding pothole notification');
            setPotholeNotification({ visible: false, severity: null });
          }, 3000);
        } catch (error: any) {
          console.error('❌ Failed to send event to backend:', error);
        }
      });

      // Start sensors with accelerometer and gyroscope monitoring (like TestMode)
      let lastGyroData: any = { x: 0, y: 0, z: 0, timestamp: 0 };

      console.log('🔧 Starting sensor monitoring...');
      await sensorServiceRef.current.startMonitoring({
        onAccelerometer: (data: any) => {
          const location = userLocationRef.current;
          const speed = currentSpeedRef.current;
          if (location) {
            detectionServiceRef.current.processAccelerometerData(
              data,
              lastGyroData,
              {
                lat: location.latitude,
                lng: location.longitude,
              },
              speed || 30 // Use actual speed from location tracking
            );
          } else {
            console.warn('⚠️ Accelerometer data received but no location available');
          }
        },
        onGyroscope: (data: any) => {
          lastGyroData = data;
        },
      });

      console.log('✅ Pothole detection active! Monitoring sensors...');
      console.log('📊 Current speed:', currentSpeed, 'km/h');
      console.log('📍 Current location:', userLocation);
    } catch (error) {
      console.error('Error starting driving mode:', error);
      Alert.alert('Error', 'Failed to start driving mode');
    }
  };

  const stopDrivingMode = async () => {
    try {
      console.log('🛑 [DrivingMode] Stopping pothole detection...');
      setIsDrivingModeActive(false);

      // Stop sensor monitoring
      sensorServiceRef.current.stopMonitoring();
      detectionServiceRef.current.reset();

      console.log('✅ [DrivingMode] Pothole detection stopped');
    } catch (error) {
      console.error('❌ [DrivingMode] Error stopping:', error);
    }
  };

  // Dismiss driving mode popup with 30-minute cooldown
  const dismissDrivingPopup = () => {
    console.log('❌ User dismissed driving mode popup');
    setShowDrivingModePopup(false);

    // Set cooldown for 30 minutes (1800000 milliseconds)
    const cooldownTime = Date.now() + 1800000;
    setPopupDismissedUntil(cooldownTime);
    console.log('⏰ Driving popup dismissed until:', new Date(cooldownTime).toLocaleTimeString());
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

      {/* Pothole Detection Notification - Top Right Corner */}
      {potholeNotification.visible && (
        <View style={styles.potholeNotification}>
          <Text style={styles.potholeNotificationIcon}>🕳️</Text>
          <View style={styles.potholeNotificationTextContainer}>
            <Text style={styles.potholeNotificationTitle}>Pothole Detected</Text>
            <Text style={styles.potholeNotificationSeverity}>Severity: {potholeNotification.severity}</Text>
          </View>
        </View>
      )}

      {/* Driving Mode Active Indicator - Top Left Corner */}
      {isDrivingModeActive && (
        <View style={styles.drivingModeIndicator}>
          <Text style={styles.drivingModeIndicatorIcon}>🚗</Text>
          <View style={styles.drivingModeIndicatorTextContainer}>
            <Text style={styles.drivingModeIndicatorTitle}>Driving Mode</Text>
            <Text style={styles.drivingModeIndicatorSubtitle}>{currentSpeed.toFixed(0)} km/h • {potholeCount} potholes</Text>
          </View>
        </View>
      )}

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
                <Image source={getAvatarImage(currentUser.avatarNumber || 1)} style={styles.userAvatar} />
              </View>

              <View style={styles.userTextInfo}>
                <Text style={styles.userName}>{currentUser.username}</Text>
                <View style={styles.pointsRow}>
                  <Text style={styles.userPoints}>{userTokenCount}</Text>
                  <Text style={styles.tokenIcon}>🪙</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Prizes Section */}
            <View style={styles.prizesSection}>
              <TouchableOpacity
                style={styles.prizesButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Prizes')}
              >
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
                  // Match by licensePlate since that's unique
                  const isCurrentUser = player.licensePlate === user?.licensePlate || player.name === currentUser.username;
                  const avatarSize = player.rank <= 3 ? 48 : 36;
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
                    <View style={[styles.leaderboardAvatarContainer, { width: avatarSize, height: avatarSize }]}>
                      <Image
                        source={getAvatarImage(player.avatar || 1)}
                        style={styles.leaderboardAvatarImage}
                      />
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
      {/* Removed large driving mode modal - now using small indicator instead */}

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
  potholeNotification: {
    position: 'absolute',
    top: 130,
    right: 14,
    backgroundColor: 'rgba(255, 87, 34, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  potholeNotificationIcon: {
    fontSize: 20,
  },
  potholeNotificationTextContainer: {
    flexDirection: 'column',
  },
  potholeNotificationTitle: {
    fontFamily: 'Bakbak-One',
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  potholeNotificationSeverity: {
    fontFamily: 'Bakbak-One',
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  drivingModeIndicator: {
    position: 'absolute',
    top: 60,
    left: 14,
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  drivingModeIndicatorIcon: {
    fontSize: 20,
  },
  drivingModeIndicatorTextContainer: {
    flexDirection: 'column',
  },
  drivingModeIndicatorTitle: {
    fontFamily: 'Bakbak-One',
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  drivingModeIndicatorSubtitle: {
    fontFamily: 'Bakbak-One',
    fontSize: 9,
    color: '#FFFFFF',
    opacity: 0.9,
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
    borderWidth: 2,
    borderColor: '#000000',
    resizeMode: 'cover',
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
  leaderboardAvatarContainer: {
    borderRadius: 7,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#000000',
  },
  leaderboardAvatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
