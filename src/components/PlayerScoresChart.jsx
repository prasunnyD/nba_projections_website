import React, { useState, useEffect, useMemo  } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { api } from '../utils/apiConfig';
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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

const PlayerScoresChart = ({ playerName, numberOfGames, setNumberOfGames  }) => {
    const [series, setSeries] = useState(null);  
    const [minutesByDate, setMinutesByDate] = useState({}); // date -> minutes
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedStat, setSelectedStat] = useState('points');
    const [propLine, setPropLine] = useState('');

    // const client = axios.create({baseURL: 'https://api.sharpr-analytics.com'});
    const client = api;

    useEffect(() => {
        if (!playerName) return;

        const fetchData  = async () => {
            setLoading(true);
            setError(null); // Reset error before making a new API call
            setSeries(null); // Clear previous data
            setMinutesByDate({});
            try {
                let res = await client.get(`nba/player/${playerName}/last/${numberOfGames}/games`);

                const payload = res.data || {};
            const datesAsc = Object.keys(payload)
            .filter(Boolean)
            .sort((a, b) => new Date(a) - new Date(b)); // old -> new

            const points   = datesAsc.map(d => payload[d]?.points ?? payload[d]?.PTS ?? 0);
            const rebounds = datesAsc.map(d => payload[d]?.rebounds ?? payload[d]?.REB ?? 0);
            const assists  = datesAsc.map(d => payload[d]?.assists ?? payload[d]?.AST ?? 0);

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

            setSeries({ dates: datesAsc, points, rebounds, assists });
            setMinutesByDate(minutesMap);
        } catch (e) {
            console.error(e);
            setError('Failed to fetch player data.');
        } finally {
            setLoading(false);
        }
        };

        fetchData();
    }, [playerName, numberOfGames]);

    const getCombinedStats = (a, b) => series[a].map((v, i) => v + series[b][i]);
    const getCombinedStatsThree = (a, b, c) =>
        series[a].map((v, i) => v + series[b][i] + series[c][i]);

    const yLeft = useMemo(() => {
        if (!series) return [];
        switch (selectedStat) {
        case 'points+rebounds+assists': return getCombinedStatsThree('points', 'rebounds', 'assists');
        case 'points+rebounds':        return getCombinedStats('points', 'rebounds');
        case 'points+assists':         return getCombinedStats('points', 'assists');
        case 'rebounds+assists':       return getCombinedStats('rebounds', 'assists');
        case 'rebounds':               return series.rebounds;
        case 'assists':                return series.assists;
        case 'points':
        default:                       return series.points;
        }
    }, [series, selectedStat]);

    const statLabel = (s) => ({
        'points': 'Points',
        'rebounds': 'Rebounds',
        'assists': 'Assists',
        'points+rebounds+assists': 'Points + Rebounds + Assists',
        'points+rebounds': 'Points + Rebounds',
        'points+assists': 'Points + Assists',
        'rebounds+assists': 'Rebounds + Assists',
    }[s] || 'Value');

    const leftAxisTitle = statLabel(selectedStat);

    const minutesY = useMemo(() => {
        if (!series) return [];
        return series.dates.map(d => minutesByDate[d] ?? null);
    }, [series, minutesByDate]);

    const traces = series ? [
        {
        x: series.dates,
        y: yLeft,
        type: 'bar',
        name: leftAxisTitle,
        marker: {
            color: propLine
            ? yLeft.map(v => Number(v) >= Number(propLine) ? '#22c55e' : '#ef4444')
            : '#2563eb',
        },
        hovertemplate: '%{x}<br>%{y}<extra>' + leftAxisTitle + '</extra>',
        },
    ] : [];

    if (minutesY.some(v => v != null)) {
        traces.push({
        x: series.dates,
        y: minutesY,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Minutes',
        yaxis: 'y2',
        hovertemplate: '%{x}<br>%{y:.1f} min<extra>Minutes</extra>',
        });
    }

    const valuesForProp = yLeft;
    const above = valuesForProp.filter(v => Number(v) >= Number(propLine || 0)).length;
    const below = valuesForProp.length ? valuesForProp.length - above : 0;
    const abovePct = valuesForProp.length ? ((above / valuesForProp.length) * 100).toFixed(1) : '';
    const belowPct = valuesForProp.length ? ((below / valuesForProp.length) * 100).toFixed(1) : '';

    if (!playerName) return <div>Please select a player.</div>;
    if (loading) return <div>Loading…</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div>
        <h2 className="text-white">
            Last {numberOfGames} Games {leftAxisTitle} History
        </h2>

        {/* Buttons */}
        <div className="mb-4 flex flex-wrap gap-2">
            {['points','rebounds','assists',
            'points+rebounds+assists','points+rebounds','points+assists','rebounds+assists']
            .map(key => (
                <button
                key={key}
                onClick={() => setSelectedStat(key)}
                className={`stat-button ${selectedStat === key ? 'active' : 'inactive'}`}
                >
                {statLabel(key)}
                </button>
            ))}
        </div>

        {/* Controls */}
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
                <label htmlFor="gameCount" className="text-white font-medium">Number of Games:</label>
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
            <span className="font-bold text-green-500">Above: {above} ({abovePct}%)</span>
            <span className="font-bold text-red-500">Below: {below} ({belowPct}%)</span>
            </div>
        </div>

        {/* Chart */}
        {series && (
            <Plot
                data={traces}
                layout={{
                    margin: { t: 30, r: 60, b: 60, l: 50 },
                    xaxis: {
                    title: 'Game Date',
                    tickangle: -45,
                    automargin: true,
                    showgrid: false,   // ⬅️ no vertical gridlines
                    zeroline: false,
                    },
                    yaxis: {
                    title: leftAxisTitle,
                    rangemode: 'tozero',
                    zeroline: false,
                    showgrid: false,   // ⬅️ no horizontal gridlines (left)
                    },
                    yaxis2: {
                    title: 'Minutes',
                    overlaying: 'y',
                    side: 'right',
                    rangemode: 'tozero',
                    zeroline: false,
                    showgrid: false,   // ⬅️ no horizontal gridlines (right)
                    },
                    showlegend: true,
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    height: 420,
                }}
                config={{
                    responsive: true,
                    displayModeBar: false, // hide toolbar
                    staticPlot: false,      // ⬅️ disables zoom/pan/drag; keeps hover
                }}
                className="w-full"
                />

        )}
        </div>
    );
};

export default PlayerScoresChart;