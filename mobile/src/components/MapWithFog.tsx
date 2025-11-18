import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { PROVIDER_DEFAULT, Polyline, Region } from 'react-native-maps';
import Svg, { Rect, Defs, ClipPath, Circle } from 'react-native-svg';
import * as Location from 'expo-location';
import { hasMovedBeyondThreshold } from '../utils/distance';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_VISITED_POINTS = 300; // Limit points for performance
const MOVEMENT_THRESHOLD = 15; // Meters before recording new point
const HOLE_RADIUS = 50; // Radius of fog holes in pixels

interface MapWithFogProps {
  children?: React.ReactNode;
  initialRegion?: Region;
  onLocationUpdate?: (location: { latitude: number; longitude: number }) => void;
  style?: any;
  exploredPaths?: Array<Array<{ latitude: number; longitude: number }>>;
}

interface VisitedArea {
  latitude: number;
  longitude: number;
}

interface PixelCoord {
  x: number;
  y: number;
}

/**
 * MapWithFog component - Map with fog of war overlay that reveals as user explores
 *
 * Features:
 * - Dark semi-transparent overlay covering unexplored areas
 * - SVG ClipPath to cut transparent "holes" where user has been
 * - Real-time location tracking using expo-location
 * - Converts geographic coordinates to screen pixels
 * - Performance optimized with point limiting
 */
export default function MapWithFog({
  children,
  initialRegion,
  onLocationUpdate,
  style,
  exploredPaths = [],
}: MapWithFogProps) {
  const mapRef = useRef<MapView>(null);
  const [visitedAreas, setVisitedAreas] = useState<VisitedArea[]>([]);
  const [visitedPixelCoords, setVisitedPixelCoords] = useState<PixelCoord[]>([]);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(initialRegion || null);
  const lastRecordedPosition = useRef<VisitedArea | null>(null);

  /**
   * Initialize location tracking when component mounts
   */
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    (async () => {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission denied');
        return;
      }

      // Get initial position
      try {
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const initialPos = {
          latitude: initialLocation.coords.latitude,
          longitude: initialLocation.coords.longitude,
        };

        lastRecordedPosition.current = initialPos;
        setVisitedAreas([initialPos]);

        // Notify parent component
        if (onLocationUpdate) {
          onLocationUpdate(initialPos);
        }

        // Center map on user's location
        if (mapRef.current && !initialRegion) {
          mapRef.current.animateToRegion({
            ...initialPos,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        }
      } catch (error) {
        console.error('Error getting initial location:', error);
      }

      // Start watching user's position
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5, // Update every 5 meters
          timeInterval: 2000, // Update every 2 seconds
        },
        (location) => {
          const newPos = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          // Only record if user moved beyond threshold
          if (
            !lastRecordedPosition.current ||
            hasMovedBeyondThreshold(newPos, lastRecordedPosition.current, MOVEMENT_THRESHOLD)
          ) {
            lastRecordedPosition.current = newPos;

            setVisitedAreas((prev) => {
              const updated = [...prev, newPos];
              // Limit to last MAX_VISITED_POINTS for performance
              return updated.length > MAX_VISITED_POINTS
                ? updated.slice(updated.length - MAX_VISITED_POINTS)
                : updated;
            });

            // Notify parent component
            if (onLocationUpdate) {
              onLocationUpdate(newPos);
            }
          }
        }
      );
    })();

    // Cleanup subscription on unmount
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [initialRegion, onLocationUpdate]);

  /**
   * Convert geographic coordinates to screen pixel coordinates
   * This happens whenever the map region changes or visited areas update
   */
  useEffect(() => {
    const convertCoordinatesToPixels = async () => {
      if (!mapRef.current || visitedAreas.length === 0) {
        return;
      }

      try {
        const pixelPromises = visitedAreas.map(async (area) => {
          try {
            const point = await mapRef.current!.coordinateToPoint({
              latitude: area.latitude,
              longitude: area.longitude,
            });
            return point;
          } catch (error) {
            return null;
          }
        });

        const pixelResults = await Promise.all(pixelPromises);
        const validPixels = pixelResults.filter((p): p is PixelCoord => p !== null);

        setVisitedPixelCoords(validPixels);
      } catch (error) {
        console.error('Error converting coordinates:', error);
      }
    };

    convertCoordinatesToPixels();
  }, [visitedAreas, currentRegion]);

  /**
   * Handle map region changes
   */
  const handleRegionChangeComplete = useCallback((region: Region) => {
    setCurrentRegion(region);
  }, []);

  return (
    <View style={[styles.container, style]}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={
          initialRegion || {
            latitude: 45.2671,
            longitude: 19.8335,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }
        }
        showsUserLocation
        showsMyLocationButton={false}
        followsUserLocation={false}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {/* Render explored paths (yellow lines) */}
        {exploredPaths.map((path, index) => (
          <Polyline
            key={`explored-path-${index}`}
            coordinates={path}
            strokeColor="#FDDA91"
            strokeWidth={7}
            lineCap="round"
            lineJoin="round"
          />
        ))}

        {/* Any additional children */}
        {children}
      </MapView>

      {/* Fog overlay removed - will be added back later with proper tile system */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  fogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
