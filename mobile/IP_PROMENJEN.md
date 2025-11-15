# ✅ IP ADRESA POPRAVLJENA!

## Problem
Tvoj IP se promenio sa `10.0.10.157` na `10.0.10.156`

## Rešenje
✅ **SVE JE AŽURIRANO!**

### Promene:
1. **apiService.ts** → Default IP sada je `10.0.10.156:5001`
2. **backendDiscovery.ts** → Tvoj IP je **PRVI** u listi za testiranje
3. **Quick discover** → Odmah testira `10.0.10.156:5001`

### Backend Test:
```bash
curl http://10.0.10.156:5001/health
```
**Rezultat:** ✅ `{"status":"ok","timestamp":"2025-11-15T14:22:16.806Z"}`

Backend **RADI PERFEKTNO** na tvom IP-u!

---

## Kako Pokrenuti?

### Opcija 1: Reload App (Najbrže)
U Expo terminalu pritisni:
```
r  (reload app)
```

### Opcija 2: Restart Expo
```bash
# Ctrl+C u terminalu gde radi expo
# Zatim:
npx expo start
```

### Opcija 3: U App-u (Ako već radi)
1. Otvori app
2. Idi na "Test Backend"
3. Klikni "Test Connection"
4. Trebalo bi da se poveže odmah! ✅

### Opcija 4: Auto-Discovery (Ako i dalje ne radi)
1. U app-u klikni "Auto-Discover"
2. Sačekaj 2-3 sekunde
3. Pronaći će backend na `10.0.10.156:5001`!

---

## Šta Dalje?

### Testiranje:
1. **Reload app** (pritisni `r` u Expo terminalu)
2. **Otvori "Test Backend" screen**
3. **Klikni "Test Connection"**
4. **Trebalo bi da vidiš:**
   ```
   ✅ Success!
   Backend is reachable at http://10.0.10.156:5001
   ```

### Logovi koje gledaš:
```
🔍 Health check URL: http://10.0.10.156:5001/health
✅ Backend is reachable: {status: "ok", ...}
✅ Backend is available
```

---

## Ako Se IP Opet Promeni?

### Opcija 1: Koristi Auto-Discovery (NE MORAŠ MENJATI KOD!)
- U app-u klikni "Auto-Discover"
- App će automatski pronaći novi IP
- Čuvaće ga u AsyncStorage

### Opcija 2: Ručno Unesi IP (Brže)
- U app-u klikni "Custom IP"
- Unesi novi IP (npr. `10.0.10.160:5001`)
- Klikni "Test URL"

### Opcija 3: Promeni u Kodu (Klasičan način)
```typescript
// mobile/src/services/apiService.ts (linija 6)
let BACKEND_HOST = 'http://TVOJ_NOVI_IP:5001';
```

---

## Debug Komande

### Proveri svoj IP:
```bash
ipconfig
# Traži "IPv4 Address"
```

### Testiraj backend:
```bash
curl http://TVOJ_IP:5001/health
```

### Testiraj sa moba (u browseru):
```
http://TVOJ_IP:5001/health
```

---

## Summary

✅ **IP ažuriran na `10.0.10.156:5001`**
✅ **Backend radi perfektno**
✅ **App će se odmah povezati**
✅ **Auto-discovery pripreman za buduće promene**

**Samo restartuj app i radiće!** 🚀

