import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAppStore } from '../store/useAppStore';

/**
 * Connectivity Banner - Shows offline/online status
 * Displays at top of screen when backend is unavailable
 */
export default function ConnectivityBanner() {
  const connectivity = useAppStore((state) => state.connectivity);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!connectivity.isBackendAvailable) {
      // Fade in when offline
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Fade out when online
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [connectivity.isBackendAvailable, fadeAnim]);

  // Don't render if backend is available
  if (connectivity.isBackendAvailable && fadeAnim.__getValue() === 0) {
    return null;
  }

  const lastSyncText = connectivity.lastSync
    ? `Last sync: ${new Date(connectivity.lastSync).toLocaleTimeString()}`
    : 'Never synced';

  const pendingCount = connectivity.pendingEvents.length;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>📴</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Offline Mode</Text>
          <Text style={styles.subtitle}>
            Using mock data • {pendingCount} pending events
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ff9800',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f57c00',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
