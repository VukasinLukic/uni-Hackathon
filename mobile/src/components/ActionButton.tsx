import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';

interface ActionButtonProps {
  onTestMode: () => void;
  onTestBackend: () => void;
  onViewGraphs: () => void;
  onLegacyDemo?: () => void;
}

export default function ActionButton({ onTestMode, onTestBackend, onViewGraphs, onLegacyDemo }: ActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;

    Animated.spring(animation, {
      toValue,
      friction: 5,
      tension: 40,
      useNativeDriver: false, // height animation requires false
    }).start();

    setIsOpen(!isOpen);
  };

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    Animated.spring(animation, {
      toValue: 0,
      friction: 5,
      tension: 40,
      useNativeDriver: false,
    }).start();
    // Call action immediately
    action();
  };

  const menuHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, onLegacyDemo ? 270 : 200],
  });

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={styles.container}>
        {/* Menu Items */}
        <Animated.View style={[styles.menu, { height: menuHeight, opacity: animation }]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleAction(onTestMode)}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>🧪</Text>
            </View>
            <Text style={styles.menuText}>Test Mode</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleAction(onTestBackend)}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>🔌</Text>
            </View>
            <Text style={styles.menuText}>Test Backend</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleAction(onViewGraphs)}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>📊</Text>
            </View>
            <Text style={styles.menuText}>View Graphs</Text>
          </TouchableOpacity>

          {onLegacyDemo && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleAction(onLegacyDemo)}
            >
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>🎯</Text>
              </View>
              <Text style={styles.menuText}>Legacy Demo</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Main Action Button */}
        <TouchableOpacity
          style={[styles.actionButton, isOpen && styles.actionButtonOpen]}
          onPress={toggleMenu}
        >
          <Animated.Text style={[styles.actionButtonText, { transform: [{ rotate: rotation }] }]}>
            +
          </Animated.Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  menu: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    minWidth: 160,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f7',
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f5f5f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 18,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.3,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  actionButtonOpen: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '300',
  },
});
