# 🌐 NEMANJA - Backend Implementation Plan (PavePatrol Exploration App)

**Role:** Backend Developer - PavePatrol City Exploration & Gamification System
**Tech Stack:** Node.js + Express + TypeScript + MongoDB + Socket.IO + JWT + Gemini API
**Timeline:** 19 days (phased approach)
**Language:** English Only

---

## 🎯 OVERVIEW

Backend responsibilities for PavePatrol (clean exploration/gamification platform):

### Core Systems (8 total)
1. **Authentication** - Multi-provider OAuth (Google, Apple, Facebook, Email) + JWT
2. **XP & Leveling** - Award XP, calculate levels, track progression
3. **Achievement System** - Define achievements, check progress, auto-unlock
4. **Leaderboards** - Daily/weekly/monthly/all-time rankings with cron jobs
5. **Exploration Grid** - 100m cell tracking, fog-of-war data
6. **Discovery Clustering** - Group nearby events into activity areas
7. **Drive Sessions** - Track user sessions, calculate XP rewards
8. **Rewards System** - QR code generation, redemption tracking
9. **AI Verification** - Gemini Vision API for photo validation
10. **Real-time Updates** - Socket.IO for live notifications

### Key Features
- JWT-based authentication with multi-provider support
- Geospatial queries with MongoDB 2dsphere indexes
- Automated leaderboard updates via node-cron
- Discovery clustering (3m radius)
- Activity scoring algorithm
- WebSocket real-time updates
- AI photo verification

---

## 📅 PHASE 1: Code Cleanup & Database Setup (Days 1-2)

### Day 1 Morning: Terminology Cleanup

**RENAME Models:**
```
src/models/Pothole.model.ts → src/models/Discovery.model.ts
src/models/Event.model.ts → src/models/ExplorationEvent.model.ts
src/models/Photo.model.ts → src/models/DiscoveryPhoto.model.ts
```

**RENAME Services:**
```
src/services/clusteringService.ts → src/services/discoveryClusteringService.ts
src/services/severityService.ts → src/services/activityScoringService.ts
```

**RENAME Controllers:**
```
src/controllers/potholeController.ts → src/controllers/discoveryController.ts
src/controllers/eventController.ts → src/controllers/explorationEventController.ts
src/controllers/uploadController.ts → src/controllers/uploadController.ts (keep, update methods)
```

**RENAME Routes:**
```
src/routes/potholes.routes.ts → src/routes/discoveries.routes.ts
src/routes/events.routes.ts → src/routes/explorationEvents.routes.ts
```

**UPDATE Terminology in Files:**
- All "pothole" → "discovery" or "activity area"
- All "severity" → "popularityScore" or "activityLevel"
- All "road damage" → "point of interest"
- All "detection" → "discovery moment"

**Deliverable:** Clean codebase with no pothole references

---

### Day 1 Afternoon: Update Existing Models

**File:** `src/models/Discovery.model.ts` (renamed from Pothole.model.ts)

**Schema Updates:**
```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IDiscovery extends Document {
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  popularityScore: number; // 0-100 (was severity)
  metadata: {
    visitCount: number;
    uniqueUsers: string[]; // user IDs
    firstDiscoveredBy: string; // user ID
    photos: string[]; // URLs
    aiVerified: boolean;
    aiConfidence: number; // 0-100
  };
  timestamps: {
    firstDiscovered: Date;
    lastVisited: Date;
  };
}

const DiscoverySchema = new Schema<IDiscovery>({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  popularityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  metadata: {
    visitCount: { type: Number, default: 1 },
    uniqueUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    firstDiscoveredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    photos: [String],
    aiVerified: { type: Boolean, default: false },
    aiConfidence: { type: Number, default: 0 }
  },
  timestamps: {
    firstDiscovered: { type: Date, default: Date.now },
    lastVisited: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Geospatial index for nearby queries
DiscoverySchema.index({ location: '2dsphere' });

export default mongoose.model<IDiscovery>('Discovery', DiscoverySchema);
```

**Deliverable:** Updated Discovery model

---

### Day 2 Morning: Update User Model

**File:** `src/models/User.model.ts` (update existing)

**Schema Updates:**
```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  // Identity
  email: string;
  username: string;
  password?: string; // Only for email/password auth
  avatarUrl?: string;
  authProvider: 'google' | 'apple' | 'facebook' | 'email';
  authProviderId?: string;

  // Gamification
  level: number;
  currentXP: number;
  totalXP: number;

  // Stats
  stats: {
    distanceTraveled: number; // km
    discoveriesMade: number; // NOT potholes
    cellsExplored: number;
    explorationPercentage: number; // % of city
    currentStreak: number; // days
    longestStreak: number; // days
  };

  // Settings
  settings: {
    notifications: boolean;
    sensitivity: number; // 1-10
    language: string;
  };

  // Metadata
  createdAt: Date;
  lastActive: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: function() { return this.authProvider === 'email'; }
  },
  avatarUrl: String,
  authProvider: {
    type: String,
    enum: ['google', 'apple', 'facebook', 'email'],
    required: true
  },
  authProviderId: String,

  // Gamification
  level: { type: Number, default: 1 },
  currentXP: { type: Number, default: 0 },
  totalXP: { type: Number, default: 0 },

  // Stats
  stats: {
    distanceTraveled: { type: Number, default: 0 },
    discoveriesMade: { type: Number, default: 0 }, // UPDATED
    cellsExplored: { type: Number, default: 0 },
    explorationPercentage: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 }
  },

  // Settings
  settings: {
    notifications: { type: Boolean, default: true },
    sensitivity: { type: Number, default: 5, min: 1, max: 10 },
    language: { type: String, default: 'en' }
  },

  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Calculate level based on XP
UserSchema.methods.calculateLevel = function(): number {
  // Formula: XP Required = 100 × 1.5^(level-1)
  let level = 1;
  let xpRequired = 0;

  while (xpRequired <= this.totalXP) {
    level++;
    xpRequired += Math.floor(100 * Math.pow(1.5, level - 1));
  }

  return level - 1;
};

// Update level when XP changes
UserSchema.pre('save', function(next) {
  if (this.isModified('totalXP')) {
    const newLevel = this.calculateLevel();
    if (newLevel > this.level) {
      this.level = newLevel;
      // Level up event will be emitted by XP service
    }
  }
  next();
});

export default mongoose.model<IUser>('User', UserSchema);
```

**Deliverable:** Updated User model with exploration stats

---

### Day 2 Afternoon: Create New Models

**1. ExplorationCell Model**

**File:** `src/models/ExplorationCell.model.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IExplorationCell extends Document {
  cellId: string; // e.g., "45752_21225"
  userId: mongoose.Types.ObjectId;
  grid: {
    lat: number;
    lng: number;
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  };
  activity: {
    explorationCount: number;
    uniqueVisitors: number;
    activityLevel: 'low' | 'medium' | 'high';
  };
  timestamps: {
    firstExplored: Date;
    lastExplored: Date;
  };
}

const ExplorationCellSchema = new Schema<IExplorationCell>({
  cellId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  grid: {
    lat: Number,
    lng: Number,
    bounds: {
      north: Number,
      south: Number,
      east: Number,
      west: Number
    }
  },
  activity: {
    explorationCount: { type: Number, default: 1 },
    uniqueVisitors: { type: Number, default: 1 },
    activityLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    }
  },
  timestamps: {
    firstExplored: { type: Date, default: Date.now },
    lastExplored: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Compound index for user + cell queries
ExplorationCellSchema.index({ userId: 1, cellId: 1 }, { unique: true });

export default mongoose.model<IExplorationCell>('ExplorationCell', ExplorationCellSchema);
```

**2. DriveSession Model**

**File:** `src/models/DriveSession.model.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IDriveSession extends Document {
  userId: mongoose.Types.ObjectId;
  duration: {
    startTime: Date;
    endTime?: Date;
    totalMinutes?: number;
  };
  distance: {
    distanceTraveled: number; // km
    avgSpeed?: number; // km/h
  };
  discoveries: {
    discoveriesMade: number; // UPDATED
    cellsExplored: number;
    newCellsCount: number;
  };
  xp: {
    totalXPEarned: number;
    breakdown: {
      distance: number;
      cells: number;
      discoveries: number;
    };
  };
  route: {
    pathCoordinates: Array<{ lat: number; lng: number; timestamp: Date }>;
  };
}

const DriveSessionSchema = new Schema<IDriveSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  duration: {
    startTime: { type: Date, required: true },
    endTime: Date,
    totalMinutes: Number
  },
  distance: {
    distanceTraveled: { type: Number, default: 0 },
    avgSpeed: Number
  },
  discoveries: {
    discoveriesMade: { type: Number, default: 0 }, // UPDATED
    cellsExplored: { type: Number, default: 0 },
    newCellsCount: { type: Number, default: 0 }
  },
  xp: {
    totalXPEarned: { type: Number, default: 0 },
    breakdown: {
      distance: { type: Number, default: 0 },
      cells: { type: Number, default: 0 },
      discoveries: { type: Number, default: 0 }
    }
  },
  route: {
    pathCoordinates: [{
      lat: Number,
      lng: Number,
      timestamp: Date
    }]
  }
}, {
  timestamps: true
});

DriveSessionSchema.index({ userId: 1, 'duration.startTime': -1 });

export default mongoose.model<IDriveSession>('DriveSession', DriveSessionSchema);
```

**3. Achievement Model**

**File:** `src/models/Achievement.model.ts` (update if exists)

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  name: string;
  description: string;
  category: 'exploration' | 'discovery' | 'streaks' | 'distance' | 'special';
  icon: string;
  requirement: {
    type: 'exploration' | 'discovery' | 'streak' | 'distance';
    threshold: number;
  };
  reward: {
    xpReward: number;
  };
  progress: {
    unlockedBy: Array<{
      userId: mongoose.Types.ObjectId;
      unlockedAt: Date;
    }>;
  };
}

const AchievementSchema = new Schema<IAchievement>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['exploration', 'discovery', 'streaks', 'distance', 'special'],
    required: true
  },
  icon: { type: String, required: true },
  requirement: {
    type: {
      type: String,
      enum: ['exploration', 'discovery', 'streak', 'distance'],
      required: true
    },
    threshold: { type: Number, required: true }
  },
  reward: {
    xpReward: { type: Number, required: true }
  },
  progress: {
    unlockedBy: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      unlockedAt: { type: Date, default: Date.now }
    }]
  }
}, {
  timestamps: true
});

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);
```

**4. Reward Model**

**File:** `src/models/Reward.model.ts` (update if exists)

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IReward extends Document {
  name: string;
  description: string;
  partnerName: string;
  category: 'discount' | 'voucher' | 'merchandise' | 'premium';
  cost: {
    xpCost: number;
  };
  redemption: {
    qrCode?: string; // JWT token
    expiresAt?: Date;
    status: 'available' | 'active' | 'redeemed' | 'expired';
    redeemedBy?: mongoose.Types.ObjectId;
    redeemedAt?: Date;
  };
  partnerLogo?: string;
  redemptionInstructions?: string;
}

const RewardSchema = new Schema<IReward>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  partnerName: { type: String, required: true },
  category: {
    type: String,
    enum: ['discount', 'voucher', 'merchandise', 'premium'],
    required: true
  },
  cost: {
    xpCost: { type: Number, required: true }
  },
  redemption: {
    qrCode: String,
    expiresAt: Date,
    status: {
      type: String,
      enum: ['available', 'active', 'redeemed', 'expired'],
      default: 'available'
    },
    redeemedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    redeemedAt: Date
  },
  partnerLogo: String,
  redemptionInstructions: String
}, {
  timestamps: true
});

export default mongoose.model<IReward>('Reward', RewardSchema);
```

**Deliverable:** All gamification models created

---

## 📅 PHASE 2: Authentication System (Days 3-4)

### Day 3: Multi-Provider OAuth Setup

**File:** `src/controllers/authController.ts`

**Install Dependencies:**
```bash
npm install passport passport-google-oauth20 passport-facebook passport-apple
npm install jsonwebtoken bcryptjs
npm install @types/passport @types/jsonwebtoken @types/bcryptjs --save-dev
```

**Implementation:**
```typescript
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '30d';

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Email/Password Registration
export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      authProvider: 'email'
    });

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        level: user.level,
        currentXP: user.currentXP,
        totalXP: user.totalXP
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Email/Password Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email, authProvider: 'email' });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        level: user.level,
        currentXP: user.currentXP,
        totalXP: user.totalXP,
        stats: user.stats
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// Google OAuth
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;

    // Verify Google token
    // (Use google-auth-library to verify)
    const googleUser = await verifyGoogleToken(accessToken);

    // Find or create user
    let user = await User.findOne({
      authProvider: 'google',
      authProviderId: googleUser.id
    });

    if (!user) {
      user = await User.create({
        email: googleUser.email,
        username: googleUser.name || googleUser.email.split('@')[0],
        avatarUrl: googleUser.picture,
        authProvider: 'google',
        authProviderId: googleUser.id
      });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'Google authentication failed' });
  }
};

// Apple OAuth
export const appleAuth = async (req: Request, res: Response) => {
  try {
    const { identityToken } = req.body;

    // Verify Apple token
    const appleUser = await verifyAppleToken(identityToken);

    // Find or create user
    let user = await User.findOne({
      authProvider: 'apple',
      authProviderId: appleUser.sub
    });

    if (!user) {
      user = await User.create({
        email: appleUser.email,
        username: appleUser.email?.split('@')[0] || `user_${Date.now()}`,
        authProvider: 'apple',
        authProviderId: appleUser.sub
      });
    }

    user.lastActive = new Date();
    await user.save();

    const token = generateToken(user._id.toString());
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'Apple authentication failed' });
  }
};

// Facebook OAuth
export const facebookAuth = async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;

    // Verify Facebook token
    const facebookUser = await verifyFacebookToken(accessToken);

    // Find or create user
    let user = await User.findOne({
      authProvider: 'facebook',
      authProviderId: facebookUser.id
    });

    if (!user) {
      user = await User.create({
        email: facebookUser.email,
        username: facebookUser.name || facebookUser.email.split('@')[0],
        avatarUrl: facebookUser.picture?.data?.url,
        authProvider: 'facebook',
        authProviderId: facebookUser.id
      });
    }

    user.lastActive = new Date();
    await user.save();

    const token = generateToken(user._id.toString());
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'Facebook authentication failed' });
  }
};

// Refresh Token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    // Verify old token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Generate new token
    const newToken = generateToken(decoded.userId);

    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Helper functions (implement these)
async function verifyGoogleToken(accessToken: string): Promise<any> {
  // Use google-auth-library
  // Implementation details...
}

async function verifyAppleToken(identityToken: string): Promise<any> {
  // Use apple-signin-auth
  // Implementation details...
}

async function verifyFacebookToken(accessToken: string): Promise<any> {
  // Use Facebook Graph API
  // Implementation details...
}
```

**Auth Routes:**

**File:** `src/routes/auth.routes.ts`

```typescript
import express from 'express';
import {
  register,
  login,
  googleAuth,
  appleAuth,
  facebookAuth,
  refreshToken
} from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/apple', appleAuth);
router.post('/facebook', facebookAuth);
router.post('/refresh', refreshToken);

export default router;
```

**Auth Middleware:**

**File:** `src/middleware/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Get user
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

**Deliverable:** Complete authentication system

---

## 📅 PHASE 3: XP & Achievement System (Days 5-6)

### Day 5: XP Service

**File:** `src/services/xpService.ts` (new)

```typescript
import User, { IUser } from '../models/User.model';
import { io } from '../server'; // Socket.IO instance

interface XPAward {
  userId: string;
  amount: number;
  reason: string;
}

class XPService {
  // Calculate XP required for a level
  calculateRequiredXP(level: number): number {
    // Formula: XP Required = 100 × 1.5^(level-1)
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  // Calculate total XP required to reach a level
  calculateTotalXPForLevel(targetLevel: number): number {
    let totalXP = 0;
    for (let level = 1; level < targetLevel; level++) {
      totalXP += this.calculateRequiredXP(level);
    }
    return totalXP;
  }

  // Award XP to user
  async awardXP({ userId, amount, reason }: XPAward): Promise<{
    leveledUp: boolean;
    newLevel?: number;
    newXP: number;
    totalXP: number;
  }> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const previousLevel = user.level;
    const previousXP = user.currentXP;

    // Add XP
    user.currentXP += amount;
    user.totalXP += amount;

    // Check if leveled up
    const requiredXP = this.calculateRequiredXP(user.level + 1);
    let leveledUp = false;
    let newLevel = user.level;

    while (user.currentXP >= this.calculateRequiredXP(user.level + 1)) {
      const xpForNextLevel = this.calculateRequiredXP(user.level + 1);
      user.currentXP -= xpForNextLevel;
      user.level += 1;
      leveledUp = true;
      newLevel = user.level;

      // Emit level-up event
      io.to(userId).emit('level_up', {
        userId,
        newLevel: user.level,
        reason
      });
    }

    await user.save();

    return {
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
      newXP: user.currentXP,
      totalXP: user.totalXP
    };
  }

  // Award XP for distance traveled
  async awardDistanceXP(userId: string, kilometers: number): Promise<any> {
    const xp = Math.floor(kilometers * 10); // 10 XP per km
    return this.awardXP({
      userId,
      amount: xp,
      reason: `Traveled ${kilometers.toFixed(1)}km`
    });
  }

  // Award XP for exploring new cell
  async awardCellXP(userId: string, cellCount: number = 1): Promise<any> {
    const xp = cellCount * 50; // 50 XP per cell
    return this.awardXP({
      userId,
      amount: xp,
      reason: `Explored ${cellCount} new cell(s)`
    });
  }

  // Award XP for discovery moment
  async awardDiscoveryXP(userId: string, discoveryCount: number = 1): Promise<any> {
    const xp = discoveryCount * 100; // 100 XP per discovery
    return this.awardXP({
      userId,
      amount: xp,
      reason: `Made ${discoveryCount} discovery moment(s)`
    });
  }

  // Get user's current XP and level info
  async getUserXPInfo(userId: string): Promise<{
    level: number;
    currentXP: number;
    totalXP: number;
    xpToNextLevel: number;
    progress: number; // 0-100%
  }> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const xpToNextLevel = this.calculateRequiredXP(user.level + 1);
    const progress = (user.currentXP / xpToNextLevel) * 100;

    return {
      level: user.level,
      currentXP: user.currentXP,
      totalXP: user.totalXP,
      xpToNextLevel,
      progress
    };
  }
}

export default new XPService();
```

**XP Controller:**

**File:** `src/controllers/xpController.ts` (new)

```typescript
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import xpService from '../services/xpService';

// Award XP manually (admin only)
export const awardXP = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, amount, reason } = req.body;

    const result = await xpService.awardXP({ userId, amount, reason });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to award XP' });
  }
};

// Get user's XP info
export const getMyXP = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id.toString();

    const xpInfo = await xpService.getUserXPInfo(userId);

    res.json(xpInfo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get XP info' });
  }
};
```

**XP Routes:**

**File:** `src/routes/xp.routes.ts` (new)

```typescript
import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { awardXP, getMyXP } from '../controllers/xpController';

const router = express.Router();

router.post('/award', authenticate, awardXP);
router.get('/me', authenticate, getMyXP);

export default router;
```

**Deliverable:** XP system with leveling

---

### Day 6: Achievement System

**File:** `src/services/achievementService.ts` (new)

```typescript
import Achievement, { IAchievement } from '../models/Achievement.model';
import User from '../models/User.model';
import xpService from './xpService';
import { io } from '../server';

class AchievementService {
  // Seed default achievements
  async seedAchievements(): Promise<void> {
    const achievements = [
      // Exploration
      {
        name: 'First Steps',
        description: 'Explore your first cell',
        category: 'exploration',
        icon: 'map-marker',
        requirement: { type: 'exploration', threshold: 1 },
        reward: { xpReward: 50 }
      },
      {
        name: 'Explorer I',
        description: 'Explore 10 cells',
        category: 'exploration',
        icon: 'compass',
        requirement: { type: 'exploration', threshold: 10 },
        reward: { xpReward: 100 }
      },
      {
        name: 'Explorer II',
        description: 'Explore 100 cells',
        category: 'exploration',
        icon: 'map',
        requirement: { type: 'exploration', threshold: 100 },
        reward: { xpReward: 500 }
      },
      {
        name: 'Explorer III',
        description: 'Explore 500 cells',
        category: 'exploration',
        icon: 'globe',
        requirement: { type: 'exploration', threshold: 500 },
        reward: { xpReward: 2000 }
      },

      // Discovery
      {
        name: 'First Discovery',
        description: 'Make your first discovery moment',
        category: 'discovery',
        icon: 'star',
        requirement: { type: 'discovery', threshold: 1 },
        reward: { xpReward: 100 }
      },
      {
        name: 'Discovery Hunter',
        description: 'Make 10 verified discoveries',
        category: 'discovery',
        icon: 'binoculars',
        requirement: { type: 'discovery', threshold: 10 },
        reward: { xpReward: 200 }
      },
      {
        name: 'Discovery Master',
        description: 'Make 50 verified discoveries',
        category: 'discovery',
        icon: 'medal',
        requirement: { type: 'discovery', threshold: 50 },
        reward: { xpReward: 500 }
      },

      // Streaks
      {
        name: 'Consistency',
        description: 'Maintain a 3-day streak',
        category: 'streaks',
        icon: 'fire',
        requirement: { type: 'streak', threshold: 3 },
        reward: { xpReward: 200 }
      },
      {
        name: 'Dedication',
        description: 'Maintain a 7-day streak',
        category: 'streaks',
        icon: 'flame',
        requirement: { type: 'streak', threshold: 7 },
        reward: { xpReward: 500 }
      },
      {
        name: 'Legendary Streak',
        description: 'Maintain a 30-day streak',
        category: 'streaks',
        icon: 'trophy',
        requirement: { type: 'streak', threshold: 30 },
        reward: { xpReward: 2000 }
      },

      // Distance
      {
        name: 'Getting Started',
        description: 'Travel 1km',
        category: 'distance',
        icon: 'road',
        requirement: { type: 'distance', threshold: 1 },
        reward: { xpReward: 50 }
      },
      {
        name: 'Road Wanderer',
        description: 'Travel 50km',
        category: 'distance',
        icon: 'car',
        requirement: { type: 'distance', threshold: 50 },
        reward: { xpReward: 500 }
      },
      {
        name: 'Road Warrior',
        description: 'Travel 500km',
        category: 'distance',
        icon: 'truck',
        requirement: { type: 'distance', threshold: 500 },
        reward: { xpReward: 2000 }
      },

      // Special
      {
        name: 'Early Adopter',
        description: 'Join during beta period',
        category: 'special',
        icon: 'rocket',
        requirement: { type: 'exploration', threshold: 1 },
        reward: { xpReward: 1000 }
      }
    ];

    for (const achievement of achievements) {
      await Achievement.findOneAndUpdate(
        { name: achievement.name },
        achievement,
        { upsert: true, new: true }
      );
    }

    console.log('✅ Achievements seeded');
  }

  // Check if user unlocked any achievements
  async checkAchievements(userId: string): Promise<IAchievement[]> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const allAchievements = await Achievement.find();
    const newlyUnlocked: IAchievement[] = [];

    for (const achievement of allAchievements) {
      // Check if already unlocked
      const alreadyUnlocked = achievement.progress.unlockedBy.some(
        (entry) => entry.userId.toString() === userId
      );

      if (alreadyUnlocked) continue;

      // Check if user meets requirement
      let meetsRequirement = false;

      switch (achievement.requirement.type) {
        case 'exploration':
          meetsRequirement = user.stats.cellsExplored >= achievement.requirement.threshold;
          break;
        case 'discovery':
          meetsRequirement = user.stats.discoveriesMade >= achievement.requirement.threshold;
          break;
        case 'streak':
          meetsRequirement = user.stats.currentStreak >= achievement.requirement.threshold;
          break;
        case 'distance':
          meetsRequirement = user.stats.distanceTraveled >= achievement.requirement.threshold;
          break;
      }

      if (meetsRequirement) {
        // Unlock achievement
        achievement.progress.unlockedBy.push({
          userId: user._id,
          unlockedAt: new Date()
        });
        await achievement.save();

        // Award XP
        await xpService.awardXP({
          userId,
          amount: achievement.reward.xpReward,
          reason: `Unlocked achievement: ${achievement.name}`
        });

        // Emit Socket.IO event
        io.to(userId).emit('achievement_unlocked', {
          achievement: {
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            xpReward: achievement.reward.xpReward
          }
        });

        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }

  // Get all achievements with user progress
  async getAchievementsWithProgress(userId: string): Promise<any[]> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const achievements = await Achievement.find();

    return achievements.map((achievement) => {
      const unlocked = achievement.progress.unlockedBy.some(
        (entry) => entry.userId.toString() === userId
      );

      let progress = 0;

      switch (achievement.requirement.type) {
        case 'exploration':
          progress = user.stats.cellsExplored;
          break;
        case 'discovery':
          progress = user.stats.discoveriesMade;
          break;
        case 'streak':
          progress = user.stats.currentStreak;
          break;
        case 'distance':
          progress = user.stats.distanceTraveled;
          break;
      }

      return {
        ...achievement.toObject(),
        unlocked,
        progress,
        progressPercentage: Math.min((progress / achievement.requirement.threshold) * 100, 100)
      };
    });
  }

  // Get user's unlocked achievements
  async getUnlockedAchievements(userId: string): Promise<any[]> {
    const achievements = await Achievement.find({
      'progress.unlockedBy.userId': userId
    });

    return achievements.map((achievement) => {
      const unlockedEntry = achievement.progress.unlockedBy.find(
        (entry) => entry.userId.toString() === userId
      );

      return {
        ...achievement.toObject(),
        unlockedAt: unlockedEntry?.unlockedAt
      };
    });
  }
}

export default new AchievementService();
```

**Achievement Controller:**

**File:** `src/controllers/achievementController.ts` (new)

```typescript
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import achievementService from '../services/achievementService';

// Get all achievements with progress
export const getAchievements = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id.toString();
    const achievements = await achievementService.getAchievementsWithProgress(userId);
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get achievements' });
  }
};

// Get user's unlocked achievements
export const getMyAchievements = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id.toString();
    const achievements = await achievementService.getUnlockedAchievements(userId);
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get unlocked achievements' });
  }
};

// Check for newly unlocked achievements
export const checkAchievements = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id.toString();
    const newAchievements = await achievementService.checkAchievements(userId);
    res.json({ newAchievements });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check achievements' });
  }
};
```

**Achievement Routes:**

**File:** `src/routes/achievements.routes.ts` (new)

```typescript
import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getAchievements,
  getMyAchievements,
  checkAchievements
} from '../controllers/achievementController';

const router = express.Router();

router.get('/', authenticate, getAchievements);
router.get('/me', authenticate, getMyAchievements);
router.post('/check', authenticate, checkAchievements);

export default router;
```

**Deliverable:** Achievement system with auto-unlock

---

## 📅 PHASE 4: Exploration & Drive Sessions (Days 7-8)

### Day 7: Exploration Grid Service

**File:** `src/services/explorationService.ts` (new)

```typescript
import ExplorationCell, { IExplorationCell } from '../models/ExplorationCell.model';
import User from '../models/User.model';
import xpService from './xpService';
import achievementService from './achievementService';

class ExplorationService {
  // Calculate cell ID from coordinates
  getCellId(lat: number, lng: number): string {
    const cellLat = Math.floor(lat / 0.001); // ~100m cells
    const cellLng = Math.floor(lng / 0.001);
    return `${cellLat}_${cellLng}`;
  }

  // Calculate cell bounds
  getCellBounds(cellId: string): {
    north: number;
    south: number;
    east: number;
    west: number;
  } {
    const [latStr, lngStr] = cellId.split('_');
    const cellLat = parseInt(latStr);
    const cellLng = parseInt(lngStr);

    return {
      north: (cellLat + 1) * 0.001,
      south: cellLat * 0.001,
      east: (cellLng + 1) * 0.001,
      west: cellLng * 0.001
    };
  }

  // Record cell exploration
  async exploreCell(userId: string, lat: number, lng: number): Promise<{
    isNewCell: boolean;
    cellId: string;
    xpAwarded: number;
  }> {
    const cellId = this.getCellId(lat, lng);
    const bounds = this.getCellBounds(cellId);

    // Check if cell already explored by user
    let cell = await ExplorationCell.findOne({ userId, cellId });

    let isNewCell = false;
    let xpAwarded = 0;

    if (!cell) {
      // New cell - create and award XP
      cell = await ExplorationCell.create({
        cellId,
        userId,
        grid: {
          lat: Math.floor(lat / 0.001) * 0.001,
          lng: Math.floor(lng / 0.001) * 0.001,
          bounds
        },
        activity: {
          explorationCount: 1,
          uniqueVisitors: 1,
          activityLevel: 'low'
        }
      });

      // Update user stats
      const user = await User.findById(userId);
      if (user) {
        user.stats.cellsExplored += 1;
        await user.save();
      }

      // Award XP
      await xpService.awardCellXP(userId, 1);
      xpAwarded = 50;

      // Check achievements
      await achievementService.checkAchievements(userId);

      isNewCell = true;
    } else {
      // Existing cell - update last explored
      cell.activity.explorationCount += 1;
      cell.timestamps.lastExplored = new Date();
      await cell.save();
    }

    return {
      isNewCell,
      cellId,
      xpAwarded
    };
  }

  // Get user's explored cells
  async getUserCells(userId: string): Promise<IExplorationCell[]> {
    return ExplorationCell.find({ userId });
  }

  // Get exploration stats
  async getExplorationStats(userId: string): Promise<{
    totalCells: number;
    explorationPercentage: number;
    recentCells: IExplorationCell[];
  }> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const recentCells = await ExplorationCell.find({ userId })
      .sort({ 'timestamps.firstExplored': -1 })
      .limit(10);

    // Calculate exploration percentage (based on city size)
    // For demo, assume city has 10,000 cells total
    const totalCityCells = 10000;
    const explorationPercentage = (user.stats.cellsExplored / totalCityCells) * 100;

    return {
      totalCells: user.stats.cellsExplored,
      explorationPercentage: Math.min(explorationPercentage, 100),
      recentCells
    };
  }

  // Get cells for map overlay (GeoJSON format)
  async getCellsGeoJSON(userId: string): Promise<any> {
    const cells = await this.getUserCells(userId);

    return {
      type: 'FeatureCollection',
      features: cells.map((cell) => ({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [cell.grid.bounds.west, cell.grid.bounds.south],
            [cell.grid.bounds.east, cell.grid.bounds.south],
            [cell.grid.bounds.east, cell.grid.bounds.north],
            [cell.grid.bounds.west, cell.grid.bounds.north],
            [cell.grid.bounds.west, cell.grid.bounds.south]
          ]]
        },
        properties: {
          cellId: cell.cellId,
          activityLevel: cell.activity.activityLevel,
          explorationCount: cell.activity.explorationCount,
          firstExplored: cell.timestamps.firstExplored
        }
      }))
    };
  }
}

export default new ExplorationService();
```

**Exploration Controller:**

**File:** `src/controllers/explorationController.ts` (new)

```typescript
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import explorationService from '../services/explorationService';

// Get user's explored cells
export const getMyCells = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id.toString();
    const cells = await explorationService.getUserCells(userId);
    res.json(cells);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cells' });
  }
};

// Get exploration stats
export const getMyStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id.toString();
    const stats = await explorationService.getExplorationStats(userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
};

// Get cells GeoJSON for map
export const getCellsGeoJSON = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id.toString();
    const geojson = await explorationService.getCellsGeoJSON(userId);
    res.json(geojson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get GeoJSON' });
  }
};
```

**Exploration Routes:**

**File:** `src/routes/exploration.routes.ts` (new)

```typescript
import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getMyCells,
  getMyStats,
  getCellsGeoJSON
} from '../controllers/explorationController';

const router = express.Router();

router.get('/cells', authenticate, getMyCells);
router.get('/stats', authenticate, getMyStats);
router.get('/geojson', authenticate, getCellsGeoJSON);

export default router;
```

**Deliverable:** Exploration grid system

---

### Day 8: Drive Session Management

**File:** `src/controllers/driveController.ts` (new)

```typescript
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import DriveSession from '../models/DriveSession.model';
import User from '../models/User.model';
import explorationService from '../services/explorationService';
import xpService from '../services/xpService';
import achievementService from '../services/achievementService';

// Start drive session
export const startDrive = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;

    const session = await DriveSession.create({
      userId,
      duration: {
        startTime: new Date()
      },
      distance: { distanceTraveled: 0 },
      discoveries: {
        discoveriesMade: 0,
        cellsExplored: 0,
        newCellsCount: 0
      },
      xp: {
        totalXPEarned: 0,
        breakdown: {
          distance: 0,
          cells: 0,
          discoveries: 0
        }
      },
      route: { pathCoordinates: [] }
    });

    res.json({ sessionId: session._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start drive session' });
  }
};

// Update drive session
export const updateDrive = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { location } = req.body; // { lat, lng }

    const session = await DriveSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Add location to route
    session.route.pathCoordinates.push({
      lat: location.lat,
      lng: location.lng,
      timestamp: new Date()
    });

    // Check if new cell
    const cellResult = await explorationService.exploreCell(
      req.user._id.toString(),
      location.lat,
      location.lng
    );

    if (cellResult.isNewCell) {
      session.discoveries.cellsExplored += 1;
      session.discoveries.newCellsCount += 1;
      session.xp.breakdown.cells += cellResult.xpAwarded;
      session.xp.totalXPEarned += cellResult.xpAwarded;
    }

    await session.save();

    res.json({
      cellId: cellResult.cellId,
      isNewCell: cellResult.isNewCell,
      xpAwarded: cellResult.xpAwarded
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update drive session' });
  }
};

// End drive session
export const endDrive = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = await DriveSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.duration.endTime = new Date();
    session.duration.totalMinutes =
      (session.duration.endTime.getTime() - session.duration.startTime.getTime()) / 60000;

    // Calculate distance (Haversine formula)
    const distance = calculateRouteDistance(session.route.pathCoordinates);
    session.distance.distanceTraveled = distance;

    // Calculate avg speed
    session.distance.avgSpeed = session.duration.totalMinutes > 0
      ? (distance / session.duration.totalMinutes) * 60
      : 0;

    // Award distance XP
    const distanceXP = Math.floor(distance * 10); // 10 XP per km
    session.xp.breakdown.distance = distanceXP;
    session.xp.totalXPEarned += distanceXP;

    await session.save();

    // Update user stats
    const user = await User.findById(req.user._id);
    if (user) {
      user.stats.distanceTraveled += distance;
      await user.save();
    }

    // Award total XP
    await xpService.awardXP({
      userId: req.user._id.toString(),
      amount: session.xp.totalXPEarned,
      reason: 'Completed drive session'
    });

    // Check achievements
    const newAchievements = await achievementService.checkAchievements(req.user._id.toString());

    res.json({
      session: {
        duration: session.duration.totalMinutes,
        distance: session.distance.distanceTraveled,
        avgSpeed: session.distance.avgSpeed,
        cellsExplored: session.discoveries.cellsExplored,
        newCells: session.discoveries.newCellsCount,
        discoveries: session.discoveries.discoveriesMade,
        xpEarned: session.xp.totalXPEarned,
        xpBreakdown: session.xp.breakdown
      },
      newAchievements
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to end drive session' });
  }
};

// Helper: Calculate distance between coordinates (Haversine)
function calculateRouteDistance(coordinates: Array<{ lat: number; lng: number }>): number {
  let totalDistance = 0;

  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i - 1];
    const curr = coordinates[i];

    totalDistance += haversineDistance(prev.lat, prev.lng, curr.lat, curr.lng);
  }

  return totalDistance;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
```

**Drive Routes:**

**File:** `src/routes/drives.routes.ts` (new)

```typescript
import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { startDrive, updateDrive, endDrive } from '../controllers/driveController';

const router = express.Router();

router.post('/start', authenticate, startDrive);
router.post('/:sessionId/update', authenticate, updateDrive);
router.post('/:sessionId/end', authenticate, endDrive);

export default router;
```

**Deliverable:** Drive session tracking with XP calculation

---

Due to length constraints, I'll create a summary document now. The plan continues with:
- Phase 5: Leaderboards (Day 9-10)
- Phase 6: Discovery Clustering & AI Verification (Days 11-12)
- Phase 7: Rewards & QR Codes (Days 13-14)
- Phase 8: Real-time & Socket.IO (Day 15)
- Phase 9: Polish & Testing (Days 16-18)
- Phase 10: Deployment (Day 19)

Would you like me to continue with the remaining phases, or would you prefer a summary document of the deletion recommendations and key changes?
