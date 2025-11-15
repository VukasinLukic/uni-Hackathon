import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideDownAnim = useRef(new Animated.Value(-30)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Sequence: Background loads → Title fades in → Button appears
    Animated.sequence([
      // Wait for background to settle
      Animated.delay(500),

      // Title animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(slideDownAnim, {
          toValue: 0,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),

      // Wait a bit
      Animated.delay(300),

      // Button animation
      Animated.parallel([
        Animated.timing(buttonFadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <ImageBackground
      source={require('../../../assets/images/pozadina.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Dark overlay for better text visibility */}
      <View style={styles.overlay} />

      {/* Content */}
      <SafeAreaView style={styles.safeArea}>
        {/* Logo/Title at Top */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideDownAnim }],
            },
          ]}
        >
          <Text style={styles.title}>PAVE PATROL</Text>
        </Animated.View>

        {/* Spacer to push button down */}
        <View style={styles.spacer} />

        {/* Start Button - Positioned at x:86, y:285 from design */}
        <Animated.View
          style={[
            styles.buttonWrapper,
            {
              opacity: buttonFadeAnim,
              transform: [{ scale: buttonScaleAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.startButton}
            onPress={onGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>start</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Dark overlay for text readability
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  title: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  spacer: {
    flex: 1,
  },
  buttonWrapper: {
    position: 'absolute',
    left: '60%',
    marginLeft: -95,
    top: 280,
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 60,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#071E35',
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
});
