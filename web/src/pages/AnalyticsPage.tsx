import { useState } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import { Award, Send } from 'lucide-react';
import leaderboardData from '../data/mockLeaderboard.json';
import rewardsData from '../data/mockRewards.json';

interface LeaderboardEntry {
  id: string;
  licensePlate: string;
  points: number;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  value: number;
}

export default function AnalyticsPage() {
  const [selectedReward, setSelectedReward] = useState<string>('');
  const [rankFrom, setRankFrom] = useState<number>(1);
  const [rankTo, setRankTo] = useState<number>(1);
  const [sending, setSending] = useState(false);

  const leaderboard: LeaderboardEntry[] = leaderboardData;
  const rewards: Reward[] = rewardsData;

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
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      License Plate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {leaderboard.map((entry, index) => (
                    <tr
                      key={entry.id}
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
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900 dark:text-white">
                          {entry.licensePlate}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {entry.points.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                    />
                  </div>
                </div>
                {rankFrom > 0 && rankTo > 0 && rankFrom <= rankTo && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {rankTo - rankFrom + 1} citizen(s) will receive this reward
                  </p>
                )}
              </div>

              {/* Preview Recipients */}
              {rankFrom > 0 && rankTo > 0 && rankFrom <= rankTo && (
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Recipients:</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {leaderboard.slice(rankFrom - 1, rankTo).map((entry, idx) => (
                      <div key={entry.id} className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                        #{rankFrom + idx} - {entry.licensePlate}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={handleSendReward}
                disabled={!selectedReward || rankFrom < 1 || rankTo < 1 || rankFrom > rankTo || sending}
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
