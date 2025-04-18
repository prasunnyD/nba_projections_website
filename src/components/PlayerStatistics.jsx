import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const PlayerStatistics = ({ playerName }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const client = axios.create({
        baseURL: "https://api.sharpr-analytics.com"
    });

    useEffect(() => {

        // Only fetch if playerName is not empty
        if (!playerName) return;

        const fetchPlayerStatistics = async () => {
            setLoading(true);
            try {
                let response = await client.get(`/${playerName}-shooting-splits`);
                let response2 = await client.get(`/${playerName}-headline-stats`);
    
                const playerData = response.data[playerName];
                const headlineStats = response2.data[playerName];
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
                    },
                    PTS: {
                        value: headlineStats.PTS,
                    },
                    REB: {
                        value: headlineStats.REB,
                    },
                    AST: {
                        value: headlineStats.AST,
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
                
                {/* Shooting Splits Table */}
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
                        <td className="px-4 py-2 text-left text-white">
                            {data.FG2M.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data.FG2A.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data.FG2_PCT.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data.FG2A_FREQUENCY.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data.FG3M.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data.FG3A.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data.FG3_PCT.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data.FG3A_FREQUENCY.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data.FG_PCT.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
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