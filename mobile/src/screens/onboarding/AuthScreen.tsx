import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';

interface AuthScreenProps {
  onAuthComplete: () => void;
  onSkip: () => void;
}

export default function AuthScreen({ onAuthComplete, onSkip }: AuthScreenProps) {
  const { login, isLoading } = useAuth();
  const [licensePlate, setLicensePlate] = useState('');

  const handleLogin = async () => {
    if (!licensePlate.trim()) {
      Alert.alert('Error', 'Please enter your license plate');
      return;
    }

    try {
      await login(licensePlate.trim());
      console.log('✅ Login successful');
      onAuthComplete();
    } catch (error: any) {
      console.error('❌ Login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
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
            <Text style={styles.subtitle}>Join the Adventure</Text>
          </View>

          {/* Auth Form */}
          <View style={styles.formContainer}>
            <Text style={styles.description}>
              Enter your vehicle license plate to continue
            </Text>

            {/* License Plate Input */}
            <TextInput
              style={styles.input}
              placeholder="e.g. BG-123-AB"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={licensePlate}
              onChangeText={setLicensePlate}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!isLoading}
            />

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Logging in...' : 'Continue'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.infoText}>
              Your license plate is your username
            </Text>

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
    paddingHorizontal: 30,
  },
  keyboardView: {
    flex: 1,
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
    justifyContent: 'center',
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    borderRadius: 30,
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
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 18,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    textAlign: 'center',
    fontWeight: '600',
  },
});
