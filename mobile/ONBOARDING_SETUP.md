# Onboarding Setup - PavePatrol

## ✅ Što Sam Uradio

Napravio sam **KOMPLETNO NOVI ONBOARDING FLOW** sa 4 ekrana:

### 1. **WelcomeScreen** 🌃
- Animirana noćna pozadina sa zvezdama
- Zgrada sa prozorima
- Logo "PAVE PATROL"
- "start" dugme
- Dizajn kao na Figma slici

### 2. **FeaturesScreen** 📱
- Swipe carousel sa 3 feature karte:
  - 🚗 **Auto Detection** - Automatska detekcija
  - 🗺️ **Fog of War** - Explore city
  - 🏆 **Earn Rewards** - XP i nagrade
- Skip i Next dugmad
- Animirane pagination dots

### 3. **AuthScreen** 🔐
- Login/Register toggle
- Email + Password polja
- Skip opcija (guest mode)
- Mock authentication (čuva u AsyncStorage)
- Zustand store integracija

### 4. **PermissionsScreen** 📍
- Location (Required)
- Motion Sensors (Required)
- Camera (Optional - za Walking Mode)
- Objašnjenja za svaki permission
- Privacy notice
- "Allow All" dugme

---

## 🚀 Kako Pokrenut Onboarding?

### Opcija 1: Reload App (Videćeš Welcome Screen)

**Ako prvi put pokrećeš:**
- Onboarding će se automatski pokazati
- Proći ćeš kroz sve 4 ekrana

### Opcija 2: Reset Onboarding (Za Testiranje)

**U app-u dodaj test dugme (temporary):**

```typescript
// U bilo kom screenu dodaj:
import AsyncStorage from '@react-native-async-storage/async-storage';

<Button
  title="Reset Onboarding"
  onPress={async () => {
    await AsyncStorage.removeItem('@onboarding_completed');
    // Restartuj app
  }}
/>
```

### Opcija 3: Direktno u AsyncStorage (Via Expo)

1. Otvori Expo Dev Menu (shake phone)
2. Idi u "Debug Remote JS"
3. U Console upucaj:
```javascript
await AsyncStorage.removeItem('@onboarding_completed');
```

---

## 📂 Struktura Fajlova

```
mobile/
├── App.tsx (✅ AŽURIRAN - dodati onboarding screenovi)
├── src/
│   ├── screens/
│   │   ├── onboarding/
│   │   │   ├── WelcomeScreen.tsx (✅ NOVO)
│   │   │   ├── FeaturesScreen.tsx (✅ NOVO)
│   │   │   ├── AuthScreen.tsx (✅ NOVO)
│   │   │   └── PermissionsScreen.tsx (✅ NOVO)
│   │   ├── HomeScreen.tsx (postojeći)
│   │   ├── DrivingModeScreen.tsx (postojeći)
│   │   └── ... (ostali postojeći screenovi)
│   └── store/
│       └── useAppStore.ts (koristi se u AuthScreen)
```

---

## 🎨 Dizajn Detalji

### Boje (Dark Theme):
```typescript
background: ['#071E35', '#0A2942', '#071E35'] // Gradient
buildings: '#0A1E2F'
windows: '#FFD700' (gold)
text: '#FFFFFF'
button: '#FFFFFF' (text: '#071E35')
```

### Animacije:
- **Stars**: Twinkling effect (loop)
- **Logo**: Fade in + slide up
- **Button**: Scale bounce
- **Features**: Horizontal scroll with scale/opacity

---

## 🔧 Kako Testirati?

### Test 1: Welcome Screen
```
1. Otvori app
2. Trebalo bi da vidiš:
   - Noćnu pozadinu sa zvezdama
   - Zgrada sa žutim prozorima
   - Logo "PAVE PATROL"
   - "start" dugme
```

### Test 2: Features Carousel
```
1. Klikni "start"
2. Swipe left/right da vidiš 3 feature karte
3. Klikni "Next" ili "Skip"
```

### Test 3: Auth
```
1. Unesi email i password
2. Klikni "Create Account" ili "Sign In"
3. Ili klikni "Skip for now"
```

### Test 4: Permissions
```
1. Klikni "Allow All Permissions"
2. Approve Location i Camera
3. App će te odvesti na Home screen
```

---

## 🐛 Troubleshooting

### Problem: Ne vidim onboarding

**Rešenje:**
```typescript
// Resetuj AsyncStorage
await AsyncStorage.removeItem('@onboarding_completed');
// Restartuj app (r u Expo terminalu)
```

### Problem: Stuck na nekom ekranu

**Rešenje:**
Proveri da li navigation callback radi:
- WelcomeScreen → `onGetStarted` → features
- FeaturesScreen → `onNext` → auth
- AuthScreen → `onAuthComplete` → permissions
- PermissionsScreen → `onComplete` → home

### Problem: Permissions ne rade

**Rešenje:**
Na iOS simulatoru/Android emulatoru permissions mogu failati.
Koristi pravi device za testiranje.

---

## 📱 Flow Diagram

```
App Start
  ↓
Check AsyncStorage: @onboarding_completed?
  ↓
  ├─ Yes → HomeScreen
  │
  └─ No → WelcomeScreen
            ↓ (tap "start")
          FeaturesScreen (3 slides)
            ↓ (tap "Next" ili "Skip")
          AuthScreen (Login/Register)
            ↓ (submit ili "Skip")
          PermissionsScreen
            ↓ (tap "Allow All")
          Save @onboarding_completed = 'true'
            ↓
          HomeScreen (glavna app)
```

---

## ⚙️ Konfiguracija

### Disable Onboarding (Za Dev):
```typescript
// App.tsx - dodaj na vrh
const SKIP_ONBOARDING = true; // DEV MODE

// U checkOnboardingStatus:
if (SKIP_ONBOARDING || completed === 'true') {
  setHasCompletedOnboarding(true);
  setCurrentScreen('home');
}
```

### Reset On Every Launch (Za Testiranje):
```typescript
// App.tsx - u checkOnboardingStatus:
await AsyncStorage.removeItem('@onboarding_completed'); // Force onboarding
```

---

## 🎯 Next Steps

1. **Test onboarding flow** (reload app, trebalo bi da vidis Welcome screen)
2. **Proveri sve animacije** (swipe features, tap buttons)
3. **Test permissions** (na pravom device-u)
4. **Refinuj dizajn** (fontovi, spacing, colors)

---

## 🚨 Important Notes

- **Action Menu** u donjem desnom uglu **NIJE DIRNUT** - radi normalno
- Onboarding se pokazuje **SAMO PRVI PUT**
- Nakon завршеtka onboarding-a, app počinje od **HomeScreen**
- Mock authentication - zameni sa pravim backend API-jem kasnije

---

## 🔄 Kako Reload App?

### Expo Terminal:
```
r  (reload)
```

### Phone:
```
Shake device → Reload
```

---

Sve je **GOTOVO I POVEZANO**! Samo reload app i videćeš onboarding! 🎉

