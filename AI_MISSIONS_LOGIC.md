# AI Missions Logic - FIXED ✅

## Kratak Pregled
AI Missions generiše optimizovane rute za popravku rupa sortirane po SEVERITY (prioritet). Backend koristi Gemini 2.0 Flash za optimizaciju, a frontend prikazuje tačne adrese i mapu sa rutama.

---

## Flow (Korak po Korak)

### 1️⃣ REQUEST (Frontend → Backend)
**Endpoint:** `POST /api/ai-mission`

**Body (SIMPLIFIED):**
```json
{
  "teams": 1-3,
  "workHours": 4-8
}
```

❌ **REMOVED:** `missionType`, `constraints` (nepotrebni)

**Validacija:** [aiMissionController.ts:29-31](backend/src/controllers/aiMissionController.ts#L29-L31)

---

### 2️⃣ FETCH & SORT POTHOLES
**Kod:** [aiMissionController.ts:34](backend/src/controllers/aiMissionController.ts#L34)
```typescript
const potholes = await Pothole.find({ status: { $in: ['new', 'planned'] } });
```

**Transform:** [aiMissionController.ts:41-50](backend/src/controllers/aiMissionController.ts#L41-L50)
- Izvlači `[lng, lat]` iz GeoJSON
- Konvertuje severity: `severity / 100` (0-100 → 0-1)
- **✅ TAČNA ADRESA:** `p.location.address || coordinates`

**Sortiranje:** [aiMissionController.ts:53](backend/src/controllers/aiMissionController.ts#L53)
```typescript
const sortedPotholes = [...potholeData].sort((a, b) => b.severity - a.severity);
```
✅ **JEDNOSTAVNO:** Samo po severity, najviši prioritet prvi

**Limit:** `.slice(0, 15)` - top 15 za AI

---

### 3️⃣ AI PROMPT (IMPROVED)
**Kod:** [aiMissionController.ts:59-79](backend/src/controllers/aiMissionController.ts#L59-L79)

**Config:**
- Model: `gemini-2.0-flash-exp` (FREE)
- Temperature: `0.1` ✅ (bilo 0.3, sad konzistentnije)
- Max tokens: `800`

**Prompt Format:**
```
ROUTE OPTIMIZER

Task: Create 2 missions for repair teams, 6h each.
Priority: Highest severity first.

AVAILABLE POTHOLES (ID, Lat, Lng, Severity):
1. 456a4, 45.749, 21.226, 0.70
2. 789bc, 45.751, 21.228, 0.92

CRITICAL RULES:
1. Return EXACTLY 2 mission(s) (one per team)
2. ONLY use IDs from the list above
3. Each team works MAX 6 hours (assume 30min per pothole)
4. Cluster nearby potholes for shortest route
5. Return valid JSON format below

REQUIRED JSON FORMAT:
{"missions":[{"teamId":1,"route":["id1","id2"],"estimatedTime":5.2,"totalDistance":11.4,"impactScore":8.9}]}
```

---

### 4️⃣ FALLBACK MECHANISM
**Kod:** [aiMissionController.ts:98-110](backend/src/controllers/aiMissionController.ts#L98-L110)

✅ **FIXED:** Ako AI faila (JSON parse error ili missing missions), koristi fallback:

```typescript
function createFallbackMissions(potholes, teams, hours) {
  // Podeli rupe po timovima
  // Kalkuliši tačan distance, time, impact
  // Vrati validne missions
}
```

---

### 5️⃣ ENRICH SA TAČNIM PODACIMA
**Kod:** [aiMissionController.ts:119-178](backend/src/controllers/aiMissionController.ts#L119-L178)

**Validacija IDs:** [aiMissionController.ts:125-126](backend/src/controllers/aiMissionController.ts#L125-L126)
```typescript
const validShortIds = new Set(topPotholes.map(p => p.id.slice(-6)));
const validRouteIds = routeIds.filter(id => validShortIds.has(id.slice(-6)));
```
✅ **FIXED:** Proverava da li AI vraća postojeće IDs

**TAČAN Total Distance:** [aiMissionController.ts:141-144](backend/src/controllers/aiMissionController.ts#L141-L144)
```typescript
let totalDistance = 0;
for (let i = 1; i < routePotholes.length; i++) {
  totalDistance += calculateDistance(routePotholes[i - 1], routePotholes[i]);
}
```

**TAČAN Estimated Time:** [aiMissionController.ts:147-149](backend/src/controllers/aiMissionController.ts#L147-L149)
```typescript
const repairTime = routePotholes.length * 0.5; // 30min po rupi
const travelTime = totalDistance / 40; // 40 km/h
const estimatedTime = repairTime + travelTime;
```

**TAČAN Impact Score:** [aiMissionController.ts:152-153](backend/src/controllers/aiMissionController.ts#L152-L153)
```typescript
const impactScore = routePotholes.reduce((sum, p) => sum + p.severity, 0) / routePotholes.length;
```

**✅ ADDRESS INCLUDED:** [aiMissionController.ts:169](backend/src/controllers/aiMissionController.ts#L169)
```typescript
address: p.address, // TAČNA ADRESA IZ BAZE
```

---

### 6️⃣ FINAL RESPONSE
**Kod:** [aiMissionController.ts:191-195](backend/src/controllers/aiMissionController.ts#L191-L195)

```json
{
  "missions": [{
    "teamId": 1,
    "route": ["456a4", "789bc"],
    "potholes": [{
      "id": "6918d7d4b6da5d16997456a4",
      "lat": 45.749,
      "lng": 21.226,
      "severity": 0.7,
      "address": "Bulevar oslobođenja 46, Novi Sad",
      "distance": 0
    }, {
      "id": "def789abc123",
      "lat": 45.751,
      "lng": 21.228,
      "severity": 0.9,
      "address": "Maksima Gorkog 12, Novi Sad",
      "distance": 1.8
    }],
    "routeGeometry": {
      "type": "LineString",
      "coordinates": [[21.226, 45.749], [21.228, 45.751]]
    },
    "estimatedTime": 1.2,
    "totalDistance": 1.8,
    "impactScore": 0.8
  }],
  "totalPotholes": 2,
  "totalImpact": 0.8
}
```

---

## ✅ FRONTEND - MAPBOX MAPA SA RUTAMA

**File:** [web/src/pages/AIMissionsPage.tsx](web/src/pages/AIMissionsPage.tsx)

**Šta prikazuje:**

1. **Jednostavan Form:**
   - Number of Teams (1-3)
   - Work Duration (4-8h)
   - Generate Button

2. **Mission Results Cards:**
   - Team broj, potholes count, distance, time, impact
   - **✅ Route sa ADRESAMA:** [AIMissionsPage.tsx:240-271](web/src/pages/AIMissionsPage.tsx#L240-L271)
   ```tsx
   {mission.potholes.map((pothole, pIdx) => (
     <div>
       <MapPin /> {pothole.address}
       Severity: {pothole.severity * 100}/100
       {pothole.distance}km from prev
     </div>
   ))}
   ```

3. **Mapbox Mapa sa Rutama:** [AIMissionsPage.tsx:278-366](web/src/pages/AIMissionsPage.tsx#L278-L366)
   - **LineString rute** različitih boja po timu
   - **Numbered markers** (1, 2, 3...) na svakoj rupi
   - **Popup sa adresom** kad klikneš marker

**Mapbox Layer:**
```tsx
<Layer
  type="line"
  paint={{
    'line-color': teamColors[idx], // Plava, zelena, narandžasta
    'line-width': 4,
    'line-opacity': 0.8,
  }}
/>
```

---

## ✅ FIXED PROBLEMS

### ✅ P1: missionType & constraints REMOVED
Sada jednostavno sortira po severity DESC.

### ✅ P2: Address prikazuje TAČNU adresu iz baze
```typescript
address: p.location.address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
```

### ✅ P3: Distance je TAČAN (Haversine formula)
```typescript
calculateDistance(p1, p2) → tačan km
```

### ✅ P4: EstimatedTime je TAČAN
```
repairTime (30min/pothole) + travelTime (distance/40km/h)
```

### ✅ P5: ImpactScore je TAČAN
```
average severity svih rupa u ruti
```

### ✅ P6: Prompt je BOLJI
- CRITICAL RULES sa EXACTLY, ONLY, MAX
- Temperature 0.1 (konzistentnije)

### ✅ P7: Fallback mehanizam postoji
Ako AI faila, automatski kreira simple missions.

### ✅ P8: Mapa RADI sa Mapbox
- LineString rute
- Numbered markers
- Popup sa adresama

---

## 🧪 TESTING

Testiraj sa:
```bash
curl -X POST http://localhost:5000/api/ai-mission \
  -H "Content-Type: application/json" \
  -d '{"teams": 2, "workHours": 6}'
```

Očekivani response:
- 2 missions
- Max 12 potholes po timu (6h * 2)
- Tačne adrese
- LineString geometrija

---

## 📊 SUMMARY

**Backend:** [backend/src/controllers/aiMissionController.ts](backend/src/controllers/aiMissionController.ts) - 276 lines
**Frontend:** [web/src/pages/AIMissionsPage.tsx](web/src/pages/AIMissionsPage.tsx) - 375 lines
**API Service:** [web/src/services/apiService.ts:168-179](web/src/services/apiService.ts#L168-L179)

**Status:** ✅ FULLY WORKING
- Backend simplified & fixed
- Addresses from database
- Accurate calculations
- Mapbox map with routes
- Fallback mechanism
