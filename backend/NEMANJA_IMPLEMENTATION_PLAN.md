# 🌐 NEMANJA - Backend Implementation Plan

**Role**: Backend Developer - PavePatrol Gamification System
**Tech Stack**: Node.js + Express + MongoDB + Socket.IO + JWT + Gemini API + Node-cron
**Timeline**: 7 days (phased approach)

---

## 🎯 OVERVIEW

Backend responsibilities for PavePatrol gamification platform:
- User authentication (JWT-based, not Auth0)
- XP & leveling system
- Achievement tracking & unlocking
- Leaderboard management (daily/weekly/monthly)
- Fog of war grid system (100m cells)
- Drive session tracking
- Pothole clustering & severity scoring
- Gemini AI verification
- Rewards redemption with QR codes
- Route optimization for city officials
- Real-time Socket.IO updates
- Statistics & analytics

---

## 📅 PHASE 1: Authentication & Database (Day 1)

### Day 1 Morning: Project Setup & User Auth

**Tasks:**
1. Initialize Node.js + TypeScript project
2. Setup MongoDB connection
3. Create User model with gamification fields:
   - Email, username, password hash, avatarUrl
   - Level, currentXP, totalXP
   - Stats (distanceDriven, potholesDetected, cellsExplored, explorationPercentage)
   - Settings (notifications, sensitivity)
4. Implement JWT authentication:
   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/refresh
5. Create auth middleware for protected routes

**Deliverable**: User registration/login with JWT tokens

---

### Day 1 Afternoon: Core Models

**Tasks:**
1. Create Achievement model:
   - Name, description, category
   - Requirement (threshold value)
   - Reward XP, icon
   - Unlocked by users array
2. Create ExplorationCell model:
   - CellId (lat_lng grid coordinate)
   - UserId
   - Road quality (good/moderate/poor)
   - Pothole count
   - Explored timestamp
3. Create Reward model:
   - Name, description, cost in XP
   - Partner name, category
   - QR code data, expiry, status (active/redeemed/expired)
   - User redemptions array
4. Create DriveSession model:
   - UserId, start time, end time, duration
   - Distance traveled, avg speed
   - Potholes detected, cells explored
   - XP earned

**Deliverable**: All gamification models defined

---

## 📅 PHASE 2: XP System & Achievements (Day 2)

### Day 2 Morning: XP Service

**Tasks:**
1. Create XP service (`services/xpService.ts`):
   - Award XP for actions (drive distance, explore cell, detect pothole)
   - Calculate level from XP: `100 × 1.5^(level-1)`
   - Level up users when threshold reached
   - Handle XP transactions
2. Create endpoints:
   - POST /api/xp/award - Award XP to user
   - GET /api/xp/me - Get current user XP & level
3. Emit Socket.IO event when user levels up

**Deliverable**: XP system with level calculations

---

### Day 2 Afternoon: Achievement System

**Tasks:**
1. Create achievement service (`services/achievementService.ts`):
   - Check achievement progress for user
   - Unlock achievement when threshold met
   - Award XP for unlocked achievements
2. Define 15-20 base achievements:
   - Exploration: First cell, 10 cells, 100 cells, 50% city
   - Detection: First pothole, 10, 50, 200 verified
   - Streaks: 3 days, 7 days, 30 days
   - Distance: 1km, 50km, 500km
3. Create endpoints:
   - GET /api/achievements - Get all achievements
   - GET /api/achievements/me - Get user's unlocked achievements
   - GET /api/achievements/progress - Get progress toward locked achievements
4. Create cron job to check daily streaks

**Deliverable**: Achievement tracking system

---

## 📅 PHASE 3: Drive Sessions & Fog of War (Day 3)

### Day 3 Morning: Drive Session Endpoints

**Tasks:**
1. Create drive session controller:
   - POST /api/drives/start - Start new drive session
   - POST /api/drives/update - Update session with GPS points
   - POST /api/drives/end - End session, calculate XP earned
2. Calculate distance traveled using Haversine formula
3. Award XP based on:
   - Distance: 10 XP per km
   - New cells explored: 50 XP per cell
   - Potholes detected: 100 XP per verified pothole
4. Check achievements after drive ends

**Deliverable**: Drive session tracking with XP

---

### Day 3 Afternoon: Fog of War Grid System

**Tasks:**
1. Create exploration service (`services/explorationService.ts`):
   - Convert lat/lng to cellId: `floor(lat/0.001)_floor(lng/0.001)`
   - Check if cell already explored by user
   - Create new ExplorationCell if first visit
   - Calculate road quality for cell based on potholes
   - Award 50 XP for new cell
2. Create endpoints:
   - GET /api/exploration/cells - Get user's explored cells
   - GET /api/exploration/stats - Get exploration percentage
   - GET /api/exploration/city - Get all cells in city (for map overlay)
3. Calculate exploration percentage for user's stats

**Deliverable**: Fog of war grid system

---

## 📅 PHASE 4: Leaderboards & Clustering (Day 4)

### Day 4 Morning: Leaderboard System

**Tasks:**
1. Create leaderboard service (`services/leaderboardService.ts`):
   - Calculate rankings by totalXP
   - Support daily/weekly/monthly/all-time
   - Cache rankings in memory for performance
2. Create node-cron jobs:
   - Daily reset (midnight): Archive yesterday's top 10
   - Weekly reset (Monday): Archive last week's top 10
   - Monthly reset (1st): Archive last month's top 10
3. Create endpoints:
   - GET /api/leaderboard/daily - Top 100 today
   - GET /api/leaderboard/weekly - Top 100 this week
   - GET /api/leaderboard/monthly - Top 100 this month
   - GET /api/leaderboard/all-time - Top 100 overall
   - GET /api/leaderboard/me - User's current rank

**Deliverable**: Leaderboard rankings with cron jobs

---

### Day 4 Afternoon: Pothole Clustering

**Tasks:**
1. Keep existing clustering algorithm (20m radius)
2. Update Pothole model to include:
   - Verified status
   - AI confidence score
   - Contributing userIds for XP attribution
3. Create POST /api/events endpoint for sensor data
4. When cluster created/updated:
   - Award 100 XP to reporting user (pending verification)
   - Emit Socket.IO event for real-time map update
5. Keep existing severity calculation

**Deliverable**: Pothole clustering with XP rewards

---

## 📅 PHASE 5: AI Verification & Rewards (Day 5)

### Day 5 Morning: Gemini AI Verification

**Tasks:**
1. Create AI service (`services/aiVerificationService.ts`):
   - Validate pothole images with Gemini
   - Return isPothole + confidence (0-100)
2. Update pothole verification flow:
   - User submits photo (walking mode)
   - Upload to Cloudinary
   - Send to Gemini for analysis
   - If verified (confidence > 70):
     - Mark pothole as verified
     - Award 100 XP to user
     - Increase severity by 10 points
   - If rejected:
     - Do not award XP
     - Mark as false positive
3. Create endpoint:
   - POST /api/verify/photo - Upload & verify pothole photo

**Deliverable**: AI-powered pothole verification

---

### Day 5 Afternoon: Rewards System

**Tasks:**
1. Create reward service (`services/rewardService.ts`):
   - Check user has enough XP
   - Deduct XP cost
   - Generate unique QR code with JWT
   - Create redemption record with expiry (30 days)
2. Seed database with rewards:
   - Partner discounts (bike shop, car wash)
   - Service vouchers
   - Exclusive merch
3. Create endpoints:
   - GET /api/rewards - Get all available rewards
   - POST /api/rewards/redeem - Redeem reward for XP
   - GET /api/rewards/me - Get user's active QR codes
   - POST /api/rewards/validate - Validate QR code (for partners)

**Deliverable**: Reward redemption with QR codes

---

## 📅 PHASE 6: Route Optimization & Stats (Day 6)

### Day 6 Morning: Route Optimization

**Tasks:**
1. Keep existing route optimizer (greedy nearest-neighbor)
2. Update to use verified potholes only
3. Create endpoint:
   - POST /api/routes/optimize - Input num crews, get optimized routes
   - Response includes: crew assignments, stops, total distance, estimated time
4. Add filtering by severity threshold (e.g., only fix severity >= 70)

**Deliverable**: Route optimization for city officials

---

### Day 6 Afternoon: Statistics & Analytics

**Tasks:**
1. Create stats controller with endpoints:
   - GET /api/stats/overview - Total potholes, resolved, high severity, avg resolution time
   - GET /api/stats/trends - Daily reports/fixes for last 30 days
   - GET /api/stats/heatmap - Geographic density of potholes
   - GET /api/stats/user/:id - User profile stats
2. Aggregate data for charts:
   - Reports per day (line chart)
   - Severity distribution (pie chart)
   - Top contributors (bar chart)
3. Cache frequently accessed stats

**Deliverable**: Analytics endpoints for web dashboard

---

## 📅 PHASE 7: Real-time & Polish (Day 7)

### Day 7 Morning: Socket.IO Real-time

**Tasks:**
1. Create Socket.IO handler (`websocket/socketHandler.ts`):
   - Connection: Authenticate with JWT
   - Subscribe to location: Join room for nearby updates
   - Emit events:
     - `new_pothole` - New severe pothole detected
     - `level_up` - User leveled up
     - `achievement_unlocked` - New achievement
     - `leaderboard_update` - Ranking changed
2. Integrate Socket.IO emissions in:
   - XP service (level up)
   - Achievement service (unlock)
   - Event controller (new pothole)
   - Leaderboard cron jobs (ranking update)

**Deliverable**: Real-time updates via Socket.IO

---

### Day 7 Afternoon: Testing & Deployment

**Tasks:**
1. Test all endpoints with Postman
2. Seed database with:
   - 5 test users with various XP levels
   - 20-30 fake potholes
   - 15-20 achievements
   - 5-10 rewards
3. Add request validation (express-validator)
4. Add rate limiting (express-rate-limit)
5. Write API documentation (README)
6. Deploy to Railway/Heroku/DigitalOcean
7. Setup MongoDB Atlas production cluster

**Deliverable**: Production-ready backend

---

## 🎯 PRIORITY CHECKLIST

### MUST HAVE
- [ ] JWT authentication (register/login) - **ROUTES CREATED, NEEDS IMPLEMENTATION**
- [x] User model with XP/level/stats - **BASIC MODEL EXISTS**
- [ ] XP service (award, level up) - **NOT STARTED**
- [ ] Achievement system (check, unlock) - **NOT STARTED**
- [ ] Drive session tracking - **NOT STARTED**
- [ ] Fog of war grid (100m cells) - **NOT STARTED**
- [ ] Leaderboard (at least all-time) - **NOT STARTED**
- [x] POST /api/events (pothole detection) - **IMPLEMENTED**
- [x] Clustering & severity scoring - **IMPLEMENTED**

### SHOULD HAVE
- [x] AI verification (Gemini) - **IMPLEMENTED**
- [ ] Rewards with QR codes - **NOT STARTED**
- [ ] Leaderboard cron jobs (daily/weekly/monthly) - **NOT STARTED**
- [ ] Route optimization - **FILE EXISTS, EMPTY**
- [x] Statistics endpoints - **IMPLEMENTED**
- [x] Socket.IO real-time - **IMPLEMENTED**

### NICE TO HAVE
- [x] AI chatbot backend - **IMPLEMENTED**
- [ ] Advanced analytics
- [ ] Redis caching
- [ ] Daily challenges
- [ ] Streak bonuses

---

## ✅ TRENUTNO IMPLEMENTIRANO (Legacy sistem)

**Models:**
- ✅ User.model.ts (basic, needs gamification fields)
- ✅ Event.model.ts (sensor data)
- ✅ Pothole.model.ts (clustering ready)
- ⚠️ Photo.model.ts (empty file)

**Services:**
- ✅ clusteringService.ts (20m radius clustering)
- ✅ severityService.ts (severity calculation)
- ✅ aiVisionService.ts (Gemini verification)
- ✅ cloudinaryService.ts (image upload)
- ✅ geminiChatService.ts (AI chatbot)
- ⚠️ routeOptimizer.ts (empty file)

**Controllers:**
- ✅ eventController.ts (POST /api/events)
- ✅ potholeController.ts (CRUD operations)
- ✅ statsController.ts (analytics)
- ✅ uploadController.ts (photo upload)
- ✅ chatController.ts (AI chat)
- ⚠️ routeController.ts (minimal implementation)

**Routes:**
- ⚠️ auth.routes.ts (empty file)
- ✅ events.routes.ts
- ✅ potholes.routes.ts
- ✅ stats.routes.ts
- ✅ upload.routes.ts
- ✅ chat.routes.ts
- ✅ routes.routes.ts

**Infrastructure:**
- ✅ database.ts (MongoDB connection)
- ✅ auth0.ts (Auth0 config - needs JWT replacement)
- ✅ socketHandler.ts (Socket.IO)
- ✅ Middleware (auth, validation, error)
- ✅ Utils (logger, geoUtils, constants)

---

## 🚧 ŠTA TREBA DODATI (Gamification)

**PRIORITY 1 - Core Gamification:**
1. User model update (level, XP, stats fields)
2. Achievement model (new)
3. ExplorationCell model (new)
4. DriveSession model (new)
5. Reward model (new)
6. XP service (new)
7. Achievement service (new)
8. Exploration service (new)
9. Leaderboard service (new)

**PRIORITY 2 - Endpoints:**
1. Auth routes implementation (JWT)
2. XP endpoints (award, get)
3. Achievement endpoints (list, progress)
4. Drive session endpoints (start, update, end)
5. Exploration endpoints (cells, stats)
6. Leaderboard endpoints (daily/weekly/monthly/all-time)
7. Rewards endpoints (list, redeem, validate)

**PRIORITY 3 - Advanced:**
1. Leaderboard cron jobs
2. Achievement cron (streaks)
3. Route optimizer implementation
4. QR code generation
5. Reward system

---

## 🗂️ FINAL FOLDER STRUCTURE

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── jwt.ts
│   ├── models/
│   │   ├── User.model.ts
│   │   ├── Achievement.model.ts
│   │   ├── ExplorationCell.model.ts
│   │   ├── Reward.model.ts
│   │   ├── DriveSession.model.ts
│   │   ├── Pothole.model.ts
│   │   └── Event.model.ts
│   ├── services/
│   │   ├── xpService.ts
│   │   ├── achievementService.ts
│   │   ├── explorationService.ts
│   │   ├── leaderboardService.ts
│   │   ├── clusteringService.ts
│   │   ├── severityService.ts
│   │   ├── aiVerificationService.ts
│   │   ├── rewardService.ts
│   │   └── routeOptimizer.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── xpController.ts
│   │   ├── achievementController.ts
│   │   ├── driveController.ts
│   │   ├── explorationController.ts
│   │   ├── leaderboardController.ts
│   │   ├── eventController.ts
│   │   ├── potholeController.ts
│   │   ├── verificationController.ts
│   │   ├── rewardController.ts
│   │   ├── routeController.ts
│   │   └── statsController.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── validation.middleware.ts
│   ├── websocket/
│   │   └── socketHandler.ts
│   ├── cron/
│   │   ├── leaderboardCron.ts
│   │   └── achievementCron.ts
│   ├── utils/
│   │   ├── qrGenerator.ts
│   │   └── haversine.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── xp.routes.ts
│   │   ├── achievements.routes.ts
│   │   ├── drives.routes.ts
│   │   ├── exploration.routes.ts
│   │   ├── leaderboard.routes.ts
│   │   ├── events.routes.ts
│   │   ├── potholes.routes.ts
│   │   ├── verify.routes.ts
│   │   ├── rewards.routes.ts
│   │   ├── routes.routes.ts
│   │   └── stats.routes.ts
│   ├── app.ts
│   └── server.ts
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 📊 KEY DATA MODELS

### User
- Email, username, password (bcrypt), avatarUrl
- Level, currentXP, totalXP
- Stats: distanceDriven, potholesDetected, cellsExplored, explorationPercentage
- Settings: notifications, sensitivity
- Created/updated timestamps

### Achievement
- Name, description, category (exploration/detection/streaks/distance)
- Requirement threshold
- Reward XP, icon URL
- unlockedBy: [userId] array

### ExplorationCell
- cellId (e.g., "45752_21225")
- userId
- roadQuality (good/moderate/poor)
- potholeCount
- exploredAt timestamp

### Reward
- name, description, xpCost
- partnerName, category
- qrCode, expiresAt, status
- userId (who redeemed)

### DriveSession
- userId
- startTime, endTime, duration
- distanceTraveled, avgSpeed
- potholesDetected, cellsExplored
- xpEarned

### Pothole (updated)
- location (GeoJSON Point)
- severity (0-100)
- status (new/planned/in_progress/resolved)
- verified (boolean)
- aiConfidence (0-100)
- contributingUsers: [userId]
- impactData, reports, photo

---

## 🔗 API ENDPOINTS SUMMARY

**Auth:**
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh

**XP:**
- POST /api/xp/award
- GET /api/xp/me

**Achievements:**
- GET /api/achievements
- GET /api/achievements/me
- GET /api/achievements/progress

**Drive Sessions:**
- POST /api/drives/start
- POST /api/drives/update
- POST /api/drives/end

**Exploration:**
- GET /api/exploration/cells
- GET /api/exploration/stats
- GET /api/exploration/city

**Leaderboards:**
- GET /api/leaderboard/daily
- GET /api/leaderboard/weekly
- GET /api/leaderboard/monthly
- GET /api/leaderboard/all-time
- GET /api/leaderboard/me

**Events & Potholes:**
- POST /api/events
- GET /api/potholes
- GET /api/potholes/nearby
- PATCH /api/potholes/:id

**Verification:**
- POST /api/verify/photo

**Rewards:**
- GET /api/rewards
- POST /api/rewards/redeem
- GET /api/rewards/me
- POST /api/rewards/validate

**Routes:**
- POST /api/routes/optimize

**Stats:**
- GET /api/stats/overview
- GET /api/stats/trends
- GET /api/stats/heatmap
- GET /api/stats/user/:id

---

## 🚀 SUCCESS METRICS

- User registration/login working smoothly
- XP correctly awarded for all actions
- Achievements unlock automatically
- Leaderboards update on schedule
- Drive sessions track XP accurately
- Fog of war cells calculated correctly
- AI verification accuracy > 85%
- QR codes generate uniquely
- Route optimization reduces drive time by > 30%
- Socket.IO events emit in real-time

---

**Nemanja, srećno! 💪 Focus on gamification first (XP, achievements, leaderboards), then AI & rewards!**
