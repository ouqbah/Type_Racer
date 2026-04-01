import React, { useEffect, useState } from 'react';
import { Trophy, Clock, Target, Zap, Medal, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Score {
  id: string;
  uid: string;
  displayName: string;
  wpm: number;
  accuracy: number;
  time: number;
  timestamp: any;
}

export const Leaderboard: React.FC = () => {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scores');
      if (!response.ok) throw new Error('Failed to fetch scores');
      const newScores = await response.json();
      setScores(newScores);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center sm:justify-start gap-3">
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
            Global Leaderboard
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base">Top 50 fastest typists in the world.</p>
        </div>
        <button
          onClick={fetchScores}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium w-full sm:w-auto justify-center"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs sm:text-sm uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
              <th className="p-3 sm:p-4 font-semibold rounded-tl-xl text-center">Rank</th>
              <th className="p-3 sm:p-4 font-semibold">Typist</th>
              <th className="p-3 sm:p-4 font-semibold text-right">WPM</th>
              <th className="p-3 sm:p-4 font-semibold text-right">Accuracy</th>
              <th className="p-3 sm:p-4 font-semibold text-right hidden sm:table-cell">Time</th>
              <th className="p-3 sm:p-4 font-semibold text-right rounded-tr-xl">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
            {scores.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No scores yet. Be the first to play!
                </td>
              </tr>
            ) : (
              scores.map((score, index) => (
                <tr key={score.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="p-3 sm:p-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm mx-auto ${
                      index === 0 ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-500' : 
                      index === 1 ? 'bg-gray-200 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400' : 
                      index === 2 ? 'bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-500' : 
                      'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {index < 3 ? <Medal className="w-4 h-4" /> : index + 1}
                    </div>
                  </td>
                  <td className="p-3 sm:p-4 font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                      {score.displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate max-w-[100px] sm:max-w-none">{score.displayName}</span>
                  </td>
                  <td className="p-3 sm:p-4 text-right font-bold text-indigo-600 dark:text-indigo-400 text-base sm:text-lg">
                    {score.wpm}
                  </td>
                  <td className="p-3 sm:p-4 text-right font-medium text-green-600 dark:text-green-400">
                    {score.accuracy}%
                  </td>
                  <td className="p-3 sm:p-4 text-right text-gray-500 dark:text-gray-400 font-mono text-xs sm:text-sm hidden sm:table-cell">
                    {score.time}s
                  </td>
                  <td className="p-3 sm:p-4 text-right text-gray-500 dark:text-gray-500 text-xs sm:text-sm whitespace-nowrap">
                    {score.timestamp ? formatDistanceToNow(new Date(score.timestamp), { addSuffix: true }) : 'Just now'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
