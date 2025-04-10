import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Roster = ({ homeTeam, awayTeam, onPlayerSelect }) => {
    const [homeRoster, setHomeRoster] = useState([]);
    const [awayRoster, setAwayRoster] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    useEffect(() => {
        const fetchRosters = async () => {
            if (!homeTeam || !awayTeam) return;
            setLoading(true);
            setError(null);
            try {
                const client = axios.create({ baseURL: 'https://api.sharpr-analytics.com' });
                const [homeResponse, awayResponse] = await Promise.all([
                    client.get(`/team-roster/${homeTeam}`),
                    client.get(`/team-roster/${awayTeam}`),
                ]);
                // Extract the roster arrays
                const homeRosterArray = Object.values(homeResponse.data || {})[0] || [];
                const awayRosterArray = Object.values(awayResponse.data || {})[0] || [];

                setHomeRoster(homeRosterArray);
                setAwayRoster(awayRosterArray);
            } catch (err) {
                console.error('Error fetching rosters:', err);
                setError('Failed to load rosters. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchRosters();
    }, [homeTeam, awayTeam]);

    const handlePlayerClick = (player) => {
        setSelectedPlayer(player); // Update the selected player
        onPlayerSelect(player); // Notify parent
    };

    const renderRoster = (roster, teamName) => {
        if (loading) return <p>Loading roster for {teamName}...</p>;
        if (error) return <p className="text-red-500">{error}</p>;
        if (roster.length > 0) {
            return (
                <ul>
                    {roster.map((player, index) => (
                        <li
                            key={index}
                            className={`roster-item ${
                                selectedPlayer === player.PLAYER ? 'selected' : ''
                            }`}
                            onClick={() => handlePlayerClick(player.PLAYER)}
                        >
                            <strong>{player.NUM || 'N/A'}</strong> - {player.PLAYER || 'Unknown'} ({player.POSITION || 'N/A'})
                        </li>
                    ))}
                </ul>
            );
        }
        return <p>No roster data available for {teamName}.</p>;
    };

    return (
        <div>
            <div className="roster-container">
                <h3 className="roster-title">{homeTeam} Team Roster</h3>
                {renderRoster(homeRoster, homeTeam)}
            </div>
            <div className="roster-container">
                <h3 className="roster-title">{awayTeam} Team Roster</h3>
                {renderRoster(awayRoster, awayTeam)}
            </div>
        </div>
    );
};

export default Roster;