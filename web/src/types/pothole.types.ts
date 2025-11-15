export interface Pothole {
  _id: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat] - GeoJSON format
    address?: string;
  };
  severity: number; // 0-100 scale (backend format)
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

export interface PotholeFilters {
  severity: 'all' | 'low' | 'medium' | 'high';
  status: 'all' | 'new' | 'planned' | 'in_progress' | 'resolved' | 'rejected';
  timeframe: 'all' | 'today' | 'week' | 'month';
}

export interface PotholeStats {
  total: number;
  reported: number;
  verified: number;
  inProgress: number;
  fixed: number;
  avgSeverity: number;
}
