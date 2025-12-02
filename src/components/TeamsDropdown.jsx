import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { api,logApiCall } from '../utils/apiConfig';
import { getTeamLogoUrl } from '../helpers/teamLogoUtils';

const TeamsDropdown = ({ onTeamSelect, onRosterData, onPlayerSelect, homeTeam }) => {
    const [selectedTeam, setSelectedTeam] = useState('');
    const [roster, setRoster] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isRosterExpanded, setIsRosterExpanded] = useState(true);
    const isManualSelection = useRef(false);
    const lastAutoSelectedHomeTeam = useRef(null);

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

    // Extract team name for API calls (roster API needs full team name format)
    const extractCityForAPI = (teamValue) => {
        if (!teamValue) return '';
        
        // Handle LA teams - API needs specific format
        if (teamValue === 'Los Angeles Lakers' || 
            (teamValue.includes('Lakers') && teamValue.includes('Los Angeles'))) {
            return 'Los Angeles Lakers';
        }
        if (teamValue === 'Los Angeles Clippers' || 
            teamValue === 'LA Clippers' ||
            (teamValue.includes('Clippers'))) {
            return 'Los Angeles Clippers';
        }
        
        // Find matching team in nbaTeams array
        const team = nbaTeams.find(t => t.city === teamValue);
        if (team) {
            // For most teams, return the city name (which is what the API expects)
            return team.city;
        }
        
        // Fallback: if it's in "City Team" format, try to match or return city
        const parts = teamValue.split(' ');
        if (parts.length > 1) {
            // For multi-word cities, check if it matches known patterns
            if (parts[0] === 'New' && parts[1] === 'York') return 'New York';
            if (parts[0] === 'New' && parts[1] === 'Orleans') return 'New Orleans';
            if (parts[0] === 'Oklahoma' && parts[1] === 'City') return 'Oklahoma City';
            if (parts[0] === 'San' && parts[1] === 'Antonio') return 'San Antonio';
            if (parts[0] === 'Golden' && parts[1] === 'State') return 'Golden State';
            // For others, assume first word(s) before team name is the city
            // Most team names are single words, so take everything except last word
            return parts.slice(0, -1).join(' ');
        }
        // Single word - return as is
        return teamValue;
    };

    const fetchRosterForTeam = useCallback(async (teamCity, isHomeTeam = false) => {
        if (!teamCity) {
            setRoster([]);
            setSelectedPlayer(null);
            onTeamSelect('');
            onRosterData([]);
            return;
        }

        // Extract just the city for API call
        const cityForAPI = extractCityForAPI(teamCity);

        setLoading(true);
        setError(null);
        try {
            const apiUrl = `nba/team-roster/${cityForAPI}`;
            logApiCall('GET', apiUrl);
            
            const client = api;
            const response = await client.get(apiUrl);
            
            // Extract the roster array
            const rosterArray = Object.values(response.data || {})[0] || [];
            setRoster(rosterArray);
            setIsRosterExpanded(true); // Expand roster when new team is loaded
            
            // Notify parent components (use original teamCity for display)
            onTeamSelect(teamCity);
            onRosterData(rosterArray);

            // Randomly select a player if this is the home team and roster has players
            if (isHomeTeam && rosterArray.length > 0 && onPlayerSelect) {
                const randomIndex = Math.floor(Math.random() * rosterArray.length);
                const randomPlayer = rosterArray[randomIndex];
                if (randomPlayer && randomPlayer.PLAYER) {
                    setSelectedPlayer(randomPlayer.PLAYER);
                    onPlayerSelect(randomPlayer.PLAYER);
                }
            }
        } catch (err) {
            console.error('Error fetching roster:', err);
            setError('Failed to load roster. Please try again.');
            setRoster([]);
        } finally {
            setLoading(false);
        }
    }, [onTeamSelect, onRosterData, onPlayerSelect]);

    const handleTeamChange = async (event) => {
        const selectedCity = event.target.value;
        console.log("Selected City: ", selectedCity);
        isManualSelection.current = true; // Mark as manual selection
        setSelectedTeam(selectedCity);
        await fetchRosterForTeam(selectedCity, false); // Not home team for manual selection
    };

    // Auto-select homeTeam when it changes (only when homeTeam prop changes, not when selectedTeam changes)
    useEffect(() => {
        if (!homeTeam) return;
        
        // If homeTeam changed to a new value, reset manual selection flag to allow auto-select
        if (homeTeam !== lastAutoSelectedHomeTeam.current) {
            isManualSelection.current = false;
        }
        
        // Use functional update to get current selectedTeam value
        setSelectedTeam(currentSelected => {
            // Only auto-select if:
            // 1. homeTeam is different from currently selected team
            // 2. It's not a manual selection (user hasn't manually changed the team)
            if (homeTeam !== currentSelected && !isManualSelection.current) {
                lastAutoSelectedHomeTeam.current = homeTeam; // Track what we auto-selected
                fetchRosterForTeam(homeTeam, true); // true indicates this is the home team
                return homeTeam;
            }
            return currentSelected; // Keep current selection
        });
        // Only depend on homeTeam, not selectedTeam, so manual selections aren't overridden
    }, [homeTeam, fetchRosterForTeam]);

    const handlePlayerClick = (player) => {
        setSelectedPlayer(player);
        if (onPlayerSelect) {
            onPlayerSelect(player);
        }
    };

    const toggleRoster = () => {
        setIsRosterExpanded(!isRosterExpanded);
    };

    const renderRoster = () => {
        if (!selectedTeam) return null;
        
        if (loading) return <p className="text-gray-400">Loading roster...</p>;
        if (error) return <p className="text-red-500">{error}</p>;
        if (roster.length > 0) {
            return (
                <div className="mt-4">
                    <button
                        onClick={toggleRoster}
                        className="w-full flex items-center justify-between text-left p-2 bg-neutral-800 hover:bg-neutral-750 rounded-md transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            {selectedTeam && (
                                <img 
                                    src={getTeamLogoUrl(selectedTeam)} 
                                    alt={`${selectedTeam} logo`}
                                    className="w-8 h-8 object-contain"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            )}
                            <h3 className="text-lg font-semibold text-white">
                                {selectedTeam} Roster
                            </h3>
                        </div>
                        <svg
                            className={`w-5 h-5 text-white transition-transform duration-200 ${
                                isRosterExpanded ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {isRosterExpanded && (
                        <ul className="space-y-1 mt-2 max-h-96 overflow-y-auto">
                            {roster.map((player, index) => {
                                const getStatusColor = (status) => {
                                    if (status === 'Out') return 'text-red-500';
                                    if (status === 'Questionable') return 'text-orange-500';
                                    if (status === 'Probable') return 'text-yellow-500';
                                    if (status === 'Available') return 'text-blue-500';
                                    return '';
                                };
                                
                                const status = player.STATUS && player.STATUS.trim() !== '' ? player.STATUS : null;
                                
                                return (
                                    <li
                                        key={index}
                                        className={`roster-item text-gray-300 hover:text-white cursor-pointer p-1 rounded ${
                                            selectedPlayer === player.PLAYER ? 'bg-blue-600 text-white' : ''
                                        }`}
                                        onClick={() => handlePlayerClick(player.PLAYER)}
                                    >
                                        <strong>{player.NUM || 'N/A'}</strong> - {player.PLAYER || 'Unknown'} ({player.POSITION || 'N/A'})
                                        {status && (
                                            <span className={`ml-2 font-semibold ${getStatusColor(status)}`}>
                                                {status}
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            );
        }
        return <p className="text-gray-400">No roster data available.</p>;
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