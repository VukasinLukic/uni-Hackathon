# PavePatrol - Master Plan

## 🎯 Vision
Transform pothole detection into a gamified exploration experience where users earn XP, unlock achievements, and compete on leaderboards while helping map road quality.

---

## 📱 Core Features

### Mobile App (React Native + Expo)
- **Automatic Pothole Detection** - Sensors detect potholes while driving (15-90 km/h)
- **Fog of War Map** - Explore city, reveal roads, see unexplored areas in dark
- **XP & Leveling** - Earn points for driving, detecting potholes, exploring new areas
- **Achievements** - Unlock badges for milestones (first pothole, 100 cells explored, etc.)
- **Leaderboards** - Daily/weekly/monthly rankings
- **Rewards Shop** - Redeem XP for real rewards via QR codes
- **Walking Mode** - Manual photo reporting with camera
- **Real-time Alerts** - Voice warnings for upcoming severe potholes
- **Profile & Stats** - Track progress, level, exploration %

### Web Dashboard (React + Tailwind)
- **City Map** - View all potholes with severity colors
- **Status Management** - Mark potholes as new/planned/in progress/resolved
- **Route Optimization** - AI suggests efficient repair crew routes
- **Analytics** - Stats, trends, performance metrics
- **Filtering** - By severity, status, area, timeframe
- **AI Chatbot** - Natural language queries ("What are top 5 worst potholes?")

### Backend (Node.js + Express + MongoDB)
- **Event Clustering** - Group nearby pothole reports (~20m radius)
- **Severity Scoring** - Calculate based on magnitude, frequency, max impact
- **XP System** - Award points for distance, potholes, exploration
- **Achievement Tracking** - Check progress, unlock rewards
- **Leaderboard Ranking** - Recalculate daily/weekly/monthly via cron jobs
- **AI Verification** - Gemini API validates pothole detections
- **Real-time Updates** - Socket.IO for live data sync
- **Authentication** - JWT token-based auth

---

## 🗺️ Key Concepts

### Fog of War System
- City divided into 100m x 100m grid cells
- Cells start dark (unexplored)
- Turn colored when driven through (green/yellow/red based on road quality)
- Earn 50 XP per new cell explored
- Track exploration % per user

### XP & Progression
| Action | XP Earned |
|--------|-----------|
| Drive 1km | 10 XP |
| Explore new cell | 50 XP |
| Detect verified pothole | 100 XP |
| Walking Mode report | 75 XP |
| Daily challenge | 200 XP |
| 7-day streak | 500 XP |

**Level Formula:** `XP Required = 100 × 1.5^(level-1)`

### Achievement Categories
- **Exploration**: First cell, 10 cells, 100 cells, 50% city
- **Detection**: First pothole, 10 verified, 50 verified, 200 verified
- **Streaks**: 3 days, 7 days, 30 days
- **Distance**: 1km, 50km, 500km

### Rewards System
- Partner discounts (bike shop, car wash)
- Service vouchers
- Exclusive merchandise
- Premium features (ad-free)
- Redeem with XP, get unique QR code
- Partners scan QR to validate

---

## 🔄 User Flows

### Driver Journey
1. **Login** → Auth with email/password or Google OAuth
2. **Home Dashboard** → See fog of war map, current level, XP bar, exploration %
3. **Start Drive** → Auto-start sensor monitoring
4. **Detect Pothole** → Haptic feedback, XP +100, send to backend
5. **Explore New Area** → Cell revealed on map, XP +50
6. **Alert** → "Caution: severe pothole in 50m"
7. **End Drive** → Summary screen (distance, XP earned, new achievements)
8. **View Profile** → Check level, achievements, stats
9. **Redeem Reward** → Spend XP, get QR code
10. **Leaderboard** → See ranking, compete with friends

### City Official Journey
1. **Login** → Secure dashboard access
2. **View Map** → See all potholes, color-coded by severity
3. **Filter** → Show only critical potholes (severity > 70)
4. **Plan Routes** → Input 2 crews, AI suggests optimized paths
5. **Dispatch** → Assign routes, mark as "in progress"
6. **Verify Fix** → Mark pothole "resolved"
7. **Analytics** → View weekly trends, avg resolution time

---

## 🛠️ Technical Architecture

### Mobile Stack
- React Native + Expo SDK 54
- TypeScript
- Sensors: Accelerometer, Gyroscope (50 Hz sampling)
- Location: GPS with best navigation accuracy
- Maps: react-native-maps + custom fog of war overlay
- State: Zustand
- Auth: JWT tokens stored in AsyncStorage

### Backend Stack
- Node.js + Express + TypeScript
- MongoDB Atlas (geospatial queries with 2dsphere index)
- Socket.IO (real-time updates)
- Google Gemini API (AI verification)
- Cloudinary (image storage)
- Node-cron (scheduled leaderboard updates)
- JWT authentication

### Web Stack
- React + TypeScript
- Tailwind CSS
- Mapbox GL JS / Leaflet
- Socket.IO client
- Recharts (analytics)

---

## 📊 Data Models

### User
- Email, username, avatarUrl
- Level, currentXP, totalXP
- Stats (distance, potholes detected, exploration %)
- Settings (notifications, sensitivity)

### Pothole Cluster
- Location (lat/lng with geospatial index)
- Severity (0-100 score)
- Status (new/planned/in_progress/resolved)
- Reports count, unique users
- Impact data (avg magnitude, max magnitude)
- Photo URL, AI validation result

### Exploration Cell
- CellId (grid coordinate)
- UserId
- Road quality (good/moderate/poor)
- Pothole count
- Explored timestamp

### Achievement
- Name, description, category
- Requirement (threshold)
- Reward XP, icon

### Reward
- Name, description, cost in XP
- Partner name, category
- QR code, expiry, status

---

## 🎮 Gamification Strategy

**Engagement Loop:**
1. Drive → Detect potholes → Earn XP
2. Explore new areas → Reveal fog of war → Earn XP
3. Level up → Unlock achievements → Feel progress
4. Check leaderboard → See rank → Compete
5. Earn enough XP → Redeem reward → Get value

**Retention Hooks:**
- Daily challenges (reset at midnight)
- Streak bonuses (lose if miss a day)
- Leaderboard resets (weekly competition)
- New rewards added monthly
- Seasonal events

---

## 🚀 Implementation Phases

### Phase 1: Foundation ✅
- Basic mobile app UI (minimalist Apple-style)
- Sensor integration (accelerometer, gyroscope, GPS)
- Pothole detection algorithm
- Backend event clustering & severity scoring
- Legacy demo preservation

### Phase 2: Authentication & Backend (Week 1-2)
- User registration/login (JWT)
- MongoDB schemas (User, Achievement, Exploration, Reward)
- XP service (award, level up, track)
- Achievement service (check, unlock)
- Leaderboard service (calculate, rank)

### Phase 3: Gamification Core (Week 3-4)
- Mobile: Onboarding flow (welcome, features, permissions)
- Mobile: Profile screen (stats, level, XP bar)
- Mobile: Drive session tracking
- Mobile: Post-drive summary (XP earned, achievements unlocked)
- Backend: Drive endpoints (start, update, end)

### Phase 4: Fog of War (Week 4-5)
- Backend: Grid cell calculation (100m cells)
- Backend: Exploration tracking
- Backend: Road quality calculation
- Mobile: Fog of war map overlay
- Mobile: Home dashboard with map

### Phase 5: Achievements & Leaderboards (Week 5-6)
- Backend: Achievement checking logic
- Backend: Leaderboard cron jobs
- Mobile: Achievement screen (grid, progress)
- Mobile: Leaderboard screen (tabs, ranking)

### Phase 6: AI Verification (Week 7)
- Backend: Gemini API integration
- Backend: Verification endpoint
- Mobile: "Verifying..." indicator
- Adjust XP based on confidence

### Phase 7: Rewards (Week 8)
- Backend: Reward redemption
- Backend: QR code generation
- Mobile: Rewards marketplace
- Mobile: My rewards (active QR codes)

### Phase 8: Web Dashboard (Week 8-9)
- Map with pothole markers
- Filters (severity, status, area)
- Status updates
- Route optimization
- Analytics charts
- AI chatbot

### Phase 9: Polish (Week 9-10)
- Animations (level up, XP gain, achievement unlock)
- Push notifications
- Performance optimization
- Testing (unit, integration, E2E)
- Bug fixes

### Phase 10: Launch (Week 10)
- Production deployment
- MongoDB Atlas setup
- Backend on Railway/Heroku
- Mobile app build (EAS)
- Demo video
- Presentation materials

---

## ✅ Success Metrics

- User retention (7-day, 30-day)
- Daily active users
- Avg potholes detected per user
- Exploration coverage % per city
- Reward redemption rate
- Session length (time spent driving)
- Level distribution (how many reach level 10+)

---

## 🎯 MVP Scope (Hackathon)

**Must Have:**
- ✅ Mobile: Auto pothole detection
- ✅ Mobile: Sensor monitoring + GPS
- ✅ Backend: Event clustering
- ✅ Backend: Severity scoring
- [ ] Authentication (register/login)
- [ ] XP system (award, level up)
- [ ] Basic fog of war map
- [ ] Simple leaderboard

**Should Have:**
- [ ] Achievements (3-5 basic ones)
- [ ] AI verification (Gemini)
- [ ] Post-drive summary
- [ ] Web dashboard (basic map view)

**Nice to Have:**
- [ ] Rewards system
- [ ] AI chatbot
- [ ] Route optimization
- [ ] Advanced analytics

---

## 💡 Future Enhancements

- AR navigation with pothole overlays
- Social features (teams, challenges)
- Government integration (official reporting API)
- Multi-city expansion
- Predict pothole formation (weather + road data)
- Bike mode (detect potholes while cycling)
- Public transit mode (bus/tram pothole mapping)

---

**Team:**
- Vukasin: Mobile development (React Native, sensors, UI)
- Nemanja: Backend development (Node.js, MongoDB, AI)
- Teodora: Web dashboard (React, maps, analytics)
