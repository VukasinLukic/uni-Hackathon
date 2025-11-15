# Kako se povezati na Backend - Potpuno Uputstvo

## Problem koji si imao

```
❌ Backend health check failed: timeout of 5000ms exceeded
```

Backend radi na `localhost:5001` ali mobitel ne može da mu pristupi.

## Rešenje - 3 Opcije

### Opcija 1: AUTO-DISCOVERY (PREPORUČENO) ⭐

App sada **AUTOMATSKI PRONALAZI** backend!

1. **Otvori app**
2. **Idi na "Test Backend" ekran**
3. **Klikni "Auto-Discover"**
4. **Sačekaj** - app će testirati:
   - `10.0.10.157:5001` (tvoj IP)
   - `192.168.1.100:5001`
   - `192.168.0.100:5001`
   - `localhost:5001`
   - I još **40+ kombinacija** IP adresa i portova!

5. **Kada pronađe backend:**
   - ✅ Automatski se povezuje
   - ✅ Čuva IP u AsyncStorage
   - ✅ Koristi ga svaki put kad pokreneš app

**Prednosti:**
- Ne moraš da menjaš kod
- Ne moraš da znaš svoj IP
- Funkcioniše na bilo kom WiFi-ju
- Čuva IP koji radi

---

### Opcija 2: RUČNO UNESI IP

Ako auto-discovery ne pronađe, možeš RUČNO da uneseš IP:

1. **Saznaj svoj IP adresu:**
   ```bash
   # Windows
   ipconfig
   # Traži "IPv4 Address" kod WiFi adaptera
   # Primer: 192.168.1.100
   ```

2. **U app-u:**
   - Idi na "Test Backend"
   - Klikni "Custom IP"
   - Unesi: `192.168.1.100:5001` (svoj IP!)
   - Klikni "Test URL"

3. **App će:**
   - ✅ Testirati taj IP
   - ✅ Ako radi, sačuvaće ga
   - ✅ Koristiće ga svaki put

**Formati koji rade:**
```
192.168.1.100:5001
10.0.10.157:5001
http://192.168.1.100:5001
```

---

### Opcija 3: OSTANI OFFLINE (BEZ BACKEND-A)

**NE MORAŠ UOPŠTE DA SE POVEZUJEŠ!**

App ima **OFFLINE MODE** sa mock podacima:
- ✅ 5 sample potholes u Novom Sadu
- ✅ Svi senzori rade
- ✅ Sva funkcionalnost dostupna
- ✅ Events se čuvaju lokalno

**Kada koristiti:**
- Razvijaš UI
- Backend nije potreban
- Tesiraš senzore
- Nemaš WiFi konekciju

---

## Kako Radi Auto-Discovery?

### 1. Brza Pretraga (Quick Discover)
- Testira 4 najčešća IP-a
- Traje 4-6 sekundi
- Koristi se automatski kod svakog API poziva

### 2. Potpuna Pretraga (Full Discovery)
- Testira 40+ kombinacija IP adresa
- Portovi: 5001, 5000, 3000, 8080
- IP paterni:
  ```
  192.168.1.x (100-102)
  192.168.0.x (100-102)
  10.0.10.x (157-159)
  192.168.43.1 (Mobile hotspot)
  192.168.137.1 (Windows hotspot)
  localhost, 127.0.0.1
  10.0.2.2 (Android emulator)
  ```

### 3. Čuvanje IP-a
- Kada pronađe backend, čuva URL u AsyncStorage
- Sledeći put koristi sačuvani URL PRVO
- Ako sačuvani ne radi, ponovo pretražuje

---

## Šta se Desilo Iza Scene?

### Kreirao sam:

1. **`backendDiscovery.ts`** - Auto-discovery servis
   - Testira sve moguće IP/port kombinacije
   - Čuva radne URL-ove
   - Quick i full discovery modovi

2. **Unapređen `apiService.ts`**
   - Auto-discovery integracija
   - Automatski fallback na mock data
   - Smart caching (ne testira svaki put)

3. **Novi UI u `TestBackendScreen`**
   - "Auto-Discover" dugme
   - "Custom IP" modal za ručni unos
   - Progress indicator tokom pretrage
   - 3 opcije kad ne može da se poveže

4. **AsyncStorage integracija**
   - Čuva IP koji radi
   - Auto-load pri pokretanju app-a

---

## Testiranje

### Test 1: Auto-Discovery
```
1. Pokreni backend: npm run dev (u backend folderu)
2. Otvori app
3. Klikni "Test Backend"
4. Klikni "Auto-Discover"
5. Sačekaj 10-20 sekundi
6. Trebalo bi da pronađe backend!
```

### Test 2: Custom IP
```
1. Saznaj svoj IP (ipconfig)
2. U app-u klikni "Custom IP"
3. Unesi: [tvoj-ip]:5001
4. Klikni "Test URL"
5. Trebalo bi da radi!
```

### Test 3: Offline Mode
```
1. Nemoj pokretati backend
2. Klikni "Test Connection"
3. Klikni "Stay Offline"
4. App radi sa mock podacima!
```

---

## Debugovanje

### Logovi koje gledaš:
```javascript
🚀 Initializing API Service...        // App se pokreće
💾 Using saved backend URL: ...       // Koristi sačuvani IP
✅ Backend is available               // Backend radi!
⚠️ Backend unavailable - using fallback mode  // Offline mode
🔍 Starting auto-discovery...         // Discovery u toku
✅ Found working backend: ...         // Pronađen backend!
💾 Saved backend URL: ...            // IP sačuvan
```

### Ako ne radi:

**Problem: Auto-discovery ne pronalazi**
- Proveri da je backend pokrenut (`npm run dev`)
- Proveri da si na istom WiFi-u
- Windows Firewall možda blokira port 5001
  ```bash
  # Dozvoli port kroz firewall
  netsh advfirewall firewall add rule name="Node 5001" dir=in action=allow protocol=TCP localport=5001
  ```

**Problem: Custom IP ne radi**
- Proveri IP (ipconfig)
- Proveri da backend radi (curl http://[ip]:5001/health)
- Unesi port (192.168.1.100:5001 NE samo 192.168.1.100)

**Problem: Uvek je offline**
- To je OK! App radi bez backend-a
- Koristi mock podatke
- Možeš da razvijaš normalno

---

## Koje IP Adrese Pokušava?

### Automatski testira:
1. **Sačuvani IP** (iz prošlog puta)
2. **Tvoj trenutni IP** (10.0.10.157)
3. **Standardni lokalni IP-ovi:**
   - 192.168.1.100-102
   - 192.168.0.100-102
4. **Hotspot IP-ovi:**
   - 192.168.43.1 (Mobile)
   - 192.168.137.1 (Windows)
5. **Emulator IP-ovi:**
   - localhost, 127.0.0.1
   - 10.0.2.2 (Android)

### Portovi:
- 5001 (tvoj backend)
- 5000 (alternativen)
- 3000 (dev server)
- 8080 (generic)

---

## Quick Start - 3 Koraka

1. **Pokreni backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Pokreni app**
   ```bash
   cd mobile
   npx expo start
   ```

3. **U app-u klikni "Auto-Discover"**
   - Sačekaj
   - Profit! 🎉

---

## Dodatno: Dodaj Svoj IP u Discovery

Ako želiš da dodate svoj specifični IP u discovery listu:

```typescript
// mobile/src/services/backendDiscovery.ts
// Linija 14-16, dodaj svoj IP:

const getIPCandidates = (): string[] => {
  return [
    '10.0.10.157',        // Tvoj IP
    '192.168.1.100',      // Dodaj ovde!
    // ...
  ];
};
```

---

## Rezime

✅ **Auto-Discovery** - App automatski pronalazi backend
✅ **Custom IP** - Možeš ručno da uneseš IP
✅ **Offline Mode** - Radi bez backend-a
✅ **Čuva IP** - Jednom se poveže, pamti zauvek
✅ **Smart Fallback** - Nikad ne crashuje

**Možeš da radiš na app-u bez ikakvog backend-a!** 🚀

