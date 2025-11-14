import axios from 'axios';

// Backend API base URL
// ⚠️ CHANGE THIS TO YOUR COMPUTER'S IP ADDRESS!
// Find your IP: Windows → ipconfig | Mac → ifconfig
// Must be on same WiFi network as phone!
const BACKEND_HOST = 'http://10.0.10.157:5001'; // ← Vukasin's IP (PORT 5001!)
const API_BASE_URL = `${BACKEND_HOST}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds - clustering can take time
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export class APIService {
  /**
   * Send pothole detection event to backend
   * Backend endpoint: POST /api/events
   */
  static async sendPotholeEvent(eventData: {
    location: {
      type: 'Point'; // GeoJSON type - REQUIRED!
      coordinates: [number, number]; // [longitude, latitude] - GeoJSON format
    };
    accelerationData: {
      magnitude: number; // Total acceleration magnitude
      x: number;
      y: number;
      z: number;
    };
    gyroscopeData?: {
      alpha: number; // Z-axis rotation
      beta: number; // X-axis rotation
      gamma: number; // Y-axis rotation
    };
    deviceOrientation?: {
      pitch: number;
      roll: number;
      yaw: number;
    };
    speed: number; // km/h
    timestamp: Date;
  }) {
    try {
      const response = await api.post('/events', eventData);
      console.log('🕳️ Event sent successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to send event:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get nearby potholes
   * Backend endpoint: GET /api/potholes/nearby?lat=X&lng=Y&radius=Z
   */
  static async getNearbyPotholes(lat: number, lng: number, radius = 1000) {
    try {
      const response = await api.get('/potholes/nearby', {
        params: { lat, lng, radius },
      });
      return response.data.potholes || [];
    } catch (error: any) {
      console.error('❌ Failed to get nearby potholes:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Get all potholes
   * Backend endpoint: GET /api/potholes
   */
  static async getAllPotholes(params?: {
    status?: string;
    minSeverity?: number;
    limit?: number;
  }) {
    try {
      const response = await api.get('/potholes', { params });
      return response.data.potholes || [];
    } catch (error: any) {
      console.error('❌ Failed to get potholes:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Upload photo (NOT IMPLEMENTED on backend yet)
   * Backend endpoint: POST /api/upload/photo
   */
  static async uploadPhoto(potholeId: string, base64Image: string) {
    try {
      const response = await api.post('/upload/photo', {
        potholeId,
        image: base64Image,
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to upload photo:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Health check - test if backend is reachable
   * NOTE: /health is NOT under /api prefix!
   */
  static async healthCheck() {
    try {
      // Health endpoint is at /health, NOT /api/health
      // Create a new axios instance without baseURL to avoid /api prefix
      const healthUrl = `${BACKEND_HOST}/health`;
      console.log('🔍 Health check URL:', healthUrl);

      const response = await axios.get(healthUrl, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ Backend is reachable:', response.data);
      return true;
    } catch (error: any) {
      console.error('❌ Backend health check failed:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return false;
    }
  }
}
