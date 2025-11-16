import { usePotholeStore } from '../../store/usePotholeStore';
import MapboxPotholeMap from './MapboxPotholeMap';
import MarkersMap from './MarkersMap';
import { Pothole } from '../../types/pothole.types';

interface MapViewProps {
  onMarkerClick?: (pothole: Pothole) => void;
  filteredPotholes?: Pothole[];
}

export default function MapView({ onMarkerClick, filteredPotholes: propPotholes }: MapViewProps) {
  const { getFilteredPotholes, viewMode, selectPothole } = usePotholeStore();
  const potholes = propPotholes || getFilteredPotholes();

  const handlePotholeSelect = (potholeId: string) => {
    const pothole = potholes.find(p => p._id === potholeId);
    if (pothole) {
      selectPothole(pothole);
    }
  };

  const handleMarkerClick = (potholeId: string) => {
    const pothole = potholes.find(p => p._id === potholeId);
    if (pothole && onMarkerClick) {
      onMarkerClick(pothole);
    }
  };

  // Use different map component based on view mode
  if (viewMode === 'markers') {
    return (
      <MarkersMap
        potholes={potholes}
        onPotholeSelect={handleMarkerClick}
      />
    );
  }

  // Heatmap mode (default)
  return (
    <MapboxPotholeMap
      potholes={potholes}
      onPotholeSelect={handlePotholeSelect}
      viewMode={viewMode}
    />
  );
}
