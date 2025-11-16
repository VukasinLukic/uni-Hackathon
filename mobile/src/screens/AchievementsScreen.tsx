import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../utils/colors';
import { FONTS } from '../utils/typography';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 'http://10.0.10.156:7392';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'exploration' | 'discovery' | 'streaks' | 'distance' | 'special';
  requirement: number;
  progress: number;
  unlocked: boolean;
  xpReward: number;
}

const ACHIEVEMENT_CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'exploration', label: 'Exploration' },
  { key: 'discovery', label: 'Discovery' },
  { key: 'streaks', label: 'Streaks' },
  { key: 'distance', label: 'Distance' },
  { key: 'special', label: 'Special' },
];

interface AchievementsScreenProps {
  onBack: () => void;
}

export default function AchievementsScreen({ onBack }: AchievementsScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('@user_id');

      if (!userId) {
        // Mock data for demo
        setAchievements(MOCK_ACHIEVEMENTS);
        setLoading(false);
        return;
      }

      // TODO: Replace with actual API call
      // const response = await fetch(`${API_URL}/api/achievements/${userId}`);
      // const data = await response.json();
      // setAchievements(data.achievements);

      setAchievements(MOCK_ACHIEVEMENTS);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter(
    (achievement) => selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const renderAchievement = ({ item }: { item: Achievement }) => {
    const progressPercent = (item.progress / item.requirement) * 100;

    return (
      <View style={[styles.achievementCard, !item.unlocked && styles.achievementLocked]}>
        <Text style={[styles.achievementIcon, !item.unlocked && styles.iconLocked]}>
          {item.icon}
        </Text>
        <View style={styles.achievementContent}>
          <Text style={[styles.achievementName, !item.unlocked && styles.textLocked]}>
            {item.name}
          </Text>
          <Text style={[styles.achievementDescription, !item.unlocked && styles.textLocked]}>
            {item.description}
          </Text>

          {!item.unlocked && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {item.progress} / {item.requirement}
              </Text>
            </View>
          )}

          <View style={styles.xpRewardContainer}>
            <Text style={[styles.xpReward, !item.unlocked && styles.textLocked]}>
              +{item.xpReward} XP
            </Text>
            {item.unlocked && <Text style={styles.unlockedBadge}>✓ Unlocked</Text>}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading achievements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Achievements</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Category Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={ACHIEVEMENT_CATEGORIES}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tab, selectedCategory === item.key && styles.tabActive]}
              onPress={() => setSelectedCategory(item.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.tabText, selectedCategory === item.key && styles.tabTextActive]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Achievements List */}
      <FlatList
        data={filteredAchievements}
        keyExtractor={(item) => item.id}
        renderItem={renderAchievement}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// Mock data
const MOCK_ACHIEVEMENTS: Achievement[] = [
  // Exploration
  {
    id: '1',
    name: 'First Steps',
    description: 'Explore your first cell',
    icon: '🗺️',
    category: 'exploration',
    requirement: 1,
    progress: 1,
    unlocked: true,
    xpReward: 50,
  },
  {
    id: '2',
    name: 'Explorer I',
    description: 'Explore 10 cells',
    icon: '🧭',
    category: 'exploration',
    requirement: 10,
    progress: 5,
    unlocked: false,
    xpReward: 100,
  },
  {
    id: '3',
    name: 'Explorer II',
    description: 'Explore 100 cells',
    icon: '🌍',
    category: 'exploration',
    requirement: 100,
    progress: 5,
    unlocked: false,
    xpReward: 500,
  },

  // Discovery
  {
    id: '4',
    name: 'First Discovery',
    description: 'Detect your first discovery moment',
    icon: '⭐',
    category: 'discovery',
    requirement: 1,
    progress: 0,
    unlocked: false,
    xpReward: 100,
  },
  {
    id: '5',
    name: 'Discovery Master',
    description: 'Make 50 verified discoveries',
    icon: '🌟',
    category: 'discovery',
    requirement: 50,
    progress: 0,
    unlocked: false,
    xpReward: 500,
  },

  // Streaks
  {
    id: '6',
    name: 'Consistency',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: 'streaks',
    requirement: 3,
    progress: 1,
    unlocked: false,
    xpReward: 200,
  },
  {
    id: '7',
    name: 'Dedication',
    description: 'Maintain a 7-day streak',
    icon: '💪',
    category: 'streaks',
    requirement: 7,
    progress: 1,
    unlocked: false,
    xpReward: 500,
  },

  // Distance
  {
    id: '8',
    name: 'Getting Started',
    description: 'Travel 1km',
    icon: '🚗',
    category: 'distance',
    requirement: 1,
    progress: 0,
    unlocked: false,
    xpReward: 50,
  },
  {
    id: '9',
    name: 'Road Warrior',
    description: 'Travel 50km',
    icon: '🏎️',
    category: 'distance',
    requirement: 50,
    progress: 0,
    unlocked: false,
    xpReward: 500,
  },

  // Special
  {
    id: '10',
    name: 'Early Adopter',
    description: 'Join during beta',
    icon: '🎖️',
    category: 'special',
    requirement: 1,
    progress: 1,
    unlocked: true,
    xpReward: 1000,
  },
];

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
  },
  headerRight: {
    width: 60,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: COLORS.background.secondary,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: FONTS.button,
    color: COLORS.text.secondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  iconLocked: {
    opacity: 0.5,
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: 18,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  textLocked: {
    opacity: 0.7,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
  },
  xpRewardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpReward: {
    fontSize: 16,
    fontFamily: FONTS.button,
    color: COLORS.primary,
  },
  unlockedBadge: {
    fontSize: 14,
    fontFamily: FONTS.button,
    color: '#4CAF50',
  },
});
