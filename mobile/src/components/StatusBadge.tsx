import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppStore } from '../store/useAppStore';

interface StatusBadgeProps {
  size?: 'small' | 'medium';
  showText?: boolean;
}

/**
 * Status Badge - Shows online/offline status indicator
 * Can be used in headers, settings, etc.
 */
export default function StatusBadge({ size = 'small', showText = true }: StatusBadgeProps) {
  const isOnline = useAppStore((state) => state.connectivity.isBackendAvailable);

  const dotSize = size === 'small' ? 8 : 12;
  const fontSize = size === 'small' ? 13 : 15;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            backgroundColor: isOnline ? '#4caf50' : '#ff9800',
          },
        ]}
      />
      {showText && (
        <Text style={[styles.text, { fontSize }]}>
          {isOnline ? 'Online' : 'Offline'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    borderRadius: 999,
  },
  text: {
    color: '#8e8e93',
    fontWeight: '500',
  },
});
