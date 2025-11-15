import axios from 'axios';
import { MockDataService } from './mockDataService';
import { BackendDiscovery } from './backendDiscovery';

// Backend API base URL - will be auto-discovered!
let BACKEND_HOST = 'http://10.0.10.156:7392'; // Default fallback - Vukasin's current IP
let API_BASE_URL = `${BACKEND_HOST}/api`;

// Backend availability state
let isBackendAvailable = false;
let lastHealthCheckTime = 0;
const HEALTH_CHECK_INTERVAL = 30000; // Check every 30 seconds
let hasTriedDiscovery = false;

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
   * Initialize backend connection (with auto-discovery)
   */
  static async initialize(): Promise<void> {
    console.log('🚀 Initializing API Service...');

    // Try to get saved backend URL
    const savedUrl = await BackendDiscovery.getSavedBackendUrl();
    if (savedUrl) {
      // Check if saved URL is using old port (5001) - clear it!
      if (savedUrl.includes(':5001')) {
        console.log('🗑️ Clearing old cached URL with port 5001');
        await BackendDiscovery.clearSavedUrl();
      } else {
        console.log(`💾 Using saved backend URL: ${savedUrl}`);
        this.setBackendHost(savedUrl);
      }
    }

    // Quick check if it works
    await this.checkBackendAvailability();
  }

  /**
   * Set backend host URL
   */
  static setBackendHost(url: string): void {
    BACKEND_HOST = url;
    API_BASE_URL = `${url}/api`;
    api.defaults.baseURL = API_BASE_URL;
    console.log(`🔧 Backend host set to: ${url}`);
  }

  /**
   * Check if backend is available (cached with interval)
   * Auto-discovers backend if not tried yet
   */
  private static async checkBackendAvailability(): Promise<boolean> {
    const now = Date.now();

    // Use cached result if check was recent
    if (now - lastHealthCheckTime < HEALTH_CHECK_INTERVAL) {
      return isBackendAvailable;
    }

    // Perform new health check
    try {
      const healthUrl = `${BACKEND_HOST}/health`;
      await axios.get(healthUrl, {
        timeout: 3000, // Quick timeout for health check
        headers: { 'Content-Type': 'application/json' },
      });

      isBackendAvailable = true;
      lastHealthCheckTime = now;
      hasTriedDiscovery = false; // Reset discovery flag on success
      console.log('✅ Backend is available');
      return true;
    } catch (error) {
      // Backend failed - try auto-discovery if not done yet
      if (!hasTriedDiscovery) {
        console.log('🔍 Current backend failed, trying auto-discovery...');
        hasTriedDiscovery = true;

        const discoveredUrl = await BackendDiscovery.quickDiscover();
        if (discoveredUrl) {
          console.log(`✅ Auto-discovered backend: ${discoveredUrl}`);
          this.setBackendHost(discoveredUrl);
          isBackendAvailable = true;
          lastHealthCheckTime = now;
          return true;
        }
      }

      isBackendAvailable = false;
      lastHealthCheckTime = now;
      console.log('⚠️ Backend unavailable - using fallback mode');
      return false;
    }
  }

  /**
   * Get current backend status (without making a request)
   */
  static isOnline(): boolean {
    return isBackendAvailable;
  }

  /**
   * Send pothole detection event to backend
   * Backend endpoint: POST /api/events
   * Falls back to mock service if backend unavailable
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
    // Check backend availability
    const backendOnline = await this.checkBackendAvailability();

    if (!backendOnline) {
      console.log('🎭 Using mock service for pothole event');
      return await MockDataService.sendPotholeEvent(eventData);
    }

    try {
      const response = await api.post('/events', eventData);
      console.log('🕳️ Event sent successfully:', response.data);
      isBackendAvailable = true; // Update status on success
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to send event:', error.response?.data || error.message);

      // If backend fails, mark as unavailable and use fallback
      isBackendAvailable = false;
      console.log('🎭 Falling back to mock service');
      return await MockDataService.sendPotholeEvent(eventData);
    }
  }

  /**
   * Get nearby potholes
   * Backend endpoint: GET /api/potholes/nearby?lat=X&lng=Y&radius=Z
   * Falls back to mock service if backend unavailable
   */
  static async getNearbyPotholes(lat: number, lng: number, radius = 1000) {
    const backendOnline = await this.checkBackendAvailability();

    if (!backendOnline) {
      console.log('🎭 Using mock service for nearby potholes');
      return MockDataService.getNearbyPotholes(lat, lng, radius);
    }

    try {
      const response = await api.get('/potholes/nearby', {
        params: { lat, lng, radius },
      });
      isBackendAvailable = true;
      return response.data.potholes || [];
    } catch (error: any) {
      console.error('❌ Failed to get nearby potholes:', error.response?.data || error.message);
      isBackendAvailable = false;
      console.log('🎭 Falling back to mock service');
      return MockDataService.getNearbyPotholes(lat, lng, radius);
    }
  }

  /**
   * Get all potholes
   * Backend endpoint: GET /api/potholes
   * Falls back to mock service if backend unavailable
   */
  static async getAllPotholes(params?: {
    status?: string;
    minSeverity?: number;
    limit?: number;
  }) {
    const backendOnline = await this.checkBackendAvailability();

    if (!backendOnline) {
      console.log('🎭 Using mock service for all potholes');
      return MockDataService.getAllPotholes(params);
    }

    try {
      const response = await api.get('/potholes', { params });
      isBackendAvailable = true;
      return response.data.potholes || [];
    } catch (error: any) {
      console.error('❌ Failed to get potholes:', error.response?.data || error.message);
      isBackendAvailable = false;
      console.log('🎭 Falling back to mock service');
      return MockDataService.getAllPotholes(params);
    }
  }

  /**
   * Upload photo
   * Backend endpoint: POST /api/upload/photo
   * Falls back to mock service if backend unavailable
   */
  static async uploadPhoto(potholeId: string, base64Image: string) {
    const backendOnline = await this.checkBackendAvailability();

    if (!backendOnline) {
      console.log('🎭 Using mock service for photo upload');
      return await MockDataService.uploadPhoto(potholeId, base64Image);
    }

    try {
      const response = await api.post('/upload/photo', {
        potholeId,
        image: base64Image,
      });
      isBackendAvailable = true;
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to upload photo:', error.response?.data || error.message);
      isBackendAvailable = false;
      console.log('🎭 Falling back to mock service');
      return await MockDataService.uploadPhoto(potholeId, base64Image);
    }
  }

  /**
   * Health check - test if backend is reachable
   * NOTE: /health is NOT under /api prefix!
   * Also updates the cached backend availability status
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
      isBackendAvailable = true;
      lastHealthCheckTime = Date.now();
      return true;
    } catch (error: any) {
      console.error('❌ Backend health check failed:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      isBackendAvailable = false;
      lastHealthCheckTime = Date.now();
      return false;
    }
  }

  /**
   * Force a fresh health check (ignores cache)
   */
  static async forceHealthCheck(): Promise<boolean> {
    lastHealthCheckTime = 0; // Reset cache
    hasTriedDiscovery = false; // Allow discovery again
    return await this.checkBackendAvailability();
  }

  /**
   * Get backend host URL
   */
  static getBackendHost(): string {
    return BACKEND_HOST;
  }

  /**
   * Run full backend discovery
   */
  static async discoverBackend(
    onProgress?: (url: string, index: number, total: number) => void
  ): Promise<string | null> {
    const url = await BackendDiscovery.discoverBackend(onProgress);
    if (url) {
      this.setBackendHost(url);
      await this.forceHealthCheck();
    }
    return url;
  }

  /**
   * Test a custom backend URL
   */
  static async testCustomUrl(url: string): Promise<boolean> {
    const works = await BackendDiscovery.testCustomUrl(url);
    if (works) {
      this.setBackendHost(url);
      await this.forceHealthCheck();
    }
    return works;
  }

  /**
   * Reset backend to default and clear saved URL
   */
  static async resetBackend(): Promise<void> {
    await BackendDiscovery.clearSavedUrl();
    hasTriedDiscovery = false;
    isBackendAvailable = false;
    lastHealthCheckTime = 0;
    console.log('🔄 Backend reset');
  }
}
