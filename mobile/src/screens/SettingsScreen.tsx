import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../utils/colors';
import { FONTS } from '../utils/typography';

interface SettingsScreenProps {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [discoverySensitivity, setDiscoverySensitivity] = useState<'low' | 'medium' | 'high'>('medium');

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            await AsyncStorage.removeItem('@onboarding_completed');
            // Navigate to welcome screen - handled by parent
            onBack();
          },
        },
      ]
    );
  };

  const renderSettingRow = (
    label: string,
    value: React.ReactNode,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={styles.settingLabel}>{label}</Text>
      {value}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          {renderSettingRow(
            'Username',
            <Text style={styles.settingValue}>{user?.licensePlate || 'Not logged in'}</Text>
          )}

          {renderSettingRow(
            'Level',
            <Text style={styles.settingValue}>Level 1</Text>
          )}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          {renderSettingRow(
            'Enable Notifications',
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: COLORS.primary }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          )}

          {renderSettingRow(
            'Nearby Discoveries',
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: COLORS.primary }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : '#f4f3f4'}
              disabled={!notificationsEnabled}
            />
          )}

          {renderSettingRow(
            'Level Up Alerts',
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: COLORS.primary }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : '#f4f3f4'}
              disabled={!notificationsEnabled}
            />
          )}
        </View>

        {/* Discovery Detection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discovery Detection</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Sensitivity</Text>
            <View style={styles.sensitivityButtons}>
              {(['low', 'medium', 'high'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.sensitivityButton,
                    discoverySensitivity === level && styles.sensitivityButtonActive,
                  ]}
                  onPress={() => setDiscoverySensitivity(level)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.sensitivityButtonText,
                      discoverySensitivity === level && styles.sensitivityButtonTextActive,
                    ]}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          {renderSettingRow(
            'Privacy Policy',
            <Text style={styles.settingChevron}>›</Text>,
            () => Alert.alert('Privacy Policy', 'Privacy policy content here')
          )}

          {renderSettingRow(
            'Terms of Service',
            <Text style={styles.settingChevron}>›</Text>,
            () => Alert.alert('Terms of Service', 'Terms of service content here')
          )}

          {renderSettingRow(
            'Version',
            <Text style={styles.settingValue}>1.0.0</Text>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>
          Made with ❤️ by PavePatrol Team
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.primary,
  },
  settingValue: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
  },
  settingChevron: {
    fontSize: 24,
    color: COLORS.text.secondary,
  },
  sensitivityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sensitivityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sensitivityButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sensitivityButtonText: {
    fontSize: 14,
    fontFamily: FONTS.button,
    color: COLORS.text.secondary,
  },
  sensitivityButtonTextActive: {
    color: '#FFFFFF',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  logoutButtonText: {
    fontSize: 18,
    fontFamily: FONTS.button,
    color: '#FFFFFF',
  },
  footer: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 32,
  },
});
