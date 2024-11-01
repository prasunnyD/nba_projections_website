import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const PlayerScoresChart = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState('Anthony Edwards');

    const query = {
        city: 'Minnesota',
        minutes: 28.5,
    };

    const client = axios.create({
        baseURL: API_BASE_URL
    });

    useEffect(() => {
        const fetchPlayer = async () => {
            setLoading(true);
            try {
                let response = await client.get(`/player-last-10-games/${selectedPlayer}`, { params: query });
                console.log(response.data);
                
                // Transform data if necessary
                const dates = Object.keys(response.data);
                const points = dates.map(date => response.data[date].points);
                
                setData({ dates, points });
            } catch (error) {
                console.log(error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayer();
    }, [selectedPlayer, query.city, query.minutes]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div>
            <h2>Last 10 Games Scoring History</h2>
            {data && (
                <Plot
                    data={[
                        {
                            x: data.dates,
                            y: data.points,
                            type: 'scatter',
                            mode: 'lines+markers',
                            marker: { color: '#2563eb' },
                            line: { color: '#2563eb' },
                        },
                    ]}
                    layout={{
                        autosize: true,
                        margin: { t: 20, r: 20, b: 40, l: 40 },
                        xaxis: {
                            title: 'Game Date',
                            tickangle: -45,
                        },
                        yaxis: {
                            title: 'Points Scored',
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
