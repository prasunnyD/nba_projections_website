import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { api, logApiCall } from '../utils/apiConfig';

const TeamStatistics = () => {
    const [selectedTeam, setSelectedTeam] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // NBA Teams with their cities
    const nbaTeams = [
        { city: 'Atlanta', name: 'Hawks' },
        { city: 'Boston', name: 'Celtics' },
        { city: 'Brooklyn', name: 'Nets' },
        { city: 'Charlotte', name: 'Hornets' },
        { city: 'Chicago', name: 'Bulls' },
        { city: 'Cleveland', name: 'Cavaliers' },
        { city: 'Dallas', name: 'Mavericks' },
        { city: 'Denver', name: 'Nuggets' },
        { city: 'Detroit', name: 'Pistons' },
        { city: 'Golden State', name: 'Warriors' },
        { city: 'Houston', name: 'Rockets' },
        { city: 'Indiana', name: 'Pacers' },
        { city: 'Los Angeles Lakers', name: 'Lakers' },
        { city: 'Los Angeles Clippers', name: 'Clippers' },
        { city: 'Memphis', name: 'Grizzlies' },
        { city: 'Miami', name: 'Heat' },
        { city: 'Milwaukee', name: 'Bucks' },
        { city: 'Minnesota', name: 'Timberwolves' },
        { city: 'New Orleans', name: 'Pelicans' },
        { city: 'New York', name: 'Knicks' },
        { city: 'Oklahoma City', name: 'Thunder' },
        { city: 'Orlando', name: 'Magic' },
        { city: 'Philadelphia', name: '76ers' },
        { city: 'Phoenix', name: 'Suns' },
        { city: 'Portland', name: 'Trail Blazers' },
        { city: 'Sacramento', name: 'Kings' },
        { city: 'San Antonio', name: 'Spurs' },
        { city: 'Toronto', name: 'Raptors' },
        { city: 'Utah', name: 'Jazz' },
        { city: 'Washington', name: 'Wizards' }
    ];

    const client = api;

    const handleTeamChange = (event) => {
        const teamCity = event.target.value;
        setSelectedTeam(teamCity);
        setData(null);
        setError(null);
    };

    useEffect(() => {
        // Only fetch if selectedTeam is not empty
        if (!selectedTeam) return;

        const fetchTeamStatistics = async () => {
            setLoading(true);
            try {
                const apiUrl = `/${selectedTeam}-defense-stats`;
                logApiCall('GET', apiUrl);
                
                let response = await client.get(apiUrl);
    
                const teamData = response.data[selectedTeam];

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
    }, [selectedTeam]);

    return (
        <div className="bg-neutral-700 shadow-lg overflow-y-auto h-full">
            {/* Team Selection Dropdown */}
            <div className="p-4 border-b border-gray-600">
                <label htmlFor="team-stats-select" className="block text-sm font-medium text-white mb-2">
                    Select Team for Statistics
                </label>
                <select
                    id="team-stats-select"
                    value={selectedTeam}
                    onChange={handleTeamChange}
                    className="w-full p-2 bg-neutral-600 text-white border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Choose a team...</option>
                    {nbaTeams.map((team, index) => (
                        <option key={index} value={team.city}>
                            {team.city} {team.name}
                        </option>
                    ))}
                </select>
            </div>

            {loading && (
                <div className="flex items-center justify-center h-full">
                    <div className="text-white">Loading...</div>
                </div>
            )}
            {error && (
                <div className="flex items-center justify-center h-full">
                    <div className="text-red-500">Error loading team statistics</div>
                </div>
            )}
            {data && (
                <div className="p-4">
                    <h1 style={{ color: 'white' }} className="text-2xl font-bold mb-4">{selectedTeam} Defensive Statistics</h1>
                
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
                                    name: selectedTeam
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