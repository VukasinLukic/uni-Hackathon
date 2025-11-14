# 📱 React Native Setup za Windows

## ❌ Problem: iOS Simulator ne radi na Windows-u!

iOS simulator radi SAMO na Mac-u. Na Windows-u imaš 3 opcije:

---

## ✅ OPCIJA 1: Expo Go App (NAJBRŽE - PREPORUČENO)

### Šta ti treba:
- **Fizički iPhone** ili **Android telefon**
- **Expo Go app** (besplatan)

### Setup (5 minuta):

1. **Instaliraj Expo Go na telefonu:**
   - iPhone: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. **Pokreni projekat:**
   ```bash
   cd mobile
   npm start
   ```

3. **Skeniraj QR kod:**
   - iPhone: Otvori Camera app → skeniraj QR kod
   - Android: Otvori Expo Go → Tap "Scan QR Code"

4. **Aplikacija se učitava na telefonu!** 🎉

### ✅ Prednosti:
- Radi odmah, bez instalacije
- Test na PRAVOM uređaju (senzori rade!)
- Hot reload - vidiš izmene u realnom vremenu

### ❌ Mane:
- Treba fizički uređaj
- Treba WiFi konekcija

---

## ✅ OPCIJA 2: Android Emulator (Windows)

### Setup (30 minuta):

1. **Instaliraj Android Studio:**
   - Download: https://developer.android.com/studio
   - Instaliraj sa default settings

2. **Setup Android Emulator:**
   ```bash
   # U Android Studio:
   # Tools → Device Manager → Create Device
   # Izaberi: Pixel 5 ili bilo koji
   # System Image: Latest (API 34)
   # Finish
   ```

3. **Pokreni emulator:**
   ```bash
   # U Android Studio, klikni Play button na emulatoru
   ```

4. **Pokreni Expo:**
   ```bash
   cd mobile
   npm start
   # Pritisni 'a' za Android
   ```

### ✅ Prednosti:
- Ne treba fizički uređaj
- Puno kontrole

### ❌ Mane:
- Sporo (treba dobar PC)
- Senzori ne rade realno (simulirani)

---

## ✅ OPCIJA 3: Web Browser (za brzi test UI-ja)

```bash
cd mobile
npm start
# Pritisni 'w' za web
```

Otvara React Native u browseru - dobro za test UI-ja, ALI:
- ❌ Senzori ne rade
- ❌ Native features ne rade

---

## 🚀 MOJA PREPORUKA ZA TEBE:

**Koristi OPCIJU 1 (Expo Go)** jer:
1. Najbrže je (5 min setup)
2. Testirat ćeš na pravom uređaju
3. Senzori (accelerometer) rade SAMO na pravom telefonu!

---

## 📱 KAKO RADITI U REACT NATIVE - QUICK START

### 1. Struktura File-ova

```
mobile/
├── App.tsx          ← Main entry point
├── src/
│   ├── screens/     ← Screen komponente (kao pages)
│   ├── components/  ← Reusable komponente
│   └── services/    ← Business logika
```

### 2. Osnovni Koncepti

#### Components = Building Blocks

```tsx
import { View, Text, Button } from 'react-native';

function MyComponent() {
  return (
    <View>  {/* Kao <div> u web-u */}
      <Text>Hello World</Text>  {/* Mora Text za tekst! */}
      <Button title="Click Me" onPress={() => alert('Hi')} />
    </View>
  );
}
```

**Pravila:**
- `<View>` = `<div>` (container)
- `<Text>` = mora za SVE tekstove
- `<Image>` = za slike
- `<ScrollView>` = scrollable container
- `<TouchableOpacity>` = klikabilni element

#### Styling sa Tailwind (NativeWind)

```tsx
// ✅ SA NativeWind (kao na web-u!)
<View className="bg-blue-500 p-4 rounded-xl">
  <Text className="text-white font-bold">Styled!</Text>
</View>

// ❌ BEZ NativeWind (staromodno)
<View style={{ backgroundColor: 'blue', padding: 16 }}>
  <Text style={{ color: 'white' }}>Styled</Text>
</View>
```

### 3. State Management (kao u React-u)

```tsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <View>
      <Text className="text-2xl">{count}</Text>
      <Button title="+" onPress={() => setCount(count + 1)} />
    </View>
  );
}
```

### 4. Navigation (prelazak između ekrana)

```tsx
// U navigation/AppNavigator.tsx
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
}

// U HomeScreen.tsx
function HomeScreen({ navigation }) {
  return (
    <Button 
      title="Go to Details"
      onPress={() => navigation.navigate('Details')}
    />
  );
}
```

### 5. Senzori (za detekciju rupa)

```tsx
import { Accelerometer } from 'expo-sensors';
import { useEffect, useState } from 'react';

function SensorDemo() {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const subscription = Accelerometer.addListener(accelData => {
      setData(accelData);
    });

    Accelerometer.setUpdateInterval(100); // 10 Hz

    return () => subscription.remove();
  }, []);

  return (
    <View>
      <Text>X: {data.x.toFixed(2)}</Text>
      <Text>Y: {data.y.toFixed(2)}</Text>
      <Text>Z: {data.z.toFixed(2)}</Text>
    </View>
  );
}
```

---

## 🎯 WORKFLOW ZA DEVELOPMENT

### 1. Pokreni Expo
```bash
cd mobile
npm start
```

### 2. Skeniraj QR sa telefonom (Expo Go app)

### 3. Edituj kod u VS Code
- Čim snimiš fajl (`Ctrl+S`)
- App se **automatski reload-uje** na telefonu! 🔥

### 4. Shake telefon za dev menu:
- Reload app
- Debug
- Performance monitor

---

## 🐛 Troubleshooting

### "Expo version mismatch" warning
```bash
cd mobile
npx expo install --fix
```

### Kod se ne update-uje
- Shake telefon → "Reload"
- Ili u terminalu pritisni `r`

### QR kod ne skenira
- Proveri da li su telefon i PC na istom WiFi-u
- Na iPhone-u koristi Camera app
- Na Android-u koristi Expo Go scan

### App crashuje
- Pogledaj terminal - tu su error-i
- Shake telefon → "Debug Remote JS" → otvori Chrome DevTools

---

## 📚 Korisni Resursi

- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [NativeWind Docs](https://www.nativewind.dev/)
- [Expo Sensors](https://docs.expo.dev/versions/latest/sdk/sensors/)

---

## ✅ Checklist pre početka:

- [ ] Instaliraj Expo Go na telefonu
- [ ] Telefon i PC na istom WiFi-u
- [ ] `npm start` u mobile folderu
- [ ] Skeniraj QR kod
- [ ] Vidiš demo app na telefonu
- [ ] Promeni tekst u App.tsx i snimi - app se reload-uje

**Ako sve radi - READY! 🚀**
