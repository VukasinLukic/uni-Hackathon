/**
 * Mock Data Service - Fallback when backend is unavailable
 * Provides realistic mock data for offline/development mode
 */

export interface MockPothole {
  _id: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  severity: number;
  status: 'active' | 'verified' | 'fixed';
  confidence: number;
  detectionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockUser {
  id: string;
  email: string;
  name: string;
  level: number;
  xp: number;
  totalDistance: number;
  potholesDetected: number;
  createdAt: string;
}

/**
 * Mock potholes around Novi Sad, Serbia
 * These are realistic locations on actual streets
 */
const MOCK_POTHOLES: MockPothole[] = [
  {
    _id: 'mock-1',
    location: {
      type: 'Point',
      coordinates: [19.8451, 45.2551], // Bulevar oslobođenja
    },
    severity: 7,
    status: 'active',
    confidence: 0.85,
    detectionCount: 3,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    _id: 'mock-2',
    location: {
      type: 'Point',
      coordinates: [19.8335, 45.2540], // Futoška ulica
    },
    severity: 5,
    status: 'verified',
    confidence: 0.92,
    detectionCount: 5,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: 'mock-3',
    location: {
      type: 'Point',
      coordinates: [19.8470, 45.2600], // Narodnih heroja
    },
    severity: 8,
    status: 'active',
    confidence: 0.78,
    detectionCount: 2,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: 'mock-4',
    location: {
      type: 'Point',
      coordinates: [19.8400, 45.2510], // Kralja Aleksandra
    },
    severity: 6,
    status: 'active',
    confidence: 0.88,
    detectionCount: 4,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    _id: 'mock-5',
    location: {
      type: 'Point',
      coordinates: [19.8380, 45.2580], // Jevrejska ulica
    },
    severity: 4,
    status: 'fixed',
    confidence: 0.95,
    detectionCount: 8,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

const MOCK_USER: MockUser = {
  id: 'mock-user-1',
  email: 'demo@potholehunter.com',
  name: 'Demo User',
  level: 3,
  xp: 1250,
  totalDistance: 45.7,
  potholesDetected: 12,
  createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
};

export class MockDataService {
  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Get nearby potholes (mock)
   */
  static getNearbyPotholes(
    lat: number,
    lng: number,
    radius: number = 1000
  ): MockPothole[] {
    console.log(`🎭 MOCK: Getting potholes near ${lat}, ${lng} (radius: ${radius}m)`);

    const nearby = MOCK_POTHOLES.filter((pothole) => {
      const [pLng, pLat] = pothole.location.coordinates;
      const distance = this.calculateDistance(lat, lng, pLat, pLng);
      return distance <= radius;
    });

    console.log(`🎭 MOCK: Found ${nearby.length} potholes`);
    return nearby;
  }

  /**
   * Get all potholes (mock)
   */
  static getAllPotholes(params?: {
    status?: string;
    minSeverity?: number;
    limit?: number;
  }): MockPothole[] {
    console.log('🎭 MOCK: Getting all potholes', params);

    let filtered = [...MOCK_POTHOLES];

    if (params?.status) {
      filtered = filtered.filter((p) => p.status === params.status);
    }

    if (params?.minSeverity) {
      filtered = filtered.filter((p) => p.severity >= params.minSeverity);
    }

    if (params?.limit) {
      filtered = filtered.slice(0, params.limit);
    }

    console.log(`🎭 MOCK: Returning ${filtered.length} potholes`);
    return filtered;
  }

  /**
   * Send pothole event (mock - just log it)
   */
  static async sendPotholeEvent(eventData: any): Promise<{
    success: boolean;
    message: string;
    potholeId?: string;
  }> {
    console.log('🎭 MOCK: Pothole event received (not saved)', eventData);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate a mock pothole ID
    const mockId = `mock-${Date.now()}`;

    console.log(`🎭 MOCK: Event processed with ID ${mockId}`);

    return {
      success: true,
      message: 'Event recorded in offline mode (not synced)',
      potholeId: mockId,
    };
  }

  /**
   * Upload photo (mock)
   */
  static async uploadPhoto(
    potholeId: string,
    base64Image: string
  ): Promise<{ success: boolean; message: string; url?: string }> {
    console.log(`🎭 MOCK: Photo upload for pothole ${potholeId} (${base64Image.length} bytes)`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      message: 'Photo saved locally (not synced)',
      url: `mock://photo-${Date.now()}.jpg`,
    };
  }

  /**
   * Get mock user data
   */
  static getMockUser(): MockUser {
    console.log('🎭 MOCK: Returning mock user');
    return { ...MOCK_USER };
  }

  /**
   * Health check (always returns false for mock)
   */
  static healthCheck(): boolean {
    console.log('🎭 MOCK: Health check - backend not available');
    return false;
  }

  /**
   * Add a new mock pothole at location (for testing)
   */
  static addMockPothole(lat: number, lng: number, severity: number = 6): MockPothole {
    const newPothole: MockPothole = {
      _id: `mock-${Date.now()}`,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      severity,
      status: 'active',
      confidence: 0.8 + Math.random() * 0.15,
      detectionCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_POTHOLES.push(newPothole);
    console.log(`🎭 MOCK: Added new pothole at ${lat}, ${lng}`);
    return newPothole;
  }
}
