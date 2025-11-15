# PavePatrol - Master Plan

## 🎯 Vision
Transform city exploration into an immersive gamified experience where users discover their city, unlock hidden areas through fog-of-war mapping, earn XP, collect achievements, and compete on leaderboards while exploring urban landscapes.

---

## 📱 Core Features

### Mobile App (React Native + Expo + Mapbox)
- **Automatic Discovery Detection** - Sensors detect interesting activity moments while driving/moving (15-90 km/h)
- **Fog of War Map** - Explore city, reveal roads, see unexplored areas shrouded in darkness
- **XP & Leveling** - Earn points for distance traveled, discovery moments, exploring new grid cells
- **Achievements** - Unlock badges for milestones (first discovery, 100 cells explored, city master, etc.)
- **Leaderboards** - Daily/weekly/monthly rankings of top explorers
- **Rewards Shop** - Redeem XP for real rewards via QR codes (partner discounts, vouchers, merchandise)
- **Walking Mode** - Capture discovery photos with camera for bonus XP
- **Real-time Alerts** - Notifications for nearby activity areas and interesting discoveries
- **Profile & Stats** - Track progress, level, exploration percentage, distance traveled
- **Custom Map Styling** - Mapbox-powered beautiful, game-like map experience

### Web Dashboard (React + Tailwind + Mapbox)
- **City Exploration Map** - View all discovered areas, activity hotspots, exploration density
- **User Management** - View top explorers, user statistics, engagement metrics
- **Heatmap Analytics** - Visualize most explored areas, discovery clusters
- **Analytics Dashboard** - Stats, trends, exploration coverage, daily active users
- **Filtering** - By activity intensity, discovery type, area, timeframe
- **AI Chatbot** - Natural language queries ("Which neighborhoods are most explored?", "Who are top 10 explorers?")

### Backend (Node.js + Express + MongoDB)
- **Discovery Clustering** - Group nearby exploration events into activity areas (~3m radius)
- **Activity Scoring** - Calculate area popularity based on visit frequency and user engagement
- **XP System** - Award points for distance traveled, new cells explored, discovery moments
- **Achievement Tracking** - Check progress, unlock rewards automatically
- **Leaderboard Ranking** - Recalculate daily/weekly/monthly via cron jobs
- **AI Verification** - Gemini Vision API validates discovery photos for authenticity
- **Real-time Updates** - Socket.IO for live map sync, level-up notifications
- **Authentication** - JWT token-based auth (Google, Apple, Facebook, Email)

---

## 🗺️ Key Concepts

### Fog of War System (Mapbox-Powered)
- City divided into 100m x 100m grid cells
- Cells start dark/blurred (unexplored territory)
- Turn colored/revealed when user passes through them
- Color intensity based on exploration frequency:
  - **Bright/Vibrant** = Frequently explored
  - **Medium/Faded** = Moderately explored
  - **Dark Gray** = Unexplored
- Earn 50 XP per new cell explored
- Track exploration % per user
- Smooth fog reveal animations using Mapbox GL JS
- Offline cell caching for performance

### XP & Progression
| Action | XP Earned |
|--------|-----------|
| Travel 1km (any mode) | 10 XP |
| Explore new cell | 50 XP |
| Verified discovery moment | 100 XP |
| Walking Mode photo | 75 XP |
| Complete daily challenge | 200 XP |
| Maintain 7-day streak | 500 XP |
| Unlock achievement | Varies (50-500 XP) |

**Level Formula:** `XP Required = 100 × 1.5^(level-1)`

**Level Progression Examples:**
- Level 1 → 2: 100 XP
- Level 2 → 3: 150 XP
- Level 5 → 6: 506 XP
- Level 10 → 11: 3,840 XP

### Achievement Categories
- **Exploration**: First cell, 10 cells, 100 cells, 500 cells, 50% city explored, 100% neighborhood
- **Discovery**: First discovery moment, 10 verified, 50 verified, 200 verified discoveries
- **Streaks**: 3 days active, 7 days active, 30 days active, 100 days active
- **Distance**: 1km traveled, 50km, 500km, 1000km, marathon walker
- **Special**: City Navigator, Neighborhood Master, Top Explorer (weekly), Early Adopter

### Rewards System
- Partner discounts (bike shop, car wash)
- Service vouchers
- Exclusive merchandise
- Premium features (ad-free)
- Redeem with XP, get unique QR code
- Partners scan QR to validate

---

## 🔄 User Flows

### Explorer Journey (Mobile User)
1. **Welcome Screen** → Beautiful intro with "Start" button (using login without start.svg background)
2. **Feature Highlights** → 4 slide carousel showing app features
3. **Authentication** → Login with Google, Apple, Facebook, or Email
4. **Permissions** → Request location, motion sensors, camera, notifications
5. **Home Dashboard** → See fog of war map (Mapbox), current level, XP bar, exploration %
6. **Start Exploration** → Tap floating action button, choose Drive or Walk mode
7. **Drive/Explore Mode** → Auto-detect discovery moments via sensors, real-time map updates
8. **Discovery Moment** → Haptic feedback, visual notification, XP +100
9. **Explore New Cell** → Fog reveals on map, animation plays, XP +50
10. **Real-time Alert** → "Interesting activity area nearby!"
11. **End Session** → Summary screen (distance, XP earned, cells explored, achievements unlocked)
12. **View Profile** → Check level, stats, exploration %, achievements
13. **Browse Rewards** → Marketplace with partner offers
14. **Redeem Reward** → Spend XP, receive unique QR code
15. **Check Leaderboard** → See daily/weekly/monthly rankings

### Admin/Analytics Journey (Web Dashboard)
1. **Login** → Secure dashboard access
2. **View Exploration Map** → See all discovered areas, activity hotspots on Mapbox
3. **Filter** → Show by activity intensity, discovery type, timeframe
4. **Heatmap View** → Visualize most explored neighborhoods
5. **User Analytics** → Top explorers, engagement metrics, retention stats
6. **AI Chatbot** → Ask natural language questions about exploration data
7. **Export Data** → Download reports, user statistics, exploration coverage

---

## 🛠️ Technical Architecture

### Mobile Stack
- **Framework**: React Native + Expo SDK 54
- **Language**: TypeScript
- **Maps**: Mapbox GL (@rnmapbox/maps) with custom fog-of-war overlay
- **Sensors**: Accelerometer, Gyroscope (50 Hz sampling for discovery detection)
- **Location**: GPS with best navigation accuracy, background tracking
- **State Management**: Zustand (lightweight, performant)
- **Authentication**: JWT tokens with AsyncStorage persistence
- **Fonts**: Gajraj One (buttons), Bakbak One (readable text)
- **Camera**: expo-camera for Walking Mode photos
- **Notifications**: expo-notifications for real-time alerts
- **Haptics**: expo-haptics for discovery feedback
- **Language**: English only

### Backend Stack
- **Framework**: Node.js + Express + TypeScript
- **Database**: MongoDB Atlas (geospatial queries with 2dsphere index for discovery clustering)
- **Real-time**: Socket.IO (live map updates, level-up notifications, activity alerts)
- **AI**: Google Gemini Vision API (discovery photo verification)
- **Image Storage**: Cloudinary (discovery photos, user avatars)
- **Scheduling**: Node-cron (leaderboard updates, streak checking, daily challenges)
- **Authentication**: JWT tokens (Google, Apple, Facebook, Email via OAuth 2.0)
- **Validation**: Express-validator for request validation
- **Security**: Helmet, CORS, rate limiting

### Web Stack
- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Mapbox GL JS (consistent with mobile)
- **Real-time**: Socket.IO client
- **Charts**: Recharts (analytics, heatmaps, trends)
- **AI Chat**: Integration with Gemini chat API

---

## 📊 Data Models

### User
- **Identity**: email, username, avatarUrl, authProvider (google/apple/facebook/email)
- **Gamification**: level, currentXP, totalXP
- **Stats**:
  - distanceTraveled (km)
  - discoveriesMade (count)
  - cellsExplored (count)
  - explorationPercentage (% of city)
  - currentStreak (days)
  - longestStreak (days)
- **Settings**: notifications, sensitivity, language
- **Timestamps**: createdAt, lastActive

### Discovery / Activity Area
- **Location**: GeoJSON Point (lat/lng with 2dsphere index)
- **Popularity Score**: 0-100 (based on visit frequency)
- **Metadata**:
  - visitCount (total visits)
  - uniqueUsers (user IDs who discovered)
  - firstDiscoveredBy (userId)
  - photos (array of photo URLs)
  - aiVerified (boolean)
  - aiConfidence (0-100)
- **Timestamps**: firstDiscovered, lastVisited

### Exploration Cell
- **Grid**: cellId (e.g., "45.752_21.225" for 100m cell)
- **Ownership**: userId (first explorer)
- **Activity**:
  - explorationCount (times visited)
  - uniqueVisitors (count)
  - activityLevel (low/medium/high)
- **Timestamps**: firstExplored, lastExplored

### Drive Session
- **User**: userId
- **Duration**: startTime, endTime, totalMinutes
- **Distance**: distanceTraveled (km), avgSpeed
- **Discoveries**: discoveriesMade, cellsExplored, newCellsCount
- **XP**: totalXPEarned
- **Route**: pathCoordinates (array of lat/lng points)

### Achievement
- **Identity**: name, description, category, icon
- **Requirement**: type (exploration/discovery/streak/distance), threshold
- **Reward**: xpReward
- **Progress**: unlockedBy (array of userIds with unlock timestamp)

### Reward
- **Offer**: name, description, partnerName, category
- **Cost**: xpCost
- **Redemption**:
  - qrCode (unique JWT)
  - expiresAt (timestamp)
  - status (active/redeemed/expired)
  - redeemedBy (userId)
  - redeemedAt (timestamp)

---

## 🎮 Gamification Strategy

**Core Engagement Loop:**
1. **Explore** → Travel through city (drive/walk)
2. **Discover** → Trigger discovery moments via sensors
3. **Reveal** → Fog-of-war clears, map expands
4. **Earn** → Accumulate XP for distance + cells + discoveries
5. **Progress** → Level up, unlock achievements
6. **Compete** → Climb leaderboards
7. **Redeem** → Exchange XP for real rewards
8. **Repeat** → Continue exploring new areas

**Retention Hooks:**
- **Daily Challenges**: New objectives reset at midnight (e.g., "Explore 5 new cells today")
- **Streak Bonuses**: Consecutive days bonus (lose if miss a day)
- **Leaderboard Resets**: Weekly competition for top spots
- **Limited-Time Rewards**: Exclusive offers added monthly
- **Seasonal Events**: Special exploration events (e.g., "Winter Wanderer Week")
- **Social Competition**: Compare progress with friends
- **Fog-of-War Completion**: Drive to complete neighborhoods/districts

**Psychological Triggers:**
- **Curiosity**: What's hidden in unexplored areas?
- **Completion**: Fill in the entire city map
- **Status**: Be top of the leaderboard
- **Achievement**: Collect all badges
- **Reward**: Redeem valuable prizes

---

## 🚀 Implementation Phases

### Phase 1: Foundation & Cleanup ✅ (Days 1-2)
- ✅ Basic mobile app UI structure
- ✅ Sensor integration (accelerometer, gyroscope, GPS)
- ✅ Discovery detection algorithm (pattern recognition)
- ✅ Backend clustering & scoring services
- 🔄 **IN PROGRESS**: Clean up pothole terminology → exploration/discovery
- 🔄 **IN PROGRESS**: Delete test/debug screens
- 🔄 **IN PROGRESS**: Rename models, services, controllers

### Phase 2: Authentication & Backend Core (Days 3-4)
- [ ] Multi-provider authentication (Google, Apple, Facebook, Email)
- [ ] Update MongoDB schemas (User, Discovery, ExplorationCell, DriveSession, Achievement, Reward)
- [ ] XP service (award, level calculation, progression tracking)
- [ ] Achievement service (progress checking, auto-unlock)
- [ ] Leaderboard service (ranking calculation, cron jobs)

### Phase 3: Mobile Onboarding & UI (Days 5-6)
- [ ] Welcome Screen with custom background (login without start.svg)
- [ ] Feature Highlights carousel (4 slides with provided images)
- [ ] Auth screen integration with OAuth providers
- [ ] Permissions flow (location, camera, motion, notifications)
- [ ] Custom fonts setup (Gajraj One for buttons, Bakbak One for text)
- [ ] Profile screen (stats, level, XP bar, achievements)

### Phase 4: Mapbox Integration & Fog of War (Days 7-8)
- [ ] Mapbox GL setup (@rnmapbox/maps)
- [ ] Custom map styling (game-like aesthetic)
- [ ] Backend: Grid cell calculation (100m cells)
- [ ] Backend: Exploration tracking service
- [ ] Frontend: Fog-of-war overlay implementation
- [ ] Frontend: Smooth reveal animations
- [ ] Home dashboard with interactive Mapbox map

### Phase 5: Drive/Walk Modes & Sessions (Days 9-10)
- [ ] Drive mode UI (distance, time, XP counter, discovery moments)
- [ ] Walking mode UI with camera integration
- [ ] Backend: Drive session endpoints (start, update, end)
- [ ] Real-time location tracking with background permissions
- [ ] Post-session summary screen (XP breakdown, new cells, achievements)
- [ ] Discovery moment haptic feedback & visual effects

### Phase 6: Achievements & Leaderboards (Days 11-12)
- [ ] Backend: Achievement definitions (15-20 achievements)
- [ ] Backend: Achievement checking logic & auto-unlock
- [ ] Backend: Leaderboard cron jobs (daily/weekly/monthly)
- [ ] Frontend: Achievement screen with progress bars
- [ ] Frontend: Leaderboard screen (tabs, user ranking, top 100)

### Phase 7: AI Verification & Photos (Day 13)
- [ ] Backend: Gemini Vision API integration
- [ ] Backend: Photo verification endpoint
- [ ] Update AI prompt for discovery validation
- [ ] Frontend: Walking mode photo capture
- [ ] Frontend: "Verifying..." loading state
- [ ] XP adjustment based on AI confidence

### Phase 8: Rewards System (Day 14)
- [ ] Backend: Reward model & redemption logic
- [ ] Backend: QR code generation (JWT-based)
- [ ] Backend: Partner validation endpoint
- [ ] Frontend: Rewards marketplace UI
- [ ] Frontend: My Rewards screen with active QR codes
- [ ] Seed database with sample rewards

### Phase 9: Web Dashboard (Days 15-16) - OPTIONAL
- [ ] Mapbox GL JS integration
- [ ] Exploration heatmap visualization
- [ ] User analytics dashboard
- [ ] Top explorers view
- [ ] Activity area management
- [ ] AI chatbot integration

### Phase 10: Polish & Testing (Days 17-18)
- [ ] Animations (level-up, XP gain, fog reveal, achievement unlock)
- [ ] Push notifications for alerts
- [ ] Performance optimization (lazy loading, caching)
- [ ] Unit tests for critical services
- [ ] Integration testing
- [ ] Bug fixes & edge cases

### Phase 11: Deployment (Day 19)
- [ ] MongoDB Atlas production setup
- [ ] Backend deployment (Railway/Render/Heroku)
- [ ] Environment variables configuration
- [ ] Mobile app build (EAS Build for iOS & Android)
- [ ] Demo video recording
- [ ] Presentation materials preparation

---

## ✅ Success Metrics

**User Engagement:**
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- User retention (Day 7, Day 30)
- Average session length (time spent exploring)
- Sessions per user per week

**Exploration:**
- Total distance traveled (aggregate)
- Average exploration coverage % per user
- New cells explored per day
- Discovery moments per session

**Gamification:**
- Average user level
- % of users reaching level 5, 10, 20
- Achievements unlocked per user
- Leaderboard engagement (% viewing daily)

**Monetization/Value:**
- Reward redemption rate
- XP earned vs XP redeemed ratio
- Partner engagement (QR scans)

**Technical:**
- App crash rate
- GPS tracking accuracy
- Discovery detection accuracy
- API response times
- Fog-of-war render performance

---

## 🎯 MVP Scope (Hackathon - 19 Days)

### **MUST HAVE** (Core Experience)
- ✅ Mobile: Sensor-based discovery detection
- ✅ Mobile: GPS location tracking
- ✅ Backend: Discovery clustering service
- ✅ Backend: Activity scoring service
- [ ] **Authentication**: Multi-provider (Google, Facebook, Email)
- [ ] **XP System**: Award XP, level calculation, progression
- [ ] **Mapbox Integration**: Fog-of-war map with reveal animations
- [ ] **Drive Mode**: Distance tracking, discovery detection, XP counter
- [ ] **Exploration Grid**: 100m cells, exploration tracking
- [ ] **Post-Session Summary**: XP breakdown, cells explored, achievements
- [ ] **Basic Leaderboard**: All-time top 100
- [ ] **Profile Screen**: Stats, level, XP bar

### **SHOULD HAVE** (Enhanced Experience)
- [ ] **Walking Mode**: Camera capture for discoveries
- [ ] **AI Verification**: Gemini Vision for photo validation
- [ ] **Achievements**: 10-15 basic achievements with auto-unlock
- [ ] **Leaderboards**: Daily/weekly/monthly rankings
- [ ] **Rewards Marketplace**: 5-10 sample rewards
- [ ] **QR Code Redemption**: Unique codes for partners
- [ ] **Onboarding Flow**: Welcome, features, auth, permissions
- [ ] **Real-time Alerts**: Socket.IO notifications

### **NICE TO HAVE** (Polish & Future)
- [ ] **Web Dashboard**: Exploration analytics, heatmaps
- [ ] **AI Chatbot**: Natural language queries
- [ ] **Advanced Animations**: Level-up, fog reveal effects
- [ ] **Daily Challenges**: Rotating objectives
- [ ] **Streak Tracking**: Consecutive days bonus
- [ ] **Social Features**: Friends, teams
- [ ] **Offline Mode**: Cached map tiles

---

## 💡 Future Enhancements (Post-Hackathon)

**Exploration Features:**
- AR navigation overlay showing unexplored areas
- 3D city visualization with fog-of-war
- Multi-city expansion with city selection
- Neighborhood-based exploration challenges
- Historical exploration data visualization

**Social Features:**
- Teams/guilds for collaborative exploration
- Friend challenges ("Race to explore X neighborhood")
- Shared exploration maps
- Social feed of discoveries

**Advanced Gamification:**
- Seasonal events (Summer Explorer, Winter Wanderer)
- Limited-time exclusive areas
- Rare discovery NFTs/collectibles
- Premium exploration modes

**Integrations:**
- Tourism board partnerships (official city guides)
- Public transit mode (explore while commuting)
- Bike mode with dedicated scoring
- Fitness app integration (Strava, Apple Health)

**Technical:**
- Machine learning for discovery pattern optimization
- Predictive exploration recommendations
- Weather-based challenges
- Offline-first architecture

---

## 👥 Team Roles

**Vukasin** - Mobile Development
- React Native + Expo development
- Mapbox integration & fog-of-war implementation
- Sensor integration & discovery detection
- UI/UX implementation (Gajraj One & Bakbak One fonts)
- Onboarding flow & all mobile screens

**Nemanja** - Backend Development
- Node.js + Express + MongoDB
- Authentication (multi-provider OAuth)
- XP system, achievements, leaderboards
- Discovery clustering & activity scoring
- AI integration (Gemini Vision API)
- Real-time updates (Socket.IO)

**Teodora** - Web Dashboard (Optional)
- React + Tailwind CSS
- Mapbox GL JS integration
- Analytics dashboard & heatmaps
- User management
- AI chatbot integration

---

## 🗺️ Why Mapbox?

**Chosen Technology:** Mapbox GL (@rnmapbox/maps for mobile, Mapbox GL JS for web)

**Key Advantages:**
✅ **Fog-of-War Support**: Custom tile styling & dynamic overlay layers
✅ **Game-Like Aesthetics**: Full control over map appearance (neon, arcade, cartoon styles)
✅ **Performance**: Vector tiles, smooth animations, offline caching
✅ **Cross-Platform**: Identical experience on iOS, Android, Web
✅ **Customization**: GeoJSON layers, heatmaps, 3D buildings, custom markers
✅ **Exploration Features**: Easy grid-based overlays, reveal animations

**Why Not Google Maps:**
❌ No fog-of-war support
❌ Limited custom styling
❌ Expensive for gamification use cases
❌ Restrictive licensing for gaming features

**Implementation:**
- Mobile: `@rnmapbox/maps` (React Native)
- Web: `mapbox-gl` (JavaScript)
- Custom layers for fog-of-war overlay
- GeoJSON for exploration cells
- Real-time updates via map layer refresh

---

## 📖 API Terminology Reference

### OLD (Pothole Detection) → NEW (Exploration)

| Old Backend Term | New Backend Term |
|------------------|------------------|
| `Pothole` | `Discovery` / `ActivityArea` |
| `PotholeEvent` | `ExplorationEvent` |
| `PotholePhoto` | `DiscoveryPhoto` |
| `severity` | `popularityScore` / `activityLevel` |
| `potholeDetected` | `discoveryMoment` |
| `potholesDetected` (user stat) | `discoveriesMade` |
| `nearbyPotholes` | `nearbyActivityAreas` |
| `detectPothole` | `detectDiscovery` |
| `verifyPothole` | `verifyDiscovery` |

### Frontend/UI Text Changes

| Old UI Text | New UI Text |
|-------------|-------------|
| "Pothole Detected!" | "Discovery Moment!" |
| "Potholes Detected" | "Discoveries Made" |
| "Detect Potholes" | "Discover Moments" |
| "Road Damage" | "Activity Area" |
| "Severe Pothole Ahead" | "Interesting Area Nearby" |
| "Detection Master" | "Discovery Master" |
| "Report Pothole" | "Capture Discovery" |

---

**Last Updated:** 2025-01-15
**Status:** Clean Exploration App - No Pothole References
**Language:** English Only
**Design:** Minimalist, Apple-style aesthetic with Gajraj One & Bakbak One fonts
