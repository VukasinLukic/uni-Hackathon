import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import MapView, { Polygon, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAppStore } from '../store/useAppStore';

interface FogOfWarMapProps {
  height?: number;
}

interface GridCell {
  id: string;
  coordinates: { latitude: number; longitude: number }[];
  explored: boolean;
  explorationCount: number;
}

const GRID_SIZE = 0.001; // Size of each grid cell in degrees (~111 meters)

export default function FogOfWarMap({ height = 400 }: FogOfWarMapProps) {
  const exploredCells = useAppStore((state) => state.map.exploredCells);
  const discoveryMarkers = useAppStore((state) => state.map.discoveryMarkers);
  const [gridCells, setGridCells] = useState<GridCell[]>([]);
  const [region, setRegion] = useState({
    latitude: 44.8125, // Novi Sad center
    longitude: 20.4612,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    // Generate grid cells around current region
    generateGridCells();
  }, [region, exploredCells]);

  const generateGridCells = () => {
    const cells: GridCell[] = [];
    const { latitude, longitude, latitudeDelta, longitudeDelta } = region;

    const startLat = latitude - latitudeDelta / 2;
    const endLat = latitude + latitudeDelta / 2;
    const startLng = longitude - longitudeDelta / 2;
    const endLng = longitude + longitudeDelta / 2;

    for (let lat = startLat; lat < endLat; lat += GRID_SIZE) {
      for (let lng = startLng; lng < endLng; lng += GRID_SIZE) {
        const cellId = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
        const isExplored = exploredCells.has(cellId);

        // Create rectangle coordinates for this grid cell
        const coordinates = [
          { latitude: lat, longitude: lng },
          { latitude: lat + GRID_SIZE, longitude: lng },
          { latitude: lat + GRID_SIZE, longitude: lng + GRID_SIZE },
          { latitude: lat, longitude: lng + GRID_SIZE },
        ];

        cells.push({
          id: cellId,
          coordinates,
          explored: isExplored,
          explorationCount: isExplored ? 1 : 0, // TODO: Track actual exploration count
        });
      }
    }

    setGridCells(cells);
  };

  const getCellColor = (cell: GridCell) => {
    if (!cell.explored) {
      return 'rgba(128, 128, 128, 0.7)'; // Gray = unexplored
    }

    // Color based on exploration frequency
    if (cell.explorationCount >= 5) {
      return 'rgba(76, 175, 80, 0.4)'; // Green = frequently explored
    } else if (cell.explorationCount >= 2) {
      return 'rgba(255, 193, 7, 0.4)'; // Yellow = moderately explored
    } else {
      return 'rgba(33, 150, 243, 0.3)'; // Blue = newly explored
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
        showsCompass
      >
        {/* Render grid cells */}
        {gridCells.map((cell) => (
          <Polygon
            key={cell.id}
            coordinates={cell.coordinates}
            fillColor={getCellColor(cell)}
            strokeColor="rgba(255, 255, 255, 0.2)"
            strokeWidth={0.5}
          />
        ))}

        {/* Render discovery markers */}
        {discoveryMarkers.map((marker, index) => (
          <Marker
            key={`discovery-${index}`}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title || 'Discovery'}
            description={marker.description}
          >
            <View style={styles.discoveryMarker}>
              <Text style={styles.markerIcon}>⭐</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Map Legend</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'rgba(128, 128, 128, 0.7)' }]} />
            <Text style={styles.legendText}>Unexplored</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'rgba(33, 150, 243, 0.5)' }]} />
            <Text style={styles.legendText}>New</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'rgba(255, 193, 7, 0.5)' }]} />
            <Text style={styles.legendText}>Moderate</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'rgba(76, 175, 80, 0.5)' }]} />
            <Text style={styles.legendText}>Frequent</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  map: {
    flex: 1,
  },
  legend: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  legendItems: {
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  legendText: {
    fontSize: 11,
    color: '#000000',
  },
  discoveryMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  markerIcon: {
    fontSize: 20,
  },
});
