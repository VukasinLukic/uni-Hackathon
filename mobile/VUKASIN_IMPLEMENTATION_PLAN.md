# 📱 VUKASIN - Mobile Implementation Plan (PavePatrol Exploration App)

**Role:** Mobile Developer - PavePatrol City Exploration Gamification
**Tech Stack:** React Native + Expo SDK 54 + TypeScript + Mapbox + Sensors + Zustand
**Timeline:** 19 days (phased approach)
**Language:** English Only
**Fonts:** Gajraj One (buttons), Bakbak One (text)

---

## 🎯 OVERVIEW

Mobile app responsibilities for PavePatrol (clean exploration/gamification experience):

### Core Screens (13 total)
1. **Welcome Screen** - Beautiful intro with "Start" button
2. **Feature Highlights** - 4-slide carousel explaining app
3. **Authentication** - Multi-provider login (Google, Apple, Facebook, Email)
4. **Permissions** - Request location, camera, motion, notifications
5. **Home Dashboard** - Fog-of-war map, level, XP, exploration %
6. **Drive Mode** - Real-time exploration with discovery detection
7. **Walking Mode** - Camera-based discovery photo capture
8. **Post-Session Summary** - XP breakdown, achievements unlocked
9. **Profile** - Stats, level, XP bar, avatar
10. **Achievements** - Grid view with progress bars
11. **Leaderboard** - Daily/weekly/monthly rankings
12. **Rewards Marketplace** - Browse & redeem rewards
13. **Settings** - Notifications, privacy, logout

### Key Features
- Mapbox GL integration with custom fog-of-war overlay
- Sensor-based discovery detection (accelerometer + gyroscope)
- Real-time GPS tracking with background permissions
- Socket.IO for live updates
- OAuth authentication (Google, Apple, Facebook, Email)
- Haptic feedback & animations
- Custom fonts (Gajraj One, Bakbak One)

---

## 📅 PHASE 1: Project Cleanup & Setup (Days 1-2)

### Day 1 Morning: Code Cleanup

**DELETE Unnecessary Files:**
```
src/screens/TestModeScreen.tsx
src/screens/SensorDebugScreen.tsx
src/screens/ViewGraphsScreen.tsx
src/screens/TestBackendScreen.tsx
src/screens/HomeScreenLegacy.tsx
src/utils/testFallback.ts (if not needed)
```

**RENAME Files:**
```
src/services/detectionService.ts → src/services/discoveryService.ts
(if exists) src/types/pothole.types.ts → src/types/discovery.types.ts
```

**UPDATE Terminology in Existing Files:**
- `src/screens/DrivingModeScreen.tsx` - Replace all "pothole" → "discovery"
- `src/screens/WalkingModeScreen.tsx` - Replace all "pothole" → "discovery"
- `src/services/apiService.ts` - Rename methods:
  - `sendPotholeEvent()` → `sendDiscoveryEvent()`
  - `getNearbyPotholes()` → `getNearbyActivityAreas()`
  - `getAllPotholes()` → `getAllDiscoveries()`
  - `uploadPhoto()` → `uploadDiscoveryPhoto()`
- `src/services/discoveryService.ts` (renamed) - Update all terminology
- `src/utils/signalProcessing.ts` - Update comments (keep logic)

**Deliverable:** Clean codebase with no pothole references

---

### Day 1 Afternoon: Mapbox Setup

**Tasks:**
1. Install Mapbox dependencies:
   ```bash
   npx expo install @rnmapbox/maps
   ```
2. Configure Mapbox access token in `.env`:
   ```
   MAPBOX_ACCESS_TOKEN=pk.your_token_here
   ```
3. Add Mapbox to `app.json`:
   ```json
   {
     "expo": {
       "plugins": [
         [
           "@rnmapbox/maps",
           {
             "RNMapboxMapsImpl": "mapbox",
             "RNMapboxMapsDownloadToken": "sk.your_download_token"
           }
         ]
       ]
     }
   }
   ```
4. Create basic Mapbox test screen to verify setup
5. Test on iOS & Android simulators

**Deliverable:** Mapbox GL rendering successfully

---

### Day 2 Morning: Font Setup

**Tasks:**
1. Download fonts:
   - Gajraj One (Google Fonts)
   - Bakbak One (Google Fonts)
2. Add fonts to `assets/fonts/`:
   ```
   assets/fonts/GajrajOne-Regular.ttf
   assets/fonts/BakbakOne-Regular.ttf
   ```
3. Load fonts in `App.tsx`:
   ```typescript
   import { useFonts } from 'expo-font';

   const [fontsLoaded] = useFonts({
     'Gajraj-One': require('./assets/fonts/GajrajOne-Regular.ttf'),
     'Bakbak-One': require('./assets/fonts/BakbakOne-Regular.ttf'),
   });
   ```
4. Create typography constants in `src/utils/typography.ts`:
   ```typescript
   export const FONTS = {
     button: 'Gajraj-One',
     body: 'Bakbak-One',
   };
   ```
5. Update Button component to use Gajraj One
6. Update all text components to use Bakbak One by default

**Deliverable:** Custom fonts loaded and applied

---

### Day 2 Afternoon: Navigation Structure

**Tasks:**
1. Update navigation stack in `App.tsx`:
   ```typescript
   Stack.Navigator:
     - WelcomeScreen
     - FeaturesScreen (carousel)
     - AuthScreen
     - PermissionsScreen
     - MainTabs:
       - HomeScreen
       - AchievementsScreen
       - LeaderboardScreen
       - ProfileScreen
     - DrivingModeScreen (modal)
     - WalkingModeScreen (modal)
     - PostSessionSummaryScreen (modal)
     - RewardsScreen
     - SettingsScreen
   ```
2. Create tab bar with custom icons
3. Setup navigation types
4. Test navigation flow

**Deliverable:** Complete navigation structure

---

## 📅 PHASE 2: Onboarding Flow (Days 3-4)

### Day 3 Morning: Welcome Screen

**File:** `src/screens/onboarding/WelcomeScreen.tsx`

**Design:**
- Background: `assets/images/login without start.svg`
- Single "Start" button centered (Gajraj One font)
- Minimalist, clean design

**Implementation:**
```typescript
<ImageBackground source={require('../../assets/images/login without start.svg')}>
  <View style={styles.container}>
    <Button
      title="Start"
      onPress={() => navigation.navigate('Features')}
      fontFamily={FONTS.button}
    />
  </View>
</ImageBackground>
```

**Deliverable:** Welcome screen with custom background

---

### Day 3 Afternoon: Feature Highlights Carousel

**File:** `src/screens/onboarding/FeaturesScreen.tsx`

**Design:**
- 4 slides with provided images
- "Back" and "Next" buttons (Gajraj One font)
- Dot indicators

**Slides:**
1. Slide 1: [Image path to be provided]
   - Text: "Discover Your City"
2. Slide 2: [Image path to be provided]
   - Text: "Unlock the Map as You Explore"
3. Slide 3: [Image path to be provided]
   - Text: "Collect XP, Unlock Rewards"
4. Slide 4: [Image path to be provided]
   - Text: "Become the Ultimate City Explorer"

**Implementation:**
- Use `react-native-snap-carousel` or FlatList with horizontal scroll
- Smooth animations
- Auto-advance option
- Skip button

**Deliverable:** Interactive feature carousel

---

### Day 4 Morning: Authentication Screen

**File:** `src/screens/onboarding/AuthScreen.tsx`

**Design:**
- Auth provider buttons:
  - Google
  - Apple (iOS only)
  - Facebook
  - Email/Password
- Optional: "Continue as Guest" (can skip)

**Implementation:**
1. Install auth dependencies:
   ```bash
   npx expo install expo-auth-session expo-web-browser
   ```
2. Setup OAuth providers in backend
3. Implement auth flow:
   ```typescript
   const handleGoogleLogin = async () => {
     const result = await Google.logInAsync(config);
     if (result.type === 'success') {
       // Send token to backend
       const userData = await api.authenticateWithGoogle(result.accessToken);
       // Store JWT token
       await AsyncStorage.setItem('authToken', userData.token);
       navigation.navigate('Permissions');
     }
   };
   ```
4. Update Zustand store with user data
5. Handle errors gracefully

**Deliverable:** Functional multi-provider authentication

---

### Day 4 Afternoon: Permissions Screen

**File:** `src/screens/onboarding/PermissionsScreen.tsx`

**Permissions Needed:**
1. Location (foreground + background)
2. Motion & Fitness (iOS)
3. Camera
4. Notifications

**Design:**
- List of permissions with icons
- Explanation for each
- "Grant Permissions" button
- "Skip" option (limited functionality)

**Implementation:**
```typescript
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Camera } from 'expo-camera';

const requestPermissions = async () => {
  // Location
  const location = await Location.requestForegroundPermissionsAsync();
  const bgLocation = await Location.requestBackgroundPermissionsAsync();

  // Camera
  const camera = await Camera.requestCameraPermissionsAsync();

  // Notifications
  const notifications = await Notifications.requestPermissionsAsync();

  if (location.granted && bgLocation.granted && camera.granted) {
    navigation.navigate('MainTabs');
  } else {
    // Show warning about limited functionality
  }
};
```

**Deliverable:** Permission request flow

---

## 📅 PHASE 3: Home Dashboard & Mapbox (Days 5-7)

### Day 5 Morning: Home Dashboard UI

**File:** `src/screens/HomeScreen.tsx` (update existing)

**Layout:**
- **Top Section:**
  - User avatar (top-left)
  - Level badge (top-right)
  - XP progress bar
- **Map Section (60% screen):**
  - Mapbox with fog-of-war overlay
  - Current location marker
  - Discovery markers
- **Quick Stats Bar:**
  - Distance today
  - Cells explored today
  - Discoveries today
- **Floating Action Button:**
  - "Start Exploration" → choose Drive or Walk mode

**Implementation:**
```typescript
<View style={styles.container}>
  <Header user={user} level={user.level} xp={user.currentXP} />
  <MapboxMap style={styles.map}>
    <FogOfWarOverlay cells={exploredCells} />
    <UserLocationMarker />
    <DiscoveryMarkers discoveries={nearbyActivityAreas} />
  </MapboxMap>
  <QuickStats
    distance={todayStats.distance}
    cells={todayStats.cells}
    discoveries={todayStats.discoveries}
  />
  <FloatingActionButton onPress={() => setModalVisible(true)} />
</View>
```

**Deliverable:** Home dashboard structure

---

### Day 5 Afternoon: Mapbox Map Component

**File:** `src/components/FogOfWarMap.tsx` (update existing)

**Features:**
- Render Mapbox map
- Custom map style (game-like aesthetic)
- User location marker
- Camera follows user

**Implementation:**
```typescript
import Mapbox from '@rnmapbox/maps';

<Mapbox.MapView style={styles.map}>
  <Mapbox.Camera
    zoomLevel={14}
    centerCoordinate={[user.lng, user.lat]}
    followUserLocation={true}
  />

  <Mapbox.UserLocation visible={true} />

  {/* Fog of War Overlay */}
  <Mapbox.ShapeSource id="fogOfWar" shape={fogGeoJSON}>
    <Mapbox.FillLayer
      id="fogFill"
      style={{
        fillColor: 'rgba(0, 0, 0, 0.7)',
        fillOpacity: 0.8,
      }}
    />
  </Mapbox.ShapeSource>

  {/* Explored Cells */}
  <Mapbox.ShapeSource id="exploredCells" shape={exploredCellsGeoJSON}>
    <Mapbox.FillLayer
      id="exploredFill"
      style={{
        fillColor: [
          'match',
          ['get', 'activityLevel'],
          'high', '#00FF00',
          'medium', '#FFFF00',
          'low', '#888888',
          '#CCCCCC'
        ],
        fillOpacity: 0.6,
      }}
    />
  </Mapbox.ShapeSource>
</Mapbox.MapView>
```

**Deliverable:** Mapbox map rendering

---

### Day 6: Fog of War Overlay Logic

**File:** `src/services/fogOfWarService.ts` (new)

**Tasks:**
1. Create grid cell calculation:
   ```typescript
   const getCellId = (lat: number, lng: number): string => {
     const cellLat = Math.floor(lat / 0.001); // ~100m
     const cellLng = Math.floor(lng / 0.001);
     return `${cellLat}_${cellLng}`;
   };
   ```

2. Generate GeoJSON for unexplored areas:
   ```typescript
   const generateFogGeoJSON = (
     cityBounds: Bounds,
     exploredCells: string[]
   ): GeoJSON => {
     // Generate grid of all cells in city
     // Remove explored cells
     // Return GeoJSON polygons for fog
   };
   ```

3. Generate GeoJSON for explored cells:
   ```typescript
   const generateExploredCellsGeoJSON = (
     cells: ExplorationCell[]
   ): GeoJSON => {
     return {
       type: 'FeatureCollection',
       features: cells.map(cell => ({
         type: 'Feature',
         geometry: {
           type: 'Polygon',
           coordinates: getCellPolygonCoords(cell.cellId)
         },
         properties: {
           activityLevel: cell.activityLevel,
           explorationCount: cell.explorationCount
         }
       }))
     };
   };
   ```

4. Implement cell reveal animation
5. Update Zustand store with new cells

**Deliverable:** Working fog-of-war system

---

### Day 7: Discovery Markers

**File:** `src/components/DiscoveryMarker.tsx` (new)

**Tasks:**
1. Create custom marker component:
   ```typescript
   <Mapbox.PointAnnotation
     id={discovery.id}
     coordinate={[discovery.lng, discovery.lat]}
   >
     <View style={styles.marker}>
       <Icon name="star" size={24} color={getColorByScore(discovery.popularityScore)} />
     </View>
   </Mapbox.PointAnnotation>
   ```

2. Marker callouts with discovery info:
   ```typescript
   <Mapbox.Callout title={discovery.name}>
     <View>
       <Text>Popularity: {discovery.popularityScore}/100</Text>
       <Text>First discovered by: {discovery.firstDiscoverer}</Text>
     </View>
   </Mapbox.Callout>
   ```

3. Filter markers by zoom level (performance)
4. Cluster nearby markers

**Deliverable:** Interactive discovery markers

---

## 📅 PHASE 4: Drive & Walking Modes (Days 8-10)

### Day 8: Drive Mode Screen

**File:** `src/screens/DrivingModeScreen.tsx` (update existing)

**UI Updates:**
- Replace "potholes" counter → "Discovery Moments"
- Update all text to exploration terminology
- Keep live stats: distance, time, XP earned
- Mini-map view (optional)

**State Management:**
```typescript
const [session, setSession] = useState({
  startTime: null,
  distance: 0,
  discoveryMoments: 0,  // NOT potholes
  cellsExplored: 0,
  xpEarned: 0
});
```

**Discovery Detection:**
```typescript
// src/services/discoveryService.ts (renamed from detectionService)
export const detectDiscoveryMoment = (sensorData) => {
  // Keep existing pattern detection logic
  // Change variable names and console logs

  if (isDiscoveryPattern(sensorData)) {
    console.log('🌟 DISCOVERY MOMENT DETECTED!');
    return true;
  }
  return false;
};
```

**On Discovery:**
```typescript
const handleDiscovery = async (location) => {
  // Haptic feedback
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

  // Visual feedback
  setDiscoveryAnimation(true);

  // Send to backend
  await api.sendDiscoveryEvent({
    location,
    timestamp: Date.now(),
    sensorData: lastSensorReading
  });

  // Award XP
  updateXP(100);

  // Update counter
  setSession(prev => ({ ...prev, discoveryMoments: prev.discoveryMoments + 1 }));
};
```

**Deliverable:** Updated drive mode (no pothole references)

---

### Day 9: Walking Mode Screen

**File:** `src/screens/WalkingModeScreen.tsx` (update existing)

**UI Updates:**
- Title: "Capture Discovery" (NOT "Report Pothole")
- Camera view for taking photos
- Subtitle: "Point camera at interesting discovery"
- Button: "Capture Discovery"

**Camera Implementation:**
```typescript
import { Camera } from 'expo-camera';

const takeDiscoveryPhoto = async () => {
  const photo = await cameraRef.current.takePictureAsync();

  // Show preview
  setPhotoUri(photo.uri);
  setStep('preview');
};

const submitDiscovery = async () => {
  setLoading(true);
  setLoadingText('Uploading discovery...');

  // Upload to backend
  const result = await api.uploadDiscoveryPhoto({
    photoUri,
    location: currentLocation,
    userId: user.id
  });

  if (result.aiVerified && result.aiConfidence > 70) {
    setLoadingText('Verifying with AI...');
    // Award XP
    await api.awardXP(userId, 75);

    Alert.alert('Success!', 'Discovery verified! +75 XP');
  } else {
    Alert.alert('Hmm...', 'Unable to verify this discovery. Please try again.');
  }

  navigation.goBack();
};
```

**Deliverable:** Updated walking mode with photo capture

---

### Day 10: Post-Session Summary

**File:** `src/screens/PostSessionSummaryScreen.tsx` (new)

**Design:**
- Celebration animation
- XP breakdown:
  - Distance traveled: `X km × 10 XP = Y XP`
  - New cells explored: `X cells × 50 XP = Y XP`
  - Discovery moments: `X × 100 XP = Y XP`
  - **Total XP Earned: Z XP**
- Level progress bar
- New achievements unlocked (if any)
- "New cell" count highlight
- Share button (optional)
- "Continue Exploring" button

**Implementation:**
```typescript
interface SessionSummary {
  distance: number;
  newCells: number;
  discoveries: number;
  xpBreakdown: {
    distance: number;
    cells: number;
    discoveries: number;
  };
  totalXP: number;
  newAchievements: Achievement[];
  leveledUp: boolean;
  newLevel?: number;
}

const PostSessionSummary: React.FC<{route}> = ({route}) => {
  const { sessionData } = route.params;
  const summary = calculateSummary(sessionData);

  return (
    <View style={styles.container}>
      {summary.leveledUp && (
        <LevelUpAnimation newLevel={summary.newLevel} />
      )}

      <Title>Exploration Complete!</Title>

      <StatCard label="Distance" value={`${summary.distance} km`} xp={summary.xpBreakdown.distance} />
      <StatCard label="New Cells" value={summary.newCells} xp={summary.xpBreakdown.cells} />
      <StatCard label="Discoveries" value={summary.discoveries} xp={summary.xpBreakdown.discoveries} />

      <Divider />

      <TotalXP value={summary.totalXP} />

      {summary.newAchievements.length > 0 && (
        <AchievementUnlocked achievements={summary.newAchievements} />
      )}

      <Button title="Continue Exploring" onPress={handleContinue} />
    </View>
  );
};
```

**Deliverable:** Comprehensive post-session summary

---

## 📅 PHASE 5: Profile & Achievements (Days 11-12)

### Day 11: Profile Screen

**File:** `src/screens/ProfileScreen.tsx` (new)

**Layout:**
- **Header:**
  - Avatar (editable)
  - Username
  - Level badge
- **XP Progress:**
  - Current XP / XP to next level
  - Progress bar
  - Level name (e.g., "Explorer", "Navigator", "Master")
- **Stats Grid (2x4):**
  - Distance Traveled
  - Discoveries Made
  - Cells Explored
  - City Explored %
  - Current Streak
  - Longest Streak
  - Total XP
  - Rank
- **Achievements Preview:**
  - Show 3-5 latest achievements
  - "View All" button
- **Settings Button**

**Implementation:**
```typescript
<ScrollView>
  <ProfileHeader
    avatar={user.avatarUrl}
    username={user.username}
    level={user.level}
    onAvatarPress={handleAvatarChange}
  />

  <XPProgressCard
    currentXP={user.currentXP}
    requiredXP={calculateRequiredXP(user.level + 1)}
    level={user.level}
  />

  <StatsGrid>
    <StatItem label="Distance" value={`${user.stats.distanceTraveled} km`} icon="road" />
    <StatItem label="Discoveries" value={user.stats.discoveriesMade} icon="star" />
    <StatItem label="Cells Explored" value={user.stats.cellsExplored} icon="grid" />
    <StatItem label="City Explored" value={`${user.stats.explorationPercentage}%`} icon="map" />
    <StatItem label="Current Streak" value={`${user.stats.currentStreak} days`} icon="fire" />
    <StatItem label="Longest Streak" value={`${user.stats.longestStreak} days`} icon="trophy" />
    <StatItem label="Total XP" value={user.totalXP} icon="zap" />
    <StatItem label="Rank" value={`#${user.rank}`} icon="medal" />
  </StatsGrid>

  <AchievementsPreview achievements={latestAchievements} />

  <Button title="View All Achievements" onPress={() => navigation.navigate('Achievements')} />
</ScrollView>
```

**Deliverable:** Complete profile screen

---

### Day 12: Achievements Screen

**File:** `src/screens/AchievementsScreen.tsx` (new)

**Design:**
- Tabs for categories:
  - All
  - Exploration
  - Discovery
  - Streaks
  - Distance
  - Special
- Grid layout (2 columns)
- Locked achievements shown in grayscale
- Progress bars for in-progress achievements
- Celebration animation when viewing newly unlocked

**Achievement Card:**
```typescript
<AchievementCard
  achievement={achievement}
  unlocked={achievement.unlocked}
  progress={achievement.progress}
>
  <Icon name={achievement.icon} size={48} color={achievement.unlocked ? 'gold' : 'gray'} />
  <Title>{achievement.name}</Title>
  <Description>{achievement.description}</Description>
  {!achievement.unlocked && (
    <ProgressBar value={achievement.progress} max={achievement.requirement} />
  )}
  <XPReward>+{achievement.xpReward} XP</XPReward>
</AchievementCard>
```

**Sample Achievements:**
```typescript
const ACHIEVEMENTS = [
  // Exploration
  { name: 'First Steps', description: 'Explore your first cell', requirement: 1, category: 'exploration', xpReward: 50 },
  { name: 'Explorer I', description: 'Explore 10 cells', requirement: 10, category: 'exploration', xpReward: 100 },
  { name: 'Explorer II', description: 'Explore 100 cells', requirement: 100, category: 'exploration', xpReward: 500 },
  { name: 'Neighborhood Master', description: 'Fully explore a neighborhood', requirement: 1, category: 'exploration', xpReward: 1000 },

  // Discovery
  { name: 'First Discovery', description: 'Detect your first discovery moment', requirement: 1, category: 'discovery', xpReward: 100 },
  { name: 'Discovery Master', description: 'Make 50 verified discoveries', requirement: 50, category: 'discovery', xpReward: 500 },

  // Streaks
  { name: 'Consistency', description: 'Maintain a 3-day streak', requirement: 3, category: 'streaks', xpReward: 200 },
  { name: 'Dedication', description: 'Maintain a 7-day streak', requirement: 7, category: 'streaks', xpReward: 500 },

  // Distance
  { name: 'Getting Started', description: 'Travel 1km', requirement: 1, category: 'distance', xpReward: 50 },
  { name: 'Road Warrior', description: 'Travel 50km', requirement: 50, category: 'distance', xpReward: 500 },

  // Special
  { name: 'Early Adopter', description: 'Join during beta', requirement: 1, category: 'special', xpReward: 1000 },
];
```

**Deliverable:** Achievements screen with categories

---

## 📅 PHASE 6: Leaderboard & Rewards (Days 13-14)

### Day 13: Leaderboard Screen

**File:** `src/screens/LeaderboardScreen.tsx` (new)

**Design:**
- Tabs: Daily / Weekly / Monthly / All-Time
- Top 3 podium design
- List view for ranks 4-100
- User's rank highlighted
- Pull-to-refresh

**Implementation:**
```typescript
const LeaderboardScreen = () => {
  const [period, setPeriod] = useState('daily');
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);

  useEffect(() => {
    fetchLeaderboard(period);
  }, [period]);

  const fetchLeaderboard = async (period) => {
    const data = await api.getLeaderboard(period);
    setLeaderboard(data.rankings);
    setMyRank(data.userRank);
  };

  return (
    <View>
      <Tabs selected={period} onChange={setPeriod}>
        <Tab value="daily">Daily</Tab>
        <Tab value="weekly">Weekly</Tab>
        <Tab value="monthly">Monthly</Tab>
        <Tab value="all-time">All-Time</Tab>
      </Tabs>

      {leaderboard.length > 0 && (
        <Podium>
          <PodiumItem rank={2} user={leaderboard[1]} />
          <PodiumItem rank={1} user={leaderboard[0]} />
          <PodiumItem rank={3} user={leaderboard[2]} />
        </Podium>
      )}

      <FlatList
        data={leaderboard.slice(3, 100)}
        renderItem={({item, index}) => (
          <LeaderboardRow
            rank={index + 4}
            user={item}
            isCurrentUser={item.id === user.id}
          />
        )}
        refreshControl={<RefreshControl onRefresh={() => fetchLeaderboard(period)} />}
      />

      {myRank && myRank > 100 && (
        <MyRankCard rank={myRank} xp={user.totalXP} />
      )}
    </View>
  );
};
```

**Deliverable:** Functional leaderboard with tabs

---

### Day 14: Rewards Marketplace

**File:** `src/screens/RewardsScreen.tsx` (new)

**Screens:**
1. **Marketplace** - Browse available rewards
2. **My Rewards** - View active QR codes

**Marketplace Design:**
- Grid of reward cards
- Each card shows:
  - Partner logo
  - Reward name
  - Description
  - XP cost
  - "Redeem" button
- Filter by category (discounts, vouchers, merchandise)

**Implementation:**
```typescript
const RewardsMarketplace = () => {
  const [rewards, setRewards] = useState([]);
  const user = useAppStore(state => state.user);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    const data = await api.getRewards();
    setRewards(data);
  };

  const redeemReward = async (reward) => {
    if (user.currentXP < reward.xpCost) {
      Alert.alert('Not Enough XP', `You need ${reward.xpCost - user.currentXP} more XP`);
      return;
    }

    const confirmed = await confirmRedeem(reward);
    if (confirmed) {
      const result = await api.redeemReward(reward.id);
      Alert.alert('Success!', 'Reward redeemed! Check "My Rewards" for QR code.');
      navigation.navigate('MyRewards');
    }
  };

  return (
    <ScrollView>
      <Header>
        <Title>Rewards Marketplace</Title>
        <XPBalance>{user.currentXP} XP</XPBalance>
      </Header>

      <CategoryFilter selected={category} onChange={setCategory} />

      <RewardGrid>
        {rewards.map(reward => (
          <RewardCard key={reward.id} reward={reward}>
            <PartnerLogo source={{uri: reward.partnerLogo}} />
            <RewardName>{reward.name}</RewardName>
            <Description>{reward.description}</Description>
            <XPCost>{reward.xpCost} XP</XPCost>
            <Button
              title="Redeem"
              disabled={user.currentXP < reward.xpCost}
              onPress={() => redeemReward(reward)}
            />
          </RewardCard>
        ))}
      </RewardGrid>
    </ScrollView>
  );
};
```

**My Rewards Screen:**
```typescript
const MyRewardsScreen = () => {
  const [activeRewards, setActiveRewards] = useState([]);

  useEffect(() => {
    loadMyRewards();
  }, []);

  const loadMyRewards = async () => {
    const data = await api.getMyRewards();
    setActiveRewards(data.filter(r => r.status === 'active'));
  };

  return (
    <FlatList
      data={activeRewards}
      renderItem={({item}) => (
        <RewardCard>
          <RewardName>{item.name}</RewardName>
          <QRCode value={item.qrCode} size={200} />
          <ExpiryDate>Expires: {formatDate(item.expiresAt)}</ExpiryDate>
          <Instructions>{item.redemptionInstructions}</Instructions>
        </RewardCard>
      )}
      ListEmptyComponent={<EmptyState message="No active rewards yet. Visit the marketplace!" />}
    />
  );
};
```

**Deliverable:** Rewards marketplace and QR code display

---

## 📅 PHASE 7: Real-time & Notifications (Day 15)

### Socket.IO Integration

**File:** `src/services/socketService.ts` (new)

**Events to Listen:**
- `discovery_nearby` - New activity area nearby
- `level_up` - User leveled up
- `achievement_unlocked` - New achievement
- `leaderboard_update` - Ranking changed

**Implementation:**
```typescript
import io from 'socket.io-client';

class SocketService {
  socket: Socket;

  connect(authToken: string) {
    this.socket = io(API_URL, {
      auth: { token: authToken }
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    this.socket.on('discovery_nearby', (data) => {
      showNotification({
        title: 'Interesting Area Nearby!',
        body: `${data.distance}m away`,
        data: { discoveryId: data.id }
      });
    });

    this.socket.on('level_up', (data) => {
      showLevelUpAnimation(data.newLevel);
      showNotification({
        title: `Level Up! 🎉`,
        body: `You're now level ${data.newLevel}!`
      });
    });

    this.socket.on('achievement_unlocked', (data) => {
      showAchievementAnimation(data.achievement);
      showNotification({
        title: 'Achievement Unlocked!',
        body: data.achievement.name
      });
    });
  }

  disconnect() {
    this.socket?.disconnect();
  }

  subscribeToLocation(lat: number, lng: number) {
    this.socket.emit('subscribe_location', { lat, lng });
  }
}

export default new SocketService();
```

**Push Notifications:**
```typescript
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const showNotification = async ({title, body, data}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // immediate
  });
};
```

**Deliverable:** Real-time notifications

---

## 📅 PHASE 8: Polish & Animations (Days 16-17)

### Day 16: Animations

**Animations Needed:**
1. **Level Up Animation:**
   - Confetti effect
   - Badge zoom-in
   - XP bar fill animation

2. **Achievement Unlock:**
   - Badge slide-in
   - Glow effect
   - Celebration particles

3. **Fog Reveal:**
   - Smooth fade-out of fog
   - Slide-in of cell color
   - Sparkle effect

4. **Discovery Moment:**
   - Pulse effect on map
   - Haptic feedback
   - +XP floating text

**Libraries:**
```bash
npx expo install react-native-reanimated
npx expo install lottie-react-native
```

**Example - Level Up Animation:**
```typescript
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

const LevelUpAnimation = ({newLevel, onComplete}) => {
  return (
    <Animated.View entering={FadeIn}>
      <LottieView
        source={require('../assets/animations/confetti.json')}
        autoPlay
        loop={false}
        onAnimationFinish={onComplete}
      />
      <Animated.View entering={ZoomIn.delay(500)}>
        <LevelBadge level={newLevel} />
        <Text style={styles.levelText}>Level {newLevel}!</Text>
      </Animated.View>
    </Animated.View>
  );
};
```

**Deliverable:** Polished animations throughout app

---

### Day 17: Settings & Final Polish

**File:** `src/screens/SettingsScreen.tsx` (new)

**Settings Options:**
- Notifications (toggle)
- Discovery sensitivity (slider)
- Language (English only for now)
- Privacy policy
- Terms of service
- Logout

**Final Polish Tasks:**
- [ ] Test all screens on iOS & Android
- [ ] Fix any layout issues
- [ ] Optimize performance (lazy loading, memoization)
- [ ] Add loading states everywhere
- [ ] Add error boundaries
- [ ] Test offline behavior
- [ ] Add empty states for all lists
- [ ] Ensure accessibility (labels, contrast)
- [ ] Test dark mode (if supported)

**Deliverable:** Production-ready mobile app

---

## 📅 PHASE 9: Testing & Deployment (Days 18-19)

### Day 18: Testing

**Unit Tests:**
```typescript
// src/services/__tests__/discoveryService.test.ts
describe('Discovery Service', () => {
  it('should detect discovery moments correctly', () => {
    const sensorData = generateMockSensorData();
    const result = detectDiscoveryMoment(sensorData);
    expect(result).toBe(true);
  });
});
```

**Integration Tests:**
- Test authentication flow end-to-end
- Test drive session XP calculation
- Test fog-of-war cell tracking
- Test API calls with mock backend

**Manual Testing Checklist:**
- [ ] Onboarding flow (all auth providers)
- [ ] Drive mode (discovery detection, XP tracking)
- [ ] Walking mode (camera, photo upload)
- [ ] Fog-of-war reveal
- [ ] Leaderboard refresh
- [ ] Rewards redemption
- [ ] Profile stats update
- [ ] Achievements unlock
- [ ] Notifications
- [ ] Settings
- [ ] Logout/login persistence

**Deliverable:** Tested, bug-free app

---

### Day 19: Deployment

**Build Configuration:**

1. **Update app.json:**
```json
{
  "expo": {
    "name": "PavePatrol",
    "slug": "pavepatrol",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "splash": {
      "image": "./assets/images/splash.png",
      "backgroundColor": "#000000"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "bundleIdentifier": "com.pavepatrol.app",
      "buildNumber": "1.0.0",
      "infoPlist": {
        "NSLocationAlwaysAndWhenInUseUsageDescription": "We need your location to track exploration and reveal the fog of war.",
        "NSLocationWhenInUseUsageDescription": "We need your location to track exploration.",
        "NSCameraUsageDescription": "We need camera access to capture discovery photos.",
        "NSMotionUsageDescription": "We use motion sensors to detect discovery moments."
      }
    },
    "android": {
      "package": "com.pavepatrol.app",
      "versionCode": 1,
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

2. **EAS Build:**
```bash
npx expo install expo-dev-client
eas build:configure
eas build --platform all
```

3. **Environment Variables:**
```
EXPO_PUBLIC_API_URL=https://api.pavepatrol.com
EXPO_PUBLIC_MAPBOX_TOKEN=pk.xxx
```

4. **Submit to Stores (optional):**
```bash
eas submit --platform ios
eas submit --platform android
```

**Deliverable:** Built iOS & Android apps

---

## 🎯 PRIORITY CHECKLIST

### **MUST HAVE** ✅
- [x] Cleanup (delete test screens, rename files)
- [ ] Mapbox integration
- [ ] Custom fonts (Gajraj One, Bakbak One)
- [ ] Welcome screen
- [ ] Feature carousel
- [ ] Authentication
- [ ] Permissions
- [ ] Home dashboard with fog-of-war
- [ ] Drive mode (updated terminology)
- [ ] Post-session summary
- [ ] Profile screen
- [ ] Basic leaderboard

### **SHOULD HAVE** 🔄
- [ ] Walking mode with camera
- [ ] Achievements screen
- [ ] Rewards marketplace
- [ ] My Rewards (QR codes)
- [ ] Real-time notifications
- [ ] Socket.IO integration
- [ ] Animations (level-up, achievements)

### **NICE TO HAVE** 🌟
- [ ] Settings screen
- [ ] Advanced animations
- [ ] Share functionality
- [ ] Dark mode
- [ ] Accessibility features

---

## 🚀 SUCCESS METRICS

**Technical:**
- App launches without crashes
- GPS tracking accuracy > 95%
- Mapbox fog-of-war renders smoothly (60fps)
- Discovery detection accuracy > 80%
- API response times < 500ms

**User Experience:**
- Onboarding completion rate > 80%
- Average session length > 5 minutes
- Daily return rate > 30%
- Achievement unlock rate > 50% (for first 3 achievements)

---

## 📱 FOLDER STRUCTURE (Final)

```
mobile/
├── assets/
│   ├── fonts/
│   │   ├── GajrajOne-Regular.ttf
│   │   └── BakbakOne-Regular.ttf
│   ├── images/
│   │   ├── login without start.svg
│   │   ├── icon.png
│   │   └── splash.png
│   └── animations/
│       ├── confetti.json
│       └── achievement-unlock.json
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── FogOfWarMap.tsx ✅
│   │   ├── DiscoveryMarker.tsx
│   │   ├── XPProgressBar.tsx
│   │   ├── AchievementCard.tsx
│   │   ├── LeaderboardRow.tsx
│   │   └── RewardCard.tsx
│   ├── screens/
│   │   ├── onboarding/
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── FeaturesScreen.tsx
│   │   │   ├── AuthScreen.tsx
│   │   │   └── PermissionsScreen.tsx
│   │   ├── HomeScreen.tsx ✅
│   │   ├── DrivingModeScreen.tsx ✅ (updated)
│   │   ├── WalkingModeScreen.tsx ✅ (updated)
│   │   ├── PostSessionSummaryScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── AchievementsScreen.tsx
│   │   ├── LeaderboardScreen.tsx
│   │   ├── RewardsScreen.tsx
│   │   ├── MyRewardsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/
│   │   ├── discoveryService.ts ✅ (renamed)
│   │   ├── apiService.ts ✅ (updated)
│   │   ├── locationService.ts ✅
│   │   ├── sensorService.ts ✅
│   │   ├── fogOfWarService.ts
│   │   ├── socketService.ts
│   │   └── notificationService.ts
│   ├── store/
│   │   └── useAppStore.ts ✅ (already updated)
│   ├── utils/
│   │   ├── typography.ts
│   │   ├── constants.ts ✅
│   │   ├── signalProcessing.ts ✅ (updated)
│   │   └── geoUtils.ts
│   ├── types/
│   │   ├── discovery.types.ts (renamed)
│   │   ├── user.types.ts
│   │   └── navigation.types.ts
│   └── navigation/
│       └── AppNavigator.tsx
├── App.tsx
├── app.json
├── package.json
└── .env
```

---

## 📝 FILES TO DELETE (Day 1)

```
src/screens/TestModeScreen.tsx
src/screens/SensorDebugScreen.tsx
src/screens/ViewGraphsScreen.tsx
src/screens/TestBackendScreen.tsx
src/screens/HomeScreenLegacy.tsx
src/utils/testFallback.ts
```

---

## 🔄 FILES TO RENAME (Day 1)

```
src/services/detectionService.ts → src/services/discoveryService.ts
```

---

**Vukasin, good luck! 💪 Focus on Mapbox fog-of-war first, then onboarding, then gamification screens. Use provided images for all screens. English only. Gajraj One for buttons, Bakbak One for text.**
