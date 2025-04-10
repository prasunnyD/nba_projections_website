import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const TeamStatistics = ({ teamName }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const client = axios.create({
        baseURL: "'https://api.sharpr-analytics.com'"
    });

    useEffect(() => {

        // Only fetch if playerName is not empty
        if (!teamName) return;

        const fetchTeamStatistics = async () => {
            setLoading(true);
            try {
                let response = await client.get(`/${teamName}-defense-stats`);
    
                const teamData = response.data[teamName];

                setData({
                    Defense: {
                        DefensiveRating: {
                            value: teamData.DEF_RATING,
                            rank: teamData.DEF_RATING_RANK
                        },
                        OPP_PTS_PAINT: {
                            value: teamData.OPP_PTS_PAINT,
                            rank: teamData.OPP_PTS_PAINT_RANK
                        }
                    },
                    Opponent: {
                        OPP_FG_PCT: {
                            value: teamData.OPP_FG_PCT,
                            rank: teamData.OPP_FG_PCT_RANK
                        },
                        OPP_REB: {
                            value: teamData.OPP_REB,
                            rank: teamData.OPP_REB_RANK
                        },
                        OPP_AST: {
                            value: teamData.OPP_AST,
                            rank: teamData.OPP_AST_RANK
                        },
                        OPP_FG3A: {
                            value: teamData.OPP_FG3A,
                            rank: teamData.OPP_FG3A_RANK
                        },
                        OPP_FG3_PCT: {
                            value: teamData.OPP_FG3_PCT,
                            rank: teamData.OPP_FG3_PCT_RANK
                        }
                    },
                    FourFactor: {
                        Pace: {
                            value: teamData.PACE,
                            rank: teamData.PACE_RANK
                        },
                        OPP_EFG_PCT: {
                            value: teamData.OPP_EFG_PCT,
                            rank: teamData.OPP_EFG_PCT_RANK
                        },
                        OPP_FTA_RATE: {
                            value: teamData.OPP_FTA_RATE,
                            rank: teamData.OPP_FTA_RATE_RANK
                        },
                        OPP_OREB_PCT: {
                            value: teamData.OPP_OREB_PCT,
                            rank: teamData.OPP_OREB_PCT_RANK
                        }
                    }
                });
            } catch (error) {
                console.error('API Error:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchTeamStatistics();
    }, [teamName]);

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
                <h1 style={{ color: 'white' }} className="text-2xl font-bold mb-4">{teamName} Defensive Statistics</h1>
                
                {/* Stats Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statistic
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rank
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Value
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {[
                                ...Object.entries(data.Defense).map(([key, stat]) => ({
                                    name:key,
                                    ...stat
                                })),
                                ...Object.entries(data.Opponent).map(([key, stat]) => ({
                                    name: key,
                                    ...stat
                                })),
                                ...Object.entries(data.FourFactor).map(([key, stat]) => ({
                                    name: key,
                                    ...stat
                                }))
                            ].map((stat, index) => (
                                <tr key={stat.name} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {stat.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                        #{stat.rank}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                        {typeof stat.value === 'number'
                                            ? (stat.name.includes('PCT') ? (stat.value * 100).toFixed(2) + '%' : stat.value.toFixed(2))
                                            : stat.value
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
    
                    {/* Keep the radar chart if desired */}
                    <div className="bg-neutral-700 shadow p-4 rounded-lg mt-6">
                        <h2 style={{ color: 'white' }} className="text-xl font-semibold mb-4">Defensive Profile</h2>
                        <Plot
                            data={[
                                {
                                    type: 'scatterpolar',
                                    r: [
                                        31 - data.Defense.DefensiveRating.rank,
                                        31 - data.Opponent.OPP_FG3A.rank,
                                        31 - data.Opponent.OPP_REB.rank,
                                        31 - data.Opponent.OPP_AST.rank,
                                        31 - data.FourFactor.Pace.rank
                                    ],
                                    theta: [
                                        'Defense Rating',
                                        'Opp 3PA',
                                        'Opp Rebounds',
                                        'Opp Assists',
                                        'Pace'
                                    ],
                                    fill: 'toself',
                                    name: teamName
                                }
                            ]}
                            layout={{
                                polar: {
                                    radialaxis: {
                                        visible: true,
                                        range: [0, 30]
                                    }
                                },
                                showlegend: false,
                                width: 500,
                                height: 500
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamStatistics;