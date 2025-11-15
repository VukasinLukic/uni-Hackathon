# 🔧 KAKO POPRAVITI "Callback URL mismatch" GREŠKU

## Problem:
```
unauthorized_client: Callback URL mismatch.
http://localhost:5173/dashboard is not in the list of allowed callback URLs
```

## ✅ TAČAN NAČIN DA DODAŠ CALLBACK URLs U AUTH0:

### Korak po Korak:

---

### 1️⃣ Otvori Auth0 Dashboard
URL: **https://manage.auth0.com/**

---

### 2️⃣ U LEVOM MENIJU klikni:
```
Applications → Applications
```

---

### 3️⃣ Pronađi aplikaciju sa imenom koje si napravio
- Ili traži po Client ID: `LS5ytK36x5SFxjgGVUWLasm6ezu2XaWM`
- **KLIKNI NA IME APLIKACIJE** (ne samo checkbox, nego na ime da otvoriš aplikaciju)

---

### 4️⃣ Scroll do sekcije **"Application URIs"**
- Ova sekcija je NEGDE U SREDINI stranice (ne na vrhu)
- Ima nekoliko polja:
  - Application Login URI
  - **Allowed Callback URLs** ← OVO TRAŽIŠ!
  - Allowed Logout URLs
  - Allowed Web Origins

---

### 5️⃣ U polju **"Allowed Callback URLs"** unesi:
```
http://localhost:5173/dashboard
```

**VAŽNO:**
- Ako već ima neki URL tamo (npr. `http://localhost:3000`), **NE BRIŠI GA**
- Samo dodaj zarez `,` i onda novi URL
- Primer ako već postoji URL:
  ```
  http://localhost:3000,http://localhost:5173/dashboard
  ```

---

### 6️⃣ U polju **"Allowed Logout URLs"** unesi:
```
http://localhost:5173
```

---

### 7️⃣ U polju **"Allowed Web Origins"** unesi:
```
http://localhost:5173
```

---

### 8️⃣ SCROLL SVE DO KRAJA STRANICE (DO DNA)
- Na dnu stranice vidiš **PLAVO DUGME "Save Changes"**
- **KLIKNI NA "Save Changes"** 💾
- **SAČEKAJ DA SE POJAVI ZELENA PORUKA** "Application updated successfully" ili slično

---

### 9️⃣ Sačekaj 10-30 sekundi
- Auth0 treba malo vremena da propagira promene

---

### 🔟 Probaj ponovo u browseru:
1. Otvori **novi tab** (ili refresh postojeći)
2. Idi na: http://localhost:5173/login
3. Klikni **"Sign Up"**
4. Sada bi trebalo da radi!

---

## ⚠️ AKO I DALJE NE RADI:

### Check 1: Da li si SAČUVAO promene?
- Proveri da li si kliknuo "Save Changes" na dnu
- Možda si zaboravio da scroll-uješ do kraja

### Check 2: Da li je TAČAN URL?
- Proveri da li si uneo **TAČNO**: `http://localhost:5173/dashboard`
- **NE**: `https://localhost:5173/dashboard` (https neće raditi)
- **NE**: `http://localhost:5173` (fali `/dashboard`)

### Check 3: Proveri u browseru koji port koristi app:
- Otvori Developer Tools (F12)
- Pogledaj URL bar - da li piše `localhost:5173`?
- Ako piše `localhost:5174` ili drugi port, dodaj i taj port u Auth0

### Check 4: Hard refresh browsera:
- Windows: `Ctrl + Shift + R`
- Možda browser kešira staru konfiguraciju

### Check 5: Proveri da li je Application Type = "Single Page Application"
- U Settings tabu, scroll do "Application Type"
- Mora biti: **Single Page Application**

---

## 📸 ŠTA TRAŽIŠ U AUTH0 DASHBOARD-u:

Kada otvoriš aplikaciju u Auth0, scroll dok ne vidiš:

```
┌─────────────────────────────────────────────────┐
│  Application URIs                               │
│                                                 │
│  Application Login URI                          │
│  [_______________________________________]      │
│                                                 │
│  Allowed Callback URLs                          │
│  [http://localhost:5173/dashboard______]  ← OVDE!
│                                                 │
│  Allowed Logout URLs                            │
│  [http://localhost:5173_________________]  ← OVDE!
│                                                 │
│  Allowed Web Origins                            │
│  [http://localhost:5173_________________]  ← OVDE!
│                                                 │
└─────────────────────────────────────────────────┘

... (scroll još dole)

┌─────────────────────────────────────────────────┐
│                                                 │
│                           [Save Changes] ← KLIKNI!
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🎯 TAČNE VREDNOSTI:

Kopiraj ove TAČNE vrednosti:

**Allowed Callback URLs:**
```
http://localhost:5173/dashboard
```

**Allowed Logout URLs:**
```
http://localhost:5173
```

**Allowed Web Origins:**
```
http://localhost:5173
```

---

## 🔍 DEBUG: Proveri trenutnu konfiguraciju

Možeš proveriti trenutnu konfiguraciju tako što:
1. Odeš na Application Settings
2. Pogledaš šta piše u **Allowed Callback URLs** polju
3. Ako je prazno ili ima pogrešan URL → to je problem!

---

## 💡 ALTERNATIVA: Dodaj SVE moguće portove

Ako nisi siguran koji port će se koristiti, dodaj sve:

**Allowed Callback URLs:**
```
http://localhost:3000/dashboard,http://localhost:5173/dashboard,http://localhost:5174/dashboard
```

**Allowed Logout URLs:**
```
http://localhost:3000,http://localhost:5173,http://localhost:5174
```

**Allowed Web Origins:**
```
http://localhost:3000,http://localhost:5173,http://localhost:5174
```

---

## 📞 Ako ništa ne radi:

1. **Screenshot-uj** stranicu sa Application URIs sekcijom
2. Proveri da li vidiš URL koji sam ti dao
3. Proveri da li je dugme "Save Changes" zeleno/sivo (da li si sačuvao)

---

Probaj sada i javi kako ide! 🚀
