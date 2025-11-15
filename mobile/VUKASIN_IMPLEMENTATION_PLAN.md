# 📱 VUKASIN - Mobile App Implementation Plan

**Role**: Mobile Developer - PavePatrol Gamification App
**Tech Stack**: React Native + Expo + TypeScript + Sensors + Maps + Zustand
**Timeline**: 7 days (phased approach)

---

## 🎯 OVERVIEW

Mobile app responsibilities for PavePatrol:
- Onboarding flow (Welcome, Features, Auth, Permissions)
- Home dashboard with fog of war map
- Drive mode with auto-detection
- Walking mode with camera
- Post-drive summary (XP earned, achievements unlocked)
- Profile screen (stats, level, XP bar)
- Achievement grid
- Leaderboard screen (daily/weekly/monthly/all-time)
- Rewards marketplace
- Settings screen
- Real-time alerts for nearby severe potholes

---

## 📅 PHASE 1: Navigation & Onboarding (Day 1)

### Day 1 Morning: Setup & Navigation

**Tasks:**
1. Keep existing Expo project structure
2. Install new dependencies:
   - React Navigation (stack + bottom tabs)
   - Zustand (state management)
   - Axios (API calls)
   - Socket.IO client
3. Create navigation structure:
   - Onboarding stack (Welcome → Features → Auth → Permissions)
   - Main tab navigator (Home, Profile, Achievements, Leaderboard, Rewards)
   - Modal screens (Settings, Post-Drive Summary)
4. Create Zustand store with:
   - User state (token, profile, level, XP)
   - Drive state (isActive, startTime, detectedPotholes)
   - Map state (exploredCells, nearbyPotholes)

**Deliverable**: Navigation structure + state management

---

### Day 1 Afternoon: Onboarding Flow

**Tasks:**
1. Create WelcomeScreen:
   - Logo animation
   - App name + tagline: "Explore. Detect. Earn."
   - "Get Started" button
2. Create FeaturesScreen:
   - Carousel with 3 features:
     - "Auto Detection" - Sensors detect potholes automatically
     - "Fog of War" - Explore city, reveal roads
     - "Earn Rewards" - XP, achievements, leaderboards
   - "Next" button
3. Create AuthScreen:
   - Email/password input fields
   - "Sign Up" and "Login" buttons
   - Call POST /api/auth/register or /api/auth/login
   - Store JWT token in AsyncStorage
   - Save user profile in Zustand
4. Create PermissionsScreen:
   - Request Location (foreground + background)
   - Request Motion sensors
   - Request Camera
   - Explain why each is needed
   - "Allow All" button

**Deliverable**: Complete onboarding flow

---

## 📅 PHASE 2: Home Dashboard & Map (Day 2)

### Day 2 Morning: Home Dashboard UI

**Tasks:**
1. Create HomeScreen layout:
   - Header: Avatar, level badge, XP bar
   - Map container (70% height)
   - Quick stats card (distance today, potholes detected)
   - Bottom tabs navigation
2. Create custom XP progress bar component:
   - Show current level
   - Progress to next level
   - Animated fill on XP gain
3. Create level badge component:
   - Circular badge with level number
   - Gold/silver/bronze colors based on tier
4. Fetch user data on mount:
   - GET /api/xp/me
   - GET /api/exploration/stats

**Deliverable**: Home dashboard UI without map

---

### Day 2 Afternoon: Fog of War Map

**Tasks:**
1. Integrate react-native-maps
2. Create fog of war overlay:
   - Fetch explored cells: GET /api/exploration/cells
   - Render 100m x 100m grid squares as polygons
   - Color cells based on road quality:
     - Green (good): 0-2 potholes
     - Yellow (moderate): 3-5 potholes
     - Red (poor): 6+ potholes
   - Dark/transparent for unexplored cells
3. Add pothole markers:
   - Fetch nearby: GET /api/potholes/nearby
   - Color by severity (green/yellow/red)
   - Show severity on tap
4. Add user location marker (blue dot)

**Deliverable**: Fog of war map on home screen

---

## 📅 PHASE 3: Drive Mode & Detection (Day 3)

### Day 3 Morning: Pre-Drive & Active Drive

**Tasks:**
1. Create DriveModeScreen (keep existing sensor logic):
   - Pre-drive state:
     - "Start Drive" button
     - Estimated XP potential
   - Active drive state:
     - Large speedometer (current speed)
     - Pulsing "Monitoring..." indicator
     - Pothole counter badge
     - XP earned so far
     - "End Drive" button
2. Integrate with backend:
   - Call POST /api/drives/start on start
   - Send GPS updates: POST /api/drives/update every 10 seconds
   - Call POST /api/drives/end on end
3. Keep existing sensor detection logic
4. On pothole detected:
   - Haptic feedback
   - Flash screen border green
   - Increment counter
   - Send event: POST /api/events

**Deliverable**: Drive mode with backend integration

---

### Day 3 Afternoon: Post-Drive Summary

**Tasks:**
1. Create PostDriveSummaryScreen (modal):
   - Show drive stats:
     - Duration (e.g., "25 minutes")
     - Distance (e.g., "12.4 km")
     - Potholes detected (e.g., "7")
     - New cells explored (e.g., "18")
   - XP breakdown:
     - Distance: 10 XP/km = 124 XP
     - New cells: 50 XP × 18 = 900 XP
     - Potholes: 100 XP × 7 = 700 XP
     - Total: 1,724 XP
   - Level up animation if leveled up
   - Achievements unlocked (if any)
   - "Continue" button
2. Animate XP bar filling up
3. Show confetti animation on level up

**Deliverable**: Post-drive summary with animations

---

## 📅 PHASE 4: Profile & Achievements (Day 4)

### Day 4 Morning: Profile Screen

**Tasks:**
1. Create ProfileScreen layout:
   - Header: Avatar, username, level badge
   - XP bar (progress to next level)
   - Stats grid (4 cards):
     - Distance Driven: "142 km"
     - Potholes Detected: "34"
     - Cells Explored: "215"
     - Exploration %: "12.4%"
   - Recent drives list (last 5)
   - Settings button (gear icon)
2. Fetch user stats: GET /api/stats/user/:id
3. Make stats cards visually appealing (icons + numbers)

**Deliverable**: Profile screen with stats

---

### Day 4 Afternoon: Achievements Screen

**Tasks:**
1. Create AchievementsScreen layout:
   - Tabs: All / Unlocked / Locked
   - Grid of achievement cards (3 columns)
2. Create achievement card component:
   - Locked: Grayed out, lock icon, progress bar
   - Unlocked: Full color, checkmark, unlock date
3. Fetch achievements:
   - GET /api/achievements/me (unlocked)
   - GET /api/achievements/progress (locked with progress)
4. Achievement categories:
   - Exploration (compass icon)
   - Detection (pothole icon)
   - Streaks (fire icon)
   - Distance (road icon)
5. Show progress for locked achievements:
   - "First Cell: 1/1"
   - "10 Cells: 7/10"

**Deliverable**: Achievement grid with progress

---

## 📅 PHASE 5: Leaderboards & Rewards (Day 5)

### Day 5 Morning: Leaderboard Screen

**Tasks:**
1. Create LeaderboardScreen layout:
   - Tabs: Daily / Weekly / Monthly / All-Time
   - Top 3 podium (1st, 2nd, 3rd with avatars)
   - Ranked list (4-100)
   - User's rank card pinned at bottom
2. Create leaderboard row component:
   - Rank number
   - Avatar + username
   - Level badge
   - Total XP
3. Fetch leaderboards:
   - GET /api/leaderboard/daily
   - GET /api/leaderboard/weekly
   - GET /api/leaderboard/monthly
   - GET /api/leaderboard/all-time
   - GET /api/leaderboard/me (user's rank)
4. Highlight user's row in green
5. Add pull-to-refresh

**Deliverable**: Leaderboard with tabs

---

### Day 5 Afternoon: Rewards Marketplace

**Tasks:**
1. Create RewardsScreen layout:
   - Available rewards grid (2 columns)
   - "My Rewards" button
2. Create reward card component:
   - Partner logo
   - Reward name
   - XP cost
   - "Redeem" button
   - Disabled if insufficient XP
3. Create RedeemModal:
   - Show reward details
   - Confirm XP deduction
   - Call POST /api/rewards/redeem
   - Display QR code on success
4. Create MyRewardsScreen:
   - List of redeemed rewards
   - Show QR code for each
   - Expiry date
   - Status (active/redeemed/expired)
5. Fetch rewards:
   - GET /api/rewards (available)
   - GET /api/rewards/me (user's redeemed)

**Deliverable**: Rewards marketplace with QR codes

---

## 📅 PHASE 6: Walking Mode & Alerts (Day 6)

### Day 6 Morning: Walking Mode

**Tasks:**
1. Keep existing WalkingModeScreen camera logic
2. Update to use Expo Camera (CameraView)
3. Integrate with AI verification:
   - Take photo
   - Show preview with "Submit" button
   - Call POST /api/verify/photo
   - Show loading: "Verifying with AI..."
   - Display result:
     - Verified: "Pothole confirmed! +100 XP"
     - Rejected: "Not a pothole. Try again."
4. Add XP notification animation on success
5. Update exploration grid if new cell

**Deliverable**: Walking mode with AI verification

---

### Day 6 Afternoon: Real-time Alerts

**Tasks:**
1. Create Socket.IO service:
   - Connect with JWT token
   - Subscribe to nearby potholes
   - Listen for events:
     - `new_pothole` - Show alert banner
     - `level_up` - Self-emitted, show animation
     - `achievement_unlocked` - Show popup
2. Create alert components:
   - Banner alert (top slide-in):
     - "Caution: Severe pothole 200m ahead!"
     - Auto-dismiss after 5 seconds
   - Achievement popup (center modal):
     - Achievement icon + name
     - "Unlocked!" badge
     - XP earned
3. Add voice alerts:
   - Use expo-speech
   - "Caution: pothole ahead"
4. Check nearby potholes every 5 seconds during drive

**Deliverable**: Real-time alerts for potholes & achievements

---

## 📅 PHASE 7: Polish & Animations (Day 7)

### Day 7 Morning: Animations & Transitions

**Tasks:**
1. Add level up animation:
   - Confetti explosion
   - Level badge grows + spins
   - Sound effect
2. Add XP gain animation:
   - Numbers fly up (+100 XP)
   - XP bar fills smoothly
3. Add achievement unlock animation:
   - Lock breaks open
   - Card flips to full color
   - Sparkle effect
4. Add smooth transitions:
   - Screen transitions (fade/slide)
   - Button press feedback
   - Loading states with spinners
5. Use React Native Reanimated for performance

**Deliverable**: Polished animations throughout app

---

### Day 7 Afternoon: Testing & Bug Fixes

**Tasks:**
1. Test on real device (iOS/Android):
   - Sensors work correctly
   - GPS accuracy
   - Detection threshold calibration
   - Battery usage optimization
2. Add error handling:
   - Network errors (show retry button)
   - Offline mode (cache data locally)
   - Permission denied (redirect to settings)
3. Add loading states:
   - Skeleton screens
   - Spinners for API calls
4. Settings screen:
   - Detection sensitivity slider
   - Notifications toggle
   - Sound alerts toggle
   - Logout button
5. Fix any crashes or UI bugs

**Deliverable**: Production-ready mobile app

---

## 🎯 PRIORITY CHECKLIST

### MUST HAVE
- [ ] Onboarding flow (Welcome, Features, Auth, Permissions) - **NOT STARTED**
- [ ] Home dashboard with fog of war map - **BASIC HOME EXISTS**
- [x] Drive mode with auto-detection - **IMPLEMENTED (Legacy)**
- [ ] Post-drive summary with XP breakdown - **NOT STARTED**
- [ ] Profile screen with stats - **NOT STARTED**
- [ ] Achievement grid - **NOT STARTED**
- [ ] Leaderboard (at least all-time) - **NOT STARTED**

### SHOULD HAVE
- [x] Walking mode with AI verification - **IMPLEMENTED (Legacy)**
- [ ] Rewards marketplace with QR codes - **NOT STARTED**
- [ ] Real-time alerts (potholes, achievements) - **NOT STARTED**
- [ ] Animations (level up, XP gain, unlock) - **NOT STARTED**
- [ ] Settings screen - **NOT STARTED**

### NICE TO HAVE
- [ ] Daily challenges
- [ ] Social features (friends, teams)
- [ ] Trip history
- [ ] Dark mode
- [ ] Offline mode

---

## ✅ TRENUTNO IMPLEMENTIRANO (Legacy sistem)

**Screens:**
- ✅ HomeScreen.tsx (new minimalist, logo placeholder)
- ✅ HomeScreenLegacy.tsx (preserved for demo)
- ✅ DrivingModeScreen.tsx (full auto-detection, sensors)
- ✅ WalkingModeScreen.tsx (camera + manual detection)
- ✅ TestModeScreen.tsx (manual testing)
- ✅ TestBackendScreen.tsx (API testing)
- ✅ ViewGraphsScreen.tsx (real-time sensor graphs)
- ✅ SensorDebugScreen.tsx (sensor calibration)

**Components:**
- ✅ ActionButton.tsx (FAB with menu)
- ✅ HomeActionButton.tsx (home-specific FAB)
- ✅ Button.tsx (generic button)
- ✅ Card.tsx (generic card)

**Services:**
- ✅ sensorService.ts (accelerometer + gyroscope at 50Hz)
- ✅ locationService.ts (GPS tracking)
- ✅ detectionService.ts (pothole detection algorithm)
- ✅ apiService.ts (backend communication)

**Utils:**
- ✅ signalProcessing.ts (high-pass filter, spike detection)
- ✅ contextChecks.ts (speed validation, device stability)
- ✅ constants.ts (app constants)

**Types:**
- ✅ pothole.types.ts (TypeScript types)

**Navigation:**
- ✅ Basic screen switching (useState-based)
- ⚠️ No navigation library (React Navigation not installed)

---

## 🚧 ŠTA TREBA DODATI (Gamification)

**PRIORITY 1 - Navigation & Onboarding:**
1. Install React Navigation (stack + bottom tabs)
2. Install Zustand (state management)
3. Install Socket.IO client
4. WelcomeScreen (new)
5. FeaturesScreen (new)
6. AuthScreen (new)
7. PermissionsScreen (new)
8. Navigation structure (Onboarding → Main Tabs)

**PRIORITY 2 - Core Gamification Screens:**
1. HomeScreen update (fog of war map)
2. ProfileScreen (new - stats, XP, level)
3. AchievementsScreen (new - grid with progress)
4. LeaderboardScreen (new - tabs for daily/weekly/monthly)
5. RewardsScreen (new - marketplace)

**PRIORITY 3 - Components:**
1. XPBar.tsx (new - animated progress bar)
2. LevelBadge.tsx (new - circular badge)
3. AchievementCard.tsx (new - locked/unlocked states)
4. LeaderboardRow.tsx (new - ranking display)
5. RewardCard.tsx (new - reward with XP cost)
6. AlertBanner.tsx (new - top slide-in alerts)
7. FogOfWarMap.tsx (new - map with grid overlay)

**PRIORITY 4 - Integration:**
1. PostDriveSummaryScreen (new - XP breakdown modal)
2. MyRewardsScreen (new - QR code display)
3. SettingsScreen (new - sensitivity, notifications)
4. Socket.IO service (new - real-time events)
5. Auth service (new - JWT token management)
6. API service update (add all new endpoints)

**PRIORITY 5 - Polish:**
1. Animations (level up, XP gain, achievement unlock)
2. Voice alerts (expo-speech)
3. Haptic feedback
4. Loading states
5. Error handling
6. Offline mode

---

## 📱 SCREEN LIST

**Onboarding Stack:**
1. WelcomeScreen
2. FeaturesScreen
3. AuthScreen
4. PermissionsScreen

**Main Tab Navigator:**
1. HomeScreen (fog of war map)
2. ProfileScreen (stats, level, XP)
3. AchievementsScreen (grid, progress)
4. LeaderboardScreen (daily/weekly/monthly/all-time)
5. RewardsScreen (marketplace)

**Modal Screens:**
6. DriveModeScreen
7. WalkingModeScreen
8. PostDriveSummaryScreen
9. SettingsScreen
10. MyRewardsScreen (QR codes)

---

## 🗂️ FOLDER STRUCTURE

```
mobile/
├── src/
│   ├── screens/
│   │   ├── onboarding/
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── FeaturesScreen.tsx
│   │   │   ├── AuthScreen.tsx
│   │   │   └── PermissionsScreen.tsx
│   │   ├── main/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── AchievementsScreen.tsx
│   │   │   ├── LeaderboardScreen.tsx
│   │   │   └── RewardsScreen.tsx
│   │   ├── modes/
│   │   │   ├── DriveModeScreen.tsx
│   │   │   └── WalkingModeScreen.tsx
│   │   ├── modals/
│   │   │   ├── PostDriveSummaryScreen.tsx
│   │   │   ├── SettingsScreen.tsx
│   │   │   └── MyRewardsScreen.tsx
│   │   └── legacy/
│   │       ├── HomeScreenLegacy.tsx
│   │       ├── DrivingModeScreen.tsx
│   │       └── TestModeScreen.tsx
│   ├── components/
│   │   ├── XPBar.tsx
│   │   ├── LevelBadge.tsx
│   │   ├── AchievementCard.tsx
│   │   ├── LeaderboardRow.tsx
│   │   ├── RewardCard.tsx
│   │   ├── AlertBanner.tsx
│   │   ├── FogOfWarMap.tsx
│   │   └── Button.tsx
│   ├── services/
│   │   ├── apiService.ts
│   │   ├── socketService.ts
│   │   ├── sensorService.ts
│   │   ├── locationService.ts
│   │   ├── detectionService.ts
│   │   └── authService.ts
│   ├── store/
│   │   └── useAppStore.ts
│   ├── navigation/
│   │   ├── OnboardingNavigator.tsx
│   │   ├── MainTabNavigator.tsx
│   │   └── RootNavigator.tsx
│   ├── utils/
│   │   ├── signalProcessing.ts
│   │   ├── gridCalculations.ts
│   │   └── animations.ts
│   └── types/
│       └── index.ts
├── App.tsx
└── package.json
```

---

## 🔗 API INTEGRATION

**Auth:**
- POST /api/auth/register
- POST /api/auth/login

**User & XP:**
- GET /api/xp/me
- GET /api/stats/user/:id

**Drive Sessions:**
- POST /api/drives/start
- POST /api/drives/update
- POST /api/drives/end

**Exploration:**
- GET /api/exploration/cells
- GET /api/exploration/stats

**Achievements:**
- GET /api/achievements/me
- GET /api/achievements/progress

**Leaderboards:**
- GET /api/leaderboard/daily
- GET /api/leaderboard/weekly
- GET /api/leaderboard/monthly
- GET /api/leaderboard/all-time
- GET /api/leaderboard/me

**Rewards:**
- GET /api/rewards
- POST /api/rewards/redeem
- GET /api/rewards/me

**Potholes:**
- POST /api/events
- GET /api/potholes/nearby
- POST /api/verify/photo

---

## 🎨 UI/UX GUIDELINES

**Design System:**
- Colors:
  - Primary: Blue (#007AFF)
  - Success: Green (#10B981)
  - Warning: Yellow (#F59E0B)
  - Danger: Red (#EF4444)
  - Background: White (#FFFFFF)
  - Secondary: Gray (#F5F5F7)
- Fonts:
  - iOS: San Francisco (system default)
  - Android: Roboto (system default)
- Spacing: 8px base unit
- Border radius: 12px for cards, 8px for buttons
- Shadows: Subtle elevation (iOS style)

**Animations:**
- Level up: Confetti + badge grow/spin (1s)
- XP gain: Number fly-up + bar fill (0.5s)
- Achievement unlock: Lock break + card flip (0.8s)
- Screen transitions: Fade/slide (0.3s)

---

## 🚀 SUCCESS METRICS

- Onboarding completion rate > 80%
- Drive mode detection accuracy > 85%
- Post-drive summary XP calculations match backend
- Fog of war map renders smoothly (60 FPS)
- Real-time alerts arrive within 2 seconds
- App crash rate < 1%
- Battery drain < 10% per hour during drive
- User engagement (daily active users)

---

**Vukašine, srećno! 💪 Focus on onboarding → home → drive mode → profile first! Test on real device early!**
