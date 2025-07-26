import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiBaseUrl, logApiCall } from '../utils/apiConfig';

const TeamsDropdown = ({ onTeamSelect, onRosterData, onPlayerSelect }) => {
    const [selectedTeam, setSelectedTeam] = useState('');
    const [roster, setRoster] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

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
        { city: 'LA Clippers', name: 'Clippers' },
        { city: 'LA Lakers', name: 'Lakers' },
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

    const handleTeamChange = async (event) => {
        const selectedCity = event.target.value;
        setSelectedTeam(selectedCity);
        
        if (selectedCity) {
            setLoading(true);
            setError(null);
            try {
                const apiUrl = `/team-roster/${selectedCity}`;
                logApiCall('GET', apiUrl);
                
                const client = axios.create({ baseURL: getApiBaseUrl() });
                const response = await client.get(apiUrl);
                
                // Extract the roster array
                const rosterArray = Object.values(response.data || {})[0] || [];
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
            onPlayerSelect(player);
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
                                onClick={() => handlePlayerClick(player.PLAYER)}
                            >
                                <strong>{player.NUM || 'N/A'}</strong> - {player.PLAYER || 'Unknown'} ({player.POSITION || 'N/A'})
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
                    Select NBA Team
                </label>
                <select
                    id="team-select"
                    value={selectedTeam}
                    onChange={handleTeamChange}
                    className="w-full p-2 bg-neutral-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Choose a team...</option>
                    {nbaTeams.map((team, index) => (
                        <option key={index} value={team.city}>
                            {team.city} {team.name}
                        </option>
                    ))}
                </select>
            </div>
            
            {renderRoster()}
        </div>
    );
};

export default TeamsDropdown; 