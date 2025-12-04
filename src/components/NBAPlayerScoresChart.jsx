import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../utils/apiConfig';
import PlayerGameChart from './PlayerGameChart';

// convert "mm:ss" or number to decimal minutes
const toMinutes = (val) => {
    if (val == null) return null;
    const s = String(val);
    if (s.includes(':')) {
        const [m, sec] = s.split(':').map(Number);
        return (Number.isFinite(m) ? m : 0) + ((Number.isFinite(sec) ? sec : 0) / 60);
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
};

const NBAPlayerScoresChart = ({ playerName, numberOfGames, setNumberOfGames }) => {
    const [series, setSeries] = useState(null);
    const [minutesByDate, setMinutesByDate] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedStat, setSelectedStat] = useState('points');
    const [propLine, setPropLine] = useState('');
    const [odds, setOdds] = useState([]);
    const [oddsLoading, setOddsLoading] = useState(false);

    const client = api;

    useEffect(() => {
        if (!playerName) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setSeries(null);
            setMinutesByDate({});
            try {
                let res = await client.get(`nba/player/${playerName}/last/${numberOfGames}/games`);

                const payload = res.data || {};
                const datesAsc = Object.keys(payload)
                    .filter(Boolean)
                    .sort((a, b) => new Date(a) - new Date(b));

                // Format dates to YYYY-MM-DD format
                const formattedDates = datesAsc.map(dateStr => {
                    const date = new Date(dateStr);
                    return date.toISOString().split('T')[0];
                });

                const points = datesAsc.map(d => payload[d]?.points ?? payload[d]?.PTS ?? 0);
                const rebounds = datesAsc.map(d => payload[d]?.rebounds ?? payload[d]?.REB ?? 0);
                const assists = datesAsc.map(d => payload[d]?.assists ?? payload[d]?.AST ?? 0);

                // Try minutes from the same payload first
                const minutesMap = {};
                let hasMinutes = false;
                datesAsc.forEach(d => {
                    const raw = payload[d]?.minutes ?? payload[d]?.MIN ?? payload[d]?.min;
                    const parsed = toMinutes(raw);
                    if (parsed != null) {
                        hasMinutes = true;
                        minutesMap[d] = parsed;
                    }
                });

                // Fallback to /player-last-10-games if minutes missing
                if (!hasMinutes) {
                    try {
                        const mRes = await api.get(`/player-last-10-games/${playerName}`);
                        const mPayload = mRes.data || {};
                        Object.keys(mPayload).forEach(d => {
                            const raw = mPayload[d]?.minutes ?? mPayload[d]?.MIN ?? mPayload[d]?.min;
                            const parsed = toMinutes(raw);
                            if (parsed != null) minutesMap[d] = parsed;
                        });
                    } catch {
                        // ignore if route not present
                    }
                }

                // Update minutesMap to use formatted dates as keys
                const formattedMinutesMap = {};
                formattedDates.forEach((formatted, idx) => {
                    const orig = datesAsc[idx];
                    if (minutesMap[orig] != null) {
                        formattedMinutesMap[formatted] = minutesMap[orig];
                    }
                });

                setSeries({ dates: formattedDates, points, rebounds, assists });
                setMinutesByDate(formattedMinutesMap);
            } catch (e) {
                console.error(e);
                setError('Failed to fetch player data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [playerName, numberOfGames]);

    // Map selected stat to market type
    const getMarketForStat = (stat) => {
        const marketMap = {
            'points': 'player_points',
            'rebounds': 'player_rebounds',
            'assists': 'player_assists',
        };
        return marketMap[stat] || null;
    };

    // Fetch odds data when player changes
    useEffect(() => {
        if (!playerName) {
            setOdds([]);
            return;
        }

        const fetchOdds = async () => {
            setOddsLoading(true);
            try {
                const res = await client.get(`nba/odds/${playerName}`);
                const oddsData = res.data || [];
                setOdds(oddsData);
            } catch (e) {
                console.error('Failed to fetch odds:', e);
                setOdds([]);
            } finally {
                setOddsLoading(false);
            }
        };

        fetchOdds();
    }, [playerName]);

    // Update propLine from FanDuel when selectedStat or odds change
    useEffect(() => {
        if (!odds || odds.length === 0) return;
        
        const market = getMarketForStat(selectedStat);
        if (market) {
            const fanDuelOdd = odds.find(
                odd => odd.sportbook === 'FanDuel' && odd.market === market
            );
            if (fanDuelOdd && fanDuelOdd.line != null) {
                setPropLine(fanDuelOdd.line.toString());
            }
        }
    }, [selectedStat, odds]);

    // Calculate combined stats
    const getCombinedStats = (a, b) => {
        if (!series) return [];
        return series[a].map((v, i) => v + series[b][i]);
    };
    
    const getCombinedStatsThree = (a, b, c) => {
        if (!series) return [];
        return series[a].map((v, i) => v + series[b][i] + series[c][i]);
    };

    // Build stats object with all stat combinations
    const allStats = useMemo(() => {
        if (!series) return {};
        return {
            points: series.points,
            rebounds: series.rebounds,
            assists: series.assists,
            'points+rebounds': getCombinedStats('points', 'rebounds'),
            'points+assists': getCombinedStats('points', 'assists'),
            'rebounds+assists': getCombinedStats('rebounds', 'assists'),
            'points+rebounds+assists': getCombinedStatsThree('points', 'rebounds', 'assists'),
        };
    }, [series]);

    // Stat options configuration
    const statOptions = [
        { key: 'points', label: 'Points' },
        { key: 'rebounds', label: 'Rebounds' },
        { key: 'assists', label: 'Assists' },
        { key: 'points+rebounds', label: 'Points + Rebounds' },
        { key: 'points+assists', label: 'Points + Assists' },
        { key: 'rebounds+assists', label: 'Rebounds + Assists' },
        { key: 'points+rebounds+assists', label: 'Points + Rebounds + Assists' },
    ];

    // Secondary metric (minutes)
    const minutesY = useMemo(() => {
        if (!series) return null;
        return {
            values: series.dates.map(d => minutesByDate[d] ?? null),
            name: 'Minutes',
            yaxisTitle: 'Minutes',
            color: '#f59e0b',
            unit: ' min'
        };
    }, [series, minutesByDate]);

    if (!playerName) return <div>Please select a player.</div>;
    if (loading) return <div>Loading…</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <PlayerGameChart
            dates={series?.dates || []}
            stats={allStats}
            selectedStat={selectedStat}
            onStatChange={setSelectedStat}
            statOptions={statOptions}
            propLine={propLine}
            onPropLineChange={setPropLine}
            numberOfGames={numberOfGames}
            onNumberOfGamesChange={setNumberOfGames}
            numberOfGamesOptions={[5, 10, 15, 20, 30]}
            secondaryMetric={minutesY}
            odds={odds}
            oddsLoading={oddsLoading}
            chartConfig={{
                lightTheme: true,
                height: 450
            }}
        />
    );
};

export default NBAPlayerScoresChart;
