import { create } from 'zustand';
import { Pothole, PotholeFilters } from '../types/pothole.types';
import { mockPotholes } from '../data/mockPotholes';

interface PotholeState {
  potholes: Pothole[];
  selectedPothole: Pothole | null;
  filters: PotholeFilters;
  viewMode: 'markers' | 'heatmap';

  // Actions
  setPotholes: (potholes: Pothole[]) => void;
  selectPothole: (pothole: Pothole | null) => void;
  setFilters: (filters: Partial<PotholeFilters>) => void;
  setViewMode: (mode: 'markers' | 'heatmap') => void;
  loadMockData: () => void;

  // Computed/filtered data
  getFilteredPotholes: () => Pothole[];
}

export const usePotholeStore = create<PotholeState>((set, get) => ({
  potholes: [],
  selectedPothole: null,
  filters: {
    severity: 'all',
    status: 'all',
    timeframe: 'all',
  },
  viewMode: 'heatmap', // Start with heatmap by default

  setPotholes: (potholes) => set({ potholes }),

  selectPothole: (pothole) => set({ selectedPothole: pothole }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  setViewMode: (mode) => set({ viewMode: mode }),

  loadMockData: () => set({ potholes: mockPotholes }),

  getFilteredPotholes: () => {
    const { potholes, filters } = get();

    return potholes.filter((pothole) => {
      // Filter by severity
      if (filters.severity !== 'all') {
        if (filters.severity === 'low' && pothole.severity >= 4) return false;
        if (filters.severity === 'medium' && (pothole.severity < 4 || pothole.severity >= 7)) return false;
        if (filters.severity === 'high' && pothole.severity < 7) return false;
      }

      // Filter by status
      if (filters.status !== 'all' && pothole.status !== filters.status) {
        return false;
      }

      // Filter by timeframe
      if (filters.timeframe !== 'all') {
        const now = Date.now();
        const createdAt = new Date(pothole.createdAt).getTime();
        const dayMs = 24 * 60 * 60 * 1000;

        if (filters.timeframe === 'today' && now - createdAt > dayMs) return false;
        if (filters.timeframe === 'week' && now - createdAt > 7 * dayMs) return false;
        if (filters.timeframe === 'month' && now - createdAt > 30 * dayMs) return false;
      }

      return true;
    });
  },
}));
