export interface MissionFormData {
  missionType: 'safety-first' | 'max-coverage' | 'critical-only';
  teams: number;
  workHours: number;
  constraints: string[];
}

export interface TeamRoute {
  teamId: number;
  route: string[];
  potholes: Array<{
    id: string;
    lat: number;
    lng: number;
    severity: number;
    distance?: number;
  }>;
  estimatedTime: number;
  totalDistance: number;
  impactScore: number;
  routeGeometry?: {
    type: 'LineString';
    coordinates: number[][];
  };
}

export interface MissionResult {
  missions: TeamRoute[];
  totalPotholes: number;
  totalImpact: number;
}
