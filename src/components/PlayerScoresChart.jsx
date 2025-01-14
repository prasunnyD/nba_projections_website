import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const PlayerScoresChart = ({ playerName, numberOfGames }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedStat, setSelectedStat] = useState('points');
    const [propLine, setPropLine] = useState(''); 

    const client = axios.create({
        baseURL: "http://localhost:8000"
    });

    useEffect(() => {

        // Only fetch if playerName is not empty
        if (!playerName) return;

        const fetchPlayer = async () => {
            setLoading(true);
            try {
                let response = await client.get(`/player-last-${numberOfGames}-games/${playerName}`);
    
                const dates = Object.keys(response.data);

                
                const points = dates.map(date => response.data[date].points);
                const assists = dates.map(date => response.data[date].assists);
                const rebounds = dates.map(date => response.data[date].rebounds);

                setData({ dates, points, assists, rebounds });
            } catch (error) {
                console.error('API Error:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchPlayer();
    }, [playerName, numberOfGames]);

    if (!playerName) {
        return <div>Please submit a player name to see their statistics.</div>;
    }
    
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

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

    return (
        <div>
            <h2>Last {numberOfGames} Games {getStatDisplayName(selectedStat)} History</h2>

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
            <div className="prop-line-container">
                <div className="prop-line-input">
                    <label htmlFor="propLine">Prop Line:</label>
                    <input
                        id="propLine"
                        type="number"
                        value={propLine}
                        onChange={(e) => setPropLine(e.target.value)}
                        className="w-20 px-2 py-1 border rounded"
                        placeholder="0.5"
                    />
                </div>
                {data && propLine && (
                    <div className="prop-line-stats">
                        <span className="stat-above">
                            Above: {getPropLineStats(data, propLine)?.above} 
                            ({getPropLineStats(data, propLine)?.abovePercentage}%)
                        </span>
                        <span className="stat-below">
                            Below: {getPropLineStats(data, propLine)?.below}
                            ({getPropLineStats(data, propLine)?.belowPercentage}%)
                        </span>
                    </div>
                )}
            </div>

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


