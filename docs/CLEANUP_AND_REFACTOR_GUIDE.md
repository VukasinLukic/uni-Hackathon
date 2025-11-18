# 🧹 PavePatrol Cleanup & Refactor Guide

**Date:** 2025-01-15
**Purpose:** Transform from pothole detection app to clean exploration/gamification app
**Status:** Ready to Execute

---

## 📋 EXECUTIVE SUMMARY

PavePatrol is being transformed from a **pothole detection app** to a **clean exploration/gamification app**. This document outlines all files to delete, rename, and update to remove pothole references and rebrand as a city exploration game.

**Key Changes:**
- Remove all pothole/road damage terminology
- Rebrand as exploration/discovery app
- Integrate Mapbox for fog-of-war
- Implement full gamification (XP, achievements, leaderboards, rewards)
- Multi-provider authentication (Google, Apple, Facebook, Email)
- English language only
- Custom fonts: Gajraj One (buttons), Bakbak One (text)

---

## 🗑️ FILES TO DELETE

### Mobile App (/mobile/src/screens/)

```
DELETE: src/screens/TestModeScreen.tsx
Reason: Debug/testing screen, not needed for production

DELETE: src/screens/SensorDebugScreen.tsx
Reason: Debug screen for sensor calibration

DELETE: src/screens/ViewGraphsScreen.tsx
Reason: Data visualization/debugging screen

DELETE: src/screens/TestBackendScreen.tsx
Reason: Backend API testing screen

DELETE: src/screens/HomeScreenLegacy.tsx
Reason: Legacy version, replaced by clean HomeScreen

DELETE (optional): src/utils/testFallback.ts
Reason: Testing utility, check if still needed
```

**Total Mobile Files to Delete:** 5-6 files

### Backend (/backend/src/)

**No files need deletion** - only renaming and refactoring

---

## 📝 FILES TO RENAME

### Mobile (/mobile/src/)

```
RENAME: src/services/detectionService.ts
TO:     src/services/discoveryService.ts

RENAME (if exists): src/types/pothole.types.ts
TO:                 src/types/discovery.types.ts
```

### Backend (/backend/src/)

**Models:**
```
RENAME: src/models/Pothole.model.ts
TO:     src/models/Discovery.model.ts

RENAME: src/models/Event.model.ts
TO:     src/models/ExplorationEvent.model.ts

RENAME: src/models/Photo.model.ts
TO:     src/models/DiscoveryPhoto.model.ts
```

**Services:**
```
RENAME: src/services/clusteringService.ts
TO:     src/services/discoveryClusteringService.ts

RENAME: src/services/severityService.ts
TO:     src/services/activityScoringService.ts
```

**Controllers:**
```
RENAME: src/controllers/potholeController.ts
TO:     src/controllers/discoveryController.ts

RENAME: src/controllers/eventController.ts
TO:     src/controllers/explorationEventController.ts
```

**Routes:**
```
RENAME: src/routes/potholes.routes.ts
TO:     src/routes/discoveries.routes.ts

RENAME: src/routes/events.routes.ts
TO:     src/routes/explorationEvents.routes.ts
```

**Total Files to Rename:** 11 files

---

## 🔧 FILES TO UPDATE (Terminology Changes)

### Mobile App

**High Priority (Heavy Pothole References):**

1. **src/screens/DrivingModeScreen.tsx**
   - Line 30: `potholesDetected` → `discoveryMoments`
   - Line 53: "POTHOLE DETECTED!" → "DISCOVERY MOMENT DETECTED!"
   - Line 58: `sendPotholeEvent` → `sendDiscoveryEvent`
   - Line 86-89: Alert text changes
   - Line 164: "Automatic pothole detection" → "Automatic discovery detection"
   - Line 204: "potholes" label → "discoveries"

2. **src/screens/WalkingModeScreen.tsx**
   - Line 94: `sendPotholeEvent` → `sendDiscoveryEvent`
   - Line 122: "Pothole report submitted" → "Discovery submitted"
   - Line 296: "Point camera at the pothole" → "Point camera at the discovery"

3. **src/services/apiService.ts**
   - Line 135: `sendPotholeEvent()` → `sendDiscoveryEvent()`
   - Line 187: `getNearbyPotholes()` → `getNearbyActivityAreas()`
   - Line 214: `getAllPotholes()` → `getAllDiscoveries()`
   - Line 243: `uploadPhoto()` → `uploadDiscoveryPhoto()`

4. **src/services/discoveryService.ts** (renamed from detectionService.ts)
   - Interface `PotholeEvent` → `DiscoveryEvent`
   - Variables: `POTHOLE_THRESHOLD` → `DISCOVERY_THRESHOLD`
   - `onPotholeDetected` → `onDiscoveryDetected`
   - Console logs: Update all mentions

5. **src/utils/signalProcessing.ts**
   - Line 90: "POTHOLE PATTERN DETECTED" → "DISCOVERY PATTERN DETECTED"
   - Update comments (keep logic)

**Medium Priority:**

6. **src/components/FogOfWarMap.tsx**
   - Line 24: Already uses `nearbyActivityAreas` (good!)
   - Minor review needed

7. **src/store/useAppStore.ts**
   - Already mostly cleaned (good job!)
   - Line 10: `discoveryMoments` ✓
   - Line 17: `detectedActivities` ✓
   - Line 24-25: `nearbyActivityAreas`, `discoveryMarkers` ✓

**Low Priority:**

8. **src/screens/onboarding/** (4 files)
   - WelcomeScreen.tsx
   - FeaturesScreen.tsx
   - AuthScreen.tsx
   - PermissionsScreen.tsx
   - Review and update copy to match exploration theme

---

### Backend

**Models to Update:**

1. **src/models/User.model.ts**
   - Line 18: `potholesDetected` → `discoveriesMade`
   - Line 22: `confirmedPotholes` → `confirmedDiscoveries`

2. **src/models/DriveSession.model.ts**
   - Line 13: `potholesDetected` → `discoveriesMade`

**Services to Update:**

3. **src/services/aiVisionService.ts**
   - Line 18: Prompt "determine if it contains a pothole" → Update for general discovery validation

**Controllers to Update:**

4. **src/controllers/statsController.ts**
   - Review for pothole-specific stats terminology

---

## 📖 TERMINOLOGY MAPPING

### Backend API & Database

| Old Term | New Term |
|----------|----------|
| `Pothole` (model) | `Discovery` / `ActivityArea` |
| `PotholeEvent` | `ExplorationEvent` |
| `PotholePhoto` | `DiscoveryPhoto` |
| `severity` | `popularityScore` / `activityLevel` |
| `potholeDetected` | `discoveryMoment` |
| `potholesDetected` (stat) | `discoveriesMade` |
| `nearbyPotholes` | `nearbyActivityAreas` |
| `detectPothole()` | `detectDiscovery()` |
| `verifyPothole()` | `verifyDiscovery()` |
| `getAllPotholes()` | `getAllDiscoveries()` |
| `sendPotholeEvent()` | `sendDiscoveryEvent()` |

### Frontend UI Text

| Old UI Text | New UI Text |
|-------------|-------------|
| "Pothole Detected!" | "Discovery Moment!" |
| "Potholes Detected" | "Discoveries Made" |
| "Detect Potholes" | "Discover Moments" |
| "Road Damage" | "Activity Area" |
| "Severe Pothole Ahead" | "Interesting Area Nearby" |
| "Detection Master" | "Discovery Master" |
| "Report Pothole" | "Capture Discovery" |
| "Point camera at the pothole" | "Point camera at the discovery" |
| "Pothole report submitted" | "Discovery submitted successfully!" |
| "Automatic pothole detection" | "Automatic discovery detection" |

---

## 🎨 NEW FEATURES TO ADD

### Mobile

**Priority 1 - Must Have:**
1. **Mapbox Integration**
   - Install `@rnmapbox/maps`
   - Configure access tokens
   - Setup fog-of-war overlay

2. **Custom Fonts**
   - Add Gajraj One (buttons)
   - Add Bakbak One (text)
   - Update all components

3. **Onboarding Screens**
   - Welcome screen with custom background
   - 4-slide feature carousel
   - Multi-provider authentication
   - Permissions flow

4. **Core Screens**
   - Home dashboard with Mapbox
   - Drive mode (updated)
   - Walking mode (updated)
   - Post-session summary
   - Profile
   - Achievements
   - Leaderboard
   - Rewards marketplace

**Priority 2 - Should Have:**
- Socket.IO real-time updates
- Push notifications
- Animations (level-up, fog reveal, achievement unlock)

### Backend

**Priority 1 - Must Have:**
1. **Authentication System**
   - Multi-provider OAuth (Google, Apple, Facebook, Email)
   - JWT token management

2. **Gamification Core**
   - XP service
   - Achievement system
   - Leaderboard (with cron jobs)

3. **Exploration System**
   - Grid cell tracking (100m cells)
   - Exploration service
   - Drive session management

4. **New Models**
   - ExplorationCell
   - DriveSession
   - Achievement
   - Reward

**Priority 2 - Should Have:**
- Rewards & QR code generation
- AI photo verification (updated prompts)
- Real-time Socket.IO events

---

## 📦 NEW DEPENDENCIES TO INSTALL

### Mobile

```bash
# Mapbox
npx expo install @rnmapbox/maps

# Fonts
# (Download from Google Fonts manually)

# Auth
npx expo install expo-auth-session expo-web-browser

# Animations
npx expo install react-native-reanimated lottie-react-native

# Camera (already installed?)
npx expo install expo-camera

# Notifications
npx expo install expo-notifications
```

### Backend

```bash
# Authentication
npm install passport passport-google-oauth20 passport-facebook passport-apple
npm install jsonwebtoken bcryptjs
npm install @types/passport @types/jsonwebtoken @types/bcryptjs --save-dev

# Cron jobs
npm install node-cron
npm install @types/node-cron --save-dev

# QR Code generation
npm install qrcode
npm install @types/qrcode --save-dev
```

---

## 🚀 EXECUTION PLAN

### Phase 1: Cleanup (Day 1)

**Morning:**
1. Delete test/debug screens (mobile)
2. Rename files (mobile + backend)
3. Update imports for renamed files

**Afternoon:**
4. Search & replace terminology in all files
5. Test that app still compiles
6. Commit changes: "refactor: remove pothole terminology"

### Phase 2: Mapbox Setup (Days 1-2)

**Mobile:**
1. Install Mapbox
2. Configure access tokens
3. Create basic map component
4. Test rendering

### Phase 3: Font Setup (Day 2)

**Mobile:**
1. Download Google Fonts
2. Load fonts in App.tsx
3. Create typography constants
4. Update Button component
5. Test font rendering

### Phase 4: Implementation (Days 3-19)

Follow the detailed implementation plans:
- **Mobile:** [VUKASIN_IMPLEMENTATION_PLAN.md](mobile/VUKASIN_IMPLEMENTATION_PLAN.md)
- **Backend:** [NEMANJA_IMPLEMENTATION_PLAN.md](backend/NEMANJA_IMPLEMENTATION_PLAN.md)

---

## ✅ VERIFICATION CHECKLIST

After cleanup, verify:

**Mobile:**
- [ ] No "pothole" string in any file (except comments explaining change)
- [ ] No "road damage" terminology
- [ ] All test/debug screens deleted
- [ ] App compiles without errors
- [ ] Navigation still works
- [ ] Zustand store functions correctly

**Backend:**
- [ ] All models renamed successfully
- [ ] All routes updated
- [ ] API endpoints use new terminology
- [ ] Database collections renamed (or migration plan ready)
- [ ] Socket.IO events use new names
- [ ] AI prompts updated

**General:**
- [ ] Git commit history shows systematic refactoring
- [ ] No broken imports
- [ ] TypeScript compiles without errors
- [ ] ESLint/Prettier passes
- [ ] README updated

---

## 🛡️ ROLLBACK STRATEGY

If issues arise:

1. **Git Checkpoint:** Commit after each phase
   ```bash
   git add .
   git commit -m "checkpoint: phase 1 cleanup complete"
   ```

2. **Branch Strategy:**
   ```bash
   git checkout -b refactor/exploration-app
   # Work on this branch
   # Merge to main when stable
   ```

3. **Database Backup:**
   - Export MongoDB collections before schema changes
   - Keep old collection names until migration verified

---

## 📊 ESTIMATED EFFORT

| Task | Time Estimate |
|------|---------------|
| File deletion | 30 minutes |
| File renaming | 1 hour |
| Terminology updates | 3-4 hours |
| Mapbox setup | 4 hours |
| Font setup | 2 hours |
| Testing cleanup | 2 hours |
| **Total Cleanup** | **1.5 days** |
| Full implementation | **17.5 days** |
| **Grand Total** | **19 days** |

---

## 🎯 SUCCESS CRITERIA

Cleanup is complete when:

1. ✅ No pothole references in code (except historical comments)
2. ✅ App compiles and runs without errors
3. ✅ All navigation flows work
4. ✅ API endpoints return data successfully
5. ✅ Database queries work with new schema
6. ✅ Mapbox renders on home screen
7. ✅ Custom fonts display correctly
8. ✅ Git history is clean and organized

---

## 📞 SUPPORT & QUESTIONS

If you encounter issues:

1. **Check existing code:** Look at [masterplan.md](masterplan.md) for guidance
2. **Review implementation plans:**
   - Mobile: [mobile/VUKASIN_IMPLEMENTATION_PLAN.md](mobile/VUKASIN_IMPLEMENTATION_PLAN.md)
   - Backend: [backend/NEMANJA_IMPLEMENTATION_PLAN.md](backend/NEMANJA_IMPLEMENTATION_PLAN.md)
3. **Consult terminology mapping** (above)

---

## 🔗 RELATED DOCUMENTS

- **Master Plan:** [masterplan.md](masterplan.md)
- **Mobile Plan:** [mobile/VUKASIN_IMPLEMENTATION_PLAN.md](mobile/VUKASIN_IMPLEMENTATION_PLAN.md)
- **Backend Plan:** [backend/NEMANJA_IMPLEMENTATION_PLAN.md](backend/NEMANJA_IMPLEMENTATION_PLAN.md)
- **Mapbox Rationale:** See [masterplan.md](masterplan.md#why-mapbox)

---

**Last Updated:** 2025-01-15
**Status:** Ready to Execute
**Language:** English Only
**Fonts:** Gajraj One (buttons), Bakbak One (text)
**Map:** Mapbox GL (@rnmapbox/maps)

Good luck, team! 🚀
