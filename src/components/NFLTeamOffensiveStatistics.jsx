import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiBaseUrl, logApiCall } from '../utils/apiConfig';
import { getNFLTeamLogoUrl, getCityForNFLLogo } from '../helpers/nflLogoUtils';

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

const NFLTeamOffensiveStatistics = ({ selectedTeam }) => {
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
                const apiUrl = `nfl/team-offense-stats/${selectedTeam}`;
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
            {/* <div className="p-4 border-b border-gray-600">
                <label htmlFor="team-offense-stats-select" className="block text-sm font-medium text-white mb-2">
                    Select Team for Offensive Statistics
                </label>
                <select
                    id="team-offense-stats-select"
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
            </div> */}

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
                <div className="p-2 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                        {(() => {
                            const fullTeamName = nflTeams.find(t => t.name === selectedTeam) 
                                ? `${nflTeams.find(t => t.name === selectedTeam).city} ${selectedTeam}`
                                : selectedTeam;
                            const logoUrl = getNFLTeamLogoUrl(getCityForNFLLogo(fullTeamName));
                            return logoUrl ? (
                                <img 
                                    src={logoUrl} 
                                    alt={`${selectedTeam} logo`}
                                    className="w-10 h-10 md:w-16 md:h-16 object-contain flex-shrink-0"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : null;
                        })()}
                        <h1 style={{ color: 'white' }} className="text-lg md:text-xl lg:text-2xl font-bold">{selectedTeam} Offensive Statistics</h1>
                    </div>
                
                {/* Stats Table */}
                <div className="overflow-x-auto -mx-2 md:mx-0">
                    <div className="inline-block min-w-full align-middle">
                        <table className="min-w-full bg-gray-800">
                            <thead className="bg-gray-900">
                                <tr>
                                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statistic
                                    </th>
                                    <th className="px-3 md:px-6 py-2 md:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rank
                                    </th>
                                    <th className="px-3 md:px-6 py-2 md:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Value
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr style={{ backgroundColor: getRankColor(data.epa_per_play_rank) }}>
                                    <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.epa_per_play_rank) }}>
                                        EPA per Play
                                    </td>
                                    <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm text-center font-bold" style={{ color: getTextColor(data.epa_per_play_rank) }}>
                                        {data.epa_per_play_rank}
                                    </td>
                                    <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.epa_per_play_rank) }}>
                                        {data.epa_per_play}
                                    </td>
                                </tr>
                                <tr style={{ backgroundColor: getRankColor(data.success_rate_rank) }}>
                                    <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.success_rate_rank) }}>
                                        Success Rate
                                    </td>
                                    <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm text-center font-bold" style={{ color: getTextColor(data.success_rate_rank) }}>
                                        {data.success_rate_rank}
                                    </td>
                                    <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.success_rate_rank) }}>
                                    {data.success_rate}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.rush_success_rate_rank) }}>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.rush_success_rate_rank) }}>
                                    Rush Success Rate
                                </td>
                                <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm text-center font-bold" style={{ color: getTextColor(data.rush_success_rate_rank) }}>
                                    {data.rush_success_rate_rank}
                                </td>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.rush_success_rate_rank) }}>
                                    {data.rush_success_rate}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.dropback_success_rate_rank) }}>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.dropback_success_rate_rank) }}>
                                    Dropback Success Rate
                                </td>
                                <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm text-center font-bold" style={{ color: getTextColor(data.dropback_success_rate_rank) }}>
                                    {data.dropback_success_rate_rank}
                                </td>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.dropback_success_rate_rank) }}>
                                    {data.dropback_success_rate}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.passingYardsPerGame_rank) }}>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.passingYardsPerGame_rank) }}>
                                    Passing Yards Per Game
                                </td>
                                <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm text-center font-bold" style={{ color: getTextColor(data.passingYardsPerGame_rank) }}>
                                    {data.passingYardsPerGame_rank}
                                </td>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.passingYardsPerGame_rank) }}>
                                    {data.passingYardsPerGame}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.yardsPerCompletion_rank) }}>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.yardsPerCompletion_rank) }}>
                                    Yards Per Completion
                                </td>
                                <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm text-center font-bold" style={{ color: getTextColor(data.yardsPerCompletion_rank) }}>
                                    {data.yardsPerCompletion_rank}
                                </td>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.yardsPerCompletion_rank) }}>
                                    {data.yardsPerCompletion}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.sacks_rank) }}>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.sacks_rank) }}>
                                    Sacks Rate Allowed
                                </td>
                                <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm text-center font-bold" style={{ color: getTextColor(data.sacks_rank) }}>
                                    {data.sacks_rank}
                                </td>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.sacks_rank) }}>
                                    {data.sacks}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.scramble_rate_rank) }}>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.scramble_rate_rank) }}>
                                    Scramble Rate
                                </td>
                                <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm text-center font-bold" style={{ color: getTextColor(data.scramble_rate_rank) }}>
                                    {data.scramble_rate_rank}
                                </td>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.scramble_rate_rank) }}>
                                    {data.scramble_rate}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.rushingAttempts_rank) }}>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.rushingAttempts_rank) }}>
                                    Rushing Attempts
                                </td>
                                <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm text-center font-bold" style={{ color: getTextColor(data.rushingAttempts_rank) }}>
                                    {data.rushingAttempts_rank}
                                </td>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.rushingAttempts_rank) }}>
                                    {data.rushingAttempts}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.yardsPerRushAttempt_rank) }}>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.yardsPerRushAttempt_rank) }}>
                                    Yards Per Rush Attempt
                                </td>
                                <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm text-center font-bold" style={{ color: getTextColor(data.yardsPerRushAttempt_rank) }}>
                                    {data.yardsPerRushAttempt_rank}
                                </td>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.yardsPerRushAttempt_rank) }}>
                                    {data.yardsPerRushAttempt}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.passingAttempts_rank) }}>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.passingAttempts_rank) }}>
                                    Passing Attempts
                                </td>
                                <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm text-center font-bold" style={{ color: getTextColor(data.passingAttempts_rank) }}>
                                    {data.passingAttempts_rank}
                                </td>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.passingAttempts_rank) }}>
                                    {data.passingAttempts}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.adot_rank) }}>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.adot_rank) }}>
                                    ADOT
                                </td>
                                <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm text-center font-bold" style={{ color: getTextColor(data.adot_rank) }}>
                                    {data.adot_rank}
                                </td>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.adot_rank) }}>
                                    {data.adot}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: getRankColor(data.int_rate_rank) }}>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.int_rate_rank) }}>
                                    Interception Rate
                                </td>
                                <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm text-center font-bold" style={{ color: getTextColor(data.int_rate_rank) }}>
                                    {data.int_rate_rank}
                                </td>
                                <td className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold" style={{ color: getTextColor(data.int_rate_rank) }}>
                                    {data.int_rate}
                                </td>
                            </tr>
                        </tbody>
                        </table>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
};

export default NFLTeamOffensiveStatistics;
