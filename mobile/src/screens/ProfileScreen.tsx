import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../utils/colors';
import { FONTS } from '../utils/typography';
import { AvatarSelector, getAvatarEmoji } from '../components/AvatarSelector';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 'http://10.0.10.156:7392';

interface ProfileScreenProps {
  onBack?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile data
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarNumber, setAvatarNumber] = useState(1);

  // Stats
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [stats, setStats] = useState({
    distanceDriven: 0,
    cellsExplored: 0,
    potholesDetected: 0,
  });

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
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
      const userId = await AsyncStorage.getItem('@user_id');

      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await fetch(`${API_URL}/api/users/profile/${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();

      if (data.success && data.user) {
        setName(data.user.name || '');
        setBio(data.user.bio || '');
        setPhone(data.user.phone || '');
        setAvatarNumber(data.user.avatarNumber || 1);
        setLevel(data.user.level || 1);
        setXp(data.user.currentXP || 0);
        setStats({
          distanceDriven: data.user.stats?.distanceDriven || 0,
          cellsExplored: data.user.stats?.cellsExplored || 0,
          potholesDetected: data.user.stats?.potholesDetected || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!isAuthenticated || !user) {
        Alert.alert('Error', 'Not authenticated. Please log in.');
        return;
      }

      // Get user ID from AsyncStorage
      const userId = await AsyncStorage.getItem('@user_id');

      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await fetch(`${API_URL}/api/users/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          bio,
          phone,
          avatarNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Profile updated successfully!');

        // Update user in AsyncStorage
        const updatedUser = { ...user, name, avatarNumber };
        await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>My Profile</Text>
          <Text style={styles.headerSubtitle}>Customize your PavePatrol identity</Text>
        </View>

        {/* Avatar Display */}
        <View style={styles.avatarDisplay}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmojiLarge}>{getAvatarEmoji(avatarNumber)}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Level {level}</Text>
          </View>
        </View>

        {/* XP Progress */}
        <View style={styles.xpContainer}>
          <View style={styles.xpBar}>
            <View style={[styles.xpProgress, { width: `${(xp % 500) / 5}%` }]} />
          </View>
          <Text style={styles.xpText}>{xp} / {Math.ceil(xp / 500) * 500} XP</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.distanceDriven.toFixed(1)} km</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.cellsExplored}</Text>
            <Text style={styles.statLabel}>Cells</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.potholesDetected}</Text>
            <Text style={styles.statLabel}>Discoveries</Text>
          </View>
        </View>

        {/* Avatar Selector */}
        <AvatarSelector selectedAvatar={avatarNumber} onSelectAvatar={setAvatarNumber} />

        {/* Profile Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.text.tertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              placeholderTextColor={COLORS.text.tertiary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              placeholderTextColor={COLORS.text.tertiary}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
  },
  avatarDisplay: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  avatarEmojiLarge: {
    fontSize: 64,
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 14,
    fontFamily: FONTS.button,
    color: '#FFFFFF',
  },
  xpContainer: {
    marginBottom: 24,
  },
  xpBar: {
    height: 8,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpProgress: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  xpText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
  },
  form: {
    marginTop: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.primary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: FONTS.button,
    color: '#FFFFFF',
  },
});
