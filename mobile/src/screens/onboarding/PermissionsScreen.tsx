import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';

interface Permission {
  id: string;
  icon: string;
  title: string;
  description: string;
  why: string;
  required: boolean;
  granted: boolean;
}

interface PermissionsScreenProps {
  onComplete: () => void;
}

export default function PermissionsScreen({ onComplete }: PermissionsScreenProps) {
  const initialPermissions: Permission[] = [
    {
      id: 'location',
      icon: '📍',
      title: 'Location Access',
      description: 'Foreground & Background',
      why: 'Track your drive and detect potholes automatically while you explore the city.',
      required: true,
      granted: false,
    },
    {
      id: 'motion',
      icon: '📳',
      title: 'Motion Sensors',
      description: 'Accelerometer & Gyroscope',
      why: 'Detect road bumps and potholes using your phone motion sensors.',
      required: true,
      granted: false,
    },
    {
      id: 'camera',
      icon: '📷',
      title: 'Camera Access',
      description: 'For Walking Mode',
      why: 'Take photos of potholes manually in Walking Mode for better verification.',
      required: false,
      granted: false,
    },
  ];

  const [permissions, setPermissions] = useState(initialPermissions);
  const [isRequesting, setIsRequesting] = useState(false);

  const requestLocationPermission = async () => {
    try {
      // EXPO GO MODE: Simulate permission grant (Expo Go doesn't support custom Info.plist)
      // Real permissions will work in standalone build
      console.log('⚠️ Expo Go detected - simulating location permission grant');
      await new Promise(resolve => setTimeout(resolve, 800));
      return true;

      /*
      // TODO: Uncomment when building standalone app (eas build)
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use PavePatrol. Please enable it in settings.'
        );
        return false;
      }

      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();

      if (backgroundStatus !== 'granted') {
        Alert.alert(
          'Background Location',
          'Background location helps detect potholes even when the app is in background. You can enable it later in settings.'
        );
      }

      return true;
      */
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  };

  const requestCameraPermission = async () => {
    try {
      // EXPO GO MODE: Simulate camera permission grant
      console.log('⚠️ Expo Go detected - simulating camera permission grant');
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;

      /*
      // TODO: Uncomment when building standalone app
      const { status } = await Camera.requestCameraPermissionsAsync();
      return status === 'granted';
      */
    } catch (error) {
      console.error('Camera permission error:', error);
      return false;
    }
  };

  const requestAllPermissions = async () => {
    setIsRequesting(true);

    try {
      // Location (required)
      const locationGranted = await requestLocationPermission();
      updatePermissionStatus('location', locationGranted);

      // Motion sensors are automatically available (no permission needed on modern devices)
      updatePermissionStatus('motion', true);

      // Camera (optional)
      const cameraGranted = await requestCameraPermission();
      updatePermissionStatus('camera', cameraGranted);

      // Check if all required permissions are granted
      const allRequiredGranted = locationGranted; // motion is always true

      if (allRequiredGranted) {
        console.log('✅ All required permissions granted');
        setTimeout(() => onComplete(), 500);
      } else {
        Alert.alert(
          'Required Permissions',
          'Location permission is required to use PavePatrol. Please enable it to continue.',
          [
            { text: 'Try Again', onPress: requestAllPermissions },
            { text: 'Exit', style: 'cancel' },
          ]
        );
      }
    } catch (error) {
      console.error('Permission request error:', error);
      Alert.alert('Error', 'Failed to request permissions. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  const updatePermissionStatus = (id: string, granted: boolean) => {
    setPermissions((prev) =>
      prev.map((perm) => (perm.id === id ? { ...perm, granted } : perm))
    );
  };

  const renderPermissionCard = (permission: Permission) => (
    <View key={permission.id} style={styles.permissionCard}>
      <View style={styles.permissionHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.permissionIcon}>{permission.icon}</Text>
        </View>
        <View style={styles.permissionInfo}>
          <View style={styles.permissionTitleRow}>
            <Text style={styles.permissionTitle}>{permission.title}</Text>
            {permission.required && (
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredBadgeText}>Required</Text>
              </View>
            )}
          </View>
          <Text style={styles.permissionDescription}>{permission.description}</Text>
        </View>
        {permission.granted && (
          <View style={styles.grantedIndicator}>
            <Text style={styles.grantedIndicatorText}>✓</Text>
          </View>
        )}
      </View>
      <Text style={styles.permissionWhy}>💡 {permission.why}</Text>
    </View>
  );

  return (
    <LinearGradient colors={['#071E35', '#0A2942']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Permissions</Text>
          <Text style={styles.subtitle}>
            We need a few permissions to make PavePatrol work smoothly
          </Text>
        </View>

        {/* Permissions List */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {permissions.map((permission) => renderPermissionCard(permission))}

          {/* Privacy Notice */}
          <View style={styles.privacyNotice}>
            <Text style={styles.privacyIcon}>🔒</Text>
            <Text style={styles.privacyText}>
              Your privacy matters. We only use your data for pothole detection and never share it
              with third parties.
            </Text>
          </View>
        </ScrollView>

        {/* Allow All Button */}
        <TouchableOpacity
          style={[styles.allowButton, isRequesting && styles.allowButtonDisabled]}
          onPress={requestAllPermissions}
          disabled={isRequesting}
          activeOpacity={0.8}
        >
          <Text style={styles.allowButtonText}>
            {isRequesting ? 'Requesting...' : 'Allow All Permissions'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  permissionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  permissionIcon: {
    fontSize: 28,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  requiredBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  requiredBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  permissionDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  grantedIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  grantedIndicatorText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  permissionWhy: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  privacyIcon: {
    fontSize: 24,
  },
  privacyText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  allowButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 30,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  allowButtonDisabled: {
    opacity: 0.6,
  },
  allowButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#071E35',
    textAlign: 'center',
  },
});
