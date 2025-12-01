import React, { useState, useEffect } from 'react';
import { api, logApiCall } from '../utils/apiConfig';

// Colorblind-friendly gradient function
const getRankColor = (rank, totalTeams = 30) => {
    if (!rank || rank === 0) return '#6B7280'; // gray for no rank
    
    // Normalize rank to 0-1 scale (1 is best, 30 is worst)
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
    // Use black text for ranks 13-30 (lighter backgrounds)
    return rank <= 12 ? 'white' : 'black';
};

// NBA Teams mapping
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
    { city: 'Los Angeles Clippers', name: 'Clippers' },
    { city: 'Los Angeles Lakers', name: 'Lakers' },
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

// Convert team name from dropdown format (city) to API format (full team name)
const convertToAPIFormat = (teamName) => {
    if (!teamName) return '';
    
    // Find matching team in nbaTeams array
    const team = nbaTeams.find(t => t.city === teamName);
    if (team) {
        // Return full team name format: "City Team"
        return `${team.city} ${team.name}`;
    }
    
    // Fallback: if already in full format, return as is
    return teamName;
};

const NBATeamOffensiveStatistics = ({ selectedTeam }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const client = api;

    useEffect(() => {
        // Only fetch if selectedTeam is not empty
        if (!selectedTeam) {
            setData(null);
            setError(null);
            return;
        }

        const fetchTeamStatistics = async () => {
            setLoading(true);
            setError(null);
            try {
                // Convert team name to API format
                const apiTeamName = convertToAPIFormat(selectedTeam);
                const apiUrl = `nba/offense-stats/${encodeURIComponent(apiTeamName)}`;
                logApiCall('GET', apiUrl);
                
                let response = await client.get(apiUrl);
    
                // The response has the team name as a key
                const teamData = response.data[apiTeamName] || response.data[Object.keys(response.data)[0]];
                setData(teamData);

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
            {!selectedTeam && (
                <div className="flex items-center justify-center h-full">
                    <div className="text-gray-400">Select a team to view offensive statistics</div>
                </div>
            )}
            {loading && (
                <div className="flex items-center justify-center h-full">
                    <div className="text-white">Loading...</div>
                </div>
            )}
            {error && (
                <div className="flex items-center justify-center h-full">
                    <div className="text-red-500">Error loading team offensive statistics</div>
                </div>
            )}
            {data && (
                <div className="p-4">
                    <h1 style={{ color: 'white' }} className="text-2xl font-bold mb-4">{data.team_name || selectedTeam} Offensive Statistics</h1>
                
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
                            <tr style={{ backgroundColor: getRankColor(data.off_rating_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.off_rating_rank) }}>
                                    Offensive Rating
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.off_rating_rank) }}>
                                    {data.off_rating_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.off_rating_rank) }}>
                                    {data.off_rating}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.reb_pct_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.reb_pct_rank) }}>
                                    Rebound Percentage
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.reb_pct_rank) }}>
                                    {data.reb_pct_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.reb_pct_rank) }}>
                                    {(data.reb_pct * 100).toFixed(1)}%
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.ast_pct_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.ast_pct_rank) }}>
                                    Assist Percentage
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.ast_pct_rank) }}>
                                    {data.ast_pct_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.ast_pct_rank) }}>
                                    {(data.ast_pct * 100).toFixed(1)}%
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.pace_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.pace_rank) }}>
                                    Pace
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.pace_rank) }}>
                                    {data.pace_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.pace_rank) }}>
                                    {data.pace}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.efg_pct_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.efg_pct_rank) }}>
                                    Effective Field Goal Percentage
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.efg_pct_rank) }}>
                                    {data.efg_pct_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.efg_pct_rank) }}>
                                    {(data.efg_pct * 100).toFixed(1)}%
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.fta_rate_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.fta_rate_rank) }}>
                                    Free Throw Attempt Rate
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.fta_rate_rank) }}>
                                    {data.fta_rate_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.fta_rate_rank) }}>
                                    {(data.fta_rate * 100).toFixed(1)}%
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.tm_tov_pct_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.tm_tov_pct_rank) }}>
                                    Team Turnover Percentage
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.tm_tov_pct_rank) }}>
                                    {data.tm_tov_pct_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.tm_tov_pct_rank) }}>
                                    {(data.tm_tov_pct * 100).toFixed(1)}%
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.oreb_pct_rank) }}>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.oreb_pct_rank) }}>
                                    Offensive Rebound Percentage
                                </td>
                                <td className="px-6 py-4 text-md text-center font-bold" style={{ color: getTextColor(data.oreb_pct_rank) }}>
                                    {data.oreb_pct_rank}
                                </td>
                                <td className="px-4 py-2 text-left font-semibold" style={{ color: getTextColor(data.oreb_pct_rank) }}>
                                    {(data.oreb_pct * 100).toFixed(1)}%
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

export default NBATeamOffensiveStatistics;

