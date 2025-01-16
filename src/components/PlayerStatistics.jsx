import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const PlayerStatistics = ({ playerName }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const client = axios.create({
        baseURL: "http://localhost:8000"
    });

    useEffect(() => {

        // Only fetch if playerName is not empty
        if (!playerName) return;

        const fetchPlayerStatistics = async () => {
            setLoading(true);
            try {
                let response = await client.get(`/${playerName}-shooting-splits`);
    
                const playerData = response.data[playerName];

                setData({
                    FG2A: {
                        value: playerData.FG2A,
                    },
                    FG2M: {
                        value: playerData.FG2M,
                    },
                    FG2_PCT: {
                        value: playerData.FG2_PCT,
                    },
                    FG2A_FREQUENCY: {
                        value: playerData.FG2A_FREQUENCY,
                    },
                    FG3A: {
                        value: playerData.FG3A,
                    },
                    FG3M: {
                        value: playerData.FG3M,
                    },
                    FG3_PCT: {
                        value: playerData.FG3_PCT,
                    },
                    FG3A_FREQUENCY: {
                        value: playerData.FG3A_FREQUENCY,
                    },
                    FG_PCT: {
                        value: playerData.FG_PCT,
                    },
                    EFG_PCT: {
                        value: playerData.EFG_PCT,
                    }
                });
            } catch (error) {
                console.error('API Error:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchPlayerStatistics();
    }, [playerName]);

    return (
        <div className="bg-neutral-700 shadow-lg overflow-y-auto h-full">
        {loading && (
            <div className="flex items-center justify-center h-full">
                <div>Loading...</div>
            </div>
        )}
        {error && (
            <div className="flex items-center justify-center h-full">
                <div className="text-red-500">Error loading team statistics</div>
            </div>
        )}
        {data && (
            <div className="p-4">
                
                
                {/* Shooting Splits Table */}
                <div className="overflow-x-auto bg-neutral-800 rounded-lg p-4 mb-6">
                    <table className="min-w-full">
                        <thead>
                    <tr className="border-b border-gray-700">
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">FG2M</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">FG2A</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">FG2_PCT</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">FG2 Freq</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">FG3A</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">FG3M</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">FG3_PCT</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">FG3 Freq</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">FG%</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">eFG%</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="px-4 py-2 text-white">
                            {data.FG2M.value}
                        </td>
                        <td className="px-4 py-2 text-white">
                            {data.FG2A.value}
                        </td>
                        <td className="px-4 py-2 text-white">
                            {data.FG2_PCT.value}
                        </td>
                        <td className="px-4 py-2 text-white">
                            {data.FG2A_FREQUENCY.value}
                        </td>
                        <td className="px-4 py-2 text-white">
                            {data.FG3A.value}
                        </td>
                        <td className="px-4 py-2 text-white">
                            {data.FG3M.value}
                        </td>
                        <td className="px-4 py-2 text-white">
                            {data.FG3_PCT.value}
                        </td>
                        <td className="px-4 py-2 text-white">
                            {data.FG3A_FREQUENCY.value}
                        </td>
                        <td className="px-4 py-2 text-white">
                            {data.FG_PCT.value}
                        </td>
                        <td className="px-4 py-2 text-white">
                            {data.EFG_PCT.value}
                            </td>
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