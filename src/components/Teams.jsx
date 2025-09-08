import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { api , logApiCall} from '../utils/apiConfig';
const Teams = () => {
    const [teams, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const apiUrl = `/team-roster/${city}`;
                logApiCall('GET', apiUrl);
                const response = await client.get(apiUrl);
                const teamRosterArray = Object.values(response.data || {})[0] || [];
                setTeam(teamRosterArray);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        fetchTeam();
    }, []);

    const handlePlayerClick = (player) => {
        setSelectedPlayer(player); // Update the selected player
        onPlayerSelect(player); // Notify parent
    };
    return (
        <div>
            <h1>Teams</h1>
        </div>
    );
};

export default Teams;