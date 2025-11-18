# PavePatrol Implementation Roadmap

This document provides a step-by-step implementation guide for building the PavePatrol gamified pothole detection system.

---

## Current Status

✅ **Completed:**
- Basic mobile app with minimalist UI design
- Driving Mode with automatic pothole detection
- Walking Mode with camera integration
- Sensor integration (accelerometer, gyroscope, GPS)
- Backend API for pothole events
- Event clustering algorithm
- Test Mode for debugging
- Legacy demo preservation

🔄 **In Progress:**
- Architecture planning
- Implementation roadmap

---

## Phase 1: Backend Foundation (Week 1-2)

### 1.1 Database Setup
**Files to create:**
- `backend/src/models/User.ts`
- `backend/src/models/Achievement.ts`
- `backend/src/models/UserAchievement.ts`
- `backend/src/models/Exploration.ts`
- `backend/src/models/Reward.ts`
- `backend/src/models/UserReward.ts`
- `backend/src/models/DriveSession.ts`

**Tasks:**
- [ ] Install Mongoose: `npm install mongoose @types/mongoose`
- [ ] Define User schema with level, XP, stats
- [ ] Define Achievement schema
- [ ] Define Exploration schema (fog of war cells)
- [ ] Define Reward schemas
- [ ] Define DriveSession schema
- [ ] Create indexes for performance

**Example User Model:**
```typescript
// backend/src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  username: string;
  passwordHash: string;
  avatarUrl?: string;
  level: number;
  currentXP: number;
  totalXP: number;
  stats: {
    totalDistance: number;
    potholesDetected: number;
    verifiedDetections: number;
    explorationPercentage: number;
    currentStreak: number;
    longestStreak: number;
  };
  settings: {
    notifications: boolean;
    sensorSensitivity: 'low' | 'medium' | 'high';
    shareDataAnonymously: boolean;
  };
  createdAt: Date;
  lastActiveAt: Date;
}

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  avatarUrl: String,
  level: { type: Number, default: 1 },
  currentXP: { type: Number, default: 0 },
  totalXP: { type: Number, default: 0 },
  stats: {
    totalDistance: { type: Number, default: 0 },
    potholesDetected: { type: Number, default: 0 },
    verifiedDetections: { type: Number, default: 0 },
    explorationPercentage: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
  },
  settings: {
    notifications: { type: Boolean, default: true },
    sensorSensitivity: { type: String, default: 'medium' },
    shareDataAnonymously: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);
```

### 1.2 Authentication System
**Files to create:**
- `backend/src/middleware/auth.ts`
- `backend/src/controllers/authController.ts`
- `backend/src/routes/authRoutes.ts`

**Tasks:**
- [ ] Install dependencies: `npm install bcrypt jsonwebtoken @types/bcrypt @types/jsonwebtoken`
- [ ] Create JWT authentication middleware
- [ ] Implement register endpoint
- [ ] Implement login endpoint
- [ ] Implement logout endpoint
- [ ] Add password hashing with bcrypt
- [ ] Add JWT token generation

**Example Auth Middleware:**
```typescript
// backend/src/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 1.3 XP & Level Service
**Files to create:**
- `backend/src/services/xpService.ts`
- `backend/src/services/levelService.ts`
- `backend/src/controllers/xpController.ts`
- `backend/src/routes/xpRoutes.ts`

**Tasks:**
- [ ] Create XP calculation functions
- [ ] Implement level-up logic
- [ ] Create XP award endpoint
- [ ] Add level title mapping
- [ ] Implement XP history tracking

**Example:**
```typescript
// backend/src/services/levelService.ts
export class LevelService {
  static calculateRequiredXP(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  static getLevelTitle(level: number): string {
    if (level < 5) return 'Rookie Explorer';
    if (level < 10) return 'Road Scout';
    if (level < 20) return 'Pothole Hunter';
    if (level < 30) return 'Street Surveyor';
    return 'Master Cartographer';
  }

  static async awardXP(userId: string, amount: number, reason: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.currentXP += amount;
    user.totalXP += amount;

    // Check for level up
    const requiredXP = this.calculateRequiredXP(user.level);
    if (user.currentXP >= requiredXP) {
      user.level += 1;
      user.currentXP -= requiredXP;
      // Trigger level up event/notification
    }

    await user.save();
    return user;
  }
}
```

---

## Phase 2: Frontend Authentication & Profile (Week 2-3)

### 2.1 Authentication Screens
**Files to create:**
- `mobile/src/screens/WelcomeScreen.tsx`
- `mobile/src/screens/FeatureSlider.tsx`
- `mobile/src/screens/AuthScreen.tsx`
- `mobile/src/screens/PermissionsScreen.tsx`
- `mobile/src/services/authService.ts`

**Tasks:**
- [ ] Create Welcome screen with logo animation
- [ ] Build feature slider (3 cards)
- [ ] Implement login/register form
- [ ] Add form validation
- [ ] Create auth service with token storage
- [ ] Implement permissions request flow
- [ ] Add guest mode option

**Example Auth Service:**
```typescript
// mobile/src/services/authService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://10.0.10.157:5001/api/auth';

export class AuthService {
  static async register(email: string, username: string, password: string) {
    const response = await axios.post(`${API_URL}/register`, {
      email,
      username,
      password,
    });

    await AsyncStorage.setItem('token', response.data.token);
    return response.data.user;
  }

  static async login(email: string, password: string) {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });

    await AsyncStorage.setItem('token', response.data.token);
    return response.data.user;
  }

  static async logout() {
    await AsyncStorage.removeItem('token');
  }

  static async getToken() {
    return await AsyncStorage.getItem('token');
  }

  static async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }
}
```

### 2.2 User Profile Screen
**Files to create:**
- `mobile/src/screens/ProfileScreen.tsx`
- `mobile/src/components/StatsOverview.tsx`
- `mobile/src/components/LevelProgressBar.tsx`

**Tasks:**
- [ ] Create profile layout
- [ ] Display user stats
- [ ] Show level and XP bar
- [ ] Add settings navigation
- [ ] Implement avatar display

---

## Phase 3: Drive Sessions & XP (Week 3-4)

### 3.1 Backend Drive Session Management
**Files to create:**
- `backend/src/controllers/driveController.ts`
- `backend/src/routes/driveRoutes.ts`
- `backend/src/services/driveService.ts`

**Tasks:**
- [ ] Create drive session start endpoint
- [ ] Implement location tracking updates
- [ ] Create drive end endpoint with XP calculation
- [ ] Calculate distance driven
- [ ] Award XP based on: distance, potholes, new cells explored
- [ ] Store drive session history

**XP Calculation Logic:**
```typescript
// backend/src/services/driveService.ts
export class DriveService {
  static async endDrive(sessionId: string) {
    const session = await DriveSession.findById(sessionId);
    const user = await User.findById(session.userId);

    // Calculate XP
    const distanceXP = Math.floor(session.distance * 10); // 10 XP per km
    const potholeXP = session.potholesDetected * 100; // 100 XP per pothole
    const explorationXP = session.newCellsExplored * 50; // 50 XP per new cell

    const totalXP = distanceXP + potholeXP + explorationXP;

    // Award XP
    await LevelService.awardXP(user._id, totalXP, 'drive_completed');

    // Update user stats
    user.stats.totalDistance += session.distance;
    user.stats.potholesDetected += session.potholesDetected;
    await user.save();

    return { totalXP, breakdown: { distanceXP, potholeXP, explorationXP } };
  }
}
```

### 3.2 Frontend Drive Flow
**Files to update:**
- `mobile/src/screens/DrivingModeScreen.tsx` (enhance existing)
**Files to create:**
- `mobile/src/screens/PostDriveSummary.tsx`
- `mobile/src/services/driveSessionService.ts`

**Tasks:**
- [ ] Add drive session tracking to existing DrivingModeScreen
- [ ] Track distance during drive
- [ ] Create post-drive summary screen
- [ ] Display XP earned with animation
- [ ] Show drive statistics
- [ ] Add share functionality

---

## Phase 4: Fog of War Map (Week 4-5)

### 4.1 Backend Exploration Service
**Files to create:**
- `backend/src/services/explorationService.ts`
- `backend/src/controllers/explorationController.ts`
- `backend/src/routes/explorationRoutes.ts`

**Tasks:**
- [ ] Implement grid cell calculation
- [ ] Create update explored cells endpoint
- [ ] Calculate road quality per cell
- [ ] Store exploration data
- [ ] Calculate exploration percentage

**Grid Cell Logic:**
```typescript
// backend/src/services/explorationService.ts
export class ExplorationService {
  static CELL_SIZE = 0.001; // ~100m

  static calculateCellId(lat: number, lng: number): string {
    const cellLat = Math.floor(lat / this.CELL_SIZE) * this.CELL_SIZE;
    const cellLng = Math.floor(lng / this.CELL_SIZE) * this.CELL_SIZE;
    return `${cellLat.toFixed(4)}_${cellLng.toFixed(4)}`;
  }

  static async updateExploredCells(userId: string, path: { lat: number; lng: number }[]) {
    const cellIds = new Set(path.map(p => this.calculateCellId(p.lat, p.lng)));

    for (const cellId of cellIds) {
      await Exploration.findOneAndUpdate(
        { userId, cellId },
        {
          userId,
          cellId,
          coordinates: this.cellIdToCoordinates(cellId),
          exploredAt: new Date(),
        },
        { upsert: true }
      );
    }

    return cellIds.size; // Number of new cells
  }

  static async calculateRoadQuality(cellId: string): Promise<'good' | 'moderate' | 'poor'> {
    const events = await Event.find({ cellId });
    const potholeCount = events.length;

    if (potholeCount === 0) return 'good';
    if (potholeCount <= 2) return 'moderate';
    return 'poor';
  }
}
```

### 4.2 Frontend Map with Fog of War
**Files to create:**
- `mobile/src/components/FogOfWarMap.tsx`
- `mobile/src/components/ExploredCellOverlay.tsx`

**Tasks:**
- [ ] Install react-native-maps: `npx expo install react-native-maps`
- [ ] Create map component with user location
- [ ] Fetch user's explored cells
- [ ] Render overlay polygons for explored cells
- [ ] Color cells by road quality
- [ ] Show unexplored areas as dark/gray
- [ ] Add exploration percentage display

**Example:**
```typescript
// mobile/src/components/FogOfWarMap.tsx
import MapView, { Polygon } from 'react-native-maps';

export default function FogOfWarMap({ exploredCells }) {
  return (
    <MapView style={styles.map} showsUserLocation>
      {exploredCells.map((cell) => {
        const color = cell.roadQuality === 'good'
          ? '#34c759'
          : cell.roadQuality === 'moderate'
          ? '#ff9500'
          : '#ff3b30';

        return (
          <Polygon
            key={cell.cellId}
            coordinates={cellToPolygon(cell.coordinates)}
            fillColor={color}
            strokeColor={color}
            strokeWidth={1}
          />
        );
      })}
    </MapView>
  );
}
```

### 4.3 Update Home Dashboard
**Files to update:**
- `mobile/src/screens/HomeScreen.tsx`

**Tasks:**
- [ ] Replace logo placeholder with FogOfWarMap
- [ ] Add stats card below map
- [ ] Display exploration percentage
- [ ] Show current level and XP bar

---

## Phase 5: Achievements System (Week 5-6)

### 5.1 Backend Achievement Logic
**Files to create:**
- `backend/src/services/achievementService.ts`
- `backend/src/controllers/achievementController.ts`
- `backend/src/routes/achievementRoutes.ts`
- `backend/src/config/achievements.ts`

**Tasks:**
- [ ] Define all achievements in config
- [ ] Create achievement checking service
- [ ] Implement progress tracking
- [ ] Create unlock achievement endpoint
- [ ] Award XP on achievement unlock
- [ ] Send notifications on unlock

**Achievements Config:**
```typescript
// backend/src/config/achievements.ts
export const ACHIEVEMENTS = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Explore your first cell',
    category: 'exploration',
    requirement: 1,
    rewardXP: 10,
    icon: '🗺️',
  },
  {
    id: 'first_catch',
    name: 'First Catch',
    description: 'Detect your first pothole',
    category: 'detection',
    requirement: 1,
    rewardXP: 25,
    icon: '🕳️',
  },
  // ... more achievements
];
```

### 5.2 Frontend Achievement Display
**Files to create:**
- `mobile/src/screens/AchievementsScreen.tsx`
- `mobile/src/components/AchievementGrid.tsx`
- `mobile/src/components/AchievementBadge.tsx`

**Tasks:**
- [ ] Create achievements screen
- [ ] Display achievement grid
- [ ] Show progress for incomplete achievements
- [ ] Add unlock animation
- [ ] Navigate from profile

---

## Phase 6: Leaderboards (Week 6)

### 6.1 Backend Leaderboard Service
**Files to create:**
- `backend/src/services/leaderboardService.ts`
- `backend/src/controllers/leaderboardController.ts`
- `backend/src/routes/leaderboardRoutes.ts`

**Tasks:**
- [ ] Create leaderboard calculation logic
- [ ] Implement daily/weekly/monthly/all-time periods
- [ ] Add cron jobs for recalculation
- [ ] Create get leaderboard endpoint
- [ ] Add user rank lookup
- [ ] Calculate rank changes

**Cron Setup:**
```typescript
// backend/src/app.ts
import cron from 'node-cron';
import { LeaderboardService } from './services/leaderboardService';

// Recalculate daily leaderboard at midnight UTC
cron.schedule('0 0 * * *', async () => {
  await LeaderboardService.recalculateLeaderboard('daily');
});

// Recalculate weekly leaderboard on Monday midnight
cron.schedule('0 0 * * 1', async () => {
  await LeaderboardService.recalculateLeaderboard('weekly');
});

// Recalculate monthly leaderboard on 1st midnight
cron.schedule('0 0 1 * *', async () => {
  await LeaderboardService.recalculateLeaderboard('monthly');
});
```

### 6.2 Frontend Leaderboard Screen
**Files to create:**
- `mobile/src/screens/LeaderboardScreen.tsx`
- `mobile/src/components/LeaderboardEntry.tsx`

**Tasks:**
- [ ] Create leaderboard screen
- [ ] Add period tabs (daily/weekly/monthly/all-time)
- [ ] Display top 100 users
- [ ] Highlight current user
- [ ] Show rank changes
- [ ] Add pull-to-refresh

---

## Phase 7: AI Verification (Week 7)

### 7.1 Backend Gemini Integration
**Files to create:**
- `backend/src/services/aiVerificationService.ts`
- `backend/src/controllers/verificationController.ts`
- `backend/src/routes/verificationRoutes.ts`

**Tasks:**
- [ ] Install Google Generative AI SDK: `npm install @google/generative-ai`
- [ ] Set up Gemini API key in .env
- [ ] Create verification prompt template
- [ ] Implement verification endpoint
- [ ] Update event with verification result
- [ ] Adjust XP based on verification confidence

**Gemini Integration:**
```typescript
// backend/src/services/aiVerificationService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class AIVerificationService {
  static async verifyPothole(eventData: any) {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
You are a pothole detection validator. Analyze the following sensor data:

Accelerometer Magnitude: ${eventData.magnitude}g
Speed: ${eventData.speed} km/h
Gyroscope Rotation: ${eventData.gyroMag} rad/s

Criteria:
- Potholes: 1.5-3.0g spikes at 20-60 km/h
- False positives: speed bumps (gradual), railroad tracks (rhythmic)

Respond with: VERIFIED, UNCERTAIN, or FALSE_POSITIVE
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();

    return {
      verified: response === 'VERIFIED',
      confidence: response === 'VERIFIED' ? 'high' : response === 'UNCERTAIN' ? 'medium' : 'low',
      reason: response,
    };
  }
}
```

### 7.2 Frontend Verification Indicator
**Files to update:**
- `mobile/src/screens/DrivingModeScreen.tsx`

**Tasks:**
- [ ] Show "Verifying..." indicator after detection
- [ ] Display verification result
- [ ] Update pothole count only for verified

---

## Phase 8: Rewards System (Week 8)

### 8.1 Backend Rewards Service
**Files to create:**
- `backend/src/services/rewardService.ts`
- `backend/src/controllers/rewardController.ts`
- `backend/src/routes/rewardRoutes.ts`

**Tasks:**
- [ ] Create rewards database entries
- [ ] Implement redeem reward endpoint
- [ ] Generate unique QR codes
- [ ] Create validate QR endpoint (for partners)
- [ ] Implement expiry logic
- [ ] Track redemption history

**QR Code Generation:**
```typescript
// backend/src/services/rewardService.ts
import crypto from 'crypto';

export class RewardService {
  static async redeemReward(userId: string, rewardId: string) {
    const user = await User.findById(userId);
    const reward = await Reward.findById(rewardId);

    if (user.currentXP < reward.costXP) {
      throw new Error('Insufficient XP');
    }

    // Deduct XP
    user.currentXP -= reward.costXP;
    await user.save();

    // Generate unique QR code
    const qrCode = crypto.randomBytes(16).toString('hex');

    // Create user reward
    const userReward = new UserReward({
      userId,
      rewardId,
      qrCode,
      redeemedAt: new Date(),
      expiresAt: new Date(Date.now() + reward.expiryDays * 24 * 60 * 60 * 1000),
      status: 'active',
    });

    await userReward.save();

    return userReward;
  }
}
```

### 8.2 Frontend Rewards Marketplace
**Files to create:**
- `mobile/src/screens/RewardsScreen.tsx`
- `mobile/src/screens/RewardDetailScreen.tsx`
- `mobile/src/screens/MyRewardsScreen.tsx`
- `mobile/src/components/RewardCard.tsx`
- `mobile/src/components/QRCodeDisplay.tsx`

**Tasks:**
- [ ] Install QR code library: `npx expo install react-native-qrcode-svg`
- [ ] Create rewards marketplace UI
- [ ] Display available rewards
- [ ] Show reward details
- [ ] Implement redemption flow
- [ ] Display user's active QR codes
- [ ] Add expiry countdown

---

## Phase 9: Polish & Animations (Week 9)

### 9.1 Animations
**Tasks:**
- [ ] Add level-up animation
- [ ] Create XP gain animation
- [ ] Achievement unlock animation
- [ ] Smooth screen transitions
- [ ] Loading states for all screens
- [ ] Pull-to-refresh on leaderboard

### 9.2 Notifications
**Tasks:**
- [ ] Install Expo Notifications: `npx expo install expo-notifications`
- [ ] Set up push notifications
- [ ] Send on level up
- [ ] Send on achievement unlock
- [ ] Send on reward expiring soon

### 9.3 Performance Optimization
**Tasks:**
- [ ] Lazy load map components
- [ ] Implement pagination for leaderboards
- [ ] Cache user data locally
- [ ] Optimize image loading
- [ ] Reduce bundle size

---

## Phase 10: Testing & Launch (Week 10)

### 10.1 Testing
**Tasks:**
- [ ] Unit tests for services
- [ ] Integration tests for API
- [ ] E2E tests for critical flows
- [ ] Test on multiple devices
- [ ] Performance testing
- [ ] Security audit

### 10.2 Deployment
**Tasks:**
- [ ] Set up production MongoDB
- [ ] Deploy backend to Heroku/Railway
- [ ] Configure environment variables
- [ ] Build mobile app with EAS
- [ ] Submit to app stores (optional)
- [ ] Create demo video

---

## Quick Start for Next Session

**Immediate next steps:**

1. **Set up MongoDB:**
   ```bash
   # Sign up for MongoDB Atlas
   # Create cluster
   # Get connection string
   # Add to backend/.env
   ```

2. **Create User model:**
   ```bash
   cd backend
   npm install mongoose @types/mongoose
   # Create src/models/User.ts (see Phase 1.1)
   ```

3. **Implement authentication:**
   ```bash
   npm install bcrypt jsonwebtoken @types/bcrypt @types/jsonwebtoken
   # Create authController, authRoutes, auth middleware
   ```

4. **Create welcome screens:**
   ```bash
   cd mobile
   # Create WelcomeScreen, FeatureSlider, AuthScreen
   # Update App.tsx navigation
   ```

---

## Environment Variables Needed

### Backend (.env)
```
PORT=5001
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-key
NODE_ENV=development
```

### Mobile (app.config.js or .env)
```
API_URL=http://10.0.10.157:5001
```

---

## Dependencies to Install

### Backend
```bash
npm install mongoose bcrypt jsonwebtoken @google/generative-ai node-cron
npm install --save-dev @types/mongoose @types/bcrypt @types/jsonwebtoken @types/node-cron
```

### Mobile
```bash
npx expo install @react-native-async-storage/async-storage react-native-maps react-native-qrcode-svg expo-notifications
```

---

## Success Metrics

- User retention (7-day, 30-day)
- Daily active users
- Average potholes detected per user
- Exploration coverage percentage
- Reward redemption rate
- Session length
- Level distribution

---

This roadmap provides a clear path from current state to full PavePatrol implementation. Each phase builds on the previous one and can be completed incrementally.
