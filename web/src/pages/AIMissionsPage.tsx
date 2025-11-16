import { useState, useEffect, useRef } from 'react';
import { Brain, Users, Clock, MapPin, Route, FileText } from 'lucide-react';
import AppLayout from '../components/Layout/AppLayout';
import { APIService } from '../services/apiService';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { jsPDF } from 'jspdf';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface MissionFormData {
  teams: number;
  workHours: number;
  optimizationCriteria?: 'reports' | 'severity';
}

interface TeamRoute {
  teamId: number;
  route: string[];
  potholes: Array<{
    id: string;
    lat: number;
    lng: number;
    severity: number;
    address: string;
    distance?: number;
  }>;
  estimatedTime: number;
  totalDistance: number;
  impactScore: number;
  routeGeometry?: {
    type: 'LineString';
    coordinates: number[][];
  };
}

interface MissionResult {
  missions: TeamRoute[];
  totalPotholes: number;
  totalImpact: number;
}

const teamColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function AIMissionsPage() {
  const [formData, setFormData] = useState<MissionFormData>({
    teams: 2,
    workHours: 6,
    optimizationCriteria: 'reports', // Default
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [missionResult, setMissionResult] = useState<MissionResult | null>(null);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const handleGenerateMission = async () => {
    setIsGenerating(true);
    try {
      const data = await APIService.generateAIMission(formData);
      setMissionResult(data);
    } catch (error) {
      console.error('Error generating mission:', error);
      alert('Failed to generate AI mission. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveMission = async () => {
    if (!missionResult) return;
    alert('Mission saved successfully! (Implementation pending)');
  };

  const handleExportPDF = () => {
    if (!missionResult) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Mission Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Mission Summary', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Teams: ${missionResult.missions.length}`, 20, yPos);
    yPos += 6;
    doc.text(`Total Potholes: ${missionResult.totalPotholes}`, 20, yPos);
    yPos += 6;
    doc.text(`Total Impact Score: ${missionResult.totalImpact.toFixed(2)}`, 20, yPos);
    yPos += 6;
    doc.text(`Optimization: ${formData.optimizationCriteria === 'reports' ? 'Most Reports' : 'Highest Severity'}`, 20, yPos);
    yPos += 12;

    // Mission Details
    missionResult.missions.forEach((mission) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Team ${mission.teamId}`, 20, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Potholes: ${mission.potholes.length} | Distance: ${mission.totalDistance.toFixed(1)} km | Time: ${mission.estimatedTime.toFixed(1)}h`, 20, yPos);
      yPos += 6;
      doc.text(`Impact Score: ${mission.impactScore.toFixed(2)}`, 20, yPos);
      yPos += 8;

      mission.potholes.forEach((pothole, pIdx) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(9);
        doc.text(`${pIdx + 1}. ${pothole.address}`, 25, yPos);
        yPos += 5;
        doc.setFontSize(8);
        doc.text(`   Severity: ${(pothole.severity * 100).toFixed(0)}/100 | Distance from prev: ${pothole.distance?.toFixed(2) || 0} km`, 25, yPos);
        yPos += 6;
      });

      yPos += 5;
    });

    doc.save(`AI_Mission_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!MAPBOX_TOKEN) {
      console.error('❌ MAPBOX_TOKEN is missing!');
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [19.8335, 45.2671], // Novi Sad
        zoom: 13,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        console.log('✅ Mapbox map loaded successfully');
      });

      map.current.on('error', (e) => {
        console.error('❌ Mapbox error:', e);
      });
    } catch (error) {
      console.error('❌ Failed to initialize map:', error);
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update map with mission routes
  useEffect(() => {
    if (!map.current || !missionResult) return;

    // Wait for map to load
    if (!map.current.isStyleLoaded()) {
      map.current.on('load', () => updateMapWithRoutes());
      return;
    }

    updateMapWithRoutes();

    function updateMapWithRoutes() {
      if (!map.current || !missionResult) return;

      // Remove existing layers and sources
      missionResult.missions.forEach((_, idx) => {
        if (map.current!.getLayer(`route-${idx}`)) map.current!.removeLayer(`route-${idx}`);
        if (map.current!.getSource(`route-${idx}`)) map.current!.removeSource(`route-${idx}`);
      });

      // Remove existing markers
      const markers = document.querySelectorAll('.mission-marker');
      markers.forEach((m) => m.remove());

      // Add route LineStrings
      missionResult.missions.forEach((mission, idx) => {
        if (!mission.routeGeometry || !map.current) return;

        const sourceId = `route-${idx}`;
        const layerId = `route-${idx}`;

        map.current.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: mission.routeGeometry,
            properties: {},
          } as any,
        });

        map.current.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': teamColors[idx],
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });
      });

      // Add numbered markers for each pothole
      missionResult.missions.forEach((mission, teamIdx) => {
        mission.potholes.forEach((pothole, pIdx) => {
          const el = document.createElement('div');
          el.className = 'mission-marker';
          el.innerHTML = `<div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: ${teamColors[teamIdx]};
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            cursor: pointer;
          ">${pIdx + 1}</div>`;

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px; font-size: 14px;">
              <div style="font-weight: bold; color: #7c3aed; margin-bottom: 4px;">
                Team ${mission.teamId} - Stop ${pIdx + 1}
              </div>
              <div style="margin-bottom: 4px;">${pothole.address}</div>
              <div style="color: #666; font-size: 12px;">
                Severity: ${(pothole.severity * 100).toFixed(0)}/100
              </div>
            </div>
          `);

          new mapboxgl.Marker(el)
            .setLngLat([pothole.lng, pothole.lat])
            .setPopup(popup)
            .addTo(map.current!);
        });
      });

      // Fit bounds to show all markers
      const bounds = new mapboxgl.LngLatBounds();
      missionResult.missions.forEach((mission) => {
        mission.potholes.forEach((p) => {
          bounds.extend([p.lng, p.lat]);
        });
      });

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, { padding: 50 });
      }
    }
  }, [missionResult]);

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Missions</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Generate optimized repair routes using AI
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Mission Configuration Form - SIMPLIFIED */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Mission Configuration
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Number of Teams */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <Users className="w-4 h-4 inline mr-2" />
                    Number of Teams
                  </label>
                  <select
                    value={formData.teams}
                    onChange={(e) => setFormData({ ...formData, teams: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={1}>1 Team</option>
                    <option value={2}>2 Teams</option>
                    <option value={3}>3 Teams</option>
                  </select>
                </div>

                {/* Work Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Work Duration
                  </label>
                  <select
                    value={formData.workHours}
                    onChange={(e) =>
                      setFormData({ ...formData, workHours: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={4}>4 hours</option>
                    <option value={6}>6 hours</option>
                    <option value={8}>8 hours</option>
                  </select>
                </div>

                {/* Optimization Criteria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <Route className="w-4 h-4 inline mr-2" />
                    Optimize By
                  </label>
                  <select
                    value={formData.optimizationCriteria}
                    onChange={(e) =>
                      setFormData({ ...formData, optimizationCriteria: e.target.value as 'reports' | 'severity' })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="reports">Most Reports (Most urgent)</option>
                    <option value="severity">Highest Severity (Worst condition)</option>
                  </select>
                </div>

                {/* Generate Button */}
                <div className="flex items-end">
                  <button
                    onClick={handleGenerateMission}
                    disabled={isGenerating}
                    className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Brain className="w-5 h-5" />
                    {isGenerating ? 'Generating...' : 'Generate Mission'}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            {missionResult && (
              <>
                {/* Mission Summary Cards */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Mission Results
                    </h2>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveMission}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Save Mission
                      </button>
                      <button
                        onClick={handleExportPDF}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Export to PDF
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {missionResult.missions.map((mission, idx) => (
                      <div
                        key={mission.teamId}
                        className="p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700"
                        style={{ borderColor: teamColors[idx] }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: teamColors[idx] }}
                          >
                            {mission.teamId}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Team {mission.teamId}
                          </h3>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Potholes:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {mission.route.length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Distance:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {mission.totalDistance.toFixed(1)} km
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Est. Time:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {mission.estimatedTime.toFixed(1)} hours
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Impact:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {mission.impactScore.toFixed(2)} / 1
                            </span>
                          </div>
                        </div>

                        {/* Pothole List with ADDRESSES */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                            <Route className="w-4 h-4" />
                            Route ({mission.route.length} stops):
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {mission.potholes.map((pothole, pIdx) => (
                              <div
                                key={pIdx}
                                className="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded"
                              >
                                <div className="flex items-start gap-2">
                                  <span className="font-bold text-purple-600 dark:text-purple-400">
                                    {pIdx + 1}.
                                  </span>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {pothole.address}
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-400 mt-1">
                                      Severity: {(pothole.severity * 100).toFixed(0)}/100
                                      {pothole.distance && pIdx > 0
                                        ? ` • ${pothole.distance.toFixed(1)}km from prev`
                                        : ''}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MAP WITH ROUTES */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Route className="w-5 h-5 text-purple-600" />
                    Route Map
                  </h2>
                  <div ref={mapContainer} className="h-[500px] rounded-lg overflow-hidden" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
