import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  level: number;
  xp: number;
  totalDistance: number;
  discoveryMoments: number; // Changed from potholesDetected
  cellsExplored: number;
}

interface DriveState {
  isActive: boolean;
  startTime: number | null;
  detectedActivities: number; // Changed from detectedPotholes
  distance: number;
  newCellsExplored: number;
}

interface MapState {
  exploredCells: Set<string>;
  nearbyActivityAreas: any[]; // Changed from nearbyPotholes
  discoveryMarkers: any[]; // New: points of interest
}

interface ConnectivityState {
  isBackendAvailable: boolean;
  isOfflineMode: boolean;
  lastSync: number | null;
  pendingEvents: any[];
}

interface AppStore {
  // User state
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;

  // Drive state
  drive: DriveState;
  startDrive: () => void;
  stopDrive: () => void;
  incrementDetectedActivities: () => void; // Renamed from incrementDetectedPotholes
  incrementNewCellsExplored: () => void; // New
  updateDistance: (distance: number) => void;

  // Map state
  map: MapState;
  addExploredCell: (cellId: string) => void;
  setNearbyActivityAreas: (areas: any[]) => void; // Renamed from setNearbyPotholes
  addDiscoveryMarker: (marker: any) => void; // New

  // Connectivity state
  connectivity: ConnectivityState;
  setBackendAvailable: (available: boolean) => void;
  setOfflineMode: (offline: boolean) => void;
  addPendingEvent: (event: any) => void;
  clearPendingEvents: () => void;
  updateLastSync: () => void;

  // Reset all state
  reset: () => void;
}

const initialState = {
  user: null,
  token: null,
  drive: {
    isActive: false,
    startTime: null,
    detectedActivities: 0,
    distance: 0,
    newCellsExplored: 0,
  },
  map: {
    exploredCells: new Set<string>(),
    nearbyActivityAreas: [],
    discoveryMarkers: [],
  },
  connectivity: {
    isBackendAvailable: false,
    isOfflineMode: false,
    lastSync: null,
    pendingEvents: [],
  },
};

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,

  // User actions
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),

  // Drive actions
  startDrive: () =>
    set((state) => ({
      drive: {
        ...state.drive,
        isActive: true,
        startTime: Date.now(),
        detectedActivities: 0,
        distance: 0,
        newCellsExplored: 0,
      },
    })),

  stopDrive: () =>
    set((state) => ({
      drive: {
        ...state.drive,
        isActive: false,
      },
    })),

  incrementDetectedActivities: () =>
    set((state) => ({
      drive: {
        ...state.drive,
        detectedActivities: state.drive.detectedActivities + 1,
      },
    })),

  incrementNewCellsExplored: () =>
    set((state) => ({
      drive: {
        ...state.drive,
        newCellsExplored: state.drive.newCellsExplored + 1,
      },
    })),

  updateDistance: (distance) =>
    set((state) => ({
      drive: {
        ...state.drive,
        distance,
      },
    })),

  // Map actions
  addExploredCell: (cellId) =>
    set((state) => ({
      map: {
        ...state.map,
        exploredCells: new Set([...state.map.exploredCells, cellId]),
      },
    })),

  setNearbyActivityAreas: (areas) =>
    set((state) => ({
      map: {
        ...state.map,
        nearbyActivityAreas: areas,
      },
    })),

  addDiscoveryMarker: (marker) =>
    set((state) => ({
      map: {
        ...state.map,
        discoveryMarkers: [...state.map.discoveryMarkers, marker],
      },
    })),

  // Connectivity actions
  setBackendAvailable: (available) =>
    set((state) => ({
      connectivity: {
        ...state.connectivity,
        isBackendAvailable: available,
        isOfflineMode: !available,
      },
    })),

  setOfflineMode: (offline) =>
    set((state) => ({
      connectivity: {
        ...state.connectivity,
        isOfflineMode: offline,
      },
    })),

  addPendingEvent: (event) =>
    set((state) => ({
      connectivity: {
        ...state.connectivity,
        pendingEvents: [...state.connectivity.pendingEvents, event],
      },
    })),

  clearPendingEvents: () =>
    set((state) => ({
      connectivity: {
        ...state.connectivity,
        pendingEvents: [],
      },
    })),

  updateLastSync: () =>
    set((state) => ({
      connectivity: {
        ...state.connectivity,
        lastSync: Date.now(),
      },
    })),

  // Reset all state
  reset: () => set(initialState),
}));
