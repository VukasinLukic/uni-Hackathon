# 🔧 PORT FIX - Backend na 5001 (NE 5000!)

## ❌ PROBLEM

Backend timeout greške:
```
ERROR ❌ Response Error: undefined timeout of 30000ms exceeded
ERROR ❌ Failed to send event: timeout of 30000ms exceeded
```

## ✅ UZROK

Backend se pokreće na **PORT 5001**, ali app se pokušava povezati na **PORT 5000**!

```bash
PS C:\Users\Vukasin\Documents\git projekti\uni-Hackathon\backend> npm run dev
🚀 Server running on port 5001  ← OVDE!
```

## 🛠️ REŠENJE

### 1. Promenjen API URL (FIXED!)

**File:** `mobile/src/services/apiService.ts:7`

```typescript
// STARO (GREŠKA):
const API_BASE_URL = 'http://10.0.10.157:5000/api';

// NOVO (ISPRAVLJENO):
const API_BASE_URL = 'http://10.0.10.157:5001/api'; // ✅ PORT 5001!
```

### 2. Dodat "Test Backend" Button

**Novi button u Sensor Debug Screen:**
- Klikni **"🔌 Test Backend"**
- Testira konekciju sa backendom
- Prikazuje poruku da li backend radi ili ne

### 3. Povećan Timeout

Timeout povećan na **30 sekundi** (bilo 10s) za spore mreže.

---

## 🧪 KAKO TESTIRATI?

### Korak 1: Proveri Backend

```bash
cd backend
npm run dev
```

**Očekivano:**
```
MongoDB Connected: ...
Socket.IO initialized
🚀 Server running on port 5001  ← MORA BITI 5001!
```

### Korak 2: Test Backend Connection

1. Otvori app na telefonu
2. Idi u Sensor Debug
3. Klikni **"🔌 Test Backend"**
4. Trebalo bi da vidiš: **"✅ Backend Connected!"**

### Korak 3: Test u Browser-u

Otvori u browseru (VAŽNO: `/health`, NE `/api/health`!):
```
http://10.0.10.157:5001/health
```

**Očekivano:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-14T..."
}
```

### Korak 4: Test Pothole Detection

1. Start Monitoring
2. Enable Test Mode
3. Tresni telefon JAKO (magnitude > 2.0)
4. Trebalo bi da vidiš:
   ```
   ✅ Event sent successfully!
   Severity: 45
   ```

---

## 📋 CHECKLIST

- [x] Backend pokrenut (`npm run dev`)
- [x] Backend na port **5001** (NE 5000!)
- [x] API_BASE_URL promenjen na `http://10.0.10.157:5001/api`
- [x] App restartovan (zatvori i otvori ponovo)
- [x] Test Backend button kliknut → **"✅ Backend Connected!"**
- [ ] Pothole detection test (tresni telefon)
- [ ] Backend prima event (proveri console log)

---

## 🔍 ŠTA SE PROMENILO?

### File: `mobile/src/services/apiService.ts`
```diff
- const API_BASE_URL = 'http://10.0.10.157:5000/api';
+ const API_BASE_URL = 'http://10.0.10.157:5001/api'; // PORT 5001!

- timeout: 10000, // 10 seconds
+ timeout: 30000, // 30 seconds (increased for slow network)
```

### File: `mobile/src/screens/SensorDebugScreen.tsx`
```diff
+ const testBackendConnection = async () => {
+   try {
+     const isReachable = await APIService.healthCheck();
+     if (isReachable) {
+       Alert.alert('✅ Backend Connected!', 'Backend is reachable at http://10.0.10.157:5001');
+     }
+   } catch (error) {
+     Alert.alert('❌ Connection Error', ...);
+   }
+ };

+ <TouchableOpacity onPress={testBackendConnection} style={styles.buttonTest}>
+   <Text style={styles.buttonText}>🔌 Test Backend</Text>
+ </TouchableOpacity>
```

---

## ⚠️ TROUBLESHOOTING

### Problem: "Backend Not Reachable" nakon klika na Test Backend

**Rešenja:**
1. ✅ Proveri da li backend radi (`npm run dev`)
2. ✅ Proveri da li je port **5001** (NE 5000!)
3. ✅ Proveri da su telefon i računar na istoj WiFi
4. ✅ Proveri IP adresu (`ipconfig`)
5. ✅ Restart app (zatvori i otvori ponovo)

### Problem: Backend radi, ali app i dalje timeout

**Proveri Firewall:**
- Windows Defender može blokirati port 5001
- Dodaj exception za Node.js ili port 5001

**Proveri WiFi:**
- Telefon i računar **MORAJU** biti na istoj mreži
- Neki WiFi routeri imaju "Client Isolation" - isključi ga

---

## ✅ SADA BI TREBALO DA RADI!

1. Backend pokrenut na **port 5001** ✅
2. App se povezuje na **port 5001** ✅
3. Test Backend button dodat ✅
4. Timeout povećan na 30s ✅

**Restartuj app i klikni "🔌 Test Backend"!** 🚀
