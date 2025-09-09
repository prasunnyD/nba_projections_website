import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiBaseUrl, logApiCall } from '../utils/apiConfig';

const NFLTeamDropdown = ({ onTeamSelect, onRosterData, onPlayerSelect, onPlayerPosition }) => {
    const [selectedTeam, setSelectedTeam] = useState('');
    const [roster, setRoster] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

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

    const renderRoster = () => {
        if (loading) return <p className="text-gray-400">Loading roster...</p>;
        if (error) return <p className="text-red-500">{error}</p>;
        if (roster.length > 0) {
            return (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold text-white mb-2">
                        {selectedTeam} Roster
                    </h3>
                    <ul className="space-y-1">
                        {roster.map((player, index) => (
                            <li
                                key={index}
                                className={`roster-item text-gray-300 hover:text-white cursor-pointer p-1 rounded ${
                                    selectedPlayer === player.PLAYER ? 'bg-blue-600 text-white' : ''
                                }`}
                                onClick={() => handlePlayerClick(player)}
                            >
                                {player.player_name || 'Unknown'} ({player.position || 'N/A'})
                            </li>
                        ))}
                    </ul>
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