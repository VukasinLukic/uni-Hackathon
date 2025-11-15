import { useEffect, useState } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import MapView from '../components/Map/MapView';
import { usePotholeStore } from '../store/usePotholeStore';
import { Construction, Flame } from 'lucide-react';

export default function MapPage() {
  const { loadPotholesFromAPI, viewMode, setViewMode, getFilteredPotholes } = usePotholeStore();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) {
      console.log('🔄 MapPage: Loading potholes from API...');
      loadPotholesFromAPI();
      setLoaded(true);
    }
  }, [loadPotholesFromAPI, loaded]);

  const filteredPotholes = getFilteredPotholes();

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
              Showing {filteredPotholes.length} potholes in Timișoara
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

        {/* Map container */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <MapView />
        </div>
      </div>
    </AppLayout>
  );
}
