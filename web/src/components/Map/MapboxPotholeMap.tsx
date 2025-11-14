import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface PotholeData {
  _id: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  severity: number;
  status: string;
  reports: number;
  description?: string;
}

interface MapboxPotholeMapProps {
  potholes: PotholeData[];
  onPotholeSelect?: (potholeId: string) => void;
  viewMode?: 'markers' | 'heatmap';
}

export default function MapboxPotholeMap({
  potholes,
  onPotholeSelect,
  viewMode = 'markers'
}: MapboxPotholeMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const initialized = useRef(false);

  // Initialize map ONCE
  useEffect(() => {
    if (!mapContainer.current || map.current || initialized.current) return;

    console.log('🗺️ Initializing Mapbox map...');
    console.log('📊 Potholes data:', potholes.length, 'potholes');

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    console.log('🔑 Mapbox token:', import.meta.env.VITE_MAPBOX_TOKEN ? 'Found' : 'Missing');

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

    // Add layers ONCE on map load - exactly like Mapbox example
    map.current.on('load', () => {
      console.log('🗺️ Map loaded! Adding source and layers...');
      console.log('📊 Potholes available:', potholes.length);

      if (!map.current) return;

      // Convert potholes to GeoJSON
      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: potholes.map((pothole) => ({
          type: 'Feature',
          properties: {
            id: pothole._id,
            severity: pothole.severity,
            status: pothole.status,
            reports: pothole.reports,
            description: pothole.description || '',
            address: pothole.location.address || '',
          },
          geometry: {
            type: 'Point',
            coordinates: [pothole.location.lng, pothole.location.lat],
          },
        })),
      };

      console.log('📍 GeoJSON features:', geojson.features.length);

      // Add source
      map.current.addSource('potholes', {
        type: 'geojson',
        data: geojson,
      });
      console.log(`✅ Added source with ${potholes.length} potholes`);

      // Create custom marker icon (crack/pothole icon)
      const width = 40;
      const height = 40;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Draw a crack/warning icon
        ctx.fillStyle = '#ef4444'; // red
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        // Draw triangle warning shape
        ctx.beginPath();
        ctx.moveTo(width / 2, 5);
        ctx.lineTo(width - 5, height - 5);
        ctx.lineTo(5, height - 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw exclamation mark
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(width / 2 - 2, 12, 4, 14);
        ctx.beginPath();
        ctx.arc(width / 2, height - 10, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      const potholeImage = canvas.toDataURL();
      const img = new Image(width, height);
      img.onload = () => {
        if (map.current && !map.current.hasImage('pothole-marker')) {
          map.current.addImage('pothole-marker', img);
        }
      };
      img.src = potholeImage;

      // Add HEATMAP layer - ONLY RED COLOR like the image you sent
      map.current.addLayer({
        id: 'potholes-heat',
        type: 'heatmap',
        source: 'potholes',
        maxzoom: 20,
        paint: {
          // Increase the heatmap weight based on severity
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'severity'],
            0, 0,
            10, 1
          ],
          // Increase the heatmap intensity by zoom level
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            20, 5
          ],
          // RED/BLUE color ramp like the earthquake map
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 0, 0)',           // transparent
            0.1, 'rgba(0, 100, 255, 0.4)',   // blue glow
            0.3, 'rgba(100, 150, 255, 0.6)', // light blue
            0.5, 'rgba(255, 100, 100, 0.7)', // pink/light red
            0.7, 'rgba(255, 50, 50, 0.85)',  // red
            1, 'rgba(255, 0, 0, 1)'          // bright red
          ],
          // Smaller radius for better separation
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 8,
            10, 15,
            13, 20,
            15, 25,
            20, 35
          ],
          // Opacity
          'heatmap-opacity': 0.9
        },
      });
      console.log('✅ Added RED/BLUE heatmap layer');

      // Add MARKERS layer (icon markers - NO LABELS!) - HIDDEN BY DEFAULT
      map.current.addLayer({
        id: 'potholes-markers',
        type: 'symbol',
        source: 'potholes',
        layout: {
          'visibility': 'none', // HIDDEN by default - heatmap shows first
          'icon-image': 'pothole-marker',
          'icon-size': 0.8,
          'icon-allow-overlap': true
        },
      });
      console.log('✅ Added markers layer with icon (hidden by default)');

      // Add click handler for markers mode
      map.current.on('click', 'potholes-markers', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const potholeId = feature.properties?.id;
          if (potholeId && onPotholeSelect) {
            onPotholeSelect(potholeId);
          }

          // Show popup
          const coordinates = (feature.geometry as any).coordinates.slice();
          const { severity, status, reports, description, address } = feature.properties || {};

          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div style="padding: 8px;">
                <h3 style="font-weight: bold; margin-bottom: 4px;">Severity: ${severity}/10</h3>
                <p style="margin: 2px 0;"><strong>Status:</strong> ${status}</p>
                <p style="margin: 2px 0;"><strong>Reports:</strong> ${reports}</p>
                <p style="margin: 2px 0; font-size: 12px;">${description}</p>
                ${address ? `<p style="margin-top: 4px; font-size: 11px; color: #666;">${address}</p>` : ''}
              </div>
            `)
            .addTo(map.current!);
        }
      });

      // Add click handler for HEATMAP - show popup when zoomed in (zoom > 14)
      map.current.on('click', (e) => {
        const zoom = map.current?.getZoom() || 0;

        // Only show popup on high zoom levels when you can see individual potholes
        if (zoom > 14) {
          const features = map.current?.queryRenderedFeatures(e.point, {
            layers: ['potholes-heat']
          });

          if (features && features.length > 0) {
            const feature = features[0];
            const potholeId = feature.properties?.id;

            if (potholeId && onPotholeSelect) {
              onPotholeSelect(potholeId);
            }

            // Show popup with pothole info
            const coordinates = (feature.geometry as any).coordinates.slice();
            const { severity, status, reports, description, address } = feature.properties || {};

            new mapboxgl.Popup()
              .setLngLat(coordinates)
              .setHTML(`
                <div style="padding: 8px;">
                  <h3 style="font-weight: bold; margin-bottom: 4px;">Pothole - Severity: ${severity}/10</h3>
                  <p style="margin: 2px 0;"><strong>Status:</strong> ${status}</p>
                  <p style="margin: 2px 0;"><strong>Reports:</strong> ${reports}</p>
                  <p style="margin: 2px 0; font-size: 12px;">${description}</p>
                  ${address ? `<p style="margin-top: 4px; font-size: 11px; color: #666;">${address}</p>` : ''}
                </div>
              `)
              .addTo(map.current!);

            // Prevent default behavior and stop propagation
            e.preventDefault();
            if (e.originalEvent) {
              e.originalEvent.stopPropagation();
            }
          }
        }
      });

      // Change cursor on hover for markers
      map.current.on('mouseenter', 'potholes-markers', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'potholes-markers', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });

      // Change cursor on hover for heatmap (only on high zoom)
      map.current.on('mousemove', (e) => {
        if (!map.current) return;
        const zoom = map.current.getZoom();

        if (zoom > 14) {
          const features = map.current.queryRenderedFeatures(e.point, {
            layers: ['potholes-heat']
          });

          map.current.getCanvas().style.cursor = features && features.length > 0 ? 'pointer' : '';
        }
      });

      console.log('🎉 All layers added successfully!');
    });

    initialized.current = true;

    return () => {
      console.log('🧹 Cleaning up map...');
      map.current?.remove();
      map.current = null;
      initialized.current = false;
    };
  }, [potholes]); // Re-run when potholes change!

  // Toggle layer visibility based on viewMode
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;

    console.log(`🔄 Switching to ${viewMode} mode...`);

    if (viewMode === 'heatmap') {
      // SHOW ONLY HEATMAP - NO NUMBERS, NO CIRCLES
      console.log('👁️ Showing RED heatmap ONLY, hiding all markers');

      if (map.current.getLayer('potholes-heat')) {
        map.current.setLayoutProperty('potholes-heat', 'visibility', 'visible');
      }
      if (map.current.getLayer('potholes-markers')) {
        map.current.setLayoutProperty('potholes-markers', 'visibility', 'none');
      }
    } else {
      // SHOW ONLY MARKERS (NO LABELS/NUMBERS)
      console.log('👁️ Showing markers ONLY, hiding heatmap');

      if (map.current.getLayer('potholes-heat')) {
        map.current.setLayoutProperty('potholes-heat', 'visibility', 'none');
      }
      if (map.current.getLayer('potholes-markers')) {
        map.current.setLayoutProperty('potholes-markers', 'visibility', 'visible');
      }
    }

    console.log('✅ View mode switched successfully');
  }, [viewMode]);

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />;
}
