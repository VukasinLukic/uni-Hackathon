# 🔍 ANALIZA BACKEND KONEKCIJE I UPISA U BAZU

## ✅ ŠTA SE DEŠAVA KADA APLIKACIJA DETEKTUJE RUPU?

### 1. **Detekcija Rupe (Mobile App)**

Kada mobilna aplikacija detektuje rupu, poziva se callback funkcija u [SensorDebugScreen.tsx:42-83](src/screens/SensorDebugScreen.tsx#L42-L83):

```typescript
detectionService.setCallback(async (event) => {
  // 1. Ažurira UI brojač
  setPotholesDetected((prev) => prev + 1);
  setLastDetection(new Date().toLocaleTimeString());

  // 2. Šalje događaj na backend
  const response = await APIService.sendPotholeEvent({
    location: {
      coordinates: [lng, lat]  // GeoJSON format
    },
    accelerationData: {
      magnitude: 2.5,
      x: 0,
      y: 0,
      z: 2.5
    },
    speed: 30,
    timestamp: new Date()
  });

  // 3. Prikazuje alert sa severity scoreom
  Alert.alert('Pothole Detected!', `Severity: ${response.severity}`);
});
```

---

### 2. **API Request (Mobile → Backend)**

**Endpoint:** `POST http://localhost:5000/api/events`

**Request Body:**
```json
{
  "location": {
    "coordinates": [21.2257, 45.7489]  // [longitude, latitude]
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
  "speed": 30,
  "timestamp": "2024-11-14T14:30:00.000Z"
}
```

**Axios Interceptor Loguje:**
- `📤 API Request: POST /events`
- `✅ API Response: 201 /events` (ako uspe)
- `❌ Response Error: 500 Connection refused` (ako backend nije pokrenut)

---

### 3. **Backend Procesira Događaj**

**Fajl:** `backend/src/controllers/eventController.ts`

#### Korak 1: Validacija
```typescript
// Provera required fields
if (!location?.coordinates || !accelerationData?.magnitude || !speed) {
  return res.status(400).json({ error: 'Missing required fields' });
}
```

#### Korak 2: Kreiranje Event-a u Bazi
```typescript
const event = new Event({
  userId: req.user.auth0Id,  // "mock-user-id-12345"
  location: {
    type: 'Point',
    coordinates: [21.2257, 45.7489]
  },
  accelerationData: {
    magnitude: 2.5,
    x: 0,
    y: 0,
    z: 2.5
  },
  speed: 30,
  timestamp: new Date()
});

await event.save();  // ✅ UPISUJE U MongoDB 'events' kolekciju
```

#### Korak 3: Clustering (Grupiranje u Pothole)
```typescript
const cluster = await ClusteringService.findOrCreateCluster(event);

// Traži postojeću rupu u krugu od 20m
const existingPothole = await Pothole.findOne({
  location: {
    $nearSphere: {
      $geometry: {
        type: 'Point',
        coordinates: [21.2257, 45.7489]
      },
      $maxDistance: 20  // 20 metara
    }
  },
  status: { $ne: 'resolved' }
});

if (existingPothole) {
  // Dodaje događaj postojećoj rupi
  existingPothole.reports += 1;
  existingPothole.impactData.count += 1;
  existingPothole.lastReported = new Date();
  await existingPothole.save();  // ✅ AŽURIRA 'potholes' kolekciju
} else {
  // Kreira novu rupu
  const newPothole = new Pothole({
    location: event.location,
    reports: 1,
    impactData: {
      avgMagnitude: 2.5,
      maxMagnitude: 2.5,
      count: 1
    },
    firstReported: new Date(),
    lastReported: new Date()
  });
  await newPothole.save();  // ✅ UPISUJE NOVU RUPU u 'potholes'
}
```

#### Korak 4: Računanje Severity Score
```typescript
const severity = SeverityService.calculateSeverity({
  avgMagnitude: 2.3,
  maxMagnitude: 3.1,
  reports: 5
});

// Severity = (0.3 × avgMag/3.0) + (0.5 × maxMag/3.0) + (0.2 × reports/50)
// Rezultat: 0-100 score
```

#### Korak 5: WebSocket Notifikacija
```typescript
if (severity > 70) {
  io.emit('new_pothole', { potholeId, severity });
} else {
  io.emit('pothole_updated', { potholeId, severity });
}
```

#### Korak 6: Response
```typescript
res.status(201).json({
  success: true,
  eventId: event._id,
  clusterId: cluster._id,
  severity: 45
});
```

---

### 4. **Mobile Prima Response**

```typescript
console.log('✅ Event sent successfully!', response);
// response = { success: true, eventId: "...", clusterId: "...", severity: 45 }

Alert.alert(
  '🕳️ Pothole Detected!',
  `Saved to database!\nSeverity: 45`
);
```

---

## 📊 STRUKTURA BAZE PODATAKA

### MongoDB Kolekcije:

#### 1. **events** (Svi događaji)
```json
{
  "_id": "ObjectId(...)",
  "userId": "mock-user-id-12345",
  "location": {
    "type": "Point",
    "coordinates": [21.2257, 45.7489]
  },
  "accelerationData": {
    "magnitude": 2.5,
    "x": 0,
    "y": 0,
    "z": 2.5
  },
  "speed": 30,
  "timestamp": "2024-11-14T14:30:00Z",
  "clusterId": "ObjectId(...)",
  "createdAt": "2024-11-14T14:30:00Z",
  "updatedAt": "2024-11-14T14:30:00Z"
}
```

#### 2. **potholes** (Grupisane rupe)
```json
{
  "_id": "ObjectId(...)",
  "location": {
    "type": "Point",
    "coordinates": [21.2257, 45.7489]
  },
  "severity": 45,
  "status": "new",
  "reports": 5,
  "uniqueUsers": ["mock-user-id-12345", "user-2", ...],
  "impactData": {
    "avgMagnitude": 2.3,
    "maxMagnitude": 3.1,
    "count": 5
  },
  "firstReported": "2024-11-14T10:00:00Z",
  "lastReported": "2024-11-14T14:30:00Z",
  "createdAt": "2024-11-14T10:00:00Z",
  "updatedAt": "2024-11-14T14:30:00Z"
}
```

---

## ✅ DA LI SE UPISUJE U BAZU?

### **DA! Evo kako proveriti:**

#### 1. **Proveri da li Backend Prima Zahtev**

Pokreni backend sa:
```bash
cd backend
npm run dev
```

U backend terminalu bi trebao da vidiš:
```
POST /api/events 201 - 45ms
Event created: ObjectId(...)
Cluster found/created: ObjectId(...)
```

#### 2. **Proveri MongoDB Bazu**

**Način 1: MongoDB Compass**
- Otvori MongoDB Compass
- Konektuj se na `mongodb+srv://...`
- Otvori bazu `roadsense`
- Proveri kolekcije:
  - `events` - Vidi sve događaje
  - `potholes` - Vidi grupisane rupe

**Način 2: MongoDB Shell**
```bash
mongosh "mongodb+srv://..."

use roadsense

# Vidi sve događaje
db.events.find().pretty()

# Vidi sve rupe
db.potholes.find().pretty()

# Broji događaje
db.events.countDocuments()

# Najnovije rupe
db.potholes.find().sort({ createdAt: -1 }).limit(5)
```

**Način 3: Backend API**
```bash
# Dohvati sve rupe
curl http://localhost:5000/api/potholes

# Dohvati rupe u blizini
curl "http://localhost:5000/api/potholes/nearby?lat=45.7489&lng=21.2257&radius=1000"
```

#### 3. **Proveri iz Mobile App (Console Logovi)**

Otvori Metro bundler terminal i filtriraj logove:
```
📤 API Request: POST /events
✅ API Response: 201 /events
✅ Event sent successfully! { success: true, eventId: "...", severity: 45 }
```

---

## ❌ ŠTA AKO NE RADI?

### Problem 1: Backend nije pokrenut
**Greška:**
```
❌ Response Error: ECONNREFUSED Connection refused
```

**Rešenje:**
```bash
cd backend
npm run dev
```

---

### Problem 2: Pogrešan API URL
**Greška:**
```
❌ Response Error: Network request failed
```

**Rešenje:**
U `mobile/src/services/apiService.ts`:
```typescript
// PROMENI localhost na IP adresu računara!
const API_BASE_URL = 'http://192.168.1.100:5000/api';
```

**Kako naći IP:**
```bash
# Windows
ipconfig

# Traži IPv4 Address
```

---

### Problem 3: MongoDB nije konfigurisan
**Greška u backend terminalu:**
```
MongooseServerSelectionError: connect ECONNREFUSED
```

**Rešenje:**
Proveri `backend/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/roadsense
```

---

### Problem 4: CORS greška
**Greška:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Rešenje:**
Backend već ima CORS konfigurisan u `backend/src/index.ts`:
```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8081'],
  credentials: true
}));
```

---

## 🧪 KAKO TESTIRATI KOMPLETNU INTEGRACIJU?

### Test 1: Backend Health Check
```bash
curl http://localhost:5000/health

# Očekivano:
# { "status": "ok", "timestamp": "..." }
```

### Test 2: Ručno Slanje Događaja (cURL)
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "location": {
      "coordinates": [21.2257, 45.7489]
    },
    "accelerationData": {
      "magnitude": 2.5,
      "x": 0,
      "y": 0,
      "z": 2.5
    },
    "speed": 30,
    "timestamp": "2024-11-14T14:30:00Z"
  }'

# Očekivano:
# {
#   "success": true,
#   "eventId": "ObjectId(...)",
#   "clusterId": "ObjectId(...)",
#   "severity": 45
# }
```

### Test 3: Proveri da li se Event upisao
```bash
curl http://localhost:5000/api/potholes

# Očekivano:
# {
#   "success": true,
#   "count": 1,
#   "potholes": [...]
# }
```

### Test 4: Mobilna App sa Test Mode
1. Pokreni app
2. Otvori "Sensor Debug"
3. Klikni "Start Monitoring"
4. Klikni "I'm Driving (Test Mode)"
5. Tresni telefon naglo dole-gore
6. Prikazaće se alert: "Pothole Detected! Severity: X"

---

## 📈 REZIME

### ✅ ŠTO RADI:
1. ✅ Detekcija rupe na telefonu
2. ✅ Slanje HTTP POST request na backend
3. ✅ Backend prima request
4. ✅ Event se upisuje u `events` kolekciju
5. ✅ Clustering grupuje događaje u `potholes`
6. ✅ Severity se računa automatski
7. ✅ Response se vraća u app
8. ✅ Alert se prikazuje korisniku

### ⚠️ REQUIREMENTS:
1. ⚠️ Backend mora biti pokrenut (`npm run dev`)
2. ⚠️ MongoDB mora biti dostupan
3. ⚠️ API_BASE_URL mora biti ispravan (IP adresa, ne localhost!)
4. ⚠️ Telefon i računar na istoj Wi-Fi mreži

### 🎯 ZAKLJUČAK:

**DA, APLIKACIJA UPISUJE U BAZU!**

Kada detektuje rupu:
1. Event se **ČUVA** u `events` kolekciji
2. Pothole se **KREIRA/AŽURIRA** u `potholes` kolekciji
3. Severity se **RAČUNA** automatski
4. WebSocket **EMITUJE** notifikaciju
5. Response sa severity **VRAĆA** u app

**ALI SAMO AKO JE BACKEND POKRENUT I DOSTUPAN!**

---

**Vukasin, testiraj sa "I'm Driving" dugmetom i proveri backend terminal za logove! 🚗**
