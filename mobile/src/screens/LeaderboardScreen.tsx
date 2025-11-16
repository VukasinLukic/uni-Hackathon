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
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../utils/colors';
import { FONTS } from '../utils/typography';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 'http://10.0.10.156:7392';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  licensePlate: string;
  avatarNumber: number;
  totalXP: number;
  level: number;
}

type Period = 'daily' | 'weekly' | 'monthly' | 'all-time';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'all-time', label: 'All-Time' },
];

interface LeaderboardScreenProps {
  onBack: () => void;
}

export default function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [period, setPeriod] = useState<Period>('daily');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const loadCurrentUser = async () => {
    const userId = await AsyncStorage.getItem('@user_id');
    setCurrentUserId(userId);
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      // TODO: Replace with actual API call
      // const response = await fetch(`${API_URL}/api/leaderboard?period=${period}`);
      // const data = await response.json();
      // setLeaderboard(data.rankings);
      // setMyRank(data.userRank);

      // Mock data
      setLeaderboard(MOCK_LEADERBOARD);
      setMyRank(42);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const renderPodium = () => {
    if (leaderboard.length < 3) return null;

    const first = leaderboard[0];
    const second = leaderboard[1];
    const third = leaderboard[2];

    return (
      <View style={styles.podiumContainer}>
        {/* Second Place */}
        <View style={styles.podiumPlace}>
          <Text style={styles.podiumAvatar}>
            {getAvatarEmoji(second.avatarNumber)}
          </Text>
          <View style={[styles.podiumBar, styles.podiumSecond]}>
            <Text style={styles.podiumRank}>🥈</Text>
          </View>
          <Text style={styles.podiumName}>{second.username || second.licensePlate}</Text>
          <Text style={styles.podiumXP}>{second.totalXP} XP</Text>
        </View>

        {/* First Place */}
        <View style={styles.podiumPlace}>
          <Text style={styles.podiumAvatar}>
            {getAvatarEmoji(first.avatarNumber)}
          </Text>
          <View style={[styles.podiumBar, styles.podiumFirst]}>
            <Text style={styles.podiumRank}>👑</Text>
          </View>
          <Text style={styles.podiumName}>{first.username || first.licensePlate}</Text>
          <Text style={styles.podiumXP}>{first.totalXP} XP</Text>
        </View>

        {/* Third Place */}
        <View style={styles.podiumPlace}>
          <Text style={styles.podiumAvatar}>
            {getAvatarEmoji(third.avatarNumber)}
          </Text>
          <View style={[styles.podiumBar, styles.podiumThird]}>
            <Text style={styles.podiumRank}>🥉</Text>
          </View>
          <Text style={styles.podiumName}>{third.username || third.licensePlate}</Text>
          <Text style={styles.podiumXP}>{third.totalXP} XP</Text>
        </View>
      </View>
    );
  };

  const renderLeaderboardRow = ({ item }: { item: LeaderboardEntry }) => {
    const isCurrentUser = item.userId === currentUserId;

    return (
      <View style={[styles.leaderboardRow, isCurrentUser && styles.currentUserRow]}>
        <Text style={styles.rankNumber}>#{item.rank}</Text>
        <Text style={styles.avatar}>{getAvatarEmoji(item.avatarNumber)}</Text>
        <View style={styles.userInfo}>
          <Text style={[styles.username, isCurrentUser && styles.currentUserText]}>
            {item.username || item.licensePlate}
          </Text>
          <Text style={styles.level}>Level {item.level}</Text>
        </View>
        <Text style={[styles.xp, isCurrentUser && styles.currentUserText]}>
          {item.totalXP} XP
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
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
        <Text style={styles.title}>Leaderboard</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Period Tabs */}
      <View style={styles.tabsContainer}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.tab, period === p.key && styles.tabActive]}
            onPress={() => setPeriod(p.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, period === p.key && styles.tabTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Leaderboard List */}
      <FlatList
        ListHeaderComponent={renderPodium()}
        data={leaderboard.slice(3)}
        keyExtractor={(item) => item.userId}
        renderItem={renderLeaderboardRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      {/* My Rank Card (if outside top 100) */}
      {myRank && myRank > 100 && (
        <View style={styles.myRankCard}>
          <Text style={styles.myRankLabel}>Your Rank</Text>
          <Text style={styles.myRankValue}>#{myRank}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// Helper function
const getAvatarEmoji = (avatarNumber: number): string => {
  const avatars = ['🚗', '🏎️', '🚙', '🚕', '🚓'];
  return avatars[avatarNumber - 1] || avatars[0];
};

// Mock data
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: '1', username: 'SpeedRacer', licensePlate: 'BG-001-AA', avatarNumber: 2, totalXP: 5000, level: 10 },
  { rank: 2, userId: '2', username: 'MapMaster', licensePlate: 'BG-002-BB', avatarNumber: 3, totalXP: 4500, level: 9 },
  { rank: 3, userId: '3', username: 'Explorer', licensePlate: 'BG-003-CC', avatarNumber: 1, totalXP: 4000, level: 8 },
  { rank: 4, userId: '4', username: '', licensePlate: 'BG-004-DD', avatarNumber: 4, totalXP: 3500, level: 7 },
  { rank: 5, userId: '5', username: 'RoadWarrior', licensePlate: 'BG-005-EE', avatarNumber: 5, totalXP: 3000, level: 6 },
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
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.background.secondary,
    marginHorizontal: 4,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontFamily: FONTS.button,
    color: COLORS.text.secondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  podiumPlace: {
    alignItems: 'center',
    marginHorizontal: 8,
    flex: 1,
  },
  podiumAvatar: {
    fontSize: 40,
    marginBottom: 8,
  },
  podiumBar: {
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
    paddingTop: 12,
  },
  podiumFirst: {
    height: 120,
    backgroundColor: '#FFD700',
  },
  podiumSecond: {
    height: 100,
    backgroundColor: '#C0C0C0',
  },
  podiumThird: {
    height: 80,
    backgroundColor: '#CD7F32',
  },
  podiumRank: {
    fontSize: 32,
  },
  podiumName: {
    fontSize: 14,
    fontFamily: FONTS.button,
    color: COLORS.text.primary,
    marginTop: 8,
  },
  podiumXP: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  currentUserRow: {
    backgroundColor: COLORS.primary,
  },
  rankNumber: {
    fontSize: 18,
    fontFamily: FONTS.button,
    color: COLORS.text.secondary,
    width: 40,
  },
  avatar: {
    fontSize: 32,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontFamily: FONTS.button,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  level: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
  },
  xp: {
    fontSize: 16,
    fontFamily: FONTS.button,
    color: COLORS.text.primary,
  },
  currentUserText: {
    color: '#FFFFFF',
  },
  myRankCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  myRankLabel: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: '#FFFFFF',
  },
  myRankValue: {
    fontSize: 24,
    fontFamily: FONTS.heading,
    color: '#FFFFFF',
  },
});
