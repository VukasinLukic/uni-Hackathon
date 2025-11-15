# 🌐 AUTH0 FRONTEND (WEB) INTEGRATION GUIDE

## 📋 OVERVIEW
This guide will help you integrate Auth0 authentication into the React web application.

---

## ✅ PREREQUISITES

### Auth0 Dashboard Configuration:
1. **Application Type**: Single Page Application (SPA)
2. **Domain**: `dev-u0mn320118yum8qm.us.auth0.com`
3. **Client ID**: `KW9nRPYtj4LyMKePzFe7jDvmbEfftFmB`
4. **Audience**: `https://api.roadsense.com`

### Required Callback URLs in Auth0:
```
http://localhost:3000
http://localhost:3000/callback
```

### Required Logout URLs in Auth0:
```
http://localhost:3000
```

### Allowed Web Origins:
```
http://localhost:3000
```

---

## 🔧 STEP 1: INSTALL DEPENDENCIES

```bash
cd web
npm install @auth0/auth0-react
```

---

## 🔧 STEP 2: CREATE `.env` FILE

Create `web/.env` file with:

```env
VITE_AUTH0_DOMAIN=dev-u0mn320118yum8qm.us.auth0.com
VITE_AUTH0_CLIENT_ID=KW9nRPYtj4LyMKePzFe7jDvmbEfftFmB
VITE_AUTH0_AUDIENCE=https://api.roadsense.com
VITE_API_URL=http://localhost:7392
```

---

## 🔧 STEP 3: SETUP AUTH0 PROVIDER

Update your `App.tsx` or `main.tsx`:

```typescript
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }}
        cacheLocation="localstorage"
      >
        {/* Your app components */}
      </Auth0Provider>
    </BrowserRouter>
  );
}
```

---

## 🔧 STEP 4: CREATE AUTH HOOK

Create `src/hooks/useRoadsenseAuth.ts`:

```typescript
import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

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

export const useRoadsenseAuth = () => {
  const {
    isAuthenticated,
    isLoading,
    user: auth0User,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [roadsenseUser, setRoadsenseUser] = useState<RoadsenseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncUser = async () => {
      if (isAuthenticated && auth0User) {
        try {
          // Get Auth0 token
          const token = await getAccessTokenSilently();

          // Send to backend to create/sync user
          const response = await fetch(`${API_URL}/api/auth/auth0/callback`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Failed to sync user');
          }

          const data = await response.json();

          // Save our backend token
          setAccessToken(data.accessToken);
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          setRoadsenseUser(data.user);
        } catch (err: any) {
          console.error('User sync error:', err);
          setError(err.message);
        }
      }
    };

    syncUser();
  }, [isAuthenticated, auth0User, getAccessTokenSilently]);

  const login = async () => {
    await loginWithRedirect({
      appState: { returnTo: window.location.pathname },
    });
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setRoadsenseUser(null);
    setAccessToken(null);
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return {
    isAuthenticated,
    isLoading,
    user: roadsenseUser,
    accessToken,
    error,
    login,
    logout,
  };
};
```

---

## 🔧 STEP 5: CREATE API CLIENT

Create `src/utils/apiClient.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL;

export const apiClient = {
  async get(endpoint: string) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  },

  async post(endpoint: string, data: any) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
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
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
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

## 🔧 STEP 6: CREATE LOGIN COMPONENT

Create `src/components/LoginButton.tsx`:

```typescript
import { useRoadsenseAuth } from '../hooks/useRoadsenseAuth';

export const LoginButton = () => {
  const { isAuthenticated, isLoading, user, login, logout } = useRoadsenseAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {user.avatarUrl && (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div>
            <p className="font-medium">{user.username}</p>
            <p className="text-sm text-gray-500">Level {user.level} • {user.totalXP} XP</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Login with Auth0
    </button>
  );
};
```

---

## 🔧 STEP 7: EXAMPLE API USAGE

```typescript
import { apiClient } from '../utils/apiClient';
import { useRoadsenseAuth } from '../hooks/useRoadsenseAuth';

function MyRewardsPage() {
  const { user, isAuthenticated } = useRoadsenseAuth();
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadRewards();
    }
  }, [isAuthenticated]);

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
      console.log('QR Code:', data.qrCodeData);
      // Show QR code modal
    } catch (error) {
      console.error('Failed to redeem reward:', error);
    }
  };

  return (
    <div>
      <h1>My Rewards</h1>
      <p>XP: {user?.totalXP}</p>
      {/* Render rewards */}
    </div>
  );
}
```

---

## 🎯 AVAILABLE BACKEND ENDPOINTS

### Authentication:
- `POST /api/auth/auth0/callback` - Sync Auth0 user (called automatically by hook)
- `GET /api/auth/me` - Get current user profile

### XP & Achievements:
- `GET /api/xp/level-progress` - Get level progress
- `GET /api/achievements` - Get all achievements
- `GET /api/achievements/user` - Get user achievements

### Leaderboards:
- `GET /api/leaderboards/:period/:category` - Get leaderboard
- `GET /api/leaderboards/user-rank/:period/:category` - Get user rank

### Rewards:
- `GET /api/rewards` - Get all rewards
- `POST /api/rewards/:rewardId/redeem` - Redeem reward
- `GET /api/rewards/active` - Get active redemptions
- `GET /api/rewards/stats` - Get redemption stats

### Drive Sessions:
- `POST /api/drives/start` - Start drive session
- `POST /api/drives/:sessionId/track` - Track location
- `POST /api/drives/:sessionId/end` - End session

### Exploration:
- `POST /api/exploration/explore` - Mark cell as explored
- `GET /api/exploration/user/:userId` - Get user exploration data

---

## 🐛 TROUBLESHOOTING

### Error: "User not found"
- Make sure you're calling `/api/auth/auth0/callback` after Auth0 login
- Check that the Auth0 token is valid

### Error: "Invalid token"
- Token may have expired, try logging out and back in
- Check that the audience is set correctly

### CORS errors:
- Make sure backend `.env` has `FRONTEND_URL=http://localhost:3000`
- Check that `ALLOW_ALL_ORIGINS=true` in development

---

## ✅ TESTING

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd web && npm run dev`
3. Click "Login with Auth0"
4. Select Google/Facebook/Email provider
5. After redirect, you should see your user info
6. Check console for user sync success
7. Try making API calls

---

## 📝 NOTES

- **Access tokens** are stored in localStorage
- **Refresh tokens** are also stored (for future token renewal)
- The hook automatically syncs user on login
- All API calls use the backend JWT token (not Auth0 token)
