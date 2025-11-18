import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Pothole } from '../../types/pothole.types';

interface MarkersMapProps {
  potholes: Pothole[];
  onPotholeSelect?: (potholeId: string) => void;
}

export default function MarkersMap({ potholes, onPotholeSelect }: MarkersMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Get marker color based on REPORTS count (same as heatmap logic)
  const getMarkerColor = (reports: number): string => {
    if (reports >= 10) return '#EF4444';   // Red - 10+ reports
    if (reports >= 5) return '#FCD34D';    // Yellow - 5-9 reports
    if (reports >= 2) return '#60A5FA';    // Light blue - 2-4 reports
    return '#93C5FD';                       // Very light blue - 1 report
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    console.log('🗺️ Initializing Markers Map...');
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [21.2257, 45.7489], // Timișoara
      zoom: 13,
      minZoom: 11,
      maxZoom: 18,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    console.log('✅ Markers Map initialized');

    return () => {
      console.log('🧹 Cleaning up Markers Map...');
      markersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers when potholes change
  useEffect(() => {
    if (!map.current) return;

    console.log(`📍 Updating ${potholes.length} markers...`);

    // Remove old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    potholes.forEach((pothole) => {
      const [lng, lat] = pothole.location.coordinates;
      const color = getMarkerColor(pothole.reports);

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.backgroundColor = color;
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      el.style.transition = 'width 0.2s ease, height 0.2s ease, margin 0.2s ease';
      el.style.position = 'absolute';
      el.style.pointerEvents = 'auto';

      // Create marker with offset to prevent movement
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
        offset: [0, 0]
      })
        .setLngLat([lng, lat])
        .addTo(map.current!);

      // Hover effect - change size without transform
      el.addEventListener('mouseenter', () => {
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.margin = '-3px';
        el.style.zIndex = '1000';
      });
      el.addEventListener('mouseleave', () => {
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.margin = '0';
        el.style.zIndex = '1';
      });

      // Click handler - prevent default behavior
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🖱️ Marker clicked:', pothole._id);
        if (onPotholeSelect) {
          onPotholeSelect(pothole._id);
        }
      });

      // Also prevent click propagation on the marker element itself
      marker.getElement().addEventListener('click', (e) => {
        e.stopPropagation();
      });

      markersRef.current.push(marker);
    });

    console.log(`✅ Added ${potholes.length} clickable markers`);
  }, [potholes, onPotholeSelect]);

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />;
}
