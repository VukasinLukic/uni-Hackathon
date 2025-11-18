# PavePatrol - Gamified Road Quality Mapping System

## Architecture Overview

PavePatrol transforms pothole detection into a gamified exploration experience where users earn XP, unlock achievements, and compete on leaderboards while helping map road quality.

---

## System Architecture

### Frontend (Mobile - React Native + Expo)
- **Onboarding Flow**: Welcome screens, feature highlights, authentication
- **Home Dashboard**: Geo map with fog of war, XP/level display, exploration stats
- **Real-time Drive Mode**: Live tracking with pothole detection
- **AI Verification**: Gemini integration for pothole validation
- **Gamification Engine**: XP system, achievements, leaderboards
- **Rewards Marketplace**: QR code redemption system
- **User Profile**: Statistics, achievements, settings

### Backend (Node.js + Express)
- **User Management**: Authentication, profiles, settings
- **Gamification Service**: XP calculation, level progression, achievements
- **Leaderboard Service**: Daily/weekly/monthly rankings
- **Rewards Service**: Partner integration, QR code generation
- **Map Service**: Fog of war calculation, area exploration tracking
- **AI Integration**: Gemini API for pothole verification
- **Event Processing**: Real-time pothole detection and clustering

### Database (MongoDB)
- **Users Collection**: User profiles, XP, levels, achievements
- **Events Collection**: Pothole events with validation status
- **Explorations Collection**: User exploration areas (fog of war data)
- **Rewards Collection**: Available rewards, redemptions
- **Leaderboards Collection**: Cached rankings for performance

---

## Feature Breakdown

### 1. Onboarding & Authentication

#### Screens
1. **Welcome Screen**
   - Logo animation
   - App tagline: "Explore. Detect. Earn."
   - Get Started button

2. **Feature Highlights** (3 swipeable cards)
   - Card 1: "Explore Your City" - Fog of war map visualization
   - Card 2: "Detect & Report" - Automatic pothole detection
   - Card 3: "Earn Rewards" - XP, levels, and prizes

3. **Login/Register**
   - Email + Password
   - Google OAuth (optional)
   - Skip for now (guest mode with limited features)

4. **Permissions Request**
   - Location (required)
   - Sensors (required)
   - Camera (optional - for Walking Mode)

#### Implementation
```typescript
// Components needed:
- WelcomeScreen.tsx
- FeatureSlider.tsx
- AuthScreen.tsx
- PermissionsScreen.tsx

// Services needed:
- authService.ts (Firebase Auth or JWT)
- permissionsService.ts
```

---

### 2. Home Dashboard

#### UI Elements
- **Map View** (Top 60% of screen)
  - Fog of war overlay (dark for unexplored, colored for explored)
  - User location marker
  - Pothole markers with severity colors
  - Exploration percentage overlay

- **Stats Card** (Below map)
  - Current Level + XP bar
  - Exploration % of city
  - Potholes detected today
  - Active streak

- **Quick Actions** (Bottom)
  - Start Drive Mode (primary CTA)
  - Walking Mode
  - View Leaderboard
  - Rewards Shop

#### Implementation
```typescript
// Components:
- HomeDashboard.tsx
- FogOfWarMap.tsx (using react-native-maps + custom overlay)
- StatsCard.tsx
- QuickActionBar.tsx

// Backend API:
GET /api/user/stats - User statistics
GET /api/map/fog-of-war - User exploration data
GET /api/events/nearby - Recent pothole events
```

---

### 3. Fog of War Map System

#### Concept
- City divided into grid cells (100m x 100m)
- Cells start dark/gray (unexplored)
- Cells become colored when user drives through them
- Color intensity = road quality (green = good, yellow = moderate, red = poor)

#### Data Structure
```typescript
interface ExplorationCell {
  cellId: string; // "lat_lng" grid coordinate
  userId: string;
  explored: boolean;
  exploredAt: Date;
  roadQuality: 'good' | 'moderate' | 'poor';
  potholeCount: number;
}

interface UserExploration {
  userId: string;
  totalCells: number;
  exploredCells: number;
  explorationPercentage: number;
  cityBounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}
```

#### Implementation
```typescript
// Frontend:
- FogOfWarOverlay.tsx (custom MapView overlay)
- Uses react-native-maps with custom tiles or polygons

// Backend:
POST /api/exploration/update - Update explored cells during drive
GET /api/exploration/cells - Get user's explored cells
GET /api/exploration/stats - Overall exploration statistics

// Service:
- explorationService.ts
  - calculateCellId(lat, lng): Convert coordinates to grid ID
  - updateExploredCells(userId, path): Mark cells as explored
  - calculateRoadQuality(cellId): Determine quality from pothole density
```

---

### 4. Real-time Drive Mode

#### Features
- Live map tracking
- Real-time sensor monitoring
- Pothole detection with haptic feedback
- AI verification of detections
- XP earned during drive
- Post-drive summary

#### UI Flow
1. **Pre-Drive Screen**
   - Estimated XP to earn
   - Suggested unexplored routes
   - Start Drive button

2. **Active Drive Screen**
   - Full-screen map with user location
   - Speed display
   - XP counter (incrementing)
   - Pothole detection indicator
   - End Drive button

3. **Post-Drive Summary**
   - Total distance driven
   - Potholes detected
   - XP earned (with animation)
   - New achievements unlocked
   - Exploration % increase
   - Share button

#### Implementation
```typescript
// Components:
- PreDriveScreen.tsx
- ActiveDriveScreen.tsx
- PostDriveSummary.tsx
- DetectionIndicator.tsx (animated)

// Services:
- driveService.ts
  - startDrive(): Initialize session
  - trackLocation(): Record path
  - endDrive(): Calculate rewards
  - calculateXP(distance, potholes, exploration): XP formula

// Backend API:
POST /api/drive/start - Start drive session
POST /api/drive/update - Send location updates + detections
POST /api/drive/end - Finalize drive and calculate rewards
```

---

### 5. AI-Powered Pothole Verification (Gemini)

#### Purpose
Reduce false positives by validating pothole detections using AI

#### Workflow
1. User detects pothole (sensor spike)
2. App captures:
   - Accelerometer magnitude
   - Gyroscope data
   - Speed
   - Location context (road type from Maps API)
3. Send to Gemini for verification
4. Gemini responds: `verified`, `uncertain`, `false_positive`
5. Only `verified` events earn full XP

#### Gemini Prompt Template
```
You are a pothole detection validator. Analyze the following sensor data and determine if it represents a genuine pothole:

Accelerometer Magnitude: {magnitude}g
Speed: {speed} km/h
Road Type: {roadType}
Gyroscope Rotation: {gyroMag} rad/s

Criteria:
- Potholes typically show 1.5-3.0g spikes at 20-60 km/h
- False positives: speed bumps (gradual), railroad tracks (rhythmic)
- Context: residential roads more likely to have potholes

Respond with one word: VERIFIED, UNCERTAIN, or FALSE_POSITIVE
```

#### Implementation
```typescript
// Service:
- aiVerificationService.ts
  - verifyPothole(eventData): Promise<VerificationResult>
  - Uses Google Gemini API

// Backend:
POST /api/verification/verify - Send event for AI verification
  - Integrates with Gemini API
  - Stores verification result
  - Updates event severity based on confidence

// Environment:
GEMINI_API_KEY=your_key_here
```

---

### 6. XP & Leveling System

#### XP Sources
| Action | Base XP | Notes |
|--------|---------|-------|
| Drive 1km | 10 XP | Encourages exploration |
| Explore new cell | 50 XP | Fog of war reward |
| Detect verified pothole | 100 XP | Core gameplay |
| Report via Walking Mode | 75 XP | Manual reporting |
| Complete daily challenge | 200 XP | Engagement |
| Streak bonus (7 days) | 500 XP | Retention |

#### Level Formula
```typescript
function calculateRequiredXP(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Example progression:
Level 1 → 2: 100 XP
Level 2 → 3: 150 XP
Level 3 → 4: 225 XP
Level 5 → 6: 506 XP
Level 10 → 11: 3844 XP
```

#### Implementation
```typescript
// Data Model:
interface UserLevel {
  userId: string;
  level: number;
  currentXP: number;
  totalXP: number;
  title: string; // "Rookie Explorer", "Road Scout", "Pothole Hunter"
}

// Service:
- levelService.ts
  - awardXP(userId, amount, reason)
  - checkLevelUp(userId)
  - getLevelTitle(level)

// Backend API:
POST /api/xp/award - Award XP to user
GET /api/user/level - Get user level info
```

---

### 7. Achievements System

#### Achievement Categories

**Exploration Achievements**
- First Steps: Explore first cell (10 XP)
- Neighborhood Scout: Explore 10 cells (50 XP)
- City Explorer: Explore 100 cells (200 XP)
- Master Cartographer: 50% city explored (1000 XP)

**Detection Achievements**
- First Catch: Detect first pothole (25 XP)
- Sharp Eye: 10 verified detections (100 XP)
- Pothole Hunter: 50 detections (500 XP)
- Road Warrior: 200 detections (2000 XP)

**Streak Achievements**
- Consistent: 3-day streak (50 XP)
- Dedicated: 7-day streak (200 XP)
- Unstoppable: 30-day streak (1000 XP)

**Distance Achievements**
- First Mile: Drive 1km (10 XP)
- Marathon: Drive 50km (250 XP)
- Road Trip: Drive 500km (2500 XP)

#### Implementation
```typescript
// Data Model:
interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'exploration' | 'detection' | 'streak' | 'distance';
  requirement: number;
  rewardXP: number;
  icon: string;
}

interface UserAchievement {
  userId: string;
  achievementId: string;
  progress: number;
  completed: boolean;
  completedAt?: Date;
}

// Service:
- achievementService.ts
  - checkAchievements(userId, action)
  - unlockAchievement(userId, achievementId)
  - getProgress(userId)

// Backend API:
GET /api/achievements - List all achievements
GET /api/user/achievements - User's achievement progress
POST /api/achievements/claim - Claim achievement reward
```

---

### 8. Leaderboard System

#### Leaderboard Types
1. **Daily**: Resets at midnight, sorted by XP earned today
2. **Weekly**: Resets Monday, sorted by XP this week
3. **Monthly**: Resets 1st, sorted by XP this month
4. **All-Time**: Total XP, never resets

#### Display
- Top 100 users
- User's rank (even if outside top 100)
- Avatar, username, level, XP
- Change indicator (↑ +5 or ↓ -2 since yesterday)

#### Implementation
```typescript
// Data Model:
interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string;
  level: number;
  xp: number;
  rankChange: number; // Positive = moved up
}

// Service:
- leaderboardService.ts
  - updateLeaderboard(period): Recalculate rankings
  - getUserRank(userId, period)
  - getTopUsers(period, limit)

// Backend API:
GET /api/leaderboard/:period - Get leaderboard (daily/weekly/monthly/all-time)
GET /api/leaderboard/rank/:userId - Get user's current rank

// Scheduled Jobs:
- Recalculate daily leaderboard: 00:00 UTC
- Recalculate weekly: Monday 00:00 UTC
- Recalculate monthly: 1st 00:00 UTC
```

---

### 9. Rewards System

#### Concept
Users redeem XP or achievements for real-world rewards via QR codes

#### Reward Types
- **Partner Discounts**: 20% off at local bike shop (500 XP)
- **Service Vouchers**: Free car wash (1000 XP)
- **Exclusive Merch**: PavePatrol T-shirt (2000 XP)
- **Premium Features**: Ad-free for 1 month (1500 XP)

#### Redemption Flow
1. User browses Rewards Shop
2. Selects reward (checks if enough XP)
3. Confirms redemption
4. System generates unique QR code
5. User shows QR at partner location
6. Partner scans to validate

#### Implementation
```typescript
// Data Model:
interface Reward {
  id: string;
  name: string;
  description: string;
  costXP: number;
  partnerName: string;
  category: 'discount' | 'voucher' | 'merch' | 'premium';
  imageUrl: string;
  termsAndConditions: string;
  expiryDays: number;
  available: boolean;
}

interface UserReward {
  userId: string;
  rewardId: string;
  qrCode: string; // Unique identifier
  redeemedAt: Date;
  expiresAt: Date;
  usedAt?: Date;
  status: 'active' | 'used' | 'expired';
}

// Service:
- rewardService.ts
  - redeemReward(userId, rewardId): Deduct XP, generate QR
  - validateQR(qrCode): Check if valid and unused
  - markAsUsed(qrCode): Partner confirms usage

// Backend API:
GET /api/rewards - List available rewards
POST /api/rewards/redeem - Redeem a reward
GET /api/user/rewards - User's redeemed rewards
POST /api/rewards/validate - Validate QR code (partner endpoint)
```

---

### 10. User Profile & Settings

#### Profile Sections
1. **Stats Overview**
   - Total XP
   - Current level
   - Potholes detected
   - Distance driven
   - Exploration %

2. **Achievements Display**
   - Grid of achievement badges
   - Progress bars for incomplete

3. **Rewards Inventory**
   - Active QR codes
   - Expired rewards
   - Redemption history

4. **Settings**
   - Account settings
   - Notification preferences
   - Sensor sensitivity
   - Privacy settings (share data anonymously)
   - Log out

#### Implementation
```typescript
// Components:
- ProfileScreen.tsx
- StatsOverview.tsx
- AchievementGrid.tsx
- RewardsInventory.tsx
- SettingsScreen.tsx

// Backend API:
GET /api/user/profile - Full user profile
PATCH /api/user/settings - Update settings
DELETE /api/user/account - Delete account
```

---

## Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  email: string,
  username: string,
  avatarUrl: string,
  level: number,
  currentXP: number,
  totalXP: number,
  stats: {
    totalDistance: number,
    potholesDetected: number,
    verifiedDetections: number,
    explorationPercentage: number,
    currentStreak: number,
    longestStreak: number,
  },
  settings: {
    notifications: boolean,
    sensorSensitivity: 'low' | 'medium' | 'high',
    shareDataAnonymously: boolean,
  },
  createdAt: Date,
  lastActiveAt: Date,
}
```

### Exploration Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  cellId: string, // "lat_lng"
  coordinates: {
    lat: number,
    lng: number,
  },
  roadQuality: 'good' | 'moderate' | 'poor',
  potholeCount: number,
  exploredAt: Date,
}
```

### Achievements Collection
```typescript
{
  _id: ObjectId,
  name: string,
  description: string,
  category: string,
  requirement: number,
  rewardXP: number,
  icon: string,
}
```

### UserAchievements Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  achievementId: ObjectId,
  progress: number,
  completed: boolean,
  completedAt: Date,
}
```

### Rewards Collection
```typescript
{
  _id: ObjectId,
  name: string,
  description: string,
  costXP: number,
  partnerName: string,
  category: string,
  imageUrl: string,
  termsAndConditions: string,
  expiryDays: number,
  available: boolean,
}
```

### UserRewards Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  rewardId: ObjectId,
  qrCode: string,
  redeemedAt: Date,
  expiresAt: Date,
  usedAt: Date,
  status: string,
}
```

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### User Management
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update profile
- `GET /api/user/stats` - Get user statistics
- `PATCH /api/user/settings` - Update settings

### XP & Leveling
- `POST /api/xp/award` - Award XP to user
- `GET /api/user/level` - Get level info

### Drive Sessions
- `POST /api/drive/start` - Start drive
- `POST /api/drive/update` - Update location
- `POST /api/drive/end` - End drive

### Exploration
- `POST /api/exploration/update` - Update explored cells
- `GET /api/exploration/cells` - Get user's cells
- `GET /api/exploration/stats` - Exploration statistics

### Achievements
- `GET /api/achievements` - List all achievements
- `GET /api/user/achievements` - User's progress
- `POST /api/achievements/claim` - Claim reward

### Leaderboards
- `GET /api/leaderboard/:period` - Get leaderboard
- `GET /api/leaderboard/rank/:userId` - User's rank

### Rewards
- `GET /api/rewards` - List rewards
- `POST /api/rewards/redeem` - Redeem reward
- `GET /api/user/rewards` - User's rewards
- `POST /api/rewards/validate` - Validate QR

### AI Verification
- `POST /api/verification/verify` - Verify pothole

### Events (existing)
- `POST /api/events` - Create pothole event
- `GET /api/events` - Get events
- `GET /api/health` - Health check

---

## Technology Stack

### Frontend
- React Native + Expo SDK 54
- TypeScript
- react-native-maps (fog of war)
- Expo Location, Sensors, Camera
- React Native SVG (graphs)
- Axios (API client)

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- Google Gemini API
- JWT authentication
- Node-cron (scheduled tasks)

### Infrastructure
- MongoDB Atlas (database)
- AWS S3 (image storage)
- Heroku/Railway (backend hosting)
- Expo EAS (mobile app distribution)

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- ✅ Basic UI redesign (completed)
- ✅ Navigation restructure (completed)
- ✅ Legacy demo preservation (completed)
- User authentication (Firebase or JWT)
- Database schema setup
- Basic XP system

### Phase 2: Core Gamification (Week 3-4)
- Leveling system
- Achievement tracking
- Leaderboard implementation
- Drive session management
- Post-drive summary screens

### Phase 3: Map & Exploration (Week 5-6)
- Fog of war map system
- Grid cell exploration tracking
- Road quality calculation
- Home dashboard with map

### Phase 4: AI Integration (Week 7)
- Gemini API integration
- Pothole verification logic
- Confidence scoring
- False positive filtering

### Phase 5: Rewards System (Week 8)
- Rewards marketplace
- QR code generation
- Partner integration
- Redemption flow

### Phase 6: Polish & Launch (Week 9-10)
- Onboarding flow
- Animations and transitions
- Performance optimization
- Beta testing
- Production deployment

---

## Next Steps

1. **Complete this architecture planning** ✅
2. **Create detailed implementation roadmap**
3. **Set up backend infrastructure** (MongoDB, Express routes)
4. **Implement authentication system**
5. **Build onboarding flow**
6. **Develop fog of war map component**
7. **Integrate XP and leveling**
8. **Create achievement system**
9. **Build leaderboards**
10. **Implement rewards marketplace**

---

## Notes

- All existing pothole detection logic preserved
- Legacy demo accessible via Action Button
- Progressive enhancement: new features don't break old ones
- Focus on engagement and retention through gamification
- Real-world value through rewards system
