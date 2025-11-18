# 📱 Auth0 Mobile App Setup - Kompletne Instrukcije

## ✅ ŠTA SAM URADIO U KODU:

1. ✅ Dodao `EXPO_PUBLIC_AUTH0_DOMAIN` i `EXPO_PUBLIC_AUTH0_CLIENT_ID` u `.env`
2. ✅ Instalirao `react-native-auth0` paket
3. ✅ Dodao `scheme: "roadsense"` u `app.json`
4. ✅ Konfigurisao `react-native-auth0` plugin u `app.json`

---

## 📋 ŠTA MORAŠ DA URADIŠ U AUTH0 DASHBOARD-u:

### VAŽNO: Callback URL Format za React Native

Za React Native/Expo aplikacije, callback URL NE koristi `http://localhost`, već **custom URL scheme**!

**Format**: `{scheme}://{domain}/{platform}/{bundleId}/callback`

---

### Korak 1: Otvori Mobile Application u Auth0

URL: https://manage.auth0.com/dashboard/us/dev-u0mn320118yum8qm/applications/47AZSSNUdbi7yYL8oNz5G38JtajBYo5P/settings

---

### Korak 2: Proveri Application Type

**Application Type** MORA biti: **Native**

Ako piše nešto drugo:
1. Scroll na vrh stranice
2. Klikni **"Edit"** pored Application Type
3. Izaberi **"Native"**
4. Save

---

### Korak 3: Dodaj Callback URLs

U polju **"Allowed Callback URLs"** dodaj:

```
roadsense://dev-u0mn320118yum8qm.us.auth0.com/ios/com.roadsense.mobile/callback,roadsense://dev-u0mn320118yum8qm.us.auth0.com/android/com.roadsense.mobile/callback
```

**Objašnjenje:**
- `roadsense://` - custom scheme iz app.json
- `dev-u0mn320118yum8qm.us.auth0.com` - tvoj Auth0 domain
- `ios/com.roadsense.mobile` - iOS bundle identifier
- `android/com.roadsense.mobile` - Android package name

---

### Korak 4: Dodaj Logout URLs

U polju **"Allowed Logout URLs"** dodaj:

```
roadsense://dev-u0mn320118yum8qm.us.auth0.com/ios/com.roadsense.mobile/callback,roadsense://dev-u0mn320118yum8qm.us.auth0.com/android/com.roadsense.mobile/callback
```

(Isti kao callback URLs za React Native)

---

### Korak 5: Dodaj Web Origins (opciono)

U polju **"Allowed Web Origins"** dodaj:

```
roadsense://*
```

---

### Korak 6: Proveri Allowed Origins (CORS)

U polju **"Allowed Origins (CORS)"** dodaj:

```
http://localhost:8081,http://10.0.10.156:8081
```

(Za Expo dev server)

---

### Korak 7: SAVE CHANGES

Scroll do kraja i klikni **"Save Changes"** 💾

---

### Korak 8: Omogući Database Connection

1. Idi na: https://manage.auth0.com/dashboard/us/dev-u0mn320118yum8qm/connections/database
2. Klikni na **Username-Password-Authentication**
3. U **Applications** tab:
   - Omogući aplikaciju sa Client ID: `47AZSSNUdbi7yYL8oNz5G38JtajBYo5P`
4. U **Settings** tab:
   - Proveri da je **"Disable Sign Ups"** = **OFF**
5. Save

---

## 📱 Kako Auth0 radi u React Native:

### Custom URL Scheme (Deep Linking)

React Native NE MOŽE da koristi `http://localhost` kao callback URL jer mobilne aplikacije ne rade preko web servera.

Umesto toga, koriste **custom URL scheme** (npr. `roadsense://`) koji otvara aplikaciju direktno.

**Flow:**
1. Korisnik klikne "Login" u aplikaciji
2. Aplikacija otvara browser sa Auth0 Universal Login
3. Korisnik se autentifikuje
4. Auth0 redirect-uje na: `roadsense://dev-u0mn320118yum8qm.us.auth0.com/ios/com.roadsense.mobile/callback`
5. OS prepoznaje `roadsense://` scheme i otvara tvoju aplikaciju
6. Aplikacija prima token i uloguje korisnika

---

## 🔧 Razlike između Web i Mobile Auth0:

| Feature | Web (Vite) | Mobile (Expo) |
|---------|-----------|---------------|
| **Callback URL** | `http://localhost:5173/dashboard` | `roadsense://domain/platform/bundle/callback` |
| **Application Type** | Single Page Application | Native |
| **Scheme** | `http://` ili `https://` | Custom scheme (`roadsense://`) |
| **Package** | `@auth0/auth0-react` | `react-native-auth0` |
| **Env Prefix** | `VITE_` | `EXPO_PUBLIC_` |

---

## ⚠️ EXPO Go vs Custom Dev Client

**VAŽNO**: `react-native-auth0` **NE RADI** sa **Expo Go** aplikacijom!

Moraš koristiti **Custom Development Build** ili **EAS Build**.

### Kreiranje Custom Dev Client:

```bash
# 1. Instaliraj expo-dev-client
cd mobile
npm install expo-dev-client

# 2. Dodaj u app.json plugins
# (već dodato - react-native-auth0 plugin)

# 3. Kreiraj development build
npx expo prebuild

# 4. Pokreni development build
npx expo run:android
# ili
npx expo run:ios
```

**Alternativa**: Koristi **EAS Build** (cloud build service)

```bash
# 1. Instaliraj EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Konfiguriši projekat
eas build:configure

# 4. Kreiraj development build
eas build --profile development --platform android
# ili
eas build --profile development --platform ios
```

---

## 📝 ŠTA DALJE?

Nakon što konfiguriš Auth0 Dashboard:

1. **Kreiraj Custom Development Build** (jer Expo Go ne podržava Auth0)
2. **Napravi Auth0 Context Provider** za mobile app
3. **Dodaj Login/Logout dugmad** u Welcome/Login screenove
4. **Testiraj login flow**

---

## 🚀 Quick Setup Summary:

```
✅ Kod:
- react-native-auth0 instaliran
- app.json konfigurisana sa scheme="roadsense"
- .env ima EXPO_PUBLIC_AUTH0_DOMAIN i EXPO_PUBLIC_AUTH0_CLIENT_ID

⏳ Auth0 Dashboard (TVOJ ZADATAK):
- Otvori: https://manage.auth0.com/dashboard/us/dev-u0mn320118yum8qm/applications/47AZSSNUdbi7yYL8oNz5G38JtajBYo5P/settings
- Application Type = Native
- Allowed Callback URLs = roadsense://dev-u0mn320118yum8qm.us.auth0.com/ios/com.roadsense.mobile/callback,roadsense://dev-u0mn320118yum8qm.us.auth0.com/android/com.roadsense.mobile/callback
- Allowed Logout URLs = (isti kao callback)
- Save Changes
- Omogući Database Connection za ovu aplikaciju

⏳ Build (SLEDEĆI KORAK):
- Kreirati Custom Dev Client (npx expo prebuild)
- ILI koristiti EAS Build
```

---

## 🆘 Troubleshooting:

### Problem: "Expo Go is not supported"
**Rešenje**: Moraš kreirati custom development build

### Problem: "Callback URL mismatch"
**Rešenje**: Proveri da li si dodao TAČAN callback URL u Auth0 Dashboard (sa custom scheme `roadsense://`)

### Problem: "Invalid state"
**Rešenje**: Clear app data i restartuj aplikaciju

---

Javi mi kada završiš konfiguraciju Auth0 Dashboard-a, pa ćemo nastaviti sa kreiranjem Auth0 Provider komponente za mobile! 🚀
