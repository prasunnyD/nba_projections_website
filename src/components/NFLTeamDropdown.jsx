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

    const renderRoster = () => {
        if (loading) return <p className="text-gray-400">Loading roster...</p>;
        if (error) return <p className="text-red-500">{error}</p>;
        if (roster.length > 0) {
            const groupedPlayers = groupPlayersByPosition(roster);
            const sortedPositions = Object.keys(groupedPlayers).sort();
            
            return (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        {selectedTeam} Roster
                    </h3>
                    <div className="space-y-2">
                        {sortedPositions.map((position) => {
                            const isOpen = openPositions.has(position);
                            const players = groupedPlayers[position];
                            
                            return (
                                <div key={position} className="border border-gray-600 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => togglePosition(position)}
                                        className="w-full px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-left text-white font-medium flex justify-between items-center transition-colors"
                                    >
                                        <span>
                                            {position} ({players.length})
                                        </span>
                                        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                                            ▼
                                        </span>
                                    </button>
                                    {isOpen && (
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