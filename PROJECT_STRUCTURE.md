# 🏗️ RoadSense Timișoara - Project Structure

## 📂 Root Directory Structure

```
uni-Hackathon/
├── mobile/              # React Native iOS App (Vukasin)
├── backend/             # Node.js + Express API (Nemanja)
├── web/                 # React Dashboard (Teodora)
├── docs/                # Documentation
├── PROJECT_STRUCTURE.md # This file
├── masterplan.md        # Master plan document
├── technology.stack     # Tech stack specification
└── README.md            # Main project README
```

---

## 📱 MOBILE APP STRUCTURE (Vukasin)

```
mobile/
├── src/
│   ├── screens/
│   │   ├── AuthScreen.tsx          # Login/Register with Auth0
│   │   ├── HomeScreen.tsx          # Main dashboard with Start Drive button
│   │   ├── MapScreen.tsx           # Map view with pothole markers
│   │   ├── DrivingScreen.tsx       # Active driving mode screen
│   │   └── ProfileScreen.tsx       # User profile and stats
│   │
│   ├── components/
│   │   ├── PotholeMarker.tsx       # Custom map marker component
│   │   ├── AlertModal.tsx          # Alert notification component
│   │   ├── TripSummary.tsx         # Post-trip summary component
│   │   └── CameraCapture.tsx       # Photo capture component
│   │
│   ├── services/
│   │   ├── sensorService.ts        # Accelerometer/Gyroscope logic
│   │   ├── locationService.ts      # GPS and location tracking
│   │   ├── detectionService.ts     # Pothole detection algorithm
│   │   ├── apiService.ts           # Backend API calls
│   │   └── authService.ts          # Auth0 integration
│   │
│   ├── utils/
│   │   ├── signalProcessing.ts     # High-pass filter, spike detection
│   │   ├── contextChecks.ts        # Speed, orientation validation
│   │   └── constants.ts            # Thresholds, config values
│   │
│   ├── store/
│   │   ├── useAppStore.ts          # Zustand global state
│   │   └── slices/
│   │       ├── tripSlice.ts        # Trip state
│   │       ├── potholeSlice.ts     # Pothole data
│   │       └── userSlice.ts        # User data
│   │
│   ├── navigation/
│   │   └── AppNavigator.tsx        # React Navigation setup
│   │
│   └── types/
│       ├── pothole.types.ts        # Pothole interfaces
│       ├── sensor.types.ts         # Sensor data types
│       └── api.types.ts            # API request/response types
│
├── assets/
│   ├── icons/                      # App icons
│   └── images/                     # Images and graphics
│
├── app.json                        # Expo configuration
├── package.json
├── tsconfig.json
└── README.md                       # Mobile app documentation
```

---

## 🌐 BACKEND STRUCTURE (Nemanja)

```
backend/
├── src/
│   ├── routes/
│   │   ├── events.routes.ts        # POST /api/events
│   │   ├── potholes.routes.ts      # GET/PATCH /api/potholes
│   │   ├── routes.routes.ts        # POST /api/routes (optimization)
│   │   ├── stats.routes.ts         # GET /api/stats
│   │   ├── upload.routes.ts        # POST /api/upload (images)
│   │   └── auth.routes.ts          # Auth endpoints
│   │
│   ├── controllers/
│   │   ├── eventController.ts      # Event handling logic
│   │   ├── potholeController.ts    # Pothole CRUD operations
│   │   ├── routeController.ts      # Route optimization logic
│   │   └── uploadController.ts     # Image upload handling
│   │
│   ├── services/
│   │   ├── clusteringService.ts    # Spatial clustering algorithm
│   │   ├── severityService.ts      # Severity score calculation
│   │   ├── aiVisionService.ts      # Gemini API integration
│   │   ├── routeOptimizer.ts       # VRP/TSP algorithm
│   │   └── cloudinaryService.ts    # Image storage service
│   │
│   ├── models/
│   │   ├── Event.model.ts          # Raw sensor event schema
│   │   ├── Pothole.model.ts        # Pothole cluster schema
│   │   ├── User.model.ts           # User profile schema
│   │   └── Photo.model.ts          # Photo metadata schema
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts      # Auth0 JWT verification
│   │   ├── error.middleware.ts     # Error handling
│   │   └── validation.middleware.ts # Request validation
│   │
│   ├── utils/
│   │   ├── geoUtils.ts             # Geospatial calculations
│   │   ├── logger.ts               # Logging utility
│   │   └── constants.ts            # Configuration constants
│   │
│   ├── websocket/
│   │   └── socketHandler.ts        # Socket.IO real-time logic
│   │
│   └── config/
│       ├── database.ts             # MongoDB connection
│       ├── auth0.ts                # Auth0 configuration
│       └── env.ts                  # Environment variables
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .env.example                    # Environment variables template
├── package.json
├── tsconfig.json
└── README.md                       # Backend documentation
```

---

## 🖥️ WEB DASHBOARD STRUCTURE (Teodora)

```
web/
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx           # Auth0 login page
│   │   ├── DashboardPage.tsx       # Main dashboard with map
│   │   ├── AnalyticsPage.tsx       # Analytics and stats
│   │   └── SettingsPage.tsx        # Admin settings
│   │
│   ├── components/
│   │   ├── Map/
│   │   │   ├── MapView.tsx         # Mapbox map component
│   │   │   ├── PotholeMarker.tsx   # Pothole markers
│   │   │   └── Heatmap.tsx         # Heatmap overlay
│   │   │
│   │   ├── PotholeList/
│   │   │   ├── PotholeTable.tsx    # Sortable table
│   │   │   └── PotholeRow.tsx      # Individual row
│   │   │
│   │   ├── Filters/
│   │   │   ├── FilterBar.tsx       # Filter controls
│   │   │   └── SearchBox.tsx       # Search functionality
│   │   │
│   │   ├── Details/
│   │   │   ├── PotholeDetail.tsx   # Detail sidebar
│   │   │   └── StatusControl.tsx   # Status update controls
│   │   │
│   │   ├── RouteOptimizer/
│   │   │   ├── RouteForm.tsx       # Route planning form
│   │   │   └── RouteDisplay.tsx    # Route visualization
│   │   │
│   │   ├── Analytics/
│   │   │   ├── StatsCards.tsx      # Summary statistics
│   │   │   └── Charts.tsx          # Trend charts
│   │   │
│   │   ├── Chatbot/
│   │   │   ├── ChatWidget.tsx      # AI chatbot interface
│   │   │   └── ChatMessage.tsx     # Chat message component
│   │   │
│   │   └── Layout/
│   │       ├── Navbar.tsx          # Navigation bar
│   │       ├── Sidebar.tsx         # Sidebar navigation
│   │       └── Layout.tsx          # Main layout wrapper
│   │
│   ├── services/
│   │   ├── apiService.ts           # Backend API calls
│   │   ├── authService.ts          # Auth0 integration
│   │   └── websocketService.ts     # Socket.IO client
│   │
│   ├── hooks/
│   │   ├── usePotholes.ts          # Pothole data hook
│   │   ├── useFilters.ts           # Filter state hook
│   │   └── useAuth.ts              # Auth hook
│   │
│   ├── store/
│   │   ├── useStore.ts             # Zustand store
│   │   └── slices/
│   │       ├── potholeSlice.ts
│   │       ├── filterSlice.ts
│   │       └── authSlice.ts
│   │
│   ├── utils/
│   │   ├── mapUtils.ts             # Map utilities
│   │   ├── dateUtils.ts            # Date formatting
│   │   └── constants.ts            # Constants
│   │
│   └── types/
│       ├── pothole.types.ts
│       ├── filter.types.ts
│       └── api.types.ts
│
├── public/
│   ├── index.html
│   └── assets/
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md                       # Web dashboard documentation
```

---

## 📄 SHARED TYPES (Optional - for consistency)

Create a shared `types` package if needed:

```
shared-types/
├── src/
│   ├── pothole.types.ts
│   ├── event.types.ts
│   ├── user.types.ts
│   └── api.types.ts
├── package.json
└── tsconfig.json
```

---

## 🗂️ DOCUMENTATION STRUCTURE

```
docs/
├── api/
│   └── API_DOCUMENTATION.md        # Backend API docs
├── mobile/
│   └── MOBILE_GUIDE.md             # Mobile app guide
├── web/
│   └── DASHBOARD_GUIDE.md          # Dashboard guide
├── deployment/
│   └── DEPLOYMENT.md               # Deployment instructions
└── architecture/
    └── ARCHITECTURE.md             # System architecture
```

---

## 🔑 KEY FILES TO CREATE

### Root Level
- [ ] `README.md` - Main project README
- [ ] `.gitignore` - Git ignore rules
- [ ] `docker-compose.yml` - (Optional) For local dev

### Each Folder
- [ ] `README.md` - Component-specific documentation
- [ ] `package.json` - Dependencies
- [ ] `tsconfig.json` - TypeScript configuration
- [ ] `.env.example` - Environment variables template

---

## 📦 DEPENDENCIES SUMMARY

### Mobile (package.json)
- expo
- react-native
- expo-sensors
- expo-location
- expo-camera
- react-navigation
- zustand
- axios
- react-native-auth0
- react-native-maps (or mapbox)
- socket.io-client

### Backend (package.json)
- express
- mongoose
- socket.io
- jsonwebtoken
- express-jwt
- cloudinary
- google-generative-ai (@google/generative-ai for Gemini)
- dotenv
- cors

### Web (package.json)
- react
- react-dom
- mapbox-gl
- axios
- socket.io-client
- zustand
- react-auth0-spa
- tailwindcss
- recharts (for analytics)

---

## 🚀 NEXT STEPS

1. ✅ Project structure defined
2. 🔄 Create implementation plans for each team member
3. 🔄 Initialize each folder with base files
4. 🔄 Set up Git branches for each component
5. 🔄 Create shared API contract/types
