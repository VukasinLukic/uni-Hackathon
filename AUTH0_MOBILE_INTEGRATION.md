# 📱 AUTH0 MOBILE (REACT NATIVE) INTEGRATION GUIDE

## 📋 OVERVIEW
This guide will help you integrate Auth0 authentication into the React Native mobile application.

---

## ✅ PREREQUISITES

### Auth0 Dashboard Configuration:
1. **Application Type**: Native
2. **Domain**: `dev-u0mn320118yum8qm.us.auth0.com`
3. **Client ID**: `47AZSSNUdbi7yYL8oNz5G38JtajBYo5P`
4. **Audience**: `https://api.roadsense.com`

### Required Callback URLs in Auth0:
```
com.roadsense://dev-u0mn320118yum8qm.us.auth0.com/ios/com.roadsense/callback
com.roadsense://dev-u0mn320118yum8qm.us.auth0.com/android/com.roadsense/callback
```

### Required Logout URLs in Auth0:
```
com.roadsense://dev-u0mn320118yum8qm.us.auth0.com/ios/com.roadsense/callback
com.roadsense://dev-u0mn320118yum8qm.us.auth0.com/android/com.roadsense/callback
```

---

## 🔧 STEP 1: INSTALL DEPENDENCIES

```bash
cd mobile
npm install react-native-auth0
npx pod-install  # iOS only
```

---

## 🔧 STEP 2: CREATE `.env` FILE

Create `mobile/.env` file with:

```env
AUTH0_DOMAIN=dev-u0mn320118yum8qm.us.auth0.com
AUTH0_CLIENT_ID=47AZSSNUdbi7yYL8oNz5G38JtajBYo5P
AUTH0_AUDIENCE=https://api.roadsense.com
API_URL=http://localhost:7392
```

**For production**, use your production API URL (e.g., `https://api.roadsense.com`)

---

## 🔧 STEP 3: CONFIGURE APP FOR AUTH0

### Option A: Expo (Recommended)

Update `app.json`:

```json
{
  "expo": {
    "name": "RoadSense",
    "slug": "roadsense",
    "scheme": "com.roadsense",
    "plugins": [
      [
        "react-native-auth0",
        {
          "domain": "dev-u0mn320118yum8qm.us.auth0.com"
        }
      ]
    ]
  }
}
```

Then rebuild:

```bash
npx expo prebuild
npx expo run:android
# or
npx expo run:ios
```

### Option B: Bare React Native

#### iOS Configuration (`ios/RoadSense/Info.plist`):

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>None</string>
        <key>CFBundleURLName</key>
        <string>auth0</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.roadsense</string>
        </array>
    </dict>
</array>
```

#### Android Configuration (`android/app/src/main/AndroidManifest.xml`):

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application>
        <activity
            android:name=".MainActivity"
            android:launchMode="singleTask">
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:host="dev-u0mn320118yum8qm.us.auth0.com"
                    android:pathPrefix="/android/com.roadsense/callback"
                    android:scheme="com.roadsense" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

---

## 🔧 STEP 4: CREATE AUTH CONTEXT

Create `src/contexts/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import Auth0 from 'react-native-auth0';
import AsyncStorage from '@react-native-async-storage/async-storage';

const auth0 = new Auth0({
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_CLIENT_ID!,
});

const API_URL = process.env.API_URL;

interface RoadsenseUser {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  level: number;
  currentXP: number;
  totalXP: number;
  stats: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: RoadsenseUser | null;
  accessToken: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<RoadsenseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        setAccessToken(token);
        await loadUser();
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Load user error:', err);
    }
  };

  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Login with Auth0
      const credentials = await auth0.webAuth.authorize({
        scope: 'openid profile email',
        audience: process.env.AUTH0_AUDIENCE,
      });

      // Send Auth0 token to backend
      const response = await fetch(`${API_URL}/api/auth/auth0/callback`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate with backend');
      }

      const data = await response.json();

      // Save our backend tokens
      await AsyncStorage.setItem('accessToken', data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);

      setAccessToken(data.accessToken);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await auth0.webAuth.clearSession();
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');

      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        accessToken,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## 🔧 STEP 5: WRAP APP WITH AUTH PROVIDER

Update `App.tsx`:

```typescript
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      {/* Your app navigation */}
    </AuthProvider>
  );
}
```

---

## 🔧 STEP 6: CREATE API CLIENT

Create `src/utils/apiClient.ts`:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.API_URL;

export const apiClient = {
  async get(endpoint: string) {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  },

  async post(endpoint: string, data: any) {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  },

  async put(endpoint: string, data: any) {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  },

  async delete(endpoint: string) {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  },
};
```

---

## 🔧 STEP 7: CREATE LOGIN SCREEN

Create `src/screens/LoginScreen.tsx`:

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export const LoginScreen = () => {
  const { login, isLoading, error } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to RoadSense</Text>
      <Text style={styles.subtitle}>
        Report potholes, earn rewards, make a difference
      </Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={styles.button}
        onPress={login}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login with Auth0</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0066cc',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    minWidth: 200,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 20,
  },
});
```

---

## 🔧 STEP 8: EXAMPLE API USAGE

```typescript
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/apiClient';

function RewardsScreen() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const data = await apiClient.get('/api/rewards');
      setRewards(data.rewards);
    } catch (error) {
      console.error('Failed to load rewards:', error);
    }
  };

  const redeemReward = async (rewardId: string) => {
    try {
      const data = await apiClient.post(`/api/rewards/${rewardId}/redeem`, {});
      // Show QR code with data.qrCodeData
      console.log('QR Code:', data.qrCodeData);
    } catch (error) {
      console.error('Failed to redeem:', error);
    }
  };

  return (
    <View>
      <Text>Your XP: {user?.totalXP}</Text>
      {/* Render rewards */}
    </View>
  );
}
```

---

## 🔧 STEP 9: LOCATION TRACKING EXAMPLE

```typescript
import * as Location from 'expo-location';
import { apiClient } from '../utils/apiClient';

const startDriveSession = async () => {
  // Request location permission
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    alert('Location permission required');
    return;
  }

  // Start session
  const { session } = await apiClient.post('/api/drives/start', {
    startLocation: {
      latitude: 45.0,
      longitude: 19.0,
    },
  });

  // Track location every 5 seconds
  const locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10,
    },
    async (location) => {
      await apiClient.post(`/api/drives/${session._id}/track`, {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        speed: location.coords.speed,
      });
    }
  );

  return { sessionId: session._id, locationSubscription };
};

const endDriveSession = async (sessionId: string, subscription: any) => {
  subscription.remove();

  const { session, achievements } = await apiClient.post(
    `/api/drives/${sessionId}/end`,
    {}
  );

  console.log('Drive completed!', session);
  console.log('New achievements:', achievements);
};
```

---

## 🎯 AVAILABLE BACKEND ENDPOINTS

All endpoints same as web (see `AUTH0_FRONTEND_INTEGRATION.md`)

---

## 🐛 TROUBLESHOOTING

### Error: "Callback URL mismatch"
- Check that your callback URL in Auth0 dashboard matches exactly
- Make sure `scheme` in `app.json` is `com.roadsense`

### Error: "User not found"
- Make sure the `/api/auth/auth0/callback` request is completing
- Check network logs for errors

### Location not working:
- Request permissions: `Location.requestForegroundPermissionsAsync()`
- For iOS: Add `NSLocationWhenInUseUsageDescription` to `Info.plist`
- For Android: Add permissions to `AndroidManifest.xml`

---

## ✅ TESTING

### iOS:
```bash
npx expo run:ios
```

### Android:
```bash
npx expo run:android
```

### Test Flow:
1. Click "Login with Auth0"
2. Browser opens with Auth0 login
3. Select Google/Facebook/Email
4. App redirects back after login
5. User profile appears
6. Try API calls (rewards, leaderboards, etc.)

---

## 📝 PRODUCTION CHECKLIST

- [ ] Update `API_URL` to production URL
- [ ] Add production callback URLs to Auth0
- [ ] Configure deep linking for production app
- [ ] Test on real devices (iOS & Android)
- [ ] Add error handling for network failures
- [ ] Implement token refresh logic
- [ ] Add biometric authentication (optional)

---

## 📝 NOTES

- Access tokens are stored in AsyncStorage
- Tokens automatically included in all API calls
- Auth0 handles all social login flows
- Backend JWT tokens used for API authentication
