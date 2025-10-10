import React, { useState, useEffect } from 'react';
import { api } from '../utils/apiConfig';

const PlayerStatistics = ({ playerName }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const client = api; // uses your configured axios instance

  useEffect(() => {
    if (!playerName) return;

    const fetchPlayerStatistics = async () => {
      setLoading(true);
      setError(null);
      try {
        const [splitsRes, headlineRes] = await Promise.all([
          client.get(`/${encodeURIComponent(playerName)}-shooting-splits`),
          client.get(`/${encodeURIComponent(playerName)}-headline-stats`),
        ]);

        const playerData = splitsRes.data[playerName];
        const headlineStats = headlineRes.data[playerName];

        setData({
          FG2A: { value: playerData.fg2a },
          FG2M: { value: playerData.fg2m },
          FG2_PCT: { value: playerData.fg2_pct },
          FG2A_FREQUENCY: { value: playerData.fg2a_frequency },
          FG3A: { value: playerData.fg3a },
          FG3M: { value: playerData.fg3m },
          FG3_PCT: { value: playerData.fg3_pct },
          FG3A_FREQUENCY: { value: playerData.fg3a_frequency },
          FG_PCT: { value: playerData.fg_pct },
          EFG_PCT: { value: playerData.efg_pct },
          PTS: { value: headlineStats.points },
          REB: { value: headlineStats.rebounds },
          AST: { value: headlineStats.assists },
        });
      } catch (err) {
        console.error('API Error:', err);
        setError('Error loading player statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerStatistics();
  }, [playerName, client]);

  return (
    <div className="bg-neutral-700 shadow-lg overflow-y-auto h-full">
      {loading && (
        <div className="flex items-center justify-center h-full">
          <div>Loading...</div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">{error}</div>
        </div>
      )}

      {data && (
        <div className="p-4">
          <h4 className="text-xl font-bold text-white mb-4">Season Averages</h4>
          <div className="overflow-x-auto bg-neutral-800 rounded-lg p-4 mb-6">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-2 text-md font-large text-gray-300">PTS : {data.PTS.value}</th>
                  <th className="px-4 py-2 text-md font-large text-gray-300">REB : {data.REB.value}</th>
                  <th className="px-4 py-2 text-md font-large text-gray-300">AST : {data.AST.value}</th>
                </tr>
              </thead>
            </table>
          </div>

          <h4 className="text-xl font-bold text-white mb-4">Shooting Splits</h4>
          <div className="overflow-x-auto bg-neutral-800 rounded-lg p-4 mb-6">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-300">2PT Made</th>
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-300">2PT Attempted</th>
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-300">2PT %</th>
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-300">2PT Freq</th>
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-300">3PT Made</th>
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-300">3PT Attempted</th>
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-300">3PT %</th>
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-300">3PT Freq</th>
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-300">FG %</th>
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-300">eFG %</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 text-left text-white">{data.FG2M.value}</td>
                  <td className="px-4 py-2 text-left text-white">{data.FG2A.value}</td>
                  <td className="px-4 py-2 text-left text-white">{data.FG2_PCT.value}</td>
                  <td className="px-4 py-2 text-left text-white">{data.FG2A_FREQUENCY.value}</td>
                  <td className="px-4 py-2 text-left text-white">{data.FG3M.value}</td>
                  <td className="px-4 py-2 text-left text-white">{data.FG3A.value}</td>
                  <td className="px-4 py-2 text-left text-white">{data.FG3_PCT.value}</td>
                  <td className="px-4 py-2 text-left text-white">{data.FG3A_FREQUENCY.value}</td>
                  <td className="px-4 py-2 text-left text-white">{data.FG_PCT.value}</td>
                  <td className="px-4 py-2 text-left text-white">{data.EFG_PCT.value}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerStatistics;