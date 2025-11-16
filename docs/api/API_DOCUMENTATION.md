# RoadSense API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except health check) require Auth0 JWT token:
```
Authorization: Bearer <token>
```

## Endpoints

### POST /api/events
Create new pothole detection event

### GET /api/potholes
Get all potholes with optional filters

### GET /api/potholes/nearby
Get potholes near a location

### GET /api/potholes/:id
Get single pothole details

### PATCH /api/potholes/:id
Update pothole status (officials only)

### POST /api/upload/photo
Upload pothole photo

### POST /api/routes
Generate optimized repair routes

### GET /api/stats
Get system statistics

See implementation plan for detailed request/response schemas.
