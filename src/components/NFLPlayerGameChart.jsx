import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

import { getApiBaseUrl, logApiCall } from '../utils/apiConfig';

const NFLPlayerGameChart = ({ playerName, position, numberOfGames, setNumberOfGames }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedStat, setSelectedStat] = useState('rushingYards');
    const [propLine, setPropLine] = useState('');

    const client = axios.create({ baseURL: getApiBaseUrl() });

    useEffect(() => {
        if (!playerName) return;

        const fetchPlayer = async () => {
            setLoading(true);
            setError(null); // Reset error before making a new API call
            setData(null); // Clear previous data
            try {
                let response = null;
                if (position === 'RB' || position === 'WR' || position === 'TE') {
                    response = await client.get(`api/v1/nfl/players/${playerName}/rushing-receiving-game-stats`);
                } else if (position === 'QB') {
                    response = await client.get(`api/v1/nfl/players/${playerName}/passing-game-stats`);
                }

                if (!response.data || Object.keys(response.data).length === 0) {
                    throw new Error(`No data found for this player.`);
                }
                
                // Extract and validate games
                const games = response.data?.stats?.games || [];
                if (games.length === 0) {
                    throw new Error('No game data available');
                }

                // Create date-to-game mapping with validation
                const gameByDate = new Map();
                games.forEach(game => {
                    if (game.game_date) {
                        const date = new Date(game.game_date);
                        if (!isNaN(date.getTime())) {
                            gameByDate.set(game.game_date, game);
                        }
                    }
                });

                // Get sorted dates (most recent first)
                const dates = Array.from(gameByDate.keys()).sort((a, b) => new Date(b) - new Date(a));

                // Helper function to safely extract stats
                const extractStat = (date, statName) => {
                    const game = gameByDate.get(date);
                    if (!game) return 0;
                    const value = parseInt(game[statName]);
                    return isNaN(value) ? 0 : value;
                };
                if (position === 'RB' || position === 'WR' || position === 'TE') {
                // Extract all stats using the mapping
                    console.log("Position: ", position);
                    const rushingYards = dates.map(date => extractStat(date, 'rushingYards'));
                    const rushingTouchdowns = dates.map(date => extractStat(date, 'rushingTouchdowns'));
                    const receptions = dates.map(date => extractStat(date, 'receptions'));
                    const receivingYards = dates.map(date => extractStat(date, 'receivingYards'));
                    const receivingTouchdowns = dates.map(date => extractStat(date, 'receivingTouchdowns'));
                    const rushingAttempts = dates.map(date => extractStat(date, 'rushingAttempts'));
                    const longestReception = dates.map(date => extractStat(date, 'longReception'));

                    setData({ 
                        dates, 
                        rushingYards, 
                        rushingTouchdowns, 
                        receptions,
                        receivingYards,
                        receivingTouchdowns,
                        rushingAttempts,
                        longestReception
                    });
                } else if (position === 'QB') {
                    console.log("Position: ", position);
                    const completions = dates.map(date => extractStat(date, 'completions'));
                    const passingYards = dates.map(date => extractStat(date, 'passingYards'));
                    const passingTouchdowns = dates.map(date => extractStat(date, 'passingTouchdowns'));
                    const passingAttempts = dates.map(date => extractStat(date, 'passingAttempts'));
                    const passingInterceptions = dates.map(date => extractStat(date, 'passingInterceptions'));

                    setData({ 
                        dates,
                        completions,
                        passingYards, 
                        passingTouchdowns, 
                        passingAttempts, 
                        passingInterceptions
                    });
                }
            }catch (error) {
                setError(
                    err.response?.status === 404
                        ? `No game statistics available for ${playerName}.`
                        : 'Failed to fetch player data. Please try again later.'
                );
            } finally {
                setLoading(false);
            }
        };
        fetchPlayer();
    }, [playerName, numberOfGames]);


    const getPropLineStats = (data, propLine) => {
        if (!data || !propLine) return null;
        const values = data[selectedStat];
        const above = values.filter(val => val >= propLine).length;
        const below = values.length - above;
        const abovePercentage = ((above / values.length) * 100).toFixed(1);
        const belowPercentage = ((below / values.length) * 100).toFixed(1);
        return { above, below, abovePercentage, belowPercentage };
    };

    const getStatDisplayName = (stat) => {
        return stat.charAt(0).toUpperCase() + stat.slice(1);
    };

    // Error/Loading Handling
    if (!playerName) return <div>Please select a player to see their statistics.</div>;
    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div>
            <h2 style={{ color: 'white' }}>Last {numberOfGames} Games {getStatDisplayName(selectedStat)} History</h2>
            {/* Add stat selector buttons */}
            <div className="mb-4 flex flex-wrap gap-2">
                {/* Original stat buttons */}
                <button
                    onClick={() => setSelectedStat('rushingYards')}
                    className={`stat-button ${
                        selectedStat === 'rushingYards' 
                            ? 'active' 
                            : 'inactive'
                    }`}
                >
                    Rushing Yards
                </button>
                <button
                    onClick={() => setSelectedStat('rushingTouchdowns')}
                    className={`stat-button ${
                        selectedStat === 'rushingTouchdowns' 
                            ? 'active' 
                            : 'inactive'
                    }`}
                >
                    Rushing Touchdowns
                </button>
                {(position === 'RB' || position === 'WR' || position === 'TE') && (
                    <>
                        <button
                            onClick={() => setSelectedStat('receptions')}
                            className={`stat-button ${
                                selectedStat === 'receptions' 
                                    ? 'active' 
                                    : 'inactive'
                            }`}
                        >
                            Receptions
                        </button>
                        <button
                            onClick={() => setSelectedStat('receivingYards')}
                            className={`stat-button ${
                                selectedStat === 'receivingYards' 
                                    ? 'active' 
                                    : 'inactive'
                            }`}
                        >
                            Receiving Yards
                        </button>
                        <button
                            onClick={() => setSelectedStat('receivingTouchdowns')}
                            className={`stat-button ${
                                selectedStat === 'receivingTouchdowns' 
                                    ? 'active' 
                                    : 'inactive'
                            }`}
                        >
                            Receiving Touchdowns
                        </button>
                        <button
                            onClick={() => setSelectedStat('longestReception')}
                            className={`stat-button ${
                                selectedStat === 'longestReception' 
                                    ? 'active' 
                                    : 'inactive'
                            }`}
                        >
                            Longest Reception
                        </button>
                    </>
                )}
                {/* QB stat buttons */}
                {position === 'QB' && (
                    <>
                        <button
                            onClick={() => setSelectedStat('passingYards')}
                            className={`stat-button ${
                                selectedStat === 'passingYards' 
                                    ? 'active' 
                                    : 'inactive'
                            }`}
                        >
                            Passing Yards
                        </button>
                        <button
                            onClick={() => setSelectedStat('passingAttempts')}
                            className={`stat-button ${
                                selectedStat === 'passingAttempts' 
                                    ? 'active' 
                                    : 'inactive'
                            }`}
                        >
                            Passing Attempts
                        </button>
                        <button
                            onClick={() => setSelectedStat('completions')}
                            className={`stat-button ${
                                selectedStat === 'completions' 
                                    ? 'active' 
                                    : 'inactive'
                            }`}
                        >
                            Completions
                        </button>
                        <button
                            onClick={() => setSelectedStat('passingTouchdowns')}
                            className={`stat-button ${
                                selectedStat === 'passingTouchdowns' 
                                    ? 'active' 
                                    : 'inactive'
                            }`}
                        >
                            Passing Touchdowns
                        </button>
                        <button
                            onClick={() => setSelectedStat('passingInterceptions')}
                            className={`stat-button ${
                                selectedStat === 'passingInterceptions' 
                                    ? 'active' 
                                    : 'inactive'
                            }`}
                        >
                            Interceptions
                        </button>
                    </>
                )}
                {/* Combination stat buttons */}
                <button
                    onClick={() => setSelectedStat('rushingAttempts')}
                    className={`stat-button ${
                        selectedStat === 'rushingAttempts' 
                            ? 'active' 
                            : 'inactive'
                    }`}
                >
                    Rushing Attempts
                </button>
                
            </div>

            {/* Prop Line Box */}
            <div className="prop-line-container flex flex-col items-center justify-center gap-4 p-4 rounded-lg shadow bg-neutral-800">
                <div className="prop-line-and-games flex items-center gap-8">
                    <div className="prop-line-input flex items-center gap-2">
                        <label htmlFor="propLine" className="text-white font-medium">Prop Line:</label>
                        <input
                            id="propLine"
                            type="number"
                            value={propLine}
                            onChange={(e) => setPropLine(e.target.value)}
                            className="w-20 px-2 py-1 border rounded text-center"
                            placeholder="0.5"
                        />
                    </div>
                    <div className="number-of-games-container flex items-center gap-2">
                        <label htmlFor="gameCount" className="text-white font-medium">
                            Number of Games:
                        </label>
                        <select
                            id="gameCount"
                            value={numberOfGames}
                            onChange={(e) => setNumberOfGames(Number(e.target.value))}
                            className="px-3 py-2 border rounded-md"
                        >
                            <option value={17}>17 games</option>
                            <option value={30}>34 games</option>
                        </select>
                    </div>
                </div>
                <div className="prop-line-stats flex items-center gap-4 text-sm">
                    <span className="stat-above font-bold text-green-500">
                        Above: {getPropLineStats(data, propLine)?.above} ({getPropLineStats(data, propLine)?.abovePercentage}%)
                    </span>
                    <span className="stat-below font-bold text-red-500">
                        Below: {getPropLineStats(data, propLine)?.below} ({getPropLineStats(data, propLine)?.belowPercentage}%)
                    </span>
                </div>
            </div>

            {/* Chart Rendering */}
            {data && (
                <Plot
                    data={[
                        {  
                            x: data.dates,
                            y: data[selectedStat],
                            type: 'bar',
                            mode: 'lines+markers',
                            marker: {
                                color: propLine ? data[selectedStat].map(val => 
                                    val >= propLine ? '#22c55e' : '#ef4444'
                                ) : '#2563eb'
                            },
                            line: { color: '#2563eb' },
                        },
                        ...(propLine ? [{
                            x: data.dates,
                            y: Array(data.dates.length).fill(propLine),
                            type: 'scatter',
                            mode: 'lines',
                            line: {
                                color: 'black',
                                dash: 'dash',
                            },
                            name: 'Prop Line'
                        }] : [])
                    ]}
                    layout={{
                        autosize: true,
                        margin: { t: 20, r: 20, b: 40, l: 40 },
                        xaxis: {
                            title: 'Game Date',
                            tickangle: -45,
                            automargin: true,
                            type: 'category',
                            tickmode: 'array',
                            ticktext: data.dates,
                            tickvals: Array.from({length: data.dates.length}, (_, i) => i)

                        },
                        yaxis: {
                            title: selectedStat.charAt(0).toUpperCase() + selectedStat.slice(1),
                            zeroline: false,
                        },
                        height: 400,
                    }}
                    config={{
                        responsive: true,
                        displayModeBar: false,
                    }}
                    className="w-full"
                />
            )}
        </div>
    );
};

export default NFLPlayerGameChart;