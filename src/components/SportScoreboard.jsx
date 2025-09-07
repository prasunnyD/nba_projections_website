import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { getApiBaseUrl, logApiCall } from '../utils/apiConfig';

const SportScoreboard = ({ sport, onGameSelect, onTeamSelect }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedGame, setSelectedGame] = useState(null);
    
    // const client = axios.create({baseURL: "https://api.sharpr-analytics.com"});
    const client = axios.create({ baseURL: getApiBaseUrl() });
    const processTeamName = (teamName) => {
        // NBA special cases
        const nbaSpecialCases = {
            'LA Lakers': 'Los Angeles Lakers',
            'Golden State': 'Golden State',
            'New York': 'New York',
            'New Orleans': 'New Orleans',
            'San Antonio': 'San Antonio',
            'Oklahoma City': 'Oklahoma City',
            'LA Clippers': 'Los Angeles Clippers'
        };
        
        // NFL special cases
        const nflSpecialCases = {
            'New England': 'New England Patriots',
            'Green Bay': 'Green Bay Packers',
            'San Francisco': 'San Francisco 49ers',
            'New York': 'New York Giants',
            'Los Angeles': 'Los Angeles Rams',
            'Las Vegas': 'Las Vegas Raiders'
        };
        
        const specialCases = sport === 'nba' ? nbaSpecialCases : nflSpecialCases;
        
        if (specialCases[teamName]) {
            return specialCases[teamName];
        }
        return teamName;
    };

    useEffect(() => {
        const fetchScoreboard = async () => {
            setLoading(true);
            try {
                let response = await client.get(`/${sport}/scoreboard`);
                const games = Object.keys(response.data);
                const homeTeam = games.map(game => response.data[game].home_team);
                const awayTeam = games.map(game => response.data[game].away_team);
                setData({ games, homeTeam, awayTeam });
            } catch (error) {
                console.error('API Error:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        fetchScoreboard();
    }, [sport]);

    const handleGameClick = (homeTeam, awayTeam) => {
        if (typeof onGameSelect === 'function') {
            setSelectedGame(`${homeTeam} vs ${awayTeam}`);
            onGameSelect(processTeamName(homeTeam), processTeamName(awayTeam));
        } else {
            console.error("onGameSelect is not a function");
        }
    };

    const handleTeamClick = (teamName) => {
        const cityName = processTeamName(teamName);
        onTeamSelect(cityName);
    };

    const getSportColor = () => {
        return sport === 'nba' ? 'blue' : 'orange';
    };

    return (
        <div className="relative">
            <div className="scrollmenu mb-4">
                {loading && <p className="text-white">Loading {sport.toUpperCase()} games...</p>}
                {error && <p className="text-red-500">Error: {error.message}</p>}
                {data &&
                    data.games.map((game, index) => (
                        <div
                            key={game}
                            className={`game-card ${
                                selectedGame === `${data.homeTeam[index]} vs ${data.awayTeam[index]}`
                                    ? 'selected'
                                    : ''
                            }`}
                            onClick={() =>
                                handleGameClick(data.homeTeam[index], data.awayTeam[index])
                            }
                        >
                            <div className="teams">
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleTeamClick(data.awayTeam[index]);
                                    }}
                                    className="cursor-pointer hover:text-blue-500 transition-colors"
                                >
                                    {data.awayTeam[index]}
                                </span>
                                {' @ '}
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleTeamClick(data.homeTeam[index]);
                                    }}
                                    className="cursor-pointer hover:text-blue-500 transition-colors"
                                >
                                    {data.homeTeam[index]}
                                </span>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default SportScoreboard; 