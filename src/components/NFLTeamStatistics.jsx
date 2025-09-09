import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { getApiBaseUrl, logApiCall } from '../utils/apiConfig';

const NFLTeamStatistics = () => {
    const [selectedTeam, setSelectedTeam] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const nflTeams = [
        { city: 'Arizona', name: 'Cardinals' },
        { city: 'Atlanta', name: 'Falcons' },
        { city: 'Baltimore', name: 'Ravens' },
        { city: 'Buffalo', name: 'Bills' },
        { city: 'Carolina', name: 'Panthers' },
        { city: 'Chicago', name: 'Bears' },
        { city: 'Cincinnati', name: 'Bengals' },
        { city: 'Cleveland', name: 'Browns' },
        { city: 'Dallas', name: 'Cowboys' },
        { city: 'Denver', name: 'Broncos' },
        { city: 'Detroit', name: 'Lions' },
        { city: 'Green Bay', name: 'Packers' },
        { city: 'Houston', name: 'Texans' },
        { city: 'Indianapolis', name: 'Colts' },
        { city: 'Jacksonville', name: 'Jaguars' },
        { city: 'Kansas City', name: 'Chiefs' },
        { city: 'Las Vegas', name: 'Raiders' },
        { city: 'Los Angeles Chargers', name: 'Chargers' },
        { city: 'Los Angeles Rams', name: 'Rams' },
        { city: 'Miami', name: 'Dolphins' },
        { city: 'Minnesota', name: 'Vikings' },
        { city: 'New England', name: 'Patriots' },
        { city: 'New Orleans', name: 'Saints' },
        { city: 'New York Giants', name: 'Giants' },
        { city: 'New York Jets', name: 'Jets' },
        { city: 'Philadelphia', name: 'Eagles' },
        { city: 'Pittsburgh', name: 'Steelers' },
        { city: 'San Francisco', name: '49ers' },
        { city: 'Seattle', name: 'Seahawks' },
        { city: 'Tampa Bay', name: 'Buccaneers' },
        { city: 'Tennessee', name: 'Titans' },
        { city: 'Washington', name: 'Commanders' }
    ];

    const client = axios.create({
        baseURL: getApiBaseUrl()
    });

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
                const apiUrl = `nfl/team-defense-stats/${selectedTeam}`;
                logApiCall('GET', apiUrl);
                
                let response = await client.get(apiUrl);
    
                setData(response.data?.stats);

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
                    {nflTeams.map((team, index) => (
                        <option key={index} value={team.name}>
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
                    <table className="min-w-full bg-gray-800">
                        <thead className="bg-gray-900">
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
                            <tr>
                                <td className="px-4 py-2 text-left text-white">
                                    Yards Allowed
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 text-center">
                                    #1
                                </td>
                                <td className="px-4 py-2 text-left text-white">
                                    {data.yardsAllowed.value}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 text-left text-white">
                                    Average Sack Yards
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 text-center">
                                    #1
                                </td>
                                <td className="px-4 py-2 text-left text-white">
                                    {data.avgSackYards}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 text-left text-white">
                                    Average Stuff Yards
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 text-center">
                                    #1
                                </td>
                                <td className="px-4 py-2 text-left text-white">
                                    {data.avgStuffYards}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 text-left text-white">
                                    Tackles For Loss
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 text-center">
                                    #1
                                </td>
                                <td className="px-4 py-2 text-left text-white">
                                    {data.tacklesForLoss}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 text-left text-white">
                                    Passes Defended
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 text-center">
                                    #1
                                </td>
                                <td className="px-4 py-2 text-left text-white">
                                    {data.passesDefended}
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

export default NFLTeamStatistics;