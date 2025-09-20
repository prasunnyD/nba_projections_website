import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiBaseUrl, logApiCall } from '../utils/apiConfig';

const NFLTeamDropdown = ({ onTeamSelect, onRosterData, onPlayerSelect, onPlayerPosition }) => {
    const [selectedTeam, setSelectedTeam] = useState('');
    const [roster, setRoster] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [openPositions, setOpenPositions] = useState(new Set());
    const [openCategories, setOpenCategories] = useState(new Set());

    // NFL Teams with their cities
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

    // Position groupings for offense and defense
    const positionGroups = {
        'Offense': ['QB', 'RB', 'WR', 'TE'],
        'Defense': ['DE', 'DT', 'S', 'CB']
    };

    const handleTeamChange = async (event) => {
        const selectedCity = event.target.value;
        setSelectedTeam(selectedCity);
        
        if (selectedCity) {
            setLoading(true);
            setError(null);
            try {
                const apiUrl = `nfl/team-roster/${selectedCity}`;
                logApiCall('GET', apiUrl);
                
                const client = axios.create({ baseURL: getApiBaseUrl() });
                const response = await client.get(apiUrl);
                
                // Extract the roster array
                const rosterArray = response.data?.players || [];
                setRoster(rosterArray);
                
                // Notify parent components
                onTeamSelect(selectedCity);
                onRosterData(rosterArray);
            } catch (err) {
                console.error('Error fetching roster:', err);
                setError('Failed to load roster. Please try again.');
                setRoster([]);
            } finally {
                setLoading(false);
            }
        } else {
            setRoster([]);
            setSelectedPlayer(null);
            onTeamSelect('');
            onRosterData([]);
        }
    };

    const handlePlayerClick = (player) => {
        setSelectedPlayer(player);
        if (onPlayerSelect) {
            onPlayerSelect(player.player_name);
            onPlayerPosition(player.position);
        }
    };

    const togglePosition = (position) => {
        const newOpenPositions = new Set(openPositions);
        if (newOpenPositions.has(position)) {
            newOpenPositions.delete(position);
        } else {
            newOpenPositions.add(position);
        }
        setOpenPositions(newOpenPositions);
    };

    const toggleCategory = (category) => {
        const newOpenCategories = new Set(openCategories);
        if (newOpenCategories.has(category)) {
            newOpenCategories.delete(category);
        } else {
            newOpenCategories.add(category);
        }
        setOpenCategories(newOpenCategories);
    };

    const groupPlayersByPosition = (players) => {
        return players.reduce((groups, player) => {
            const position = player.position || 'Unknown';
            if (!groups[position]) {
                groups[position] = [];
            }
            groups[position].push(player);
            return groups;
        }, {});
    };

    const groupPlayersByCategory = (players) => {
        const groupedByPosition = groupPlayersByPosition(players);
        const result = {};
        
        Object.keys(positionGroups).forEach(category => {
            result[category] = {};
            positionGroups[category].forEach(position => {
                if (groupedByPosition[position]) {
                    result[category][position] = groupedByPosition[position];
                }
            });
        });
        
        return result;
    };

    const renderRoster = () => {
        if (loading) return <p className="text-gray-400">Loading roster...</p>;
        if (error) return <p className="text-red-500">{error}</p>;
        if (roster.length > 0) {
            const groupedPlayers = groupPlayersByCategory(roster);
            
            return (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        {selectedTeam} Roster
                    </h3>
                    <div className="space-y-3">
                        {Object.keys(positionGroups).map((category) => {
                            const isCategoryOpen = openCategories.has(category);
                            const categoryPlayers = groupedPlayers[category];
                            const hasPlayers = Object.keys(categoryPlayers).length > 0;
                            
                            if (!hasPlayers) return null;
                            
                            return (
                                <div key={category} className="border-2 border-gray-500 rounded-xl overflow-hidden shadow-lg">
                                    <button
                                        onClick={() => toggleCategory(category)}
                                        className="w-full px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-blue-700 hover:to-blue-800 text-left text-white font-bold text-lg flex justify-between items-center transition-all duration-200 shadow-md"
                                    >
                                        <span className="flex items-center">
                                            <span className="mr-3 text-xl">
                                                {category === 'Offense' ? '⚡' : '🛡️'}
                                            </span>
                                            {category}
                                        </span>
                                        <span className={`transform transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`}>
                                            ▼
                                        </span>
                                    </button>
                                    {isCategoryOpen && (
                                        <div className="bg-neutral-800 border-t-2 border-blue-500">
                                            <div className="space-y-1 p-2">
                                                {positionGroups[category].map((position) => {
                                                    const isPositionOpen = openPositions.has(position);
                                                    const players = categoryPlayers[position] || [];
                                                    
                                                    if (players.length === 0) return null;
                                                    
                                                    return (
                                                        <div key={position} className="border border-gray-500 rounded-lg overflow-hidden bg-neutral-700">
                                                            <button
                                                                onClick={() => togglePosition(position)}
                                                                className="w-full px-4 py-3 bg-neutral-600 hover:bg-neutral-500 text-left text-gray-200 font-semibold flex justify-between items-center transition-colors duration-150"
                                                            >
                                                                <span>
                                                                    {position} ({players.length})
                                                                </span>
                                                                <span className={`transform transition-transform duration-150 ${isPositionOpen ? 'rotate-180' : ''}`}>
                                                                    ▼
                                                                </span>
                                                            </button>
                                                            {isPositionOpen && (
                                                                <div className="bg-neutral-800 border-t border-gray-600">
                                                                    <ul className="divide-y divide-gray-600">
                                                                        {players.map((player, index) => (
                                                                            <li
                                                                                key={index}
                                                                                className={`px-4 py-2 text-gray-300 hover:text-white hover:bg-neutral-700 cursor-pointer transition-colors ${
                                                                                    selectedPlayer === player ? 'bg-blue-600 text-white' : ''
                                                                                }`}
                                                                                onClick={() => handlePlayerClick(player)}
                                                                            >
                                                                                {player.player_name || 'Unknown'}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }
        return selectedTeam ? <p className="text-gray-400">No roster data available.</p> : null;
    };

    return (
        <div className="w-full">
            <div className="mb-4">
                <label htmlFor="team-select" className="block text-sm font-medium text-white mb-2">
                    Select NFL Team
                </label>
                <select
                    id="team-select"
                    value={selectedTeam}
                    onChange={handleTeamChange}
                    className="w-full p-2 bg-neutral-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Choose a team...</option>
                    {nflTeams.map((team, index) => (
                        <option key={index} value={team.name}>
                            {team.city} {team.name}
                        </option>
                    ))}
                </select>
            </div>
            
            {renderRoster()}
        </div>
    );
};

export default NFLTeamDropdown; 