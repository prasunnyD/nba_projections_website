import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { getApiBaseUrl } from '../utils/apiConfig';
import PlayerGameChart from './PlayerGameChart';

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
            setError(null);
            setData(null);
            try {
                let response = null;
                if (position === 'RB' || position === 'WR' || position === 'TE') {
                    response = await client.get(`nfl/players/${playerName}/rushing-receiving-game-stats`);
                } else if (position === 'QB') {
                    response = await client.get(`nfl/players/${playerName}/passing-game-stats`);
                }

                if (!response.data || Object.keys(response.data).length === 0) {
                    throw new Error(`No data found for this player.`);
                }
                
                const games = response.data?.stats?.games || [];

                if (games.length === 0) {
                    throw new Error('No game data available');
                }

                // Create date-to-game mapping
                const gameByDate = new Map();
                games.forEach(game => {
                    if (game.game_date) {
                        const date = new Date(game.game_date);
                        if (!isNaN(date.getTime())) {
                            gameByDate.set(game.game_date, game);
                        }
                    }
                });

                const dates = Array.from(gameByDate.keys()).sort((a, b) => new Date(a) - new Date(b));
                const formattedDates = dates.map(dateStr => {
                    const date = new Date(dateStr);
                    return date.toISOString().split('T')[0];
                });

                // Helper functions
                const extractStat = (date, statName) => {
                    const game = gameByDate.get(date);
                    if (!game) return 0;
                    const value = parseInt(game[statName]);
                    return isNaN(value) ? 0 : value;
                };
                
                const extractDecimalStat = (date, statName) => {
                    const game = gameByDate.get(date);
                    if (!game) return 0;
                    const value = parseFloat(game[statName]);
                    return isNaN(value) ? 0 : value;
                };
                
                if (position === 'RB' || position === 'WR' || position === 'TE') {
                    setData({ 
                        dates: formattedDates, 
                        rushingYards: dates.map(date => extractStat(date, 'rushingYards')),
                        rushingTouchdowns: dates.map(date => extractStat(date, 'rushingTouchdowns')),
                        receptions: dates.map(date => extractStat(date, 'receptions')),
                        receivingYards: dates.map(date => extractStat(date, 'receivingYards')),
                        receivingTouchdowns: dates.map(date => extractStat(date, 'receivingTouchdowns')),
                        rushingAttempts: dates.map(date => extractStat(date, 'rushingAttempts')),
                        longestReception: dates.map(date => extractStat(date, 'longReception')),
                        offensiveSnapsPct: dates.map(date => extractDecimalStat(date, 'offenseSnapPct') * 100),
                        offensiveSnaps: dates.map(date => extractStat(date, 'offenseSnaps')),
                    });
                } else if (position === 'QB') {
                    setData({ 
                        dates: formattedDates,
                        completions: dates.map(date => extractStat(date, 'passingCompletions')),
                        passingYards: dates.map(date => extractStat(date, 'passingYards')),
                        passingTouchdowns: dates.map(date => extractStat(date, 'passingTouchdowns')),
                        passingAttempts: dates.map(date => extractStat(date, 'passingAttempts')),
                        passingInterceptions: dates.map(date => extractStat(date, 'interceptions')),
                        rushingYards: dates.map(date => extractStat(date, 'rushingYards')),
                        rushingTouchdowns: dates.map(date => extractStat(date, 'rushingTouchdowns')),
                        rushingAttempts: dates.map(date => extractStat(date, 'rushingAttempts')),
                        offensiveSnapsPct: dates.map(date => extractDecimalStat(date, 'offenseSnapPct') * 100),
                        offensiveSnaps: dates.map(date => extractStat(date, 'offenseSnaps')),
                    });
                }
            } catch (err) {
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

    // Build stat options based on position
    const statOptions = useMemo(() => {
        const baseOptions = [
            { key: 'rushingYards', label: 'Rushing Yards' },
            { key: 'rushingTouchdowns', label: 'Rushing Touchdowns' },
            { key: 'rushingAttempts', label: 'Rushing Attempts' },
        ];

        if (position === 'RB' || position === 'WR' || position === 'TE') {
            return [
                ...baseOptions,
                { key: 'receptions', label: 'Receptions' },
                { key: 'receivingYards', label: 'Receiving Yards' },
                { key: 'receivingTouchdowns', label: 'Receiving Touchdowns' },
                { key: 'longestReception', label: 'Longest Reception' },
            ];
        } else if (position === 'QB') {
            return [
                ...baseOptions,
                { key: 'passingYards', label: 'Passing Yards' },
                { key: 'passingAttempts', label: 'Passing Attempts' },
                { key: 'completions', label: 'Completions' },
                { key: 'passingTouchdowns', label: 'Passing Touchdowns' },
                { key: 'passingInterceptions', label: 'Interceptions' },
            ];
        }

        return baseOptions;
    }, [position]);

    // Secondary metric (offensive snaps percentage)
    const secondaryMetric = useMemo(() => {
        if (!data || !data.offensiveSnapsPct) return null;
        return {
            values: data.offensiveSnapsPct,
            name: 'Offensive Snaps %',
            yaxisTitle: 'Offensive Snaps %',
            color: '#f59e0b',
            unit: '%',
            customdata: data.offensiveSnaps
        };
    }, [data]);

    if (!playerName) return <div>Please select a player to see their statistics.</div>;
    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    // Remove dates from stats object
    const { dates, ...stats } = data || {};

    return (
        <PlayerGameChart
            dates={dates || []}
            stats={stats}
            selectedStat={selectedStat}
            onStatChange={setSelectedStat}
            statOptions={statOptions}
            propLine={propLine}
            onPropLineChange={setPropLine}
            numberOfGames={numberOfGames}
            onNumberOfGamesChange={setNumberOfGames}
            numberOfGamesOptions={[17, 34]}
            secondaryMetric={secondaryMetric}
            chartConfig={{
                lightTheme: true,
                height: 400
            }}
        />
    );
};

export default NFLPlayerGameChart;
