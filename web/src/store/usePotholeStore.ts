import { create } from 'zustand';
import { Pothole, PotholeFilters } from '../types/pothole.types';
import { APIService } from '../services/apiService';

interface PotholeState {
  potholes: Pothole[];
  selectedPothole: Pothole | null;
  filters: PotholeFilters;
  viewMode: 'markers' | 'heatmap';
  isLoading: boolean;
  error: string | null;

  // Actions
  setPotholes: (potholes: Pothole[]) => void;
  selectPothole: (pothole: Pothole | null) => void;
  setFilters: (filters: Partial<PotholeFilters>) => void;
  setViewMode: (mode: 'markers' | 'heatmap') => void;
  loadPotholesFromAPI: () => Promise<void>;
  updatePotholeStatus: (id: string, status: string, notes?: string) => Promise<void>;

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
  isLoading: false,
  error: null,

  setPotholes: (potholes) => set({ potholes }),

  selectPothole: (pothole) => set({ selectedPothole: pothole }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  setViewMode: (mode) => set({ viewMode: mode }),

  // Load real data from API
  loadPotholesFromAPI: async () => {
    set({ isLoading: true, error: null });
    console.log('🔄 Loading potholes from backend API...');

    try {
      const potholes = await APIService.getAllPotholes({ limit: 1000 });
      console.log(`✅ Loaded ${potholes.length} potholes from backend`);
      set({ potholes, isLoading: false });
    } catch (error: any) {
      console.error('❌ Failed to load potholes:', error);
      set({ error: error.message || 'Failed to load potholes', isLoading: false });
    }
  },

  // Update pothole status
  updatePotholeStatus: async (id: string, status: string, notes?: string) => {
    try {
      const updatedPothole = await APIService.updatePotholeStatus(id, status, notes);
      if (updatedPothole) {
        // Update in local state
        set((state) => ({
          potholes: state.potholes.map((p) => (p._id === id ? updatedPothole : p)),
        }));
      }
    } catch (error: any) {
      console.error('❌ Failed to update pothole:', error);
      set({ error: error.message || 'Failed to update pothole' });
    }
  },

  getFilteredPotholes: () => {
    const { potholes, filters } = get();

    return potholes.filter((pothole) => {
      // Filter by severity (backend uses 0-100, we convert to low/medium/high)
      if (filters.severity !== 'all') {
        const severityPercent = pothole.severity;
        if (filters.severity === 'low' && severityPercent >= 40) return false;
        if (filters.severity === 'medium' && (severityPercent < 40 || severityPercent >= 70)) return false;
        if (filters.severity === 'high' && severityPercent < 70) return false;
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
