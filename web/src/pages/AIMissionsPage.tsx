import { useState } from 'react';
import { Brain, Users, Clock, Shield, School, TrendingUp, Calendar } from 'lucide-react';
import AppLayout from '../components/Layout/AppLayout';
import { cn } from '../utils/cn';
import { APIService } from '../services/apiService';

interface MissionFormData {
  missionType: 'safety-first' | 'max-coverage' | 'critical-only';
  teams: number;
  workHours: number;
  constraints: string[];
}

interface TeamRoute {
  teamId: number;
  route: string[];
  potholes: Array<{
    id: string;
    lat: number;
    lng: number;
    severity: number;
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
    missionType: 'safety-first',
    teams: 2,
    workHours: 6,
    constraints: [],
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [missionResult, setMissionResult] = useState<MissionResult | null>(null);

  const handleConstraintToggle = (constraint: string) => {
    setFormData((prev) => ({
      ...prev,
      constraints: prev.constraints.includes(constraint)
        ? prev.constraints.filter((c) => c !== constraint)
        : [...prev.constraints, constraint],
    }));
  };

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
    alert('PDF export feature coming soon!');
  };

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
            {/* Mission Configuration Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Mission Configuration
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Mission Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Mission Type
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'safety-first', label: 'Safety First', icon: Shield },
                      { value: 'max-coverage', label: 'Max Coverage', icon: TrendingUp },
                      { value: 'critical-only', label: 'Critical Only', icon: Calendar },
                    ].map((option) => {
                      const Icon = option.icon;
                      return (
                        <label
                          key={option.value}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                            formData.missionType === option.value
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                          )}
                        >
                          <input
                            type="radio"
                            name="missionType"
                            value={option.value}
                            checked={formData.missionType === option.value}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                missionType: e.target.value as any,
                              })
                            }
                            className="text-purple-600"
                          />
                          <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {option.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Number of Teams */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <Users className="w-4 h-4 inline mr-2" />
                    Number of Teams
                  </label>
                  <select
                    value={formData.teams}
                    onChange={(e) =>
                      setFormData({ ...formData, teams: Number(e.target.value) })
                    }
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

                {/* Constraints */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Constraints
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'avoid-schools', label: 'Avoid schools', icon: School },
                      { value: 'high-trust-only', label: 'High trust only', icon: Shield },
                      { value: 'ignore-recent', label: 'Ignore recent (<2d)', icon: Calendar },
                    ].map((constraint) => {
                      const Icon = constraint.icon;
                      return (
                        <label
                          key={constraint.value}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.constraints.includes(constraint.value)}
                            onChange={() => handleConstraintToggle(constraint.value)}
                            className="rounded text-purple-600"
                          />
                          <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {constraint.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleGenerateMission}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Brain className="w-5 h-5" />
                  {isGenerating ? 'Generating Mission...' : 'Generate AI Mission'}
                </button>
              </div>
            </div>

            {/* Results Section */}
            {missionResult && (
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
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
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
                            {mission.impactScore.toFixed(1)} / 10
                          </span>
                        </div>
                      </div>

                      {/* Pothole List */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Route ({mission.route.length} stops):
                        </h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {mission.potholes.map((pothole, pIdx) => (
                            <div
                              key={pIdx}
                              className="text-xs text-gray-600 dark:text-gray-400 flex justify-between"
                            >
                              <span>
                                {pIdx + 1}. Pothole (Severity: {pothole.severity.toFixed(2)})
                              </span>
                              {pothole.distance && (
                                <span className="text-gray-500">
                                  +{pothole.distance.toFixed(1)}km
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
