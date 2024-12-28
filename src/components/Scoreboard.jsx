import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

const Scoreboard = ({ }) => {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const client = axios.create({
        baseURL: "http://localhost:8000"
    });

    useEffect(() => {

        const fetchScoreboard = async () => {
            setLoading(true);
            try {
                let response = await client.get(`/scoreboard`);
    
                const games = Object.keys(response.data);

                
                const homeTeam = games.map(game => response.data[game].home_team);
                const awayTeam = games.map(game => response.data[game].away_team);

                setData({ games, homeTeam , awayTeam });
            } catch (error) {
                console.error('API Error:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchScoreboard();
    }, []);

    return (
        <div className="scrollmenu">
            {loading && <p className="text-white">Loading...</p>}
            {error && <p className="text-red-500">Error: {error.message}</p>}
            {data && (
                <>
                    {data.games.map((game, index) => (
                        <div key={game} className="game-card">
                            <div className="teams">
                                {data.awayTeam[index]} @ {data.homeTeam[index]}
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};

export default Scoreboard;