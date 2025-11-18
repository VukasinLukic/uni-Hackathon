# 🛣️ RoadSense Timișoara

> Transforming city exploration into an immersive gamified experience with real-time pothole detection and urban discovery

RoadSense Timișoara is a full-stack mobile application that combines gamification, fog-of-war mapping, and AI-powered pothole detection to encourage urban exploration while contributing to city infrastructure monitoring.

## 📱 What is RoadSense?

RoadSense is a gamified city exploration platform where users:
- **Discover their city** through a fog-of-war map that reveals areas as they explore
- **Earn XP and level up** by traveling, discovering new areas, and detecting potholes
- **Compete on leaderboards** with daily, weekly, and monthly rankings
- **Unlock achievements** for exploration milestones and streaks
- **Contribute to city infrastructure** by automatically detecting and reporting potholes
- **Redeem rewards** from local partners using earned XP

## ✨ Key Features

### 🗺️ Fog of War Exploration
- City divided into 100m × 100m grid cells that darken/brighten based on exploration
- Smooth reveal animations as users travel through new areas
- Track exploration percentage and cells discovered
- Offline cell caching for optimal performance

### 🎮 Gamification System
- **XP & Leveling**: Exponential progression system (100 × 1.5^(level-1) XP per level)
- **Achievement System**: 20+ achievements across multiple categories
  - Exploration (1, 10, 100, 500 cells)
  - Distance milestones (1km, 50km, 500km, 1000km)
  - Daily streaks (3, 7, 30, 100 days)
  - Discovery moments and special achievements
- **Leaderboards**:
  - Multiple time periods (daily, weekly, monthly, all-time)
  - Categories: XP, exploration, distance, detection
  - Real-time rank updates

### 🚗 Smart Pothole Detection
- **Automatic Detection**: Uses accelerometer and gyroscope sensors at 50 Hz sampling
- **Intelligent Clustering**: Groups nearby reports within 3m radius to prevent duplicates
- **Context-Aware**: Validates speed, device stability, and spike patterns
- **Test Mode**: Lower detection thresholds for testing and development

### 📸 Discovery Moments
- **Walking Mode**: Capture discovery photos for bonus XP
- **AI Verification**: Gemini Vision API validates authentic discoveries
- **Photo Gallery**: View your discovery history with timestamps
- **Location Tracking**: GPS-tagged discoveries on the map

### 🎁 Rewards Shop
- Redeem XP for partner discounts and vouchers
- QR code-based redemption system
- Active rewards tracking
- Merchant verification system

### 📊 Web Dashboard
- **Interactive Maps**: Mapbox-powered visualization of all discoveries
- **Heatmap Analytics**: See most explored neighborhoods
- **User Analytics**: Top explorers, engagement metrics, retention stats
- **AI Chatbot**: Natural language queries about exploration data (powered by Gemini)
- **Admin Controls**: Manage users, rewards, and system settings

### ⚡ Real-Time Updates
- Socket.IO integration for live map synchronization
- Instant notifications for nearby activities
- Level-up broadcasts
- Achievement unlock alerts

## 🏗️ Project Structure

```
uni-Hackathon/
├── mobile/          # React Native + Expo mobile app
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── screens/         # App screens
│   │   ├── services/        # API services, sensors, location
│   │   ├── store/           # Zustand state management
│   │   ├── types/           # TypeScript definitions
│   │   └── utils/           # Helper functions
│   └── package.json
│
├── backend/         # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── services/        # Business logic
│   │   ├── config/          # Configuration files
│   │   └── utils/           # Helper functions
│   └── package.json
│
└── web/             # React + Vite dashboard
    ├── src/
    │   ├── components/      # React components
    │   ├── pages/           # Dashboard pages
    │   ├── services/        # API clients
    │   ├── hooks/           # Custom React hooks
    │   └── utils/           # Utility functions
    └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- Auth0 account
- Google Cloud account (Gemini API)
- Cloudinary account
- Mapbox account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd uni-Hackathon
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

**Required Environment Variables:**
```env
PORT=7392
MONGO_URI=your_mongodb_connection_string
AUTH0_DOMAIN=your_auth0_domain
AUTH0_AUDIENCE=your_auth0_audience
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### 3. Mobile App Setup
```bash
cd mobile
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

**Required Environment Variables:**
```env
EXPO_PUBLIC_API_URL=http://localhost:7392
EXPO_PUBLIC_WS_URL=ws://localhost:7392
EXPO_PUBLIC_AUTH0_DOMAIN=your_auth0_domain
EXPO_PUBLIC_AUTH0_CLIENT_ID=your_auth0_client_id
```

### 4. Web Dashboard Setup
```bash
cd web
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

**Required Environment Variables:**
```env
VITE_API_URL=http://localhost:7392
VITE_WS_URL=ws://localhost:7392
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_AUTH0_DOMAIN=your_auth0_domain
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=your_auth0_audience
```

## 🎯 Tech Stack

### Mobile App
- **Framework**: React Native + Expo SDK 54
- **Language**: TypeScript
- **State Management**: Zustand
- **Authentication**: Auth0 + Expo Auth Session
- **Maps**: React Native Maps (Mapbox GL)
- **Sensors**: Expo Sensors (Accelerometer, Gyroscope)
- **Location**: Expo Location
- **Camera**: Expo Camera
- **Storage**: AsyncStorage
- **Real-time**: Socket.IO Client
- **UI**: Expo Linear Gradient, Safe Area Context

### Backend
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **Database**: MongoDB Atlas with geospatial indexes
- **Authentication**: JWT + Auth0 + JWKS-RSA
- **AI/Vision**: Google Generative AI (Gemini)
- **Image Storage**: Cloudinary
- **Real-time**: Socket.IO
- **Scheduling**: Node-cron
- **Security**: bcryptjs, CORS

### Web Dashboard
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Auth0 React SDK
- **Maps**: Mapbox GL (react-map-gl)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Routing**: React Router DOM
- **Real-time**: Socket.IO Client

## 🔑 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register with email/password
- `POST /login` - Login with credentials
- `POST /refresh` - Refresh JWT token
- `GET /me` - Get current user profile
- `POST /auth0/callback` - Auth0 callback handler
- `POST /auth0/verify` - Verify Auth0 token

### Potholes (`/api/potholes`)
- `GET /` - Get all potholes
- `GET /nearby` - Get nearby potholes (geospatial query)
- `GET /:id` - Get pothole details
- `PATCH /:id` - Update pothole status

### Drive Sessions (`/api/drives`)
- `POST /start` - Start new drive session
- `POST /:sessionId/update` - Update drive location
- `POST /:sessionId/end` - End drive session
- `GET /active` - Get active drive
- `GET /history` - Get drive history
- `GET /stats` - Get drive statistics

### XP System (`/api/xp`)
- `POST /award` - Award XP for actions
- `GET /me` - Get user's XP and level

### Achievements (`/api/achievements`)
- `GET /` - Get all achievements
- `GET /me` - Get unlocked achievements
- `GET /progress` - Get achievement progress
- `POST /check` - Check and unlock achievements

### Leaderboards (`/api/leaderboards`)
- `GET /:period/:category` - Get leaderboard rankings
- `GET /all` - Get all leaderboards
- `GET /ranks/me` - Get user's ranks
- `GET /top/:category` - Get top N users
- `GET /nearby/:category` - Get nearby ranks
- `POST /update` - Trigger leaderboard update (admin)

### Exploration (`/api/exploration`)
- `GET /cells` - Get explored cells
- `GET /stats` - Get exploration statistics
- `GET /geojson` - Get cells as GeoJSON
- `GET /heatmap` - Get heatmap data
- `POST /explore` - Record cell exploration

### Rewards (`/api/rewards`)
- `GET /` - Get available rewards
- `POST /:rewardId/redeem` - Redeem reward
- `POST /verify-qr` - Verify QR code (merchants)
- `GET /my-redemptions` - Get redemption history
- `GET /active` - Get active redemptions

### AI Chat (`/api/gemini-chat`)
- `POST /` - Chat with Gemini AI assistant

## 📊 Data Models

### User Model
```typescript
{
  email: string
  name: string
  level: number
  xp: number
  totalDistance: number
  potholesDetected: number
  cellsExplored: number
  discoveryMoments: number
  achievements: ObjectId[]
  streakDays: number
  lastActiveDate: Date
}
```

### Pothole Model
```typescript
{
  location: { type: 'Point', coordinates: [lng, lat] }
  severity: number
  status: 'pending' | 'verified' | 'fixed'
  clusterData: {
    count: number
    contributors: ObjectId[]
  }
  photos: string[]
  detectedBy: ObjectId
  detectedAt: Date
}
```

### ExplorationCell Model
```typescript
{
  cellId: string  // Format: "lat_lng"
  location: { type: 'Point', coordinates: [lng, lat] }
  explorers: ObjectId[]
  firstDiscoveredBy: ObjectId
  firstDiscoveredAt: Date
  totalVisits: number
}
```

## 🎮 XP & Progression System

### XP Formula
- **Level Up**: 100 × 1.5^(level-1) XP required per level

### XP Sources
- **Travel**: 10 XP per 1km traveled
- **New Cell**: 50 XP per newly discovered cell
- **Discovery Moment**: 100 XP per verified photo
- **Walking Mode**: 75 XP per discovery photo
- **Daily Challenge**: 200 XP per completion
- **Streak Bonus**: 500 XP per 7-day streak

## 🏆 Achievement Categories

- **Explorer**: Discover 1, 10, 100, 500 cells
- **Traveler**: Travel 1km, 50km, 500km, 1000km
- **Streak Master**: Maintain 3, 7, 30, 100 day streaks
- **Discoverer**: Submit verified discovery moments
- **Special**: City Navigator, Neighborhood Master, First Blood

## 🔧 Pothole Detection Algorithm

```
1. Sample accelerometer/gyroscope at 50 Hz
2. Apply high-pass filter to vertical acceleration
3. Detect spike patterns above threshold
4. Validate context:
   - Speed > 5 km/h
   - Device stability check
   - Not in cooldown period (5 seconds)
5. Cluster nearby detections (3m radius)
6. Calculate severity score
7. Award XP to user
```

## 🔐 Authentication Flow

1. **OAuth 2.0** - Auth0 integration for Google, Apple, Facebook
2. **Email/Password** - Custom registration with JWT tokens
3. **Token Storage** - AsyncStorage (mobile) / LocalStorage (web)
4. **Protected Routes** - JWT verification middleware
5. **Refresh Tokens** - Automatic token refresh on expiry

## 🌐 Real-Time Architecture

```
Mobile App ←→ Socket.IO ←→ Backend Server
                  ↓
           MongoDB Atlas

Events:
- pothole:detected
- level:up
- achievement:unlocked
- exploration:new-area
- leaderboard:updated
```

## 👥 Team

- **Vukasin** - Mobile App Development
- **Nemanja** - Backend Development
- **Teodora** - Web Dashboard Development

## 📚 Additional Documentation

- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Detailed project structure
- [masterplan.md](masterplan.md) - Master plan and user flows
- [technology.stack](technology.stack) - Technology stack details

## 🐛 Known Issues

- TypeScript errors in some mobile components (non-blocking)
- React 19 compatibility warnings with some Expo packages
- Security vulnerabilities in dependencies (use `npm audit fix`)

## 🚧 Future Enhancements

- [ ] Route optimization suggestions
- [ ] Social features (friend system, team challenges)
- [ ] Custom avatar system
- [ ] Push notifications for challenges
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Public API for third-party integrations

## 📝 License

Hackathon Project - uni-Hackathon

---

Built with ❤️ for smarter cities and better roads
