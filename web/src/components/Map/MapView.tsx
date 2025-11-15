import { usePotholeStore } from '../../store/usePotholeStore';
import MapboxPotholeMap from './MapboxPotholeMap';

export default function MapView() {
  const { getFilteredPotholes, viewMode, selectPothole } = usePotholeStore();
  const potholes = getFilteredPotholes();

  const handlePotholeSelect = (potholeId: string) => {
    const pothole = potholes.find(p => p._id === potholeId);
    if (pothole) {
      selectPothole(pothole);
    }
  };

  return (
    <MapboxPotholeMap
      potholes={potholes}
      onPotholeSelect={handlePotholeSelect}
      viewMode={viewMode}
    />
  );
}
