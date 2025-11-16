import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

type PermissionsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Permissions'>;

interface PermissionsScreenProps {
  onComplete?: () => void;
}

export default function PermissionsScreen({ onComplete }: PermissionsScreenProps) {
  const navigation = useNavigation<PermissionsScreenNavigationProp>();
  const [isRequesting, setIsRequesting] = useState(false);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Popup entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const requestLocationPermission = async () => {
    try {
      // EXPO GO MODE: Simulate permission grant
      console.log('⚠️ Expo Go detected - simulating location permission grant');
      await new Promise(resolve => setTimeout(resolve, 800));
      return true;
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

      // Camera (optional)
      const cameraGranted = await requestCameraPermission();

      if (locationGranted) {
        console.log('✅ All required permissions granted');

        // Exit animation
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(async () => {
          // Mark onboarding as completed
          await AsyncStorage.setItem('@onboarding_completed', 'true');

          setTimeout(() => {
            if (onComplete) {
              onComplete();
            } else {
              navigation.navigate('Home');
            }
          }, 100);
        });
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

  const handleNo = () => {
    Alert.alert('Permission Required', 'Location is required to use this app.');
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/image-4.png')}
      style={styles.background}
      resizeMode="cover"
      blurRadius={2}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Popup Card with Animation */}
          <Animated.View
            style={[
              styles.card,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            {/* Location Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📍</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>Location</Text>

            {/* Description */}
            <Text style={styles.description}>
              Location permission is needed to give us your location
            </Text>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.noButton}
                onPress={handleNo}
                activeOpacity={0.7}
              >
                <Text style={styles.noButtonText}>nooo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.yesButton, isRequesting && styles.buttonDisabled]}
                onPress={requestAllPermissions}
                disabled={isRequesting}
                activeOpacity={0.7}
              >
                <Text style={styles.yesButtonText}>
                  {isRequesting ? 'yessiir...' : 'yessirski'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Darker overlay
  },
  card: {
    backgroundColor: '#E8F34F',
    borderRadius: 24,
    padding: 30,
    width: width - 100, // Smaller card
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontFamily: 'Bakbak-One',
    fontSize: 28,
    color: '#0A1F3D',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Bakbak-One',
    fontSize: 14,
    color: '#0A1F3D',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    opacity: 0.8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  noButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0A1F3D',
  },
  noButtonText: {
    fontFamily: 'Bakbak-One',
    fontSize: 16,
    color: '#0A1F3D',
    textAlign: 'center',
  },
  yesButton: {
    flex: 1,
    backgroundColor: '#0A1F3D',
    paddingVertical: 14,
    borderRadius: 16,
  },
  yesButtonText: {
    fontFamily: 'Bakbak-One',
    fontSize: 16,
    color: '#E8F34F',
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
