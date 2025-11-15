# 👤 User Profile System - Kompletna Implementacija

## ✅ ŠTA SAM URADIO:

### Backend:

1. **Ažurirao User Model** ([backend/src/models/User.model.ts](backend/src/models/User.model.ts)):
   - ✅ Dodao `auth0Id` polje (povezuje sa Auth0)
   - ✅ Dodao `avatarNumber` (1-5 za predefinisane avatare)
   - ✅ Dodao `name`, `bio`, `phone` polja
   - ✅ Učinio `password` opcionalnim (za Auth0 korisnike)
   - ✅ Backward compatible sa postojećim users

2. **Kreirao Auth0 Middleware** ([backend/src/middleware/auth0.middleware.ts](backend/src/middleware/auth0.middleware.ts)):
   - ✅ `checkJwt` - verifikuje Auth0 JWT token
   - ✅ `getOrCreateUser` - kreira user ako ne postoji, ili vraća postojećeg
   - ✅ Automatski sync sa Auth0 (email, name)

3. **Kreirao User Routes** ([backend/src/routes/user.routes.ts](backend/src/routes/user.routes.ts)):
   - ✅ `GET /api/users/profile` - vraća profil trenutnog user-a
   - ✅ `PUT /api/users/profile` - update profil
   - ✅ `GET /api/users/stats` - vraća statistike
   - ✅ Svi endpoints zaštićeni Auth0 JWT tokenom

4. **Registrovao Routes** ([backend/src/app.ts](backend/src/app.ts)):
   - ✅ Dodao `app.use('/api/users', userRoutes)`

### Mobile:

1. **Kreirao AvatarSelector Component** ([mobile/src/components/AvatarSelector.tsx](mobile/src/components/AvatarSelector.tsx)):
   - ✅ 5 predefinisanih avatara (emoji)
   - ✅ Vizuelni selektor sa checkmark-om
   - ✅ `getAvatarEmoji()` helper funkcija

2. **Kreirao ProfileScreen** ([mobile/src/screens/ProfileScreen.tsx](mobile/src/screens/ProfileScreen.tsx)):
   - ✅ Avatar display sa level badge-om
   - ✅ XP progress bar
   - ✅ Statistike (distance, cells, discoveries)
   - ✅ Avatar selektor (1-5)
   - ✅ Edit form (name, bio, phone)
   - ✅ Save funkcionalnost

3. **Kreirao Color Utilities** ([mobile/src/utils/colors.ts](mobile/src/utils/colors.ts)):
   - ✅ Tema boja za celu aplikaciju

---

## 📊 Kako Sistem Radi:

### Flow:

1. **User se login-uje preko Auth0** (mobile app)
   - Dobije `access_token` JWT

2. **Mobile app šalje token** u `Authorization: Bearer {token}` header-u

3. **Backend middleware (`checkJwt`)** verifikuje token sa Auth0

4. **Backend middleware (`getOrCreateUser`)**:
   - Izvlači `auth0Id` iz tokena (npr. `auth0|123456`)
   - Traži user-a u MongoDB: `User.findOne({ auth0Id })`
   - Ako NE POSTOJI → kreira novog sa default vrednostima
   - Ako POSTOJI → vraća postojećeg
   - Dodaje `req.user` za sledeći middleware

5. **User menja avatar ili profil**:
   - Bira avatar 1-5
   - Unosi name, bio, phone
   - Klikne "Save Profile"
   - → `PUT /api/users/profile` sa Auth0 tokenom
   - → Backend update-uje MongoDB dokument

---

## 🎨 Avatari:

5 predefinisanih emoji avatara:
- 1: 👨 Person 1
- 2: 👩 Person 2
- 3: 🧑 Person 3
- 4: 👤 Silhouette
- 5: 🚗 Driver

User bira broj (1-5), čuva se u `avatarNumber` polju.

---

## 📱 Profile Screen Features:

### Display:
- **Avatar** - Veliki emoji krug sa level badge-om
- **Level** - "Level {number}"
- **XP Progress Bar** - Vizuelni progress do sledećeg levela
- **Stats Cards**:
  - Distance Driven
  - Cells Explored
  - Potholes Detected

### Edit:
- **Avatar Selector** - Grid sa 5 avatara
- **Name** - Text input
- **Bio** - Multi-line text area
- **Phone** - Phone number input
- **Save Button** - Update profil

---

## 🔐 Auth0 Integration:

### Backend (✅ GOTOVO):
- Instaliran `express-jwt` i `jwks-rsa`
- Middleware verifikuje JWT sa Auth0
- Auto-create user na prvi login

### Mobile (⏳ SLEDEĆI KORAK):
Trebaš da:
1. **Kreiraj Auth0 Context Provider** za mobile app
2. **Integriši `react-native-auth0`** u App.tsx
3. **Dobij access token** iz Auth0
4. **Prosleđuj token** u ProfileScreen

---

## 📋 Šta Dalje Trebaš Da Uradiš:

### 1. Kreiraj Auth0 Context Provider za Mobile

Fajl: `mobile/src/contexts/Auth0Context.tsx`

```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import Auth0 from 'react-native-auth0';
import Constants from 'expo-constants';

const auth0 = new Auth0({
  domain: Constants.expoConfig?.extra?.EXPO_PUBLIC_AUTH0_DOMAIN!,
  clientId: Constants.expoConfig?.extra?.EXPO_PUBLIC_AUTH0_CLIENT_ID!,
});

interface Auth0ContextType {
  user: any | null;
  accessToken: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const Auth0Context = createContext<Auth0ContextType | undefined>(undefined);

export const Auth0Provider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    try {
      setIsLoading(true);
      const credentials = await auth0.webAuth.authorize({
        scope: 'openid profile email',
        audience: 'https://api.roadsense.com',
      });

      setAccessToken(credentials.accessToken);
      setUser(credentials.user);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setAccessToken(null);
  };

  return (
    <Auth0Context.Provider value={{ user, accessToken, login, logout, isLoading }}>
      {children}
    </Auth0Context.Provider>
  );
};

export const useAuth0 = () => {
  const context = useContext(Auth0Context);
  if (!context) {
    throw new Error('useAuth0 must be used within Auth0Provider');
  }
  return context;
};
```

### 2. Wrap App sa Auth0Provider

Fajl: `mobile/App.tsx`

```typescript
import { Auth0Provider } from './src/contexts/Auth0Context';

export default function App() {
  return (
    <Auth0Provider>
      {/* Rest of your app */}
    </Auth0Provider>
  );
}
```

### 3. Update ProfileScreen da koristi Auth0 token

Fajl: `mobile/src/screens/ProfileScreen.tsx`

Zameni ove linije:

```typescript
// OLD:
const [accessToken, setAccessToken] = useState<string | null>(null);

// NEW:
import { useAuth0 } from '../contexts/Auth0Context';

export const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const { accessToken } = useAuth0(); // Get token from Auth0 context
  // ...rest of code
```

### 4. Dodaj ProfileScreen u Navigation

Dodaj ProfileScreen kao tab ili screen u tvoju navigaciju.

---

## 🧪 Testiranje:

### Backend Testing (sa Postman/Thunder Client):

**1. GET Profile**
```
GET http://10.0.10.156:7392/api/users/profile
Authorization: Bearer {auth0_access_token}
```

**2. UPDATE Profile**
```
PUT http://10.0.10.156:7392/api/users/profile
Authorization: Bearer {auth0_access_token}
Content-Type: application/json

{
  "name": "John Doe",
  "bio": "Road explorer",
  "phone": "+381 60 123 4567",
  "avatarNumber": 3
}
```

**3. GET Stats**
```
GET http://10.0.10.156:7392/api/users/stats
Authorization: Bearer {auth0_access_token}
```

### Mobile Testing:

1. Login preko Auth0
2. Navigate na Profile screen
3. Izaberi avatar (1-5)
4. Unesi name, bio, phone
5. Klikni "Save Profile"
6. Refresh app → trebalo bi da vidiš ažurirani profil

---

## 📂 Fajlovi koje sam kreirao/ažurirao:

### Backend:
- ✅ `backend/src/models/User.model.ts` - Ažuriran sa auth0Id i avatarNumber
- ✅ `backend/src/middleware/auth0.middleware.ts` - Auth0 JWT validation
- ✅ `backend/src/routes/user.routes.ts` - Profile endpoints
- ✅ `backend/src/app.ts` - Registrovao /api/users routes

### Mobile:
- ✅ `mobile/src/components/AvatarSelector.tsx` - Avatar picker component
- ✅ `mobile/src/screens/ProfileScreen.tsx` - Profile screen
- ✅ `mobile/src/utils/colors.ts` - Color constants

### Dokumentacija:
- ✅ `PROFILE_SYSTEM_SETUP.md` - Ovaj fajl

---

## 🚀 Quick Start:

### Pokreni Backend:
```bash
cd backend
npm run dev
```

### Pokreni Mobile App:
```bash
cd mobile
npm start
```

### Test Backend Endpoints:
1. Dobij Auth0 access token (login preko web ili mobile)
2. Kopiraj token
3. Test sa Postman/Thunder Client

---

## 🔑 Environment Variables:

### Backend `.env`:
```
AUTH0_DOMAIN=dev-u0mn320118yum8qm.us.auth0.com
AUTH0_AUDIENCE=https://api.roadsense.com
```

### Mobile `.env`:
```
EXPO_PUBLIC_AUTH0_DOMAIN=dev-u0mn320118yum8qm.us.auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=47AZSSNUdbi7yYL8oNz5G38JtajBYo5P
```

---

## ⚠️ Important Notes:

1. **Custom Dev Build Required**: Jer koristiš `react-native-auth0`, NE MOŽEŠ koristiti Expo Go!
   ```bash
   npx expo prebuild
   npx expo run:android  # ili run:ios
   ```

2. **Auth0 Dashboard Setup**: Konfiguriši callback URLs za mobile app (vidi [AUTH0_MOBILE_SETUP.md](AUTH0_MOBILE_SETUP.md))

3. **Token Expiry**: Access tokens expire nakon nekog vremena - implementiraj refresh token logiku

4. **Error Handling**: ProfileScreen ima basic error handling, možda dodati toast notifications

---

Sve je spremno! Kada kreiš Auth0 Context Provider i integriš sa ProfileScreen-om, sistem će raditi end-to-end! 🎉
