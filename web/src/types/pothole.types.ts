export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Pothole {
  _id: string;
  location: Location;
  severity: number; // 1-10 scale
  status: 'reported' | 'verified' | 'in-progress' | 'fixed';
  reports: number;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
}

export interface PotholeFilters {
  severity: 'all' | 'low' | 'medium' | 'high';
  status: 'all' | 'reported' | 'verified' | 'in-progress' | 'fixed';
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
