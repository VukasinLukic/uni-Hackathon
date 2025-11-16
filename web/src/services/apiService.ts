import axios from 'axios';

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('Response Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export interface Pothole {
  _id: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
    address?: string;
  };
  severity: number; // 0-100
  status: 'new' | 'planned' | 'in_progress' | 'resolved' | 'rejected';
  reports: number;
  uniqueUsers: string[];
  impactData: {
    avgMagnitude: number;
    maxMagnitude: number;
    count: number;
  };
  photo?: string;
  aiValidated: boolean;
  aiConfidence?: number;
  notes?: string;
  firstReported: string;
  lastReported: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export class APIService {
  /**
   * Get all potholes
   * GET /api/potholes
   */
  static async getAllPotholes(params?: {
    status?: string;
    minSeverity?: number;
    limit?: number;
  }): Promise<Pothole[]> {
    try {
      const response = await api.get<{ success: boolean; count: number; potholes: Pothole[] }>(
        '/potholes',
        { params }
      );
      console.log(`Fetched ${response.data.count} potholes from backend`);
      return response.data.potholes || [];
    } catch (error: any) {
      console.error('Failed to get potholes:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Get single pothole by ID
   * GET /api/potholes/:id
   */
  static async getPotholeById(id: string): Promise<Pothole | null> {
    try {
      const response = await api.get<{ success: boolean; pothole: Pothole }>(`/potholes/${id}`);
      return response.data.pothole;
    } catch (error: any) {
      console.error('Failed to get pothole:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Update pothole status (officials only)
   * PATCH /api/potholes/:id
   */
  static async updatePotholeStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<Pothole | null> {
    try {
      const response = await api.patch<{ success: boolean; pothole: Pothole }>(`/potholes/${id}`, {
        status,
        notes,
      });
      return response.data.pothole;
    } catch (error: any) {
      console.error('Failed to update pothole:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Get nearby potholes
   * GET /api/potholes/nearby?lat=X&lng=Y&radius=Z
   */
  static async getNearbyPotholes(
    lat: number,
    lng: number,
    radius = 1000
  ): Promise<Pothole[]> {
    try {
      const response = await api.get<{ success: boolean; count: number; potholes: Pothole[]}>('/potholes/nearby', {
          params: { lat, lng, radius },
        }
      );
      return response.data.potholes || [];
    } catch (error: any) {
      console.error('Failed to get nearby potholes:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Health check - test if backend is reachable
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const healthUrl = API_BASE_URL.replace('/api', '/health');
      console.log('Health check URL:', healthUrl);

      const response = await axios.get(healthUrl, {
        timeout: 5000,
      });

      console.log('Backend is reachable:', response.data);
      return true;
    } catch (error: any) {
      console.error('Backend health check failed:', error.message);
      return false;
    }
  }

  /**
   * Generate AI-optimized repair mission
   * POST /api/ai-mission
   */
  static async generateAIMission(missionData: {
    teams: number;
    workHours: number;
  }): Promise<any> {
    try {
      const response = await api.post('/ai-mission', missionData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to generate AI mission:', error.response?.data || error.message);
      throw error;
    }
  }
}

/**
 * Chat with Gemini AI assistant
 * POST /api/gemini-chat
 */
export async function chatWithGemini(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  userLocation?: { lat: number; lng: number }
): Promise<any> {
  try {
    console.log('🤖 Sending to Gemini:', { message, hasLocation: !!userLocation });
    const response = await api.post('/gemini-chat', { message, history, userLocation });
    return response.data;
  } catch (error: any) {
    console.error('Failed to chat with Gemini:', error.response?.data || error.message);
    throw error;
  }
}
