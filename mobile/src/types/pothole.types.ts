export interface Pothole {
  _id: string;
  location: {
    coordinates: [number, number]; // [lng, lat]
    address?: string;
  };
  severity: number; // 0-100
  status: 'new' | 'planned' | 'in_progress' | 'resolved' | 'rejected';
  reports: number;
  impactData: {
    avgMagnitude: number;
    maxMagnitude: number;
    count: number;
  };
  photo?: string;
  aiValidated: boolean;
  firstReported: Date;
  lastReported: Date;
}

export interface PotholeEvent {
  timestamp: Date;
  location: {
    lat: number;
    lng: number;
  };
  magnitude: number;
  speed: number;
}
