# ⚡ QUICK SETUP - 3 MINUTE GUIDE

## 🔴 PROBLEM: Network Error

```
❌ Response Error: undefined Network Error
```

**RAZLOG:** `localhost` ne radi sa telefona! Telefon ne može da pristupi localhost-u na računaru.

---

## ✅ REŠENJE: 3 KORAKA

### 1️⃣ **Nađi IP adresu računara**

**Windows:**
```bash
ipconfig
```
Traži "IPv4 Address" u WiFi sekciji:
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . : 192.168.1.100  ← OVO!
```

**Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Primer:** `192.168.1.100`

---

### 2️⃣ **Promeni IP u Mobile App**

**Fajl:** `mobile/src/services/apiService.ts`

**Linija 7:**
```typescript
const API_BASE_URL = 'http://192.168.1.100:5001/api'; // ← STAVI SVOJ IP + PORT 5001!
```

**VAŽNO:** Zameni `192.168.1.100` sa TVOJOM IP adresom! **PORT MORA biti 5001!**

---

### 3️⃣ **Pokreni Backend**

```bash
cd backend
npm run dev
```

Očekivano:
```
Server running on port 5001
MongoDB connected successfully
```

---

## 🧪 TEST: Da li radi?

### Test 1: Browser
Otvori u browseru: `http://192.168.1.100:5001/health` (NE /api/health!)

Očekivano:
```json
{
  "status": "ok",
  "timestamp": "2024-11-14T..."
}
```

### Test 2: Mobile App - Backend Connection
1. Restart app (zatvori i otvori ponovo)
2. Klikni **"🔌 Test Backend"** dugme
3. Trebaš videti: "✅ Backend Connected!"

### Test 3: Mobile App - Pothole Detection
1. Start Monitoring
2. Enable Test Mode
3. Tresni telefon JAKO (magnitude > 2.0)
4. Trebaš videti: "✅ Event sent successfully!"

---

## 📊 NOVI PARAMETRI (Anti-Spam)

### ⚠️ Test Mode je STROŽI:

| Parametar | Stara vrednost | Nova vrednost |
|-----------|---------------|---------------|
| **Threshold** | 0.8g | **1.2g** |
| **Magnitude AND** | 1.5g | **1.3g** |
| **Magnitude OR** | - | **2.0g** |
| **Cooldown** | 2s | **5s** |

### 🎯 Detekcija će se aktivirati samo ako:

**Opcija 1:** (Filtered > 1.2g **AND** Magnitude > 1.3g)
**Opcija 2:** Magnitude > 2.0g

**Plus:** Cooldown 5 sekundi između detekcija!

---

## 🎨 VIZUELNI FEEDBACK

### Magnitude indikatori:
```
< 1.3g  → Beli tekst (preslabo)
> 1.3g  → 🟡 ⚡ GOOD (narandžasto)
> 2.0g  → 🟢 🎯 PERFECT! (zeleno, bold)
```

Kada vidiš **"🎯 PERFECT!"**, detektovaće!

---

## ❓ TROUBLESHOOTING

### Problem: "Network Error" i dalje

**Proveri:**
1. ✅ Backend pokrenut? `npm run dev`
2. ✅ IP adresa tačna? `ipconfig`
3. ✅ Telefon i računar na istoj WiFi?
4. ✅ Firewall ne blokira port 5000?
5. ✅ Restartovao app? (zatvori i otvori)

---

### Problem: Backend odbija konekciju

**Proveri `.env` fajl:**
```env
PORT=5001
MONGODB_URI=mongodb+srv://...
FRONTEND_URL=http://localhost:3000
MOBILE_URL=http://192.168.1.100:8081  ← ADD THIS!
```

**Backend CORS:**
U `backend/src/server.ts`:
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8081',
    'http://192.168.1.100:8081', // ← ADD YOUR IP!
  ],
  credentials: true
}));
```

---

### Problem: Previše detekcija (spam)

**REŠENO!** Novi cooldown: **5 sekundi**

Sada:
- Tresni
- Čekaj **5 sekundi**
- Tresni opet

Ne može više da spam-uje detekcije!

---

### Problem: Magnitude ne prelazi 2.0

**Tips:**
1. Drži telefon ČVRSTO u ruci
2. Tresni ga KAO DA BACAŠ (brz pokret)
3. Smer nije bitan - jačina jeste!
4. Gledaj broj - kada vidiš **2.0+**, detektovaće!

---

## 📝 REZIME

### ✅ ŠTO SI URADIO:

1. ✅ Popravio cooldown (2s → **5s**)
2. ✅ Podigao threshold (0.8g → **1.2g**)
3. ✅ Dodao magnitude AND check (**> 1.3g**)
4. ✅ Dodao magnitude OR check (**> 2.0g**)
5. ✅ Promenio API URL (upozorenje)
6. ✅ Dodao vizuelne indikatore (⚡ GOOD, 🎯 PERFECT!)

### ⚠️ ŠTO TREBA DA URADIŠ:

1. ⚠️ **Promeni IP** u `apiService.ts:7`
2. ⚠️ **Pokreni backend** (`npm run dev`)
3. ⚠️ **Restart app**
4. ⚠️ **Test** sa jakim tresom (magnitude > 2.0)

---

**Vukašine:**

1. Nađi svoj IP: `ipconfig`
2. Promeni u `apiService.ts`: `http://TVOJ_IP:5000/api`
3. Pokreni backend: `cd backend && npm run dev`
4. Restart app
5. Tresni telefon JAKO (magnitude > 2.0)
6. Videš: "✅ Event sent successfully! Severity: X"

**Backend će raditi! 🚀**
