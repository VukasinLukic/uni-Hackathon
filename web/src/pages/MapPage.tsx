import { useEffect, useState } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import MapView from '../components/Map/MapView';
import MapFilters from '../components/Map/MapFilters';
import PotholeInfoPanel from '../components/Map/PotholeInfoPanel';
import PotholesSidebar from '../components/Map/PotholesSidebar';
import { usePotholeStore } from '../store/usePotholeStore';
import { Construction, Flame } from 'lucide-react';
import { Pothole } from '../types/pothole.types';
import { getPriorityFromReports, getAreaFromAddress } from '../utils/mapHelpers';

export default function MapPage() {
  const { loadPotholesFromAPI, viewMode, setViewMode, getFilteredPotholes, potholes } = usePotholeStore();
  const [loaded, setLoaded] = useState(false);
  const [selectedPothole, setSelectedPothole] = useState<Pothole | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({
    area: 'All',
    status: 'All',
    priority: 'All',
    severity: 'All',
  });

  useEffect(() => {
    if (!loaded) {
      console.log('🔄 MapPage: Loading potholes from API...');
      loadPotholesFromAPI();
      setLoaded(true);
    }
  }, [loadPotholesFromAPI, loaded]);

  // Listen for pothole updates
  useEffect(() => {
    const handlePotholeUpdate = () => {
      console.log('🔄 Pothole updated, reloading data...');
      loadPotholesFromAPI();
    };

    window.addEventListener('pothole-updated', handlePotholeUpdate);
    return () => window.removeEventListener('pothole-updated', handlePotholeUpdate);
  }, [loadPotholesFromAPI]);

  const filteredPotholes = getFilteredPotholes();

  const handleFilterChange = (filterType: 'area' | 'status' | 'priority' | 'severity', value: string) => {
    console.log(`🔧 Filter changed: ${filterType} = ${value}`);
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handlePotholeClick = (pothole: Pothole) => {
    setSelectedPothole(pothole);
  };

  const handleCloseInfo = () => {
    setSelectedPothole(null);
  };

  // Filter potholes based on frontend filters (only for markers mode)
  const getFilteredPotholesForMarkers = () => {
    if (viewMode !== 'markers') return filteredPotholes;

    return filteredPotholes.filter((pothole) => {
      // Status filter
      if (filters.status && filters.status !== 'All') {
        const statusMap: Record<string, string> = {
          'Needs repair': 'new',
          'Planned': 'planned',
          'In progress': 'in_progress',
          'Fixed': 'resolved',
        };
        const mappedStatus = statusMap[filters.status];
        if (mappedStatus && pothole.status !== mappedStatus) return false;
      }

      // Priority filter (based on reports instead of severity)
      if (filters.priority && filters.priority !== 'All') {
        if (getPriorityFromReports(pothole.reports) !== filters.priority) return false;
      }

      // Area filter
      if (filters.area && filters.area !== 'All') {
        if (getAreaFromAddress(pothole.location.address || '') !== filters.area) return false;
      }

      // Severity filter
      if (filters.severity && filters.severity !== 'All') {
        if (filters.severity === 'High (70-100)' && pothole.severity < 70) return false;
        if (filters.severity === 'Medium (40-69)' && (pothole.severity < 40 || pothole.severity >= 70)) return false;
        if (filters.severity === 'Low (0-39)' && pothole.severity >= 40) return false;
      }

      return true;
    });
  };

  const displayedPotholes = getFilteredPotholesForMarkers();

  // Debug: log filter results
  useEffect(() => {
    console.log(`🔍 Filters:`, filters);
    console.log(`📊 Filtered potholes: ${displayedPotholes.length} / ${filteredPotholes.length}`);
  }, [filters, displayedPotholes.length, filteredPotholes.length]);

  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Pothole Map
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Showing {viewMode === 'markers' ? displayedPotholes.length : filteredPotholes.length} potholes in Timișoara
            </p>
          </div>

          {/* View mode toggle - Heatmap first, then Markers */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('heatmap')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'heatmap'
                  ? 'bg-[#212460] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Flame className="w-4 h-4" />
              Heatmap
            </button>
            <button
              onClick={() => setViewMode('markers')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'markers'
                  ? 'bg-[#212460] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Construction className="w-4 h-4" />
              Markers
            </button>
          </div>
        </div>

        {/* Filters - ONLY for markers mode */}
        {viewMode === 'markers' && (
          <div className="mb-4">
            <MapFilters potholes={potholes} filters={filters} onFilterChange={handleFilterChange} />
          </div>
        )}

        {/* Map container */}
        <div className="flex-1 relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <MapView onMarkerClick={handlePotholeClick} filteredPotholes={displayedPotholes} />

          {/* Sidebar - ONLY for markers mode */}
          {viewMode === 'markers' && (
            <PotholesSidebar
              potholes={displayedPotholes}
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
              onPotholeClick={handlePotholeClick}
              selectedPotholeId={selectedPothole?._id}
            />
          )}
        </div>

        {/* Info Panel Modal - ONLY for markers mode */}
        {viewMode === 'markers' && selectedPothole && (
          <PotholeInfoPanel pothole={selectedPothole} onClose={handleCloseInfo} />
        )}
      </div>
    </AppLayout>
  );
}
