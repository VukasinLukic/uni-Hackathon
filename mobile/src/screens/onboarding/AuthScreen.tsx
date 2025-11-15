import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../../store/useAppStore';

interface AuthScreenProps {
  onAuthComplete: () => void;
  onSkip: () => void;
}

export default function AuthScreen({ onAuthComplete, onSkip }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { setUser, setToken } = useAppStore();

  const handleAuth = async () => {
    // Validation
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      // const response = await fetch(`${API_URL}${endpoint}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });

      // Mock authentication - Replace with real backend
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockUser = {
        id: 'mock-user-1',
        email,
        name: email.split('@')[0],
        level: 1,
        xp: 0,
        totalDistance: 0,
        potholesDetected: 0,
      };

      const mockToken = 'mock-jwt-token-' + Date.now();

      // Save to AsyncStorage
      await AsyncStorage.setItem('@auth_token', mockToken);
      await AsyncStorage.setItem('@user', JSON.stringify(mockUser));

      // Update Zustand store
      setToken(mockToken);
      setUser(mockUser);

      console.log('✅ Authentication successful');
      onAuthComplete();
    } catch (error: any) {
      console.error('❌ Auth error:', error);
      Alert.alert('Error', error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#071E35', '#0A2942']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>PAVE PATROL</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Welcome Back!' : 'Join the Adventure'}
            </Text>
          </View>

          {/* Auth Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Confirm Password (Register only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleAuth}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#071E35" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle Login/Register */}
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => {
                setIsLogin(!isLogin);
                setConfirmPassword('');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleButtonText}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Text style={styles.toggleButtonTextBold}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Skip Button */}
            <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.7}>
              <Text style={styles.skipButtonText}>Skip for now →</Text>
            </TouchableOpacity>
          </View>

          {/* Info Text */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </KeyboardAvoidingView>
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
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 30,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    opacity: 0.9,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 30,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#071E35',
    textAlign: 'center',
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  toggleButtonTextBold: {
    fontWeight: '700',
    opacity: 1,
  },
  skipButton: {
    marginTop: 30,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.6,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.5,
    textAlign: 'center',
    lineHeight: 18,
  },
});
