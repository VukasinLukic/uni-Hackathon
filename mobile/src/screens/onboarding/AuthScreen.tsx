import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Animated,
  Dimensions,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

interface AuthScreenProps {
  onAuthComplete?: () => void;
}

export default function AuthScreen({ onAuthComplete }: AuthScreenProps) {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const { login, signup, isLoading } = useAuth();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');

  // License plate format: XX-XXX-XX (7 characters)
  const [char1, setChar1] = useState('');
  const [char2, setChar2] = useState('');
  const [char3, setChar3] = useState('');
  const [char4, setChar4] = useState('');
  const [char5, setChar5] = useState('');
  const [char6, setChar6] = useState('');
  const [char7, setChar7] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // Refs for inputs
  const usernameRef = useRef<TextInput>(null);
  const input1Ref = useRef<TextInput>(null);
  const input2Ref = useRef<TextInput>(null);
  const input3Ref = useRef<TextInput>(null);
  const input4Ref = useRef<TextInput>(null);
  const input5Ref = useRef<TextInput>(null);
  const input6Ref = useRef<TextInput>(null);
  const input7Ref = useRef<TextInput>(null);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleCharChange = (
    text: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    nextRef: React.RefObject<TextInput> | null
  ) => {
    const upperText = text.toUpperCase();
    if (upperText.length <= 1) {
      setter(upperText);
      setErrorMessage('');

      if (upperText.length === 1 && nextRef) {
        nextRef.current?.focus();
      }
    }
  };

  const handleKeyPress = (
    key: string,
    currentText: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    prevRef: React.RefObject<TextInput> | null
  ) => {
    if (key === 'Backspace' && currentText === '' && prevRef) {
      prevRef.current?.focus();
    }
  };

  const clearFields = () => {
    setChar1('');
    setChar2('');
    setChar3('');
    setChar4('');
    setChar5('');
    setChar6('');
    setChar7('');
    setUsername('');
  };

  const handleSubmit = async () => {
    const licensePlate = `${char1}${char2}-${char3}${char4}${char5}-${char6}${char7}`;

    // Validation
    if (!char1 || !char2 || !char3 || !char4 || !char5 || !char6 || !char7) {
      setErrorMessage('Please enter all license plate characters');
      shake();
      return;
    }

    // Check format (2 letters, dash, 3 numbers, dash, 2 letters)
    const isValid = /^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$/.test(licensePlate);

    if (!isValid) {
      setErrorMessage('Invalid format: Use AA-123-BB');
      shake();
      return;
    }

    // For signup, username is required
    if (!isLoginMode && !username.trim()) {
      setErrorMessage('Username is required for signup');
      shake();
      return;
    }

    try {
      if (isLoginMode) {
        // Login - only license plate
        await login('', licensePlate);
      } else {
        // Signup - username + license plate
        await signup(username.trim(), licensePlate);
      }

      console.log(`✅ ${isLoginMode ? 'Login' : 'Signup'} successful`);

      if (onAuthComplete) {
        onAuthComplete();
      } else {
        navigation.navigate('Permissions');
      }
    } catch (error: any) {
      console.error(`❌ ${isLoginMode ? 'Login' : 'Signup'} error:`, error);
      setErrorMessage(error.message || `${isLoginMode ? 'Login' : 'Signup'} failed. Try again.`);
      shake();
    }
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrorMessage('');
    clearFields();
    Keyboard.dismiss();
  };

  return (
    <LinearGradient colors={['#071E35', '#0D3654']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>PAVE PATROL</Text>
                <Text style={styles.subtitle}>{isLoginMode ? 'Welcome Back' : 'Create Account'}</Text>
              </View>

              {/* Tab Switcher */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, isLoginMode && styles.activeTab]}
                  onPress={() => !isLoginMode && switchMode()}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabText, isLoginMode && styles.activeTabText]}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, !isLoginMode && styles.activeTab]}
                  onPress={() => isLoginMode && switchMode()}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabText, !isLoginMode && styles.activeTabText]}>Sign Up</Text>
                </TouchableOpacity>
              </View>

              {/* Auth Form */}
              <View style={styles.formContainer}>
                {/* Username Input - Only for Sign Up */}
                {!isLoginMode && (
                  <View style={styles.usernameContainer}>
                    <Text style={styles.inputLabel}>
                      Username <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      ref={usernameRef}
                      style={styles.usernameInput}
                      value={username}
                      onChangeText={(text) => {
                        setUsername(text);
                        setErrorMessage('');
                      }}
                      placeholder="Choose your username"
                      placeholderTextColor="#999"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                      onSubmitEditing={() => input1Ref.current?.focus()}
                    />
                  </View>
                )}

                {/* License Plate Input - Format: AA-123-BB */}
                <View style={styles.plateSection}>
                  <Text style={styles.inputLabel}>
                    {isLoginMode ? 'Your License Plate' : 'License Plate'} <Text style={styles.required}>*</Text>
                  </Text>
                  <Animated.View style={[styles.plateContainer, { transform: [{ translateX: shakeAnimation }] }]}>
                    <View style={styles.plateRow}>
                      {/* First 2 letters */}
                      <TextInput
                        ref={input1Ref}
                        style={styles.plateChar}
                        maxLength={1}
                        value={char1}
                        onChangeText={(text) => handleCharChange(text, setChar1, input2Ref)}
                        onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, char1, setChar1, null)}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        keyboardType="default"
                        placeholder="A"
                        placeholderTextColor="#CCC"
                      />
                      <TextInput
                        ref={input2Ref}
                        style={styles.plateChar}
                        maxLength={1}
                        value={char2}
                        onChangeText={(text) => handleCharChange(text, setChar2, input3Ref)}
                        onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, char2, setChar2, input1Ref)}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        keyboardType="default"
                        placeholder="A"
                        placeholderTextColor="#CCC"
                      />

                      {/* Dash */}
                      <Text style={styles.dash}>-</Text>

                      {/* 3 numbers */}
                      <TextInput
                        ref={input3Ref}
                        style={styles.plateChar}
                        maxLength={1}
                        value={char3}
                        onChangeText={(text) => handleCharChange(text, setChar3, input4Ref)}
                        onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, char3, setChar3, input2Ref)}
                        keyboardType="number-pad"
                        placeholder="1"
                        placeholderTextColor="#CCC"
                      />
                      <TextInput
                        ref={input4Ref}
                        style={styles.plateChar}
                        maxLength={1}
                        value={char4}
                        onChangeText={(text) => handleCharChange(text, setChar4, input5Ref)}
                        onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, char4, setChar4, input3Ref)}
                        keyboardType="number-pad"
                        placeholder="2"
                        placeholderTextColor="#CCC"
                      />
                      <TextInput
                        ref={input5Ref}
                        style={styles.plateChar}
                        maxLength={1}
                        value={char5}
                        onChangeText={(text) => handleCharChange(text, setChar5, input6Ref)}
                        onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, char5, setChar5, input4Ref)}
                        keyboardType="number-pad"
                        placeholder="3"
                        placeholderTextColor="#CCC"
                      />

                      {/* Dash */}
                      <Text style={styles.dash}>-</Text>

                      {/* Last 2 letters */}
                      <TextInput
                        ref={input6Ref}
                        style={styles.plateChar}
                        maxLength={1}
                        value={char6}
                        onChangeText={(text) => handleCharChange(text, setChar6, input7Ref)}
                        onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, char6, setChar6, input5Ref)}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        keyboardType="default"
                        placeholder="B"
                        placeholderTextColor="#CCC"
                      />
                      <TextInput
                        ref={input7Ref}
                        style={styles.plateChar}
                        maxLength={1}
                        value={char7}
                        onChangeText={(text) => handleCharChange(text, setChar7, null)}
                        onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, char7, setChar7, input6Ref)}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        keyboardType="default"
                        onSubmitEditing={handleSubmit}
                        placeholder="B"
                        placeholderTextColor="#CCC"
                      />
                    </View>
                  </Animated.View>
                  <Text style={styles.formatHint}>Format: AA-123-BB</Text>
                </View>

                {/* Error Message */}
                {errorMessage ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
                  </View>
                ) : null}

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>
                    {isLoading ? (isLoginMode ? 'Logging in...' : 'Creating account...') : (isLoginMode ? 'Login' : 'Sign Up')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  By continuing, you agree to our Terms & Privacy
                </Text>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    marginTop: 30,
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Gajraj-One',
    fontSize: 36,
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontFamily: 'Bakbak-One',
    fontSize: 16,
    color: '#FFD975',
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 4,
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFD975',
  },
  tabText: {
    fontFamily: 'Bakbak-One',
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.6,
  },
  activeTabText: {
    color: '#071E35',
    opacity: 1,
  },
  formContainer: {
    marginBottom: 24,
  },
  usernameContainer: {
    marginBottom: 28,
  },
  inputLabel: {
    fontFamily: 'Bakbak-One',
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 10,
    marginLeft: 4,
  },
  required: {
    color: '#FF6B6B',
  },
  usernameInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Bakbak-One',
    color: '#071E35',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  plateSection: {
    marginBottom: 24,
  },
  plateContainer: {
    alignItems: 'center',
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  plateChar: {
    width: 38,
    height: 48,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    fontSize: 26,
    fontFamily: 'Bakbak-One',
    color: '#071E35',
    textAlign: 'center',
    paddingTop: 8,
  },
  dash: {
    fontSize: 28,
    fontFamily: 'Bakbak-One',
    color: '#071E35',
    fontWeight: '700',
    marginHorizontal: 2,
  },
  formatHint: {
    fontFamily: 'Bakbak-One',
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 10,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.4)',
  },
  errorText: {
    fontFamily: 'Bakbak-One',
    fontSize: 13,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#FFD975',
    paddingVertical: 18,
    borderRadius: 28,
    shadowColor: '#FFD975',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily: 'Bakbak-One',
    fontSize: 18,
    color: '#071E35',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
    paddingBottom: 10,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Bakbak-One',
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.4,
    textAlign: 'center',
  },
});
