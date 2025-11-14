# 📡 API Contract - Team Coordination

## Common TypeScript Types

```typescript
interface Pothole {
  _id: string;
  location: {
    coordinates: [number, number]; // [lng, lat]
    address?: string;
  };
  severity: number; // 0-100
  status: 'new' | 'planned' | 'in_progress' | 'resolved' | 'rejected';
  reports: number;
  photo?: string;
  firstReported: Date;
  lastReported: Date;
}

interface PotholeEvent {
  location: {
    coordinates: [number, number];
  };
  accelerationData: {
    magnitude: number;
    x: number;
    y: number;
    z: number;
  };
  speed: number;
  timestamp: Date;
}
```

## API Endpoints

### POST /api/events
**Request:**
```json
{
  "location": { "coordinates": [21.2257, 45.7489] },
  "accelerationData": { "magnitude": 2.5, "x": 0.1, "y": 0.2, "z": 2.4 },
  "speed": 45,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "...",
  "clusterId": "...",
  "severity": 75
}
```

### GET /api/potholes
**Response:**
```json
{
  "success": true,
  "count": 10,
  "potholes": [...]
}
```

### GET /api/potholes/nearby?lat=45.7489&lng=21.2257&radius=1000
**Response:**
```json
{
  "success": true,
  "count": 5,
  "potholes": [...]
}
```

## WebSocket Events

### Server → Client

**new_pothole**
```json
{
  "potholeId": "...",
  "location": { "coordinates": [...] },
  "severity": 85
}
```

**pothole_updated**
```json
{
  "potholeId": "...",
  "status": "resolved"
}
```

## Environment Variables

### Backend
- `MONGODB_URI`
- `AUTH0_DOMAIN`
- `AUTH0_AUDIENCE`
- `GEMINI_API_KEY`
- `CLOUDINARY_*`

### Mobile
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_AUTH0_DOMAIN`
- `EXPO_PUBLIC_AUTH0_CLIENT_ID`

### Web
- `VITE_API_URL`
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_MAPBOX_TOKEN`
