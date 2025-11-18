import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PrizeCardProps {
  title: string;
  description: string;
  gradientColors: [string, string];
  illustrationPosition: 'top-right' | 'left' | 'bottom-right';
  illustrationType: 'money' | 'car' | 'sponge';
  delay: number;
}

// Placeholder illustration components
const MoneyIllustration = () => (
  <View style={styles.moneyPlaceholder}>
    <View style={styles.bill} />
    <View style={[styles.bill, styles.bill2]} />
    <View style={styles.coin} />
    <View style={[styles.coin, styles.coin2]} />
  </View>
);

const CarIllustration = () => (
  <View style={styles.carPlaceholder}>
    <View style={styles.carBody} />
    <View style={styles.carWindow} />
    <View style={styles.carWheel} />
    <View style={[styles.carWheel, styles.carWheel2]} />
  </View>
);

const SpongeIllustration = () => (
  <View style={styles.spongePlaceholder}>
    <View style={styles.spongeBody} />
    <View style={styles.bubble} />
    <View style={[styles.bubble, styles.bubble2]} />
    <View style={[styles.bubble, styles.bubble3]} />
  </View>
);

const PrizeCard: React.FC<PrizeCardProps> = ({
  title,
  description,
  gradientColors,
  illustrationPosition,
  illustrationType,
  delay,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Card entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation for illustration
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -4,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const renderIllustration = () => {
    const AnimatedIllustration = Animated.createAnimatedComponent(View);

    let IllustrationComponent;
    switch (illustrationType) {
      case 'money':
        IllustrationComponent = MoneyIllustration;
        break;
      case 'car':
        IllustrationComponent = CarIllustration;
        break;
      case 'sponge':
        IllustrationComponent = SpongeIllustration;
        break;
    }

    return (
      <AnimatedIllustration
        style={[
          styles.illustrationContainer,
          { transform: [{ translateY: floatAnim }] },
        ]}
      >
        <IllustrationComponent />
      </AnimatedIllustration>
    );
  };

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View
          style={[
            styles.prizeCard,
            {
              backgroundColor: gradientColors[0],
              // Simple gradient simulation using shadow
              shadowColor: gradientColors[1],
            },
          ]}
        >
          {/* Top-right illustration (Money) */}
          {illustrationPosition === 'top-right' && (
            <View style={styles.topRightIllustration}>
              {renderIllustration()}
            </View>
          )}

          {/* Left illustration (Car) */}
          {illustrationPosition === 'left' && (
            <View style={styles.leftLayoutContainer}>
              <View style={styles.leftIllustration}>
                {renderIllustration()}
              </View>
              <View style={styles.leftContent}>
                <Text style={styles.prizeTitle}>{title}</Text>
              </View>
            </View>
          )}

          {/* Title (for non-left layouts) */}
          {illustrationPosition !== 'left' && (
            <Text style={styles.prizeTitle}>{title}</Text>
          )}

          {/* Description */}
          <Text style={styles.prizeDescription}>{description}</Text>

          {/* Bottom-right illustration (Sponge) */}
          {illustrationPosition === 'bottom-right' && (
            <View style={styles.bottomRightIllustration}>
              {renderIllustration()}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const PrizesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Map Background Pattern */}
      <View style={styles.mapBackground}>
        <View style={styles.mapLine} />
        <View style={[styles.mapLine, styles.mapLine2]} />
        <View style={[styles.mapLine, styles.mapLine3]} />
        <View style={[styles.mapLine, styles.mapLine4]} />
        <View style={[styles.mapLine, styles.mapLineVertical]} />
        <View style={[styles.mapLine, styles.mapLineVertical2]} />
        <View style={[styles.mapLine, styles.mapLineVertical3]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>YOUR PRIZES</Text>
        </View>

        {/* Prize Cards */}
        <PrizeCard
          title="CASH PRIZE"
          description={`Claim your cash prize of\n250 RON at any Posta\nRomana location`}
          gradientColors={['#c6f384', '#8cd85c']}
          illustrationPosition="top-right"
          illustrationType="money"
          delay={0}
        />

        <PrizeCard
          title="PARKING"
          description={`1 coupon for free parking\nin green zone of Timpark\nparking system`}
          gradientColors={['#f3e36c', '#d5c445']}
          illustrationPosition="left"
          illustrationType="car"
          delay={200}
        />

        <PrizeCard
          title="CAR WASH"
          description={`1 coupon for free car wash\nat any local washing\nservice`}
          gradientColors={['#82a5ff', '#3d70c9']}
          illustrationPosition="bottom-right"
          illustrationType="sponge"
          delay={400}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#082b45',
  },
  mapBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  mapLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#1a5a7a',
    width: '100%',
    top: '15%',
  },
  mapLine2: {
    top: '35%',
    width: '80%',
    left: '10%',
  },
  mapLine3: {
    top: '55%',
    width: '90%',
  },
  mapLine4: {
    top: '75%',
    width: '70%',
    left: '15%',
  },
  mapLineVertical: {
    width: 2,
    height: '100%',
    left: '25%',
  },
  mapLineVertical2: {
    width: 2,
    height: '100%',
    left: '50%',
  },
  mapLineVertical3: {
    width: 2,
    height: '100%',
    left: '75%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  screenTitle: {
    fontSize: 32,
    fontFamily: 'Gajraj-One',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardWrapper: {
    marginBottom: 24,
  },
  prizeCard: {
    borderRadius: 40,
    padding: 28,
    minHeight: 220,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    // Inner glow simulation
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  prizeTitle: {
    fontSize: 36,
    fontFamily: 'Gajraj-One',
    color: '#000000',
    letterSpacing: 1.5,
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  prizeDescription: {
    fontSize: 20,
    fontFamily: 'Bakbak-One',
    color: '#000000',
    lineHeight: 28,
    maxWidth: '75%',
  },
  // Illustration containers
  illustrationContainer: {
    // Container for animated illustrations
  },
  topRightIllustration: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  leftLayoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  leftIllustration: {
    marginRight: 20,
  },
  leftContent: {
    flex: 1,
  },
  bottomRightIllustration: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  // Money Illustration
  moneyPlaceholder: {
    width: 80,
    height: 80,
    position: 'relative',
  },
  bill: {
    width: 50,
    height: 30,
    backgroundColor: '#2ecc71',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#27ae60',
    position: 'absolute',
    top: 0,
    left: 5,
  },
  bill2: {
    top: 8,
    left: 10,
    backgroundColor: '#3dd672',
  },
  coin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1c40f',
    borderWidth: 3,
    borderColor: '#f39c12',
    position: 'absolute',
    bottom: 5,
    right: 15,
  },
  coin2: {
    bottom: 12,
    right: 5,
    backgroundColor: '#ffd93d',
  },
  // Car Illustration
  carPlaceholder: {
    width: 100,
    height: 60,
    position: 'relative',
  },
  carBody: {
    width: 90,
    height: 35,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    position: 'absolute',
    bottom: 8,
    left: 5,
    borderWidth: 2,
    borderColor: '#c0392b',
  },
  carWindow: {
    width: 35,
    height: 18,
    backgroundColor: '#3498db',
    borderRadius: 6,
    position: 'absolute',
    top: 5,
    left: 25,
    borderWidth: 2,
    borderColor: '#2980b9',
  },
  carWheel: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2c3e50',
    borderWidth: 2,
    borderColor: '#1a252f',
    position: 'absolute',
    bottom: 0,
    left: 15,
  },
  carWheel2: {
    left: 65,
  },
  // Sponge Illustration
  spongePlaceholder: {
    width: 70,
    height: 70,
    position: 'relative',
  },
  spongeBody: {
    width: 45,
    height: 35,
    backgroundColor: '#f1c40f',
    borderRadius: 8,
    position: 'absolute',
    bottom: 10,
    left: 10,
    borderWidth: 2,
    borderColor: '#f39c12',
  },
  bubble: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: '#3498db',
    position: 'absolute',
    top: 5,
    right: 15,
  },
  bubble2: {
    width: 12,
    height: 12,
    borderRadius: 6,
    top: 0,
    right: 5,
  },
  bubble3: {
    width: 14,
    height: 14,
    borderRadius: 7,
    top: 15,
    right: 25,
  },
});
