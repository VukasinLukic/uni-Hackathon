# Auth0 Setup Instrukcije za Pave Patrol

## 🔧 Šta sam uradio u kodu:

1. ✅ Zamenio MockAuthProvider sa Auth0ProviderWithNavigate
2. ✅ Konfigurisao redirect URI da vodi na `/dashboard`
3. ✅ Ažurirao LoginPage da koristi `useAuth0` hook umesto authService
4. ✅ Dodao `screen_hint: 'signup'` za Sign Up dugme
5. ✅ Sve komponente (Navbar, DashboardPage, ProtectedRoute, App) sada koriste Auth0

## 📋 ŠTA TREBAŠ DA URADIŠ U AUTH0 DASHBOARD-u:

### Korak 1: Idi na Auth0 Dashboard
URL: https://manage.auth0.com/

### Korak 2: Konfiguriši Application Settings
1. U levom meniju klikni: **Applications → Applications**
2. Pronađi aplikaciju sa Client ID: `LS5ytK36x5SFxjgGVUWLasm6ezu2XaWM`
3. Klikni na nju

### Korak 3: Dodaj Callback URLs
Scroll do **Application URIs** sekcije i unesi:

**Allowed Callback URLs:**
```
http://localhost:5174/dashboard,http://localhost:5173/dashboard,http://10.0.10.156:5174/dashboard,http://10.0.10.156:5173/dashboard
```

**Allowed Logout URLs:**
```
http://localhost:5174,http://localhost:5173,http://10.0.10.156:5174,http://10.0.10.156:5173
```

**Allowed Web Origins:**
```
http://localhost:5174,http://localhost:5173,http://10.0.10.156:5174,http://10.0.10.156:5173
```

### Korak 4: Application Type
Proveri da je **Application Type** = `Single Page Application`

### Korak 5: SAČUVAJ
Scroll na dno i klikni **Save Changes** 💾

---

### Korak 6: Omogući Database Connection (za Signup)
1. U levom meniju: **Authentication → Database**
2. Klikni na **Username-Password-Authentication** (ili kreiraj novu ako ne postoji)
3. U **Applications** tabu:
   - ✅ Omogući tvoju aplikaciju (check mark)
4. U **Settings** tabu:
   - Proveri da je **"Disable Sign Ups"** = **OFF** (da bi signup radio)
5. **Save** promene

---

### Korak 7: Universal Login (opciono, ali preporučeno)
1. U levom meniju: **Branding → Universal Login**
2. Proveri da je **Experience** = `New` (New Universal Login)
3. Možeš customizovati boje, logo, itd.

---

## 🧪 Kako testirati:

1. Otvori: http://localhost:5174/login
2. Klikni **"Sign Up"** → treba da te odvede na Auth0 signup stranicu
3. Registruj se sa email i password
4. Auth0 će te automatski vratiti na `/dashboard`
5. Klikni **Logout** u gornjem desnom uglu
6. Klikni **"Log In with Auth0"** → treba da te vrati na dashboard

---

## 🔍 Kako radi Auth0 Universal Login:

### 1. **Centralizovana autentifikacija**
   - Ne praviš login formu u svojoj aplikaciji
   - Auth0 hostuje sigurnu login stranicu
   - Kada korisnik treba da se uloguje, REDIRECT-uješ ga na Auth0

### 2. **Flow:**
   ```
   Tvoja app → loginWithRedirect()
   → Auth0 Universal Login stranica
   → Korisnik unese credentials
   → Auth0 validira
   → Redirect nazad na tvoju app (/dashboard)
   → Tvoja app dobija access_token i user info
   ```

### 3. **screen_hint: 'signup'**
   - Kada pozivaš `loginWithRedirect()` sa `screen_hint: 'signup'`
   - Auth0 prikazuje Sign Up formu umesto Login forme
   - Korisnik unese email/password → kreira se novi nalog
   - Automatski se uloguje i vrača na tvoju app

### 4. **Zašto Universal Login?**
   ✅ Sigurnije (Auth0 održava security)
   ✅ Automatski dobijate nove features (MFA, social login, itd.)
   ✅ Compliance (GDPR, SOC2, itd.)
   ✅ Customizable (možeš brandirati stranicu)
   ✅ Multi-factor authentication (SMS, email, authenticator apps)

---

## 📁 Fajlovi koje sam promenio:

1. [web/src/main.tsx](web/src/main.tsx) - Zamenio MockAuthProvider sa Auth0Provider
2. [web/src/components/auth/Auth0ProviderWithNavigate.tsx](web/src/components/auth/Auth0ProviderWithNavigate.tsx) - Redirect URI pokazuje na /dashboard
3. [web/src/pages/LoginPage.tsx](web/src/pages/LoginPage.tsx) - Koristi useAuth0 hook direktno
4. [web/src/App.tsx](web/src/App.tsx) - Koristi useAuth0 umesto useMockAuth
5. [web/src/components/auth/ProtectedRoute.tsx](web/src/components/auth/ProtectedRoute.tsx) - Koristi useAuth0
6. [web/src/components/Layout/Navbar.tsx](web/src/components/Layout/Navbar.tsx) - Koristi useAuth0, logout sa returnTo
7. [web/src/pages/DashboardPage.tsx](web/src/pages/DashboardPage.tsx) - Koristi useAuth0

---

## 🛠 Trenutna konfiguracija (.env):

```
VITE_AUTH0_DOMAIN=dev-blo6tybynoxj2od4.us.auth0.com
VITE_AUTH0_CLIENT_ID=LS5ytK36x5SFxjgGVUWLasm6ezu2XaWM
VITE_AUTH0_AUDIENCE=https://api.roadsense.com
```

---

## ⚠️ Ako i dalje ne radi:

1. **Proveri konzolu** (F12 u browseru)
   - Traži Auth0 error poruke
2. **Proveri Network tab**
   - Da li ide request ka Auth0?
   - Koji je status code?
3. **Clear browser cache** i cookies
4. **Proveri da si sačuvao promene u Auth0 Dashboard-u**
5. **Restartuj dev server** (Ctrl+C i ponovo `npm run dev`)

---

## 📞 Auth0 Docs:
- Universal Login: https://auth0.com/docs/authenticate/login/auth0-universal-login
- React SDK: https://auth0.com/docs/libraries/auth0-react
- Troubleshooting: https://auth0.com/docs/troubleshoot

---

Srećno! 🚀
