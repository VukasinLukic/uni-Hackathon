import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 'http://10.0.10.156:7392'; // Regular WiFi IP

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ProfileScreenProps {
  onBack?: () => void;
}

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

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);

  // Profile data
  const [avatarNumber, setAvatarNumber] = useState(1);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');

  // Stats
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [cityExplored, setCityExplored] = useState(0);
  const [hoursDriven, setHoursDriven] = useState(0);
  const [streetsThisWeek, setStreetsThisWeek] = useState(0);
  const [highestPosition, setHighestPosition] = useState(1);

  // Avatar selection modal
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedAvatarTemp, setSelectedAvatarTemp] = useState(1);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
    fetchLeaderboardPosition();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      if (!isAuthenticated || !user) {
        Alert.alert(
          'Not Authenticated',
          'Please log in to view your profile.',
          [{ text: 'OK', style: 'cancel', onPress: () => onBack?.() }]
        );
        setLoading(false);
        return;
      }

      // Get user ID from AsyncStorage
      const storedUserId = await AsyncStorage.getItem('@user_id');

      if (!storedUserId) {
        throw new Error('User ID not found');
      }

      setUserId(storedUserId);

      const response = await fetch(`${API_URL}/api/users/profile/${storedUserId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();

      if (data.success && data.user) {
        setAvatarNumber(data.user.avatarNumber || 1);
        setUsername(data.user.username || data.user.licensePlate || 'Player');
        setTotalPoints(data.user.totalXP || 0);
        setCityExplored(Math.round(data.user.stats?.explorationPercentage || 0));

        // Convert distance from km to hours (assuming average speed of 30km/h)
        const distanceKm = data.user.stats?.distanceDriven || 0;
        const estimatedHours = Math.round(distanceKm / 30);
        setHoursDriven(estimatedHours);

        setStreetsThisWeek(data.user.stats?.cellsExplored || 0);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboardPosition = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/leaderboard?limit=100`);

      if (!response.ok) {
        console.warn('Failed to fetch leaderboard');
        return;
      }

      const data = await response.json();

      if (data.success && data.leaderboard) {
        // Find current user's position
        const userEntry = data.leaderboard.find((entry: any) =>
          entry.licensePlate === user?.licensePlate
        );

        if (userEntry) {
          setCurrentPosition(userEntry.rank);

          // Track highest position achieved
          const storedHighest = await AsyncStorage.getItem('@highest_position');
          if (storedHighest) {
            const highest = parseInt(storedHighest);
            if (userEntry.rank < highest) {
              setHighestPosition(userEntry.rank);
              await AsyncStorage.setItem('@highest_position', userEntry.rank.toString());
            } else {
              setHighestPosition(highest);
            }
          } else {
            setHighestPosition(userEntry.rank);
            await AsyncStorage.setItem('@highest_position', userEntry.rank.toString());
          }
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard position:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Always navigate to Welcome screen after logout
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handlePrizesPress = () => {
    navigation.navigate('Prizes');
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handleAvatarPress = () => {
    setSelectedAvatarTemp(avatarNumber);
    setShowAvatarSelector(true);
  };

  const handleAvatarSave = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/users/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarNumber: selectedAvatarTemp })
      });

      if (!response.ok) {
        throw new Error('Failed to update avatar');
      }

      const data = await response.json();

      if (data.success) {
        setAvatarNumber(selectedAvatarTemp);
        setShowAvatarSelector(false);
        Alert.alert('Success', 'Avatar updated successfully!');
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      Alert.alert('Error', 'Failed to update avatar');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Section with Pale Yellow Background */}
        <View style={styles.header}>
          {/* Settings Gear Icon */}
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>

          {/* Pixel Avatar */}
          <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress} activeOpacity={0.8}>
            <Image source={getAvatarImage(avatarNumber)} style={styles.avatarImage} />
            <View style={styles.editAvatarBadge}>
              <Text style={styles.editAvatarIcon}>✏️</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Username and Tag */}
        <View style={styles.userInfo}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.userTag}>KŠ-{userId.slice(-6).toUpperCase()}</Text>
        </View>

        {/* Overview Section - Two Pills */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.overviewRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIconLarge}>💰</Text>
            </View>
            <Text style={styles.statValue}>{totalPoints}</Text>
            <Text style={styles.statLabel}>total points</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIconLarge}>🏆</Text>
            </View>
            <Text style={styles.statValue}>#{currentPosition}</Text>
            <Text style={styles.statLabel}>current position</Text>
          </View>
        </View>

        {/* Achievements Section - 2x2 Grid */}
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          <View style={styles.achievementCard}>
            <View style={styles.achievementIconContainer}>
              <Text style={styles.achievementIcon}>🗺️</Text>
            </View>
            <Text style={styles.achievementValue}>{cityExplored}%</Text>
            <Text style={styles.achievementLabel}>city explored</Text>
          </View>

          <View style={styles.achievementCard}>
            <View style={styles.achievementIconContainer}>
              <Text style={styles.achievementIcon}>⏱️</Text>
            </View>
            <Text style={styles.achievementValue}>{hoursDriven}</Text>
            <Text style={styles.achievementLabel}>hours driven</Text>
          </View>

          <View style={styles.achievementCard}>
            <View style={styles.achievementIconContainer}>
              <Text style={styles.achievementIcon}>🛣️</Text>
            </View>
            <Text style={styles.achievementValue}>{streetsThisWeek}</Text>
            <Text style={styles.achievementLabel}>streets this week</Text>
          </View>

          <View style={styles.achievementCard}>
            <View style={styles.achievementIconContainer}>
              <Text style={styles.achievementIcon}>🥇</Text>
            </View>
            <Text style={styles.achievementValue}>#{highestPosition}</Text>
            <Text style={styles.achievementLabel}>highest position</Text>
          </View>
        </View>

        {/* CTA Buttons */}
        <TouchableOpacity style={styles.prizesButton} onPress={handlePrizesPress}>
          <Text style={styles.prizesButtonText}>YOUR PRIZES</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>log out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Avatar Selection Modal */}
      <Modal
        visible={showAvatarSelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAvatarSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.avatarSelectorModal}>
            <Text style={styles.modalTitle}>Choose Your Avatar</Text>

            <FlatList
              data={Array.from({ length: 22 }, (_, i) => i + 1)}
              numColumns={4}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.avatarOption,
                    selectedAvatarTemp === item && styles.avatarOptionSelected,
                  ]}
                  onPress={() => setSelectedAvatarTemp(item)}
                  activeOpacity={0.7}
                >
                  <Image source={getAvatarImage(item)} style={styles.avatarOptionImage} />
                  {selectedAvatarTemp === item && (
                    <View style={styles.selectedCheckmark}>
                      <Text style={styles.checkmarkIcon}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.avatarGrid}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAvatarSelector(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAvatarSave}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Bakbak-One',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#D9E06A',
    height: 140,
    position: 'relative',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 28,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#000000',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#D9E06A',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
  },
  editAvatarIcon: {
    fontSize: 16,
  },
  userInfo: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
  },
  username: {
    fontSize: 32,
    fontFamily: 'Bakbak-One',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userTag: {
    fontSize: 16,
    fontFamily: 'Bakbak-One',
    color: '#888888',
    letterSpacing: 1.5,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Bakbak-One',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  overviewRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#DCDCDC',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statIconLarge: {
    fontSize: 32,
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Bakbak-One',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Bakbak-One',
    color: '#666666',
    textAlign: 'center',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  achievementCard: {
    width: '48%',
    backgroundColor: '#DCDCDC',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementIconContainer: {
    marginBottom: 6,
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementValue: {
    fontSize: 24,
    fontFamily: 'Bakbak-One',
    color: '#000000',
    marginBottom: 2,
  },
  achievementLabel: {
    fontSize: 11,
    fontFamily: 'Bakbak-One',
    color: '#666666',
    textAlign: 'center',
  },
  prizesButton: {
    marginHorizontal: 20,
    backgroundColor: '#D9E06A',
    borderRadius: 42.83,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 4.28,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  prizesButtonText: {
    fontSize: 24,
    fontFamily: 'Gajraj-One',
    color: '#000000',
    letterSpacing: 2,
  },
  logoutButton: {
    marginHorizontal: 60,
    backgroundColor: '#C04A48',
    borderRadius: 42.83,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#A03836',
  },
  logoutButtonText: {
    fontSize: 18,
    fontFamily: 'Bakbak-One',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  // Avatar Selector Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSelectorModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 4,
    borderColor: '#D9E06A',
  },
  modalTitle: {
    fontSize: 28,
    fontFamily: 'Gajraj-One',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  avatarGrid: {
    paddingBottom: 16,
  },
  avatarOption: {
    width: 70,
    height: 70,
    margin: 6,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#444444',
    overflow: 'hidden',
    position: 'relative',
  },
  avatarOptionSelected: {
    borderColor: '#D9E06A',
    borderWidth: 4,
  },
  avatarOptionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  selectedCheckmark: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#D9E06A',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkIcon: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#666666',
    borderWidth: 2,
    borderColor: '#888888',
  },
  saveButton: {
    backgroundColor: '#D9E06A',
    borderWidth: 3,
    borderColor: '#000000',
  },
  modalButtonText: {
    fontSize: 18,
    fontFamily: 'Bakbak-One',
    color: '#000000',
    letterSpacing: 1,
  },
});
