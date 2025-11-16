/**
 * Fog of War Service
 * Handles grid cell calculations and GeoJSON generation for explored areas
 */

export interface ExplorationCell {
  cellId: string;
  lat: number;
  lng: number;
  activityLevel: 'high' | 'medium' | 'low';
  explorationCount: number;
  lastVisited: Date;
}

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// ~100 meters per cell
const CELL_SIZE = 0.001;

/**
 * Get unique cell ID for given coordinates
 */
export const getCellId = (lat: number, lng: number): string => {
  const cellLat = Math.floor(lat / CELL_SIZE);
  const cellLng = Math.floor(lng / CELL_SIZE);
  return `${cellLat}_${cellLng}`;
};

/**
 * Get cell coordinates from cell ID
 */
export const getCellCoordinates = (cellId: string): { lat: number; lng: number } => {
  const [latStr, lngStr] = cellId.split('_');
  const cellLat = parseInt(latStr);
  const cellLng = parseInt(lngStr);

  return {
    lat: cellLat * CELL_SIZE,
    lng: cellLng * CELL_SIZE,
  };
};

/**
 * Get polygon coordinates for a cell (for rendering on map)
 */
export const getCellPolygonCoords = (cellId: string): number[][][] => {
  const { lat, lng } = getCellCoordinates(cellId);

  // GeoJSON polygon format: [[[lng, lat], [lng, lat], ...]]
  return [[
    [lng, lat],
    [lng + CELL_SIZE, lat],
    [lng + CELL_SIZE, lat + CELL_SIZE],
    [lng, lat + CELL_SIZE],
    [lng, lat], // close the polygon
  ]];
};

/**
 * Generate GeoJSON for explored cells
 */
export const generateExploredCellsGeoJSON = (
  cells: ExplorationCell[]
): GeoJSON.FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: cells.map(cell => ({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: getCellPolygonCoords(cell.cellId),
      },
      properties: {
        cellId: cell.cellId,
        activityLevel: cell.activityLevel,
        explorationCount: cell.explorationCount,
        lastVisited: cell.lastVisited.toISOString(),
      },
    })),
  };
};

/**
 * Generate GeoJSON for fog (unexplored areas within bounds)
 */
export const generateFogGeoJSON = (
  bounds: Bounds,
  exploredCellIds: string[]
): GeoJSON.FeatureCollection => {
  const exploredSet = new Set(exploredCellIds);
  const features: GeoJSON.Feature[] = [];

  // Calculate grid bounds
  const minLat = Math.floor(bounds.south / CELL_SIZE);
  const maxLat = Math.ceil(bounds.north / CELL_SIZE);
  const minLng = Math.floor(bounds.west / CELL_SIZE);
  const maxLng = Math.ceil(bounds.east / CELL_SIZE);

  // Generate fog cells
  for (let latCell = minLat; latCell < maxLat; latCell++) {
    for (let lngCell = minLng; lngCell < maxLng; lngCell++) {
      const cellId = `${latCell}_${lngCell}`;

      // Skip if cell is explored
      if (exploredSet.has(cellId)) {
        continue;
      }

      const lat = latCell * CELL_SIZE;
      const lng = lngCell * CELL_SIZE;

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [lng, lat],
            [lng + CELL_SIZE, lat],
            [lng + CELL_SIZE, lat + CELL_SIZE],
            [lng, lat + CELL_SIZE],
            [lng, lat],
          ]],
        },
        properties: {
          cellId,
          type: 'fog',
        },
      });
    }
  }

  return {
    type: 'FeatureCollection',
    features,
  };
};

/**
 * Calculate which cells a route passes through
 */
export const getCellsAlongRoute = (
  coordinates: Array<{ lat: number; lng: number }>
): string[] => {
  const cellIds = new Set<string>();

  for (const coord of coordinates) {
    cellIds.add(getCellId(coord.lat, coord.lng));
  }

  return Array.from(cellIds);
};

/**
 * Determine activity level based on exploration count
 */
export const getActivityLevel = (
  explorationCount: number
): 'high' | 'medium' | 'low' => {
  if (explorationCount >= 10) return 'high';
  if (explorationCount >= 5) return 'medium';
  return 'low';
};

/**
 * Calculate exploration percentage within bounds
 */
export const calculateExplorationPercentage = (
  bounds: Bounds,
  exploredCellIds: string[]
): number => {
  const minLat = Math.floor(bounds.south / CELL_SIZE);
  const maxLat = Math.ceil(bounds.north / CELL_SIZE);
  const minLng = Math.floor(bounds.west / CELL_SIZE);
  const maxLng = Math.ceil(bounds.east / CELL_SIZE);

  const totalCells = (maxLat - minLat) * (maxLng - minLng);
  const exploredCount = exploredCellIds.length;

  return Math.min(100, (exploredCount / totalCells) * 100);
};
