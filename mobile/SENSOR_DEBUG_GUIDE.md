# 🔬 Sensor Debug Screen - Testing Guide

## Šta je implementirano?

Kreiran je **Sensor Debug Screen** koji prikazuje sve senzore i detekcioni algoritam uživo!

## Kako testirati?

### 1. Pokreni aplikaciju
```bash
npm start
# ili
npx expo start
```

### 2. Otvori na telefonu
- Skeniraj QR kod u Expo Go aplikaciji
- **VAŽNO**: Senzori NE rade u simulatoru! Mora biti fizički telefon!

### 3. Testiranje ekrana

1. Na home ekranu klikni na **"🔬 Sensor Debug"** dugme
2. Klikni **"▶️ Start Monitoring"** da pokreneš senzore
3. Odmah ćeš videti live data:

## Šta se prikazuje? 📊

### ✅ Monitoring Status
- Zeleno = Aktivno
- Sivo = Pauzirano

### 🕳️ Detection Statistics
- **Potholes Detected**: Broj detektovanih rupa
- **Last Detection**: Vreme poslednje detekcije

### 🎯 Context Validation
- **Speed Valid**: Da li je brzina između 15-90 km/h (potrebno za detekciju)
- **Device Stable**: Da li je uređaj stabilan (nije se trese)

### 📍 GPS & Location
- **Speed**: Trenutna brzina u km/h
- **Latitude**: Geografska širina
- **Longitude**: Geografska dužina

### 📊 Accelerometer (g)
- **X-axis**: Akceleracija levo/desno
- **Y-axis**: Akceleracija napred/nazad
- **Z-axis**: Akceleracija gore/dole (KLJUČNO za detekciju!)
- **Magnitude**: Ukupna jačina akceleracije

### 🔄 Gyroscope (rad/s)
- **X-rotation**: Rotacija oko X ose
- **Y-rotation**: Rotacija oko Y ose
- **Z-rotation**: Rotacija oko Z ose

### ⚙️ Detection Algorithm
- **Threshold**: 1.5g spike (kada magnitude premaši ovo, detektuje rupu)
- **Cooldown**: 2 sekunde između detekcija
- **Update Rate**: 50 Hz (20ms refresh)
- **Filter Type**: High-pass filter (α=0.8)

## Kako simulirati detekciju rupe? 🕳️

Da bi algoritam detektovao "rupu", potrebno je:

### ✅ Preduslovi:
1. **Speed**: 15-90 km/h (vozi ili simuliraj GPS sa lažnim podacima)
2. **Device Stable**: Telefon ne sme da se trese previše

### ✅ Trigger Detection:
1. **Jaki vertikalni šok**: Tresni telefon naglo gore-dole
2. **Magnitude > 1.5g**: Mora biti dovoljno jak udarac
3. **Cooldown**: Čekaj 2 sekunde između pokušaja

### Testiranje BEZ vožnje (za debugging):
Možeš privremeno smanjiti threshold u [detectionService.ts:18](src/services/detectionService.ts#L18):
```typescript
private readonly POTHOLE_THRESHOLD = 0.5; // Smanjeno za testiranje (bilo 1.5)
```

Ili isključiti speed check u [contextChecks.ts:11](src/utils/contextChecks.ts#L11):
```typescript
isValidSpeed(speed: number): boolean {
  return true; // Privremeno uvek vraća true
  // return speed >= 15 && speed <= 90;
}
```

## Očekivani podaci (primer)

### Mirovanje telefona:
```
Accelerometer:
X: ~0.0
Y: ~0.0
Z: ~1.0 (gravitacija)
Magnitude: ~1.0
```

### Vožnja:
```
Speed: 30-60 km/h
Gyroscope: Male vrednosti (~0.1-0.5)
Device Stable: ✅ YES
```

### Detekcija rupe:
```
Magnitude: > 1.5g (spike!)
Speed Valid: ✅ YES
Device Stable: ✅ YES
→ 🕳️ POTHOLE DETECTED!
```

## Kontrole

- **▶️ Start Monitoring**: Pokreni senzore i GPS
- **⏸️ Stop Monitoring**: Zaustavi monitoring
- **🔄 Reset Stats**: Resetuj brojač detekcija
- **← Back**: Vrati se na home ekran

## Troubleshooting 🔧

### Senzori ne prikazuju podatke
- Proveri da li si kliknuo "Start Monitoring"
- Senzori NE rade u simulatoru/web verziji
- Mora biti fizički telefon (iOS/Android)

### GPS ne radi
- Odobri location permissions
- Izađi napolje ili blizu prozora (bolji GPS signal)
- Pričekaj 10-30 sekundi da uhvati signal

### Brzina je 0
- GPS treba vreme da izračuna brzinu
- Mora da se kreće (vozi, hoda, bicikla)

### Detekcija ne radi
- Proveri da je **Speed Valid** = ✅ YES
- Proveri da je **Device Stable** = ✅ YES
- Magnitude mora biti > 1.5g
- Čekaj 2 sekunde između pokušaja (cooldown)

## Sledeći koraci

Nakon testiranja sensor debug ekrana, sledeće faze su:

- **Faza 3**: API integracija + Driving Screen
- **Faza 4**: Map Screen + Real-time alerts
- **Faza 5**: Camera + Photo upload

---

**Vukasin, testirај na pravom telefonu i javi kako radi! 📱**
