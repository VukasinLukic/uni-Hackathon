import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  level: number;
  xp: number;
  totalDistance: number;
  potholesDetected: number;
}

interface DriveState {
  isActive: boolean;
  startTime: number | null;
  detectedPotholes: number;
  distance: number;
}

interface MapState {
  exploredCells: Set<string>;
  nearbyPotholes: any[];
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
  incrementDetectedPotholes: () => void;
  updateDistance: (distance: number) => void;

  // Map state
  map: MapState;
  addExploredCell: (cellId: string) => void;
  setNearbyPotholes: (potholes: any[]) => void;

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
    detectedPotholes: 0,
    distance: 0,
  },
  map: {
    exploredCells: new Set<string>(),
    nearbyPotholes: [],
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
        detectedPotholes: 0,
        distance: 0,
      },
    })),

  stopDrive: () =>
    set((state) => ({
      drive: {
        ...state.drive,
        isActive: false,
      },
    })),

  incrementDetectedPotholes: () =>
    set((state) => ({
      drive: {
        ...state.drive,
        detectedPotholes: state.drive.detectedPotholes + 1,
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

  setNearbyPotholes: (potholes) =>
    set((state) => ({
      map: {
        ...state.map,
        nearbyPotholes: potholes,
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
