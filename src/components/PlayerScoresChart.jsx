import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const PlayerScoresChart = ({ playerName, numberOfGames, setNumberOfGames  }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedStat, setSelectedStat] = useState('points');
    const [propLine, setPropLine] = useState('');

    const client = axios.create({baseURL: "http://localhost:8000"});

    useEffect(() => {
        if (!playerName) return;

        const fetchPlayer = async () => {
            setLoading(true);
            setError(null); // Reset error before making a new API call
            setData(null); // Clear previous data
            try {
                let response = await client.get(`/player-last-${numberOfGames}-games/${playerName}`);

                if (!response.data || Object.keys(response.data).length === 0) {
                    throw new Error(`No data found for this player.`);
                }
                // Extract and sort data in descending order
                const dates = Object.keys(response.data).sort((a, b) => new Date(b) - new Date(a))

                const points = dates.map(date => response.data[date].points);
                const assists = dates.map(date => response.data[date].assists);
                const rebounds = dates.map(date => response.data[date].rebounds);
                setData({ dates, points, assists, rebounds });
            } catch (error) {
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

    const getCombinedStats = (stat1, stat2) => {
        if (!data) return [];
        return data[stat1].map((val, idx) => val + data[stat2][idx]);
    };

    const getCombinedStatsThree = (stat1, stat2, stat3) => {
        if (!data) return [];
        return data[stat1].map((val, idx) => val + data[stat2][idx] + data[stat3][idx]);
    };

    const getYValues = () => {
        if (!data) return [];
        switch(selectedStat) {
            case 'points+rebounds+assists':
                return getCombinedStatsThree('points', 'rebounds', 'assists');
            case 'points+rebounds':
                return getCombinedStats('points', 'rebounds');
            case 'points+assists':
                return getCombinedStats('points', 'assists');
            case 'rebounds+assists':
                return getCombinedStats('rebounds', 'assists');
            default:
                return data[selectedStat];
        }
    };

    const getPropLineStats = (data, propLine) => {
        if (!data || !propLine) return null;
        const values = getYValues();
        const above = values.filter(val => val >= propLine).length;
        const below = values.length - above;
        const abovePercentage = ((above / values.length) * 100).toFixed(1);
        const belowPercentage = ((below / values.length) * 100).toFixed(1);
        return { above, below, abovePercentage, belowPercentage };
    };

    // Helper to get display name for combined stats
    const getStatDisplayName = (stat) => {
        switch(stat) {
            case 'points+rebounds':
                return 'Points + Rebounds';
            case 'points+assists':
                return 'Points + Assists';
            case 'rebounds+assists':
                return 'Rebounds + Assists';
            case 'points+rebounds+assists':
                return 'Points + Rebounds + Assists';
            default:
                return stat.charAt(0).toUpperCase() + stat.slice(1);
        }
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
                    onClick={() => setSelectedStat('points')}
                    className={`stat-button ${
                        selectedStat === 'points' 
                            ? 'active' 
                            : 'inactive'
                    }`}
                >
                    Points
                </button>
                <button
                    onClick={() => setSelectedStat('rebounds')}
                    className={`stat-button ${
                        selectedStat === 'rebounds' 
                            ? 'active' 
                            : 'inactive'
                    }`}
                >
                    Rebounds
                </button>
                <button
                    onClick={() => setSelectedStat('assists')}
                    className={`stat-button ${
                        selectedStat === 'assists' 
                            ? 'active' 
                            : 'inactive'
                    }`}
                >
                    Assists
                </button>

                {/* Combination stat buttons */}
                <button
                    onClick={() => setSelectedStat('points+rebounds+assists')}
                    className={`stat-button ${
                        selectedStat === 'points+rebounds+assists' 
                            ? 'active' 
                            : 'inactive'
                    }`}
                >
                    Points + Rebounds + Assists
                </button>
                <button
                    onClick={() => setSelectedStat('points+rebounds')}
                    className={`stat-button ${
                        selectedStat === 'points+rebounds' 
                            ? 'active' 
                            : 'inactive'
                    }`}
                >
                    Points + Rebounds
                </button>
                <button
                    onClick={() => setSelectedStat('points+assists')}
                    className={`stat-button ${
                        selectedStat === 'points+assists' 
                            ? 'active' 
                            : 'inactive'
                    }`}
                >
                    Points + Assists
                </button>
                <button
                    onClick={() => setSelectedStat('rebounds+assists')}
                    className={`stat-button ${
                        selectedStat === 'rebounds+assists' 
                            ? 'active' 
                            : 'inactive'
                    }`}
                >
                    Rebounds + Assists
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
                            <option value={5}>5 games</option>
                            <option value={10}>10 games</option>
                            <option value={15}>15 games</option>
                            <option value={20}>20 games</option>
                            <option value={30}>30 games</option>
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
                            y: getYValues(),
                            type: 'bar',
                            mode: 'lines+markers',
                            marker: {
                                color: propLine ? getYValues().map(val => 
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

export default PlayerScoresChart;