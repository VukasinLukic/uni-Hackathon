import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './ClickableMarkersMap.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface Pothole {
  _id: string;
  location: {
    coordinates: [number, number];
    address?: string;
  };
  severity: number;
  status: 'new' | 'planned' | 'in_progress' | 'resolved' | 'rejected';
  reports: number;
  photo?: string;
  firstReported: string;
  lastReported: string;
  impactData?: {
    avgMagnitude: number;
    maxMagnitude: number;
    count: number;
  };
}

interface ClickableMarkersMapProps {
  potholes: Pothole[];
  onPotholeClick?: (pothole: Pothole) => void;
  selectedPotholeId?: string | null;
  filters?: {
    area?: string;
    status?: string;
    priority?: string;
  };
}

const ClickableMarkersMap: React.FC<ClickableMarkersMapProps> = ({
  potholes,
  onPotholeClick,
  selectedPotholeId,
  filters,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Get priority from severity
  const getPriority = (severity: number): 'High Priority' | 'Medium Priority' | 'Low Priority' => {
    if (severity >= 70) return 'High Priority';
    if (severity >= 40) return 'Medium Priority';
    return 'Low Priority';
  };

  // Get area from address
  const getArea = (address?: string): string => {
    if (!address) return 'Unknown';
    // Extract area from address (simple heuristic)
    const parts = address.split(',');
    return parts[parts.length - 2]?.trim() || parts[0]?.trim() || 'Unknown';
  };

  // Filter potholes based on filters
  const filteredPotholes = potholes.filter((pothole) => {
    if (filters?.status && filters.status !== 'All' && pothole.status !== filters.status.toLowerCase().replace(' ', '_')) {
      return false;
    }

    const priority = getPriority(pothole.severity);
    if (filters?.priority && filters.priority !== 'All' && priority !== filters.priority) {
      return false;
    }

    const area = getArea(pothole.location.address);
    if (filters?.area && filters.area !== 'All' && area !== filters.area) {
      return false;
    }

    return true;
  });

  // Get marker color based on severity
  const getMarkerColor = (severity: number): string => {
    if (severity >= 70) return '#EF4444'; // Red - High
    if (severity >= 40) return '#FCD34D'; // Yellow - Medium
    return '#3B82F6'; // Blue - Low
  };


  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [21.2257, 45.2671], // Novi Sad
      zoom: 12,
    });

    map.on('load', () => {
      console.log('🗺️ Clickable Markers Map loaded');
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Update markers when potholes or filters change
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers for filtered potholes
    filteredPotholes.forEach((pothole) => {
      const [lng, lat] = pothole.location.coordinates;
      const color = getMarkerColor(pothole.severity);

      // Create marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.backgroundColor = color;
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.border = selectedPotholeId === pothole._id ? '3px solid white' : '2px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      el.style.transition = 'all 0.3s ease';

      // Hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3)';
        el.style.zIndex = '1000';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.zIndex = '1';
      });

      // Create marker
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(mapRef.current!);

      // Click handler
      el.addEventListener('click', () => {
        if (onPotholeClick) {
          onPotholeClick(pothole);
        }
      });

      markersRef.current.push(marker);
    });

    console.log(`📍 Added ${filteredPotholes.length} markers to map`);
  }, [filteredPotholes, selectedPotholeId, onPotholeClick]);

  return <div ref={mapContainerRef} className="clickable-markers-map" />;
};

export default ClickableMarkersMap;
