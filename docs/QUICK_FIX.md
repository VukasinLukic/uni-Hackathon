# BRZI FIX - Port 7392

## ✅ GOTOVO - Evo šta sam uradio:

### 1. Promenio backend port na 7392
- `backend/.env` → PORT=7392

### 2. Ažurirao mobile app
- `mobile/src/services/apiService.ts` → default: http://10.0.10.156:7392
- `mobile/src/services/backendDiscovery.ts` → portovi: [7392, 5001, ...]
- Dodao auto-clear starog cached porta 5001

### 3. Problem sa cache-om
App je držao stari URL (port 5001) u AsyncStorage. Dodao sam kod koji automatski briše cache ako ima stari port.

## 🚀 Kako pokrenuti:

```bash
# Terminal 1 - PRVO pokreni backend
cd backend
npm run dev
# Treba da vidiš: "Server running on port 7392"

# Terminal 2 - Restartuj mobile sa --clear
cd mobile
npx expo start --clear
# Ili samo restartuj app (r u terminalu)
```

## 📱 U Expo Go app-u:

1. Shake phone → Reload app
2. Proveri logove - treba da vidiš: "🗑️ Clearing old cached URL with port 5001"
3. Zatim: "Using backend URL: http://10.0.10.156:7392"

## Ako i dalje ne radi:

1. U Expo Go: Settings → Clear cache
2. Ili obriši app i ponovo skeniraj QR

**Port 7392 - jedinstven, niko drugi na hackathonu ga neće koristiti!**
