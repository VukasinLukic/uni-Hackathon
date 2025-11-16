import { useState, useEffect } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import { Award, Send, Loader2, User } from 'lucide-react';
import { APIService, LeaderboardEntry } from '../services/apiService';
import rewardsData from '../data/mockRewards.json';

interface Reward {
  id: string;
  name: string;
  description: string;
  value: number;
}

export default function AnalyticsPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReward, setSelectedReward] = useState<string>('');
  const [rankFrom, setRankFrom] = useState<number>(1);
  const [rankTo, setRankTo] = useState<number>(1);
  const [sending, setSending] = useState(false);

  const rewards: Reward[] = rewardsData;

  // Fetch leaderboard data from backend
  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);
      try {
        const data = await APIService.getLeaderboard(50); // Top 50 users
        setLeaderboard(data);
      } catch (err: any) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const handleSendReward = async () => {
    if (!selectedReward || rankFrom < 1 || rankTo < 1 || rankFrom > rankTo) {
      alert('Please select a valid reward and rank range');
      return;
    }

    setSending(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const selectedRewardData = rewards.find(r => r.id === selectedReward);
    const recipientCount = rankTo - rankFrom + 1;

    alert(`Reward "${selectedRewardData?.name}" sent to ${recipientCount} citizens (Rank ${rankFrom} to ${rankTo})`);

    setSending(false);
    setSelectedReward('');
    setRankFrom(1);
    setRankTo(1);
  };

  // Avatar component with color coding
  const Avatar = ({ avatarNumber }: { avatarNumber: number }) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
    ];

    return (
      <div className={`w-8 h-8 rounded-full ${colors[(avatarNumber - 1) % 5]} flex items-center justify-center text-white font-bold text-sm`}>
        {avatarNumber}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-300 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Citizen Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Citizen engagement and reward distribution
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard Table */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
            <div className="p-4 border-b border-gray-300 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Rankings</h2>
              {loading && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Loading...</p>
              )}
              {!loading && leaderboard.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {leaderboard.length} active citizens
                </p>
              )}
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center p-12">
                  <p className="text-red-500 dark:text-red-400">{error}</p>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-gray-500 dark:text-gray-400">
                  <User className="w-12 h-12 mb-3 opacity-50" />
                  <p>No citizens registered yet</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Citizen
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        License Plate
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {leaderboard.map((entry, index) => (
                      <tr
                        key={entry.rank}
                        className={`${
                          index < 3 ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
                        } hover:bg-gray-50 dark:hover:bg-gray-700/50`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {index === 0 && <Award className="w-5 h-5 text-yellow-500" />}
                            {index === 1 && <Award className="w-5 h-5 text-gray-400" />}
                            {index === 2 && <Award className="w-5 h-5 text-orange-600" />}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {entry.rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Avatar avatarNumber={entry.avatar} />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {entry.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                            {entry.licensePlate || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            Lvl {entry.level}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {entry.points.toLocaleString()} XP
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Reward Distribution Form */}
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 h-fit">
            <div className="p-4 border-b border-gray-300 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Distribute Reward</h2>
            </div>
            <div className="p-4 space-y-4">
              {/* Select Reward */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Reward
                </label>
                <select
                  value={selectedReward}
                  onChange={(e) => setSelectedReward(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading || leaderboard.length === 0}
                >
                  <option value="">-- Select a reward --</option>
                  {rewards.map((reward) => (
                    <option key={reward.id} value={reward.id}>
                      {reward.name}
                    </option>
                  ))}
                </select>
                {selectedReward && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {rewards.find(r => r.id === selectedReward)?.description}
                  </p>
                )}
              </div>

              {/* Rank Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rank Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">From</label>
                    <input
                      type="number"
                      min="1"
                      max={leaderboard.length}
                      value={rankFrom}
                      onChange={(e) => setRankFrom(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading || leaderboard.length === 0}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">To</label>
                    <input
                      type="number"
                      min="1"
                      max={leaderboard.length}
                      value={rankTo}
                      onChange={(e) => setRankTo(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading || leaderboard.length === 0}
                    />
                  </div>
                </div>
                {rankFrom > 0 && rankTo > 0 && rankFrom <= rankTo && leaderboard.length > 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {rankTo - rankFrom + 1} citizen(s) will receive this reward
                  </p>
                )}
              </div>

              {/* Preview Recipients */}
              {rankFrom > 0 && rankTo > 0 && rankFrom <= rankTo && leaderboard.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Recipients:</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {leaderboard.slice(rankFrom - 1, rankTo).map((entry, idx) => (
                      <div key={entry.rank} className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-mono">#{rankFrom + idx}</span> - {entry.name} ({entry.licensePlate || 'N/A'})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={handleSendReward}
                disabled={!selectedReward || rankFrom < 1 || rankTo < 1 || rankFrom > rankTo || sending || loading || leaderboard.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send Reward'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
