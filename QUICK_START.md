# 🚀 Quick Start Guide

## Prerequisites

Install:
- **Node.js** (v18+)
- **npm** or **yarn**
- **Git**
- **MongoDB** (or use MongoDB Atlas)
- **Expo CLI**: `npm install -g expo-cli`
- **iOS Simulator** or **real iPhone** (for mobile testing)

## Step 1: Clone & Setup

```bash
git clone <your-repo-url>
cd uni-Hackathon
```

## Step 2: Backend Setup (Nemanja)

```bash
cd backend
npm install
cp .env.example .env

# Edit .env file with your credentials:
# - MongoDB URI
# - Auth0 credentials
# - Gemini API key
# - Cloudinary credentials

npm run dev
```

Backend will run on http://localhost:5000

## Step 3: Web Dashboard Setup (Teodora)

```bash
cd web
npm install
cp .env.example .env

# Edit .env file:
# - Auth0 credentials
# - Mapbox token
# - Backend API URL (http://localhost:5000/api)

npm run dev
```

Web will run on http://localhost:3000

## Step 4: Mobile App Setup (Vukasin)

```bash
cd mobile
npm install
cp .env.example .env

# Edit .env file:
# - Auth0 credentials
# - Backend API URL

npm start
```

Then:
- Press `i` for iOS simulator
- OR scan QR code with Expo Go app on iPhone

## Step 5: Test the System

1. **Backend**: Visit http://localhost:5000/health (should return {"status":"ok"})
2. **Web**: Visit http://localhost:3000 and login
3. **Mobile**: Login and grant permissions
4. **Create test pothole**: Shake phone or use test data

## Common Issues

### MongoDB Connection Failed
- Check MONGODB_URI in backend/.env
- Whitelist your IP in MongoDB Atlas

### Auth0 Login Failed
- Verify AUTH0_DOMAIN and AUTH0_CLIENT_ID
- Check callback URLs in Auth0 dashboard

### Sensors Not Working
- Sensors only work on REAL iPhone, not simulator!

### CORS Errors
- Check FRONTEND_URL and MOBILE_URL in backend/.env

## Next Steps

1. Read your implementation plan:
   - Vukasin: [mobile/VUKASIN_IMPLEMENTATION_PLAN.md](mobile/VUKASIN_IMPLEMENTATION_PLAN.md)
   - Nemanja: [backend/NEMANJA_IMPLEMENTATION_PLAN.md](backend/NEMANJA_IMPLEMENTATION_PLAN.md)
   - Teodora: [web/TEODORA_IMPLEMENTATION_PLAN.md](web/TEODORA_IMPLEMENTATION_PLAN.md)

2. Check [API_CONTRACT.md](API_CONTRACT.md) for API structure

3. Follow [TEAM_COORDINATION.md](TEAM_COORDINATION.md) for workflow

## Need Help?

- Check implementation plans for detailed guides
- Read [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- Review [HACKATHON_CHECKLIST.md](HACKATHON_CHECKLIST.md)
