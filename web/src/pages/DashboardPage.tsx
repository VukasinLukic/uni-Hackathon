import { useEffect, useState } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import { usePotholeStore } from '../store/usePotholeStore';
import { AlertCircle, CheckCircle, Clock, MapPin } from 'lucide-react';

interface DashboardStats {
  total: number;
  needsRepair: number;
  planned: number;
  inProgress: number;
  resolved: number;
  avgSeverity: number;
  totalReports: number;
  highPriority: number;
}

export default function DashboardPage() {
  const { potholes, loadPotholesFromAPI } = usePotholeStore();
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    needsRepair: 0,
    planned: 0,
    inProgress: 0,
    resolved: 0,
    avgSeverity: 0,
    totalReports: 0,
    highPriority: 0,
  });

  useEffect(() => {
    loadPotholesFromAPI();
  }, [loadPotholesFromAPI]);

  useEffect(() => {
    if (potholes.length > 0) {
      const needsRepair = potholes.filter(p => p.status === 'new').length;
      const planned = potholes.filter(p => p.status === 'planned').length;
      const inProgress = potholes.filter(p => p.status === 'in_progress').length;
      const resolved = potholes.filter(p => p.status === 'resolved').length;
      const totalReports = potholes.reduce((sum, p) => sum + p.reports, 0);
      const avgSeverity = Math.round(potholes.reduce((sum, p) => sum + p.severity, 0) / potholes.length);
      const highPriority = potholes.filter(p => p.severity >= 70).length;

      setStats({
        total: potholes.length,
        needsRepair,
        planned,
        inProgress,
        resolved,
        avgSeverity,
        totalReports,
        highPriority,
      });
    }
  }, [potholes]);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header - Government Style */}
        <div className="border-b border-gray-300 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Road Infrastructure Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Municipal Road Management System
          </p>
        </div>

        {/* Key Metrics - Clean Government Style */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Potholes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
              </div>
              <MapPin className="w-10 h-10 text-gray-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Needs Repair</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.needsRepair}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
              </div>
              <Clock className="w-10 h-10 text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reports</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalReports}</p>
            <p className="text-xs text-gray-500 mt-1">Citizen submissions</p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Severity</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.avgSeverity}/100</p>
            <p className="text-xs text-gray-500 mt-1">Based on impact data</p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Priority</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.highPriority}</p>
            <p className="text-xs text-gray-500 mt-1">Severity over 70</p>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Status Breakdown</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Needs Repair</span>
              <div className="flex items-center gap-3">
                <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.needsRepair / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                  {stats.needsRepair}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Planned</span>
              <div className="flex items-center gap-3">
                <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.planned / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                  {stats.planned}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">In Progress</span>
              <div className="flex items-center gap-3">
                <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                  {stats.inProgress}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Resolved</span>
              <div className="flex items-center gap-3">
                <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                  {stats.resolved}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
