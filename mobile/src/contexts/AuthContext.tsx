import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  username: string;
  licensePlate: string;
  name?: string;
  avatarNumber: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, licensePlate: string) => Promise<void>;
  signup: (username: string, licensePlate: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Use environment variable with fallback
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.10.156:7392';

// Helper function for fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please check your internet connection');
    }
    throw error;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkStoredUser();
  }, []);

  const checkStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    }
  };

  const signup = async (username: string, licensePlate: string) => {
    try {
      setIsLoading(true);
      console.log('🔄 Attempting signup...', { username, licensePlate, API_URL });

      const response = await fetchWithTimeout(`${API_URL}/api/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          licensePlate: licensePlate.toUpperCase()
        }),
      }, 15000); // 15 second timeout

      const data = await response.json();
      console.log('📥 Signup response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      const userData: User = {
        username: data.user.username,
        licensePlate: data.user.licensePlate,
        name: data.user.name,
        avatarNumber: data.user.avatarNumber || 1,
      };

      await AsyncStorage.setItem('@user', JSON.stringify(userData));
      await AsyncStorage.setItem('@user_id', data.user._id);
      setUser(userData);

      console.log('✅ Signup successful:', username);
    } catch (error: any) {
      console.error('❌ Signup error:', error);

      // Better error messages
      if (error.message?.includes('timeout') || error.message?.includes('Network request failed')) {
        throw new Error('Nije moguće povezivanje sa serverom.\n\nProverite:\n• Da li je backend pokrenut (npm run dev)\n• Da li ste na istom WiFi-u\n• Da li firewall blokira port 7392');
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, licensePlate: string) => {
    try {
      setIsLoading(true);
      console.log('🔄 Attempting login...', { licensePlate, API_URL });

      const response = await fetchWithTimeout(`${API_URL}/api/users/login-plate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          licensePlate: licensePlate.toUpperCase()
        }),
      }, 15000); // 15 second timeout

      const data = await response.json();
      console.log('📥 Login response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const userData: User = {
        username: data.user.username,
        licensePlate: data.user.licensePlate,
        name: data.user.name,
        avatarNumber: data.user.avatarNumber || 1,
      };

      await AsyncStorage.setItem('@user', JSON.stringify(userData));
      await AsyncStorage.setItem('@user_id', data.user._id);
      setUser(userData);

      console.log('✅ Login successful with:', username);
    } catch (error: any) {
      console.error('❌ Login error:', error);

      // Better error messages
      if (error.message?.includes('timeout') || error.message?.includes('Network request failed')) {
        throw new Error('Nije moguće povezivanje sa serverom.\n\nProverite:\n• Da li je backend pokrenut (npm run dev)\n• Da li ste na istom WiFi-u\n• Da li firewall blokira port 7392');
      }

      // Pass through other errors as-is
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@user');
      await AsyncStorage.removeItem('@user_id');
      setUser(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
