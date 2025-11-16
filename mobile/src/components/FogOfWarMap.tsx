/**
 * Fog of War Map Component
 * Renders map with fog-of-war overlay and explored cells
 */

import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polygon, PROVIDER_DEFAULT } from 'react-native-maps';
import type { ExplorationCell } from '../services/fogOfWarService';
import { getCellPolygonCoords } from '../services/fogOfWarService';

interface FogOfWarMapProps {
  exploredCells: ExplorationCell[];
  userLocation?: {
    lat: number;
    lng: number;
  };
  discoveries?: Array<{
    id: string;
    lat: number;
    lng: number;
    severity: number;
  }>;
  style?: any;
  followUser?: boolean;
}

const FogOfWarMap: React.FC<FogOfWarMapProps> = ({
  exploredCells,
  userLocation,
  discoveries = [],
  style,
  followUser = true,
}) => {
  const mapRef = useRef<MapView>(null);

  // Center map on user location when it changes
  useEffect(() => {
    if (userLocation && followUser && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [userLocation, followUser]);

  const initialRegion = {
    latitude: userLocation?.lat || 44.7866,
    longitude: userLocation?.lng || 20.4489,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // Get color based on activity level
  const getCellColor = (activityLevel: string) => {
    switch (activityLevel) {
      case 'high': return 'rgba(34, 197, 94, 0.3)'; // Green
      case 'medium': return 'rgba(234, 179, 8, 0.3)'; // Yellow
      case 'low': return 'rgba(100, 116, 139, 0.3)'; // Gray
      default: return 'rgba(148, 163, 184, 0.3)';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        provider={PROVIDER_DEFAULT}
        customMapStyle={darkMapStyle}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.lat,
              longitude: userLocation.lng,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}

        {/* Explored Cells as Polygons */}
        {exploredCells.map((cell) => {
          const coords = getCellPolygonCoords(cell.cellId);
          const polygonCoords = coords[0].map(([lng, lat]) => ({
            latitude: lat,
            longitude: lng,
          }));

          return (
            <Polygon
              key={cell.cellId}
              coordinates={polygonCoords}
              fillColor={getCellColor(cell.activityLevel)}
              strokeColor="rgba(255, 255, 255, 0.2)"
              strokeWidth={1}
            />
          );
        })}

        {/* Discovery Markers */}
        {discoveries.map((discovery) => {
          const markerColor =
            discovery.severity > 70
              ? '#ef4444'
              : discovery.severity > 40
              ? '#f59e0b'
              : '#3b82f6';

          return (
            <Marker
              key={discovery.id}
              coordinate={{
                latitude: discovery.lat,
                longitude: discovery.lng,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View
                style={[
                  styles.discoveryMarker,
                  { backgroundColor: markerColor },
                ]}
              />
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
};

// Dark map style for react-native-maps
const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#212121' }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#212121' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#2c2c2c' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8a8a8a' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#000000' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3d3d3d' }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  discoveryMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default FogOfWarMap;
