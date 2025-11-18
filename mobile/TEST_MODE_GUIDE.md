# 🧪 TEST MODE - KOMPLETAN VODIČ

## ❓ Zašto se rupe ne beleže?

Ako vidiš da su **svi senzori na 0.0000**, to znači da **senzori nisu aktivni**!

### Mogući uzroci:
1. ❌ **Testiraš u browseru/simulatoru** - Senzori NE rade u web verziji!
2. ❌ **Telefon blokira senzore** - Potrebna je fizička akceleracija
3. ❌ **Speed check blokira detekciju** - Brzina je 0 km/h
4. ❌ **Stability check blokira detekciju** - Telefon ne detektuje pokret

## ✅ REŠENJE: TEST MODE!

Test mode **isključuje sve provere** i omogućava detekciju bilo gde, bilo kada!

---

## 🚀 KAKO KORISTITI TEST MODE?

### Korak 1: Pokreni Aplikaciju na FIZIČKOM TELEFONU
```bash
cd mobile
npm start
# Skeniraj QR kod u Expo Go
# VAŽNO: MORA biti pravi telefon (iPhone/Android)!
```

### Korak 2: Otvori Sensor Debug
- Klikni **"🔬 Sensor Debug"** na home ekranu

### Korak 3: Start Monitoring
- Klikni **"▶️ Start Monitoring"**
- Videš upozorenje: **"⚠️ START DRIVING!"**

### Korak 4: Enable Test Mode
- Klikni **"🚗 I'm Driving (Test Mode)"** zeleno dugme
- Prikazuje se kartica: **"🧪 TEST MODE ACTIVE"**

### Korak 5: Testiraj Detekciju
- Drži telefon u ruci
- **Tresni telefon naglo** (bilo kako - gore, dole, levo, desno)
- Magnitude će skočiti > 1.2g
- Prikazaće se alert: **"🕳️ Pothole Detected!"**

---

## 📊 ŠTA TEST MODE RADI?

### ✅ ISKLJUČUJE:
1. **Speed Check** - Ne treba da voziš (0 km/h = OK)
2. **Stability Check** - Ne treba stabilan telefon
3. **Pattern Analysis** - Ne proverava down-up pattern

### ✅ UKLJUČUJE:
1. **Niži Threshold** - 0.3g umesto 1.5g (5x lakše!)
2. **Simple Detection** - Bilo koji jak pokret detektuje
3. **Magnitude Check** - Ako > 1.2g → DETEKTUJE!

### ⚙️ PARAMETRI:

| Parametar | Real Mode | Test Mode |
|-----------|-----------|-----------|
| **Threshold** | 1.5g | 0.3g |
| **Speed Check** | 15-90 km/h | DISABLED |
| **Stability Check** | Required | DISABLED |
| **Pattern Check** | DOWN-UP only | DISABLED |
| **Cooldown** | 2 seconds | 2 seconds |

---

## 🎯 KAKO ZNATI DA RADI?

### 1. **Proveri Senzore**
Kada klikneš "Start Monitoring", senzori bi trebali pokazati **LIVE** indicator:

```
📊 Accelerometer (g)           [LIVE]
X-axis: 0.0234
Y-axis: -0.1234
Z-axis: 0.9876
Magnitude: 1.0034
```

Ako je sve **0.0000**, senzori se **NISU pokrenuli**!

### 2. **Tresni Telefon**
- Magnitude treba da skoči na **> 1.0**
- Ako test mode aktivan i magnitude > 1.2, detektovaće!

### 3. **Proveri Console Log**
U Metro bundler terminalu:
```
🧪 Test Mode: ENABLED
🕳️ POTHOLE DETECTED! {
  mode: 'TEST',
  magnitude: '1.345',
  filtered: '0.456',
  threshold: '0.300',
  speed: '30.0'
}
📤 API Request: POST /events
✅ Event sent successfully!
```

### 4. **Alert Notifikacija**
```
🕳️ Pothole Detected!
Saved to database!
Severity: 45
```

### 5. **Counter Se Povećava**
```
🕳️ Detection Statistics
Potholes Detected: 1    ← OVO SE POVEĆAVA!
Last Detection: 14:30:45
```

---

## ❌ TROUBLESHOOTING

### Problem: Svi senzori pokazuju 0.0000

**Razlog:** Senzori nisu aktivni

**Rešenja:**
1. ✅ Proveri da li je **fizički telefon** (ne browser!)
2. ✅ Restartuj app (zatvori i otvori ponovo)
3. ✅ Dozvoli motion permissions u Settings
4. ✅ Pomeri telefon - možda je u mirovanju

---

### Problem: Test Mode aktivan, ali NE detektuje

**Razlog:** Magnitude je preniska

**Proveri:**
1. Da li Magnitude skače kada treses? (treba > 1.2)
2. Da li je cooldown aktivan? (čekaj 2 sekunde između)
3. Da li Backend radi? (opciono - brojač se povećava i bez backenda)

**Rešenje:**
- Tresni telefon **JAČE**
- Magnitude mora > 1.2g za detekciju

---

### Problem: Counter se NE povećava

**Razlog:** Callback se ne poziva

**Proveri Console:**
```
🕳️ POTHOLE DETECTED!   ← Da li se ovo loguje?
```

Ako se **NE loguje**, detection service nije trigerovan!

**Rešenje:**
1. Klikni ponovo "I'm Driving (Test Mode)"
2. Tresni telefon JAČE (magnitude > 1.2)

---

### Problem: Alert se prikazuje, ali backend ne prima

**Razlog:** Backend nije pokrenut ili pogrešan URL

**Proveri Console:**
```
📤 API Request: POST /events
❌ Response Error: ECONNREFUSED   ← BACKEND NIJE DOSTUPAN
```

**Rešenje:**
1. Pokreni backend: `cd backend && npm run dev`
2. Promeni IP u `apiService.ts`:
   ```typescript
   const API_BASE_URL = 'http://192.168.1.XXX:5000/api';
   ```
3. Proveri da su telefon i računar na istoj Wi-Fi

**NAPOMENA:** Counter **ĆE se povećavati** čak i bez backenda!

---

## 📈 ŠEMA DETEKCIJE U TEST MODU

```
1. Klikneš "Start Monitoring"
   ↓
2. Senzori se aktiviraju (50 Hz)
   ↓
3. Klikneš "I'm Driving (Test Mode)"
   ↓
4. Speed check = DISABLED ✅
   Stability check = DISABLED ✅
   Threshold = 0.3g ✅
   ↓
5. Tresni telefon
   ↓
6. Magnitude > 1.2 ili Filtered > 0.3?
   ↓ YES
7. 🕳️ POTHOLE DETECTED!
   ↓
8. Counter += 1
   ↓
9. Send POST /api/events (opciono)
   ↓
10. Alert: "Pothole Detected!"
```

---

## 🎮 TESTIRANJE - STEP BY STEP

### Test 1: Proveri da li senzori rade
```
1. Start Monitoring
2. Pomeri telefon
3. Magnitude treba da se menja (ne 0.0000)
4. [LIVE] indikator pored Accelerometer
```

### Test 2: Test Mode bez backenda
```
1. Start Monitoring
2. Enable Test Mode
3. Tresni telefon (magnitude > 1.2)
4. Counter se povećava → ✅ RADI
5. Alert prikazuje "Severity: N/A" → Backend nije dostupan
```

### Test 3: Test Mode sa backendom
```
1. Pokreni backend: cd backend && npm run dev
2. Promeni IP u apiService.ts
3. Start Monitoring
4. Enable Test Mode
5. Tresni telefon
6. Counter se povećava → ✅ RADI
7. Alert prikazuje "Severity: 45" → ✅ BACKEND RADI
8. Proveri MongoDB ili curl /api/potholes → Rupa u bazi!
```

---

## 💡 TIPS & TRICKS

### Tip 1: Magnitude je kralj!
Gledaj **Magnitude** - to je najvažniji pokazatelj:
- < 1.0 = Slabo, neće detektovati
- 1.0 - 1.2 = Granica, možda detektuje
- **> 1.2 = DETEKTUJE! 🔥**

### Tip 2: Cooldown period
Mora proći **2 sekunde** između detekcija!
- Tresni
- Čekaj 2s
- Tresni opet

### Tip 3: Console je tvoj prijatelj
Ako nešto ne radi, gledaj Metro bundler:
```
✅ Test Mode ENABLED
🕳️ POTHOLE DETECTED!
📤 API Request: POST /events
✅ Event sent successfully!
```

### Tip 4: Backend je OPCIONI
App **RADI** i bez backenda!
- Counter se povećava lokalno
- Samo neće slati u bazu
- Korisno za brzo testiranje

---

## 🎯 OČEKIVANI REZULTAT

Kada sve radi kako treba:

```
🧪 TEST MODE ACTIVE
✅ Speed check DISABLED
✅ Stability check DISABLED
✅ Threshold: 0.3g (was 1.5g)
Just shake/move the phone - it WILL detect!

📊 Accelerometer (g)           [LIVE]
Magnitude: 1.5432 🔥

🕳️ Detection Statistics
Potholes Detected: 5
Last Detection: 14:32:18

⚙️ Detection Algorithm
Mode: 🧪 TEST MODE
Threshold: 0.3g spike
Pattern Check: DISABLED
```

---

## ✅ CHECKLIST

Pre testiranja, proveri:
- [ ] Fizički telefon (ne browser!)
- [ ] App instaliran preko Expo Go
- [ ] "Start Monitoring" kliknuto
- [ ] "I'm Driving (Test Mode)" kliknuto
- [ ] Senzori pokazuju vrednosti (ne 0.0000)
- [ ] Magnitude se menja kada pomeriš telefon
- [ ] [LIVE] indicator je prikazan

Ako je SVE ✅, samo **TRESNI TELEFON** i videš alert! 🎉

---

**Vukašine, probaj sada! Test mode je ultra lak - tresni telefon i detektovaće! 📱💥**
