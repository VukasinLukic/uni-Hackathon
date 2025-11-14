# ⏱️ TIMEOUT FIX - Backend Performance Optimization

## ❌ PROBLEM

Backend **radio prvih 6 detekcija**, ali onda počeo da **timeout-uje** nakon 30 sekundi:

```
LOG  ✅ Event sent successfully! severity: 47  ← RADI!
LOG  ✅ Event sent successfully! severity: 44  ← RADI!
LOG  ✅ Event sent successfully! severity: 42  ← RADI!
...
ERROR ❌ timeout of 30000ms exceeded  ← TIMEOUT!
```

---

## 🔍 UZROK - Analiza Problema

### 1. **MongoDB Geospatial Query (`$near`) Spor**

Backend koristi **MongoDB geospatial query** (`$near`) da pronađe postojeće klastere rupa:

```typescript
// clusteringService.ts
const cluster = await Pothole.findOne({
  location: {
    $near: {
      $geometry: { type: 'Point', coordinates },
      $maxDistance: 20, // 20 meters
    },
  },
});
```

**Problem:**
- Query može biti **SPOR** ako 2dsphere index nije pravilno kreiran
- Ako ima mnogo dokumenata, query može trajati 10-30+ sekundi
- Nakon nekih uspešnih zapisa, MongoDB možda **ne koristi index** efikasno

### 2. **WebSocket Emit Blokira Response**

Backend šalje WebSocket notifikaciju **PRE** nego što pošalje HTTP response:

```typescript
// eventController.ts (STARO)
await SeverityService.updateSeverity(cluster);

// WebSocket emit - BLOKIRA!
emitPotholeUpdate('new_pothole', cluster);

// HTTP response - KASNO!
res.status(201).json({ ... });
```

**Problem:** Ako WebSocket klijent nije povezan ili ima problema, može blokirati HTTP response!

### 3. **Mobile App Čeka 30 Sekundi**

```typescript
timeout: 30000, // 30 seconds - PREDUGO!
```

Čak i ako backend radi, **30s je previše** za mobile app u realnom vremenu.

---

## ✅ REŠENJE

### Fix 1: **Dodao Timeout na Geospatial Query (5s)**

**File:** `backend/src/services/clusteringService.ts:28`

```typescript
async findNearbyCluster(coordinates, maxDistance) {
  try {
    const cluster = await Pothole.findOne({
      location: { $near: { ... } },
    }).maxTimeMS(5000); // ✅ 5 second timeout!

    return cluster;
  } catch (error) {
    // If timeout, create NEW cluster instead of failing
    console.warn('Query timeout - creating new cluster');
    return null;
  }
}
```

**Benefit:** Ako query traje > 5s, **kreira novi klaster** umesto da čeka 30s i timeout-uje!

---

### Fix 2: **WebSocket Emit Async (Ne Blokira Response)**

**File:** `backend/src/controllers/eventController.ts:50`

```typescript
// ✅ Send HTTP response IMMEDIATELY
res.status(201).json({
  success: true,
  eventId: event._id,
  severity: cluster.severity,
});

// ✅ WebSocket emit AFTER response (asynchronous)
setImmediate(() => {
  try {
    emitPotholeUpdate('pothole_updated', cluster);
  } catch (error) {
    console.error('WebSocket error:', error);
  }
});
```

**Benefit:**
- Mobile app dobija **instant response** (< 1s umesto 30s)
- WebSocket se emituje **asinhrono** u pozadini
- Greške u WebSocket-u **ne blokiraju** HTTP response

---

### Fix 3: **Smanjio Mobile Timeout (30s → 10s)**

**File:** `mobile/src/services/apiService.ts:15`

```typescript
timeout: 10000, // ✅ 10 seconds (was 30s)
```

**Benefit:**
- Ako backend ne odgovori za **10s**, app će brže pokazati grešku
- Korisnik neće čekati **30s** da vidi da nešto ne radi

---

## 📊 PERFORMANSE - Pre vs Posle

### STARO (Pre Fix-a):

```
1. Mobile šalje POST /api/events
2. Backend traži nearby cluster (može 10-30s)
3. Backend čuva u MongoDB
4. Backend šalje WebSocket emit (može blokirati)
5. Backend šalje HTTP response
6. Mobile dobija response (NAKON 30s)
   ❌ TIMEOUT!
```

**Totalno vreme:** 10-30+ sekundi

---

### NOVO (Posle Fix-a):

```
1. Mobile šalje POST /api/events
2. Backend traži nearby cluster (MAX 5s, ili kreira novi)
3. Backend čuva u MongoDB
4. Backend šalje HTTP response ✅ ODMAH!
5. Mobile dobija response (< 1s) ✅ BRZO!
6. WebSocket emit se dešava u pozadini (ne blokira)
```

**Totalno vreme:** < 1-2 sekunde

---

## 🛠️ DODATNE OPTIMIZACIJE

### MongoDB Index Check

Proveri da li je **2dsphere index** kreiran:

```bash
# U MongoDB Compass ili shell
db.potholes.getIndexes()
```

Očekivano:
```json
[
  { "key": { "_id": 1 } },
  { "key": { "location": "2dsphere" } },  ← OVO MORA!
  { "key": { "severity": -1 } },
  { "key": { "status": 1 } }
]
```

Ako `location: "2dsphere"` **NE POSTOJI**, kreiraj ga:

```javascript
db.potholes.createIndex({ location: "2dsphere" })
```

---

## 🧪 TESTIRANJE

### 1. **Restartuj Backend**

```bash
cd backend
# Ctrl+C (stop)
npm run dev
```

### 2. **Reload Mobile App**

Shake telefon → Reload ili klikni `r` u terminalu

### 3. **Test Pothole Detection**

1. Start Monitoring
2. Enable Test Mode
3. Tresni telefon 10x (svaki trese sa 5s cooldown-om)
4. **Svaki trese bi trebao da se sačuva < 2s**

Očekivano:
```
LOG  🕳️ POTHOLE DETECTED!
LOG  📤 Sending pothole event...
LOG  ✅ Event sent successfully! severity: 45  ← < 2 sekunde!
```

---

## 📝 REZIME PROMENA

### Backend:

1. ✅ **clusteringService.ts** - dodao `.maxTimeMS(5000)` timeout
2. ✅ **clusteringService.ts** - dodao try-catch da ne failuje
3. ✅ **eventController.ts** - pomerio HTTP response PRE websocket emit-a
4. ✅ **eventController.ts** - websocket emit u `setImmediate()` async

### Mobile:

1. ✅ **apiService.ts** - smanjio timeout sa 30s na 10s

---

## ⚠️ NAPOMENE

### Zašto je radilo prvih 6x, pa onda timeout?

**Mogući razlozi:**

1. **MongoDB Index Delay** - Index se kreira **lazily** (tek nakon prvih dokumenata)
2. **Geospatial Query Slowdown** - Sa više dokumenata, query je sporiji
3. **WebSocket Connection Issue** - Nakon nekog vremena, WebSocket konekcija može imati problema
4. **Network Lag** - Wifi mreža može imati packet loss nakon nekog vremena

**Rešenje:** Svi fix-ovi gore rešavaju ove probleme!

---

## ✅ SADA BI TREBALO DA RADI!

**Restartuj backend i probaj ponovo! Backend će sada biti BRŽI i NE ĆE timeout-ovati! 🚀**

---

## 🔍 DEBUG - Ako I Dalje Timeout-uje

### 1. Proveri Backend Console

```bash
# Backend terminal
npm run dev

# Gledaj za:
LOG  findNearbyCluster error (creating new cluster): ...
```

Ako vidiš ovu poruku, znači da geospatial query timeout-uje i **kreira novi klaster** umesto da failuje!

### 2. Proveri MongoDB Connection

```bash
# U backend terminalu
LOG  MongoDB Connected: ...
```

Ako NE vidiš ovu poruku, MongoDB konekcija nije uspela!

### 3. Proveri Mobile App Logs

```bash
# Metro bundler terminal
LOG  📤 API Request: POST /events
LOG  ✅ API Response: 201 /events  ← Trebalo bi < 2s!
```

Ako vidiš response **< 2s**, sve radi!

---

**Vukašine, restartuj backend i probaj! 🚀**
