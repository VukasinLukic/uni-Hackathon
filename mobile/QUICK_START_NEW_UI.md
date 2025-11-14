# 🚀 Quick Start Guide - New UI

## ✅ Implementation Complete!

Your mobile app has been completely redesigned with a minimalist Apple-style UI and new features!

## 📱 What's New

### **New Screens:**
1. **Home Screen** - Choose between Driving Mode or Walking Mode
2. **Driving Mode** - Automatic pothole detection with floating action menu
3. **Walking Mode** - Camera-based manual pothole reporting
4. **Test Mode** - Full sensor debugging interface
5. **Test Backend** - Backend connectivity testing
6. **View Graphs** - Real-time oscillation visualization

### **New Components:**
- Button (primary, secondary, outline variants)
- Card (clean white cards with shadows)
- ActionButton (floating menu in bottom-right corner)

## 🏃 How to Run

### 1. Start the App
```bash
cd mobile
npx expo start
```

### 2. Open on Your Device
- Scan QR code with Expo Go app
- Or press `a` for Android emulator
- Or press `i` for iOS simulator

## 📖 How to Use Each Mode

### **Driving Mode** 🚗
1. Tap "Driving Mode" on home screen
2. Tap "Start Monitoring"
3. Drive at 15-90 km/h for automatic detection
4. Potholes detected automatically
5. Use **Action Button** (bottom-right ➕) for:
   - **Test Mode** - See sensor data
   - **Test Backend** - Check connection
   - **View Graphs** - See real-time chart

### **Walking Mode** 🚶
1. Tap "Walking Mode" on home screen
2. Point camera at pothole
3. Tap white circle button to capture
4. Review photo
5. Tap "Send Report" to submit

### **Test Mode** 🧪
1. Open from Action Button in Driving Mode
2. Tap "Start" to begin monitoring
3. **Shake device HARD** to simulate pothole
4. See real-time sensor data:
   - Accelerometer (X, Y, Z + magnitude)
   - Gyroscope (rotations)
   - GPS location & speed
5. Test mode bypasses speed checks!

### **Test Backend** 🔌
1. Open from Action Button in Driving Mode
2. Tap "Test Connection"
3. See if backend is reachable
4. View server configuration
5. Check troubleshooting tips if fails

### **View Graphs** 📊
1. Open from Action Button in Driving Mode
2. Tap "Start" to begin
3. **Shake device** to see oscillations
4. Blue line = acceleration magnitude
5. Red dashed line = 1.5g threshold
6. Peaks above red line = potential potholes
7. Current magnitude shown at top

## 🎨 Design Features

- **White backgrounds** everywhere
- **Black primary buttons** with white text
- **Clean typography** with proper spacing
- **Subtle shadows** on all cards
- **Smooth animations** on action button
- **Color-coded indicators** (green = good, red = bad, orange = warning)

## 🔧 Technical Details

### **Installed Packages:**
- `expo-camera` - For Walking Mode photos
- `react-native-svg` - For View Graphs charts

### **Services Used:**
- SensorService - Accelerometer & gyroscope
- LocationService - GPS & speed tracking
- DetectionService - Pothole algorithm
- APIService - Backend communication

### **Navigation:**
```
Home
├── Driving Mode
│   ├── Test Mode (via Action Button)
│   ├── Test Backend (via Action Button)
│   └── View Graphs (via Action Button)
└── Walking Mode
```

## ⚙️ Configuration

### **Backend URL** (in src/services/apiService.ts):
```typescript
baseURL: 'http://10.0.10.157:5001/api'
```

### **Detection Thresholds:**
- **Real mode**: 1.5g minimum
- **Test mode**: 1.2g / 1.3g / 2.0g thresholds
- **Speed range**: 15-90 km/h (bypassed in test mode)
- **Cooldown**: 2 seconds (real), 5 seconds (test)

## 🐛 Troubleshooting

### **"Backend Not Reachable"**
1. Ensure backend is running: `cd backend && npm run dev`
2. Check IP address is correct (10.0.10.157)
3. Verify phone and computer on same WiFi
4. Check firewall settings

### **"Camera Permission Denied"**
1. Go to device Settings
2. Find Expo Go app
3. Enable Camera permission

### **"Location Permission Denied"**
1. Go to device Settings
2. Find Expo Go app
3. Enable Location permission
4. Set to "Always" or "While Using App"

### **No Potholes Detected**
1. Enable Test Mode from Action Button
2. Shake device VERY HARD
3. Check magnitude > 1.3g in View Graphs
4. Or drive over actual bumps at 15+ km/h

## 📂 Files Changed/Created

### **New Files:**
- `src/components/Button.tsx`
- `src/components/Card.tsx`
- `src/components/ActionButton.tsx`
- `src/screens/HomeScreen.tsx`
- `src/screens/DrivingModeScreen.tsx`
- `src/screens/WalkingModeScreen.tsx`
- `src/screens/TestModeScreen.tsx`
- `src/screens/TestBackendScreen.tsx`
- `src/screens/ViewGraphsScreen.tsx`

### **Updated Files:**
- `App.tsx` - New navigation logic
- `src/services/locationService.ts` - Added getCurrentLocationOnce()
- `VUKASIN_TODO.md` - Updated with Phase 4

### **Old Files (can be removed):**
- `src/screens/SensorDebugScreen.tsx` - Replaced by TestModeScreen

## 🎯 Next Steps

Ready for Phase 5 & 6:
- Map screen with pothole visualization
- Voice/sound alerts for nearby potholes
- Photo upload to backend (Walking Mode)
- Performance optimizations
- Battery improvements

---

**Need Help?** Check REDESIGN_COMPLETE.md for full documentation!

**Enjoy the new UI!** 🎉
