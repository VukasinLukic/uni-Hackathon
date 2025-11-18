# 🚀 Quick Start - Mapbox Gaming Map

## Test the Implementation RIGHT NOW

### 1. Start the App
```bash
cd mobile
npx expo start
```

### 2. Navigate to Map
**Option A: Update Settings Screen** (recommended for easy access)

Add a button in [SettingsScreen.tsx](mobile/src/screens/SettingsScreen.tsx):

```typescript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();

<TouchableOpacity
  style={styles.menuItem}
  onPress={() => navigation.navigate('MapGame')}
>
  <Text style={styles.menuText}>🗺️ Gaming Map (NEW)</Text>
</TouchableOpacity>
```

**Option B: Test Directly**

Temporarily update [HomeScreenWithMap.tsx](mobile/src/screens/HomeScreenWithMap.tsx) to navigate to MapGame on mount:

```typescript
useEffect(() => {
  navigation.navigate('MapGame');
}, []);
```

**Option C: Deep Link** (if configured)

```bash
npx uri-scheme open exp://localhost:8081/--/MapGame --ios
```

### 3. Grant Permissions
- Allow location access when prompted
- Tap "Start Tracking" button

### 4. Test Features

✅ **Fog-of-War**: Walk/drive around, watch purple areas appear
✅ **Path Trail**: Golden line follows your movement
✅ **XP Gain**: Header shows XP increasing (+50 XP per new 100m cell)
✅ **Tokens**: If backend has potholes nearby, they appear as markers

---

## Quick Fixes

### Map Not Loading?
```bash
# Clear cache and restart
npx expo start --clear
```

### Location Not Working?
Check permissions in `app.json`:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Track your exploration",
        "NSLocationAlwaysUsageDescription": "Track your exploration in background"
      }
    },
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    }
  }
}
```

### Mapbox Token Invalid?
Update in [mobile/.env](mobile/.env):
```
EXPO_PUBLIC_MAPBOX_TOKEN=your_new_token_here
```

Then restart Expo.

---

## File Locations

| Component | Path |
|-----------|------|
| **Map Screen** | `mobile/src/screens/MapGameScreen.tsx` |
| **Map Component** | `mobile/src/components/MapboxGamingMap.tsx` |
| **HTML Template** | `mobile/assets/mapbox-gaming-map.html` |
| **Navigator** | `mobile/src/navigation/AppNavigator.tsx` |
| **App Entry** | `mobile/App.tsx` |

---

## Customize

### Change Fog Color
Edit `mobile/assets/mapbox-gaming-map.html`:
```javascript
const FOG_COLOR = 'rgba(0, 0, 0, 0.75)'; // Make darker/lighter
```

### Change Grid Size
```javascript
const CELL_SIZE = 0.001; // Smaller = more cells
```

### Change Path Color
```javascript
const PATH_COLOR = '#FFD700'; // Try #00ff00 for green
```

### Add Test Tokens
In `MapGameScreen.tsx`:
```typescript
const testTokens: Token[] = [
  {
    id: 'test1',
    lat: 45.2671, // Replace with your current location
    lng: 19.8335,
    type: 'coin',
    value: 100
  }
];

<MapboxGamingMap tokens={testTokens} />
```

---

## Debug Console

### React Native Side
```typescript
console.log('Current location:', currentLocation);
console.log('Explored cells:', exploredCells);
console.log('Tokens:', tokens);
```

### WebView Side
Open `mobile/assets/mapbox-gaming-map.html` and add:
```javascript
console.log('Map initialized');
console.log('User location:', userLocation);
console.log('Explored cells:', Array.from(exploredCells));
```

Logs appear in Expo console.

---

## Testing Checklist

- [ ] App starts without errors
- [ ] Can navigate to MapGame screen
- [ ] Map loads (dark theme visible)
- [ ] Location permission granted
- [ ] User marker appears at current location
- [ ] Camera follows user smoothly
- [ ] Purple areas appear when moving
- [ ] Golden trail follows path
- [ ] XP increases in header
- [ ] "Start Tracking" button toggles to "Stop Tracking"

---

## Next Steps

1. **Add to Home Screen**: Put a button on HomeScreen to access map
2. **Integrate with Driving Mode**: Auto-start tracking during drive sessions
3. **Add Leaderboard**: Show global fog coverage rankings
4. **Socket.IO**: Real-time multiplayer fog reveal
5. **Background Tracking**: Continue tracking when app is minimized

---

## Support

**Issues?** Check:
1. [MAPBOX_WEBVIEW_IMPLEMENTATION_SUMMARY.md](MAPBOX_WEBVIEW_IMPLEMENTATION_SUMMARY.md) - Full documentation
2. Expo console for errors
3. Browser dev tools (for WebView debugging)

**Need help?** Review the HTML file comments - each function is documented.

---

**Status**: ✅ Ready to test!
**Last Updated**: 2025-11-16
