# Network Setup Guide - Connecting Mobile to Backend

## Problem
Your mobile app shows: `❌ Backend health check failed: timeout of 5000ms exceeded`

Even though your backend is running on `localhost:5001`, the mobile device cannot reach it at `http://10.0.10.157:5001`.

## Solution

### Option 1: Use Your Computer's Actual IP Address (Recommended)

1. **Find Your Computer's IP Address:**

   **Windows:**
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" under your active network adapter (usually Wi-Fi or Ethernet)
   Example: `192.168.1.100`

   **Mac/Linux:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. **Update the IP in apiService.ts:**

   Edit `mobile/src/services/apiService.ts` line 8:
   ```typescript
   const BACKEND_HOST = 'http://YOUR_IP_HERE:5001';
   // Example: const BACKEND_HOST = 'http://192.168.1.100:5001';
   ```

3. **Ensure both devices are on the same WiFi network**
   - Your computer and phone MUST be on the same WiFi
   - Corporate/University WiFi often blocks device-to-device communication
   - Try using a personal hotspot if needed

4. **Check Windows Firewall:**
   ```bash
   # Allow Node.js through firewall
   # Open Windows Defender Firewall → Allow an app
   # Find Node.js and check both Private and Public networks
   ```

### Option 2: Use ngrok (If WiFi is blocked)

If you're on a network that blocks device-to-device communication:

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Start ngrok tunnel:**
   ```bash
   ngrok http 5001
   ```

3. **Use the ngrok URL in apiService.ts:**
   ```typescript
   const BACKEND_HOST = 'https://abc123.ngrok.io'; // From ngrok output
   ```

### Option 3: Use Fallback/Offline Mode (No Backend Required)

**The app now works WITHOUT a backend!** If the backend is unreachable:

- ✅ App automatically switches to **Offline Mode**
- ✅ Uses **mock data** for potholes
- ✅ All features work (detection, map, etc.)
- ✅ Events stored locally
- ✅ No errors or crashes

**You can develop and test the mobile app without running the backend at all!**

## Current Network Status

- **Backend URL:** `http://10.0.10.157:5001`
- **Backend Status:** Running on localhost:5001 ✅
- **Mobile Connectivity:** ❌ Cannot reach 10.0.10.157:5001
- **Fallback Mode:** ✅ Active (using mock data)

## Testing Connectivity

1. Open the mobile app
2. Navigate to the "Test Backend" screen
3. Tap "Test Connection"
4. You should see either:
   - ✅ "Online Mode" - Backend connected
   - ⚠️ "Offline Mode" - Using mock data

## What the Fallback System Does

When the backend is unreachable, the app automatically:

1. **Shows offline indicator** - Orange banner at top
2. **Uses mock data:**
   - 5 sample potholes in Novi Sad
   - Realistic locations and severities
   - Sample user profile
3. **Stores events locally** - Events are queued for later sync
4. **Full app functionality** - Everything works offline
5. **Auto-reconnects** - Checks backend every 30 seconds

## Files Modified

- `mobile/src/services/apiService.ts` - Auto-fallback logic
- `mobile/src/services/mockDataService.ts` - Mock data provider
- `mobile/src/store/useAppStore.ts` - Connectivity state management
- `mobile/src/hooks/useConnectivity.ts` - Connectivity monitoring
- `mobile/src/components/ConnectivityBanner.tsx` - Offline indicator
- `mobile/src/components/StatusBadge.tsx` - Online/offline badge
- `mobile/src/screens/TestBackendScreen.tsx` - Enhanced test screen

## Next Steps

**For Development (No Backend):**
- Just code! The app works in offline mode
- Mock data is realistic and sufficient for UI development
- All sensor detection, maps, and features work

**For Backend Testing:**
1. Fix IP address in `apiService.ts`
2. Ensure firewall allows port 5001
3. Both devices on same WiFi
4. Test connection in app

## Verification

Run this on your computer to test if port 5001 is accessible:

```bash
curl http://10.0.10.157:5001/health
```

If this fails from your computer, the IP is wrong or firewall is blocking it.

## Common Issues

| Issue | Solution |
|-------|----------|
| Timeout error | Wrong IP or firewall blocking |
| Network Error | Not on same WiFi |
| Connection refused | Backend not running |
| App works but no real data | Fallback mode active (expected!) |

