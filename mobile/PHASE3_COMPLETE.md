# ✅ FAZA 3 - ZAVRŠENA!

## 🎯 Šta je urađeno?

### 1. **Pojednostavljen Home Screen**
- Uklonjen sav demo sadržaj
- Samo 2 dugmeta: "Sensor Debug" i "View Map (coming soon)"
- Čist, minimalistički dizajn

### 2. **API Servis za Backend Komunikaciju**
- Kreiran `src/services/apiService.ts`
- Axios HTTP client sa interceptorima
- Metode:
  - `sendPotholeEvent()` - Šalje detektovane rupe u bazu
  - `getNearbyPotholes()` - Dohvata rupe u blizini
  - `getAllPotholes()` - Dohvata sve rupe
  - `healthCheck()` - Provera da li backend radi

### 3. **Poboljšan Algoritam Detekcije**
- **NOVA LOGIKA**: Razlikuje rupu od ivičnjaka!
- **Rupa**: Prvo DOLE (negative spike), pa GORE (bounce back)
- **Ivičnjak**: Prvo GORE (climb up), pa DOLE (drop) - **ODBACUJE SE!**
- Pattern analysis sa 15 sample prozor
- Detaljno logovanje u konzoli

### 4. **Upozorenje za Vožnju**
- ⚠️ Prikazuje warning ako brzina nije 15-90 km/h
- Kaže korisniku da mora da vozi da bi detekcija radila
- Velika narandžasta kartica sa trenutnom brzinom

### 5. **Integracija sa Backendom**
- Automatsko slanje događaja u bazu kada se detektuje rupa
- Alert notifikacija sa severity scoreom
- Console logovi za debugging

---

## 📱 KAKO TESTIRATI?

### **VAŽNO: Promena API URL-a!**

Kada testirate na **fizičkom telefonu**, morate promeniti API URL!

**Fajl:** `mobile/src/services/apiService.ts`

**Linija 5-6:**
```typescript
// PROMENI OVO NA IP ADRESU SVOG RAČUNARA!
const API_BASE_URL = 'http://192.168.1.XXX:5000/api';
// NE KORISTI 'localhost' - telefon ne može da pristupi localhost-u!
```

### Kako naći svoju IP adresu?

**Windows:**
```bash
ipconfig
# Traži "IPv4 Address" u Wi-Fi sekciji
# Primer: 192.168.1.100
```

**Mac/Linux:**
```bash
ifconfig
# ili
ip addr show
```

**VAŽNO**: Telefon i računar moraju biti na **istoj Wi-Fi mreži**!

---

## 🚗 TESTIRANJE U AUTU

### 1. Pokreni Backend
```bash
cd backend
npm run dev
# Backend će biti na http://localhost:5000
```

### 2. Proveri da Backend Radi
Otvori browser: `http://localhost:5000/health`

Očekivani odgovor:
```json
{
  "status": "ok",
  "timestamp": "2024-11-14T..."
}
```

### 3. Promeni API URL u Aplikaciji
U fajlu `mobile/src/services/apiService.ts`:
```typescript
const API_BASE_URL = 'http://192.168.1.100:5000/api'; // TVOJ IP!
```

### 4. Pokreni Mobile App
```bash
cd mobile
npm start
# Skeniraj QR kod u Expo Go
```

### 5. Testiranje
1. Otvori aplikaciju na telefonu
2. Klikni "🔬 Sensor Debug"
3. Klikni "▶️ Start Monitoring"
4. **Vidi upozorenje**: "START DRIVING! Speed must be between 15-90 km/h"
5. **Kreni da voziš** (15+ km/h)
6. Kada naletiš na rupu:
   - Telefon će vibrirati (ako je omogućeno)
   - Prikazeće se alert: "🕳️ Pothole Detected! Saved to database!"
   - Brojač će se povećati
   - Događaj će se poslati u bazu

### 6. Proveri Bazu Podataka
```bash
# U backend terminalu
# Proveri MongoDB kolekciju 'events' i 'potholes'
```

---

## 🧪 TESTIRANJE BEZ VOŽNJE (Debug Mode)

Ako želiš da testiraš **bez vožnje**, možeš privremeno isključiti speed check:

**Fajl:** `mobile/src/utils/contextChecks.ts`

**Linija 11-13:**
```typescript
isValidSpeed(speed: number): boolean {
  return true; // PRIVREMENO - uvek vraća true
  // return speed >= 15 && speed <= 90; // Zakomentiši ovo
}
```

**Fajl:** `mobile/src/services/detectionService.ts`

**Linija 18:**
```typescript
private readonly POTHOLE_THRESHOLD = 0.5; // Smanji na 0.5 za testiranje (bilo 1.5)
```

Sada možeš testirati tresući telefon naglo dole-gore!

---

## 🛠️ BACKEND - ŠTA TREBA DA RADIŠ?

### ✅ BACKEND JE OK - NIŠTA NE TREBA DA PROMENIŠ!

Backend već ima sve potrebne endpoint-e:

✅ **POST /api/events** - Prima događaje sa mobilne app
✅ **GET /api/potholes/nearby** - Vraća rupe u blizini
✅ **GET /api/potholes** - Vraća sve rupe
✅ **GET /health** - Health check

### 📊 Podatke koje Mobile šalje:

```json
{
  "location": {
    "coordinates": [longitude, latitude]
  },
  "accelerationData": {
    "magnitude": 2.5,
    "x": 0,
    "y": 0,
    "z": 2.5
  },
  "gyroscopeData": {
    "alpha": 0,
    "beta": 0,
    "gamma": 0
  },
  "speed": 45.5,
  "timestamp": "2024-11-14T14:30:00.000Z"
}
```

### 🎉 Backend Automatski:
- ✅ Spasava event u kolekciju `events`
- ✅ Grupiše događaje u `potholes` (clustering unutar 20m)
- ✅ Računa severity score (0-100)
- ✅ Vraća severity nazad u mobilnu app
- ✅ Emituje WebSocket event (za web dashboard)

**NE TREBA NIŠTA DA PROMENIŠ NA BACKENDU!**

---

## 🚨 ČESTA PITANJA

### Q: Backend nije dostupan sa telefona?
**A:** Proveri:
1. Da li je backend pokrenut? (`npm run dev`)
2. Da li si promenio IP u `apiService.ts`?
3. Da li su telefon i računar na istoj Wi-Fi mreži?
4. Firewall možda blokira port 5000

### Q: GPS ne radi?
**A:**
- Izađi napolje (bolji signal)
- Čekaj 10-30 sekundi
- Proveri da si odobrio location permissions

### Q: Detekcija ne radi?
**A:** Proveri:
- Da li je "Speed Valid" = ✅ YES?
- Da li je "Device Stable" = ✅ YES?
- Da li je Magnitude > 1.5?
- Pogledaj console logove za pattern detection

### Q: Detektuje ivičnjak kao rupu?
**A:** Algoritam bi trebao da **odbacuje** ivičnjake. Proveri console:
- ✅ "POTHOLE PATTERN DETECTED (down-up)"
- ❌ "CURB PATTERN REJECTED (up-down)"

Ako i dalje detektuje ivičnjak, povećaj range threshold u `signalProcessing.ts:80`:
```typescript
if (range < 0.7) { // Promeni sa 0.5 na 0.7
```

---

## 📈 NAPREDAK

### ✅ Faza 1: Setup & Foundation - ZAVRŠENO
### ✅ Faza 2: Sensor Integration - ZAVRŠENO
### ✅ Faza 3: API Integration & Driving Screen - ZAVRŠENO
### 🔜 Faza 4: Map & Alerts - SLEDEĆE
### 🔜 Faza 5: Camera & Polish - SLEDEĆE

---

## 🎯 SLEDEĆI KORACI

Posle testiranja u autu:

1. **Prilagodi threshold** ako je potrebno
2. **Kalibriraj pattern detection** za različite tipove rupa
3. **Implementiraj Fazu 4** - Mapa sa potholes
4. **Dodaj audio alerts** - Glasovno upozorenje pred rupom

---

**Vukašine, idi u kola i testirај! Srećno! 🚗💨**

**NAPOMENA**: Ne zaboravi da promeniš `API_BASE_URL` na svoj IP!
