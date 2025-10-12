import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { getApiBaseUrl, logApiCall } from '../utils/apiConfig';

// Colorblind-friendly gradient function
const getRankColor = (rank, totalTeams = 32) => {
    if (!rank || rank === 0) return '#6B7280'; // gray for no rank
    
    // Normalize rank to 0-1 scale (1 is best, 32 is worst)
    const normalizedRank = (rank - 1) / (totalTeams - 1);
    
    // Colorblind-friendly blue to light gray to red gradient
    // Blue (good rank) -> Light Gray -> Red (bad rank)
    if (normalizedRank <= 0.5) {
        // Blue to Light Gray
        const t = normalizedRank * 2;
        const r = Math.round(59 + (200 - 59) * t);
        const g = Math.round(130 + (200 - 130) * t);
        const b = Math.round(246 + (200 - 246) * t);
        return `rgb(${r}, ${g}, ${b})`;
    } else {
        // Light Gray to Red
        const t = (normalizedRank - 0.5) * 2;
        const r = Math.round(200 + (220 - 200) * t);
        const g = Math.round(200 + (20 - 200) * t);
        const b = Math.round(200 + (20 - 200) * t);
        return `rgb(${r}, ${g}, ${b})`;
    }
};

// Helper function to determine text color based on background brightness
const getTextColor = (rank) => {
    if (!rank || rank === 0) return 'white';
    
    // Use white text for ranks 1-12 (darker backgrounds)
    // Use black text for ranks 13-32 (lighter backgrounds)
    return rank <= 12 ? 'white' : 'black';
};

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
                            <tr style={{ backgroundColor: getRankColor(data.epa_per_play_allowed_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.epa_per_play_allowed_rank) }}>
                                    EPA per Play Allowed
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.epa_per_play_allowed_rank) }}>
                                    {data.epa_per_play_allowed_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.epa_per_play_allowed_rank) }}>
                                    {data.epa_per_play_allowed}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.yards_per_play_allowed_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.yards_per_play_allowed_rank) }}>
                                    Yards Per Play Allowed
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.yards_per_play_allowed_rank) }}>
                                    {data.yards_per_play_allowed_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.yards_per_play_allowed_rank) }}>
                                    {data.yards_per_play_allowed}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.down_conversion_rate_allowed_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.down_conversion_rate_allowed_rank) }}>
                                    Down Conversion Rate Allowed
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.down_conversion_rate_allowed_rank) }}>
                                    {data.down_conversion_rate_allowed_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.down_conversion_rate_allowed_rank) }}>
                                    {data.down_conversion_rate_allowed}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.success_rate_allowed_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.success_rate_allowed_rank) }}>
                                    Success Rate Allowed
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.success_rate_allowed_rank) }}>
                                    {data.success_rate_allowed_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.success_rate_allowed_rank) }}>
                                    {data.success_rate_allowed}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.rush_success_rate_allowed_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.rush_success_rate_allowed_rank) }}>
                                    Rush Success Rate Allowed
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.rush_success_rate_allowed_rank) }}>
                                    {data.rush_success_rate_allowed_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.rush_success_rate_allowed_rank) }}>
                                    {data.rush_success_rate_allowed}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.rush_stuff_rate_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.rush_stuff_rate_rank) }}>
                                    Rush Stuff Rate
                                </td>
                                <td className="px-6 py-4 text-center font-bold" style={{ color: getTextColor(data.rush_stuff_rate_rank) }}>
                                    {data.rush_stuff_rate_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.rush_stuff_rate_rank) }}>
                                    {data.rush_stuff_rate}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.yards_before_contact_per_rb_rush_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.yards_before_contact_per_rb_rush_rank) }}>
                                    Yards Before Contact Per Rush
                                </td>
                                <td className="px-6 py-4 text-center font-bold" style={{ color: getTextColor(data.yards_before_contact_per_rb_rush_rank) }}>
                                    {data.yards_before_contact_per_rb_rush_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.yards_before_contact_per_rb_rush_rank) }}>
                                    {data.yards_before_contact_per_rb_rush}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.dropback_success_rate_allowed_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.dropback_success_rate_allowed_rank) }}>
                                    Dropback Success Rate Allowed
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.dropback_success_rate_allowed_rank) }}>
                                    {data.dropback_success_rate_allowed_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.dropback_success_rate_allowed_rank) }}>
                                    {data.dropback_success_rate_allowed}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.pressure_rate_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.pressure_rate_rank) }}>
                                    Pressure Rate
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.pressure_rate_rank) }}>
                                    {data.pressure_rate_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.pressure_rate_rank) }}>
                                    {data.pressure_rate}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.scramble_rate_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.scramble_rate_rank) }}>
                                    Scramble Rate
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.scramble_rate_rank) }}>
                                    {data.scramble_rate_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.scramble_rate_rank) }}>
                                    {data.scramble_rate}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.blitz_rate_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.blitz_rate_rank) }}>
                                    Blitz Rate
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.blitz_rate_rank) }}>
                                    {data.blitz_rate_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.blitz_rate_rank) }}>
                                    {data.blitz_rate}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.sacks_rate_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.sacks_rate_rank) }}>
                                    Sacks Rate
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.sacks_rate_rank) }}>
                                    {data.sacks_rate_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.sacks_rate_rank) }}>
                                    {data.sacks_rate}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.explosive_play_rate_allowed_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.explosive_play_rate_allowed_rank) }}>
                                    Explosive Play Rate Allowed
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.dropback_success_rate_allowed_rank) }}>
                                    {data.explosive_play_rate_allowed_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.dropback_success_rate_allowed_rank) }}>
                                    {data.explosive_play_rate_allowed}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.man_rate_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.man_rate_rank) }}>
                                    Man Rate
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.man_rate_rank) }}>
                                    {data.man_rate_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.man_rate_rank) }}>
                                    {data.man_rate}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.zone_rate_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.zone_rate_rank) }}>
                                    Zone Rate
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.zone_rate_rank) }}>
                                    {data.zone_rate_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.zone_rate_rank) }}>
                                    {data.zone_rate}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.adot_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.adot_rank) }}>
                                    ADOT
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.adot_rank) }}>
                                    {data.adot_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.adot_rank) }}>
                                    {data.adot}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.int_rate_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.int_rate_rank) }}>
                                    Interception Rate
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.int_rate_rank) }}>
                                    {data.int_rate_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.int_rate_rank) }}>
                                    {data.int_rate}
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