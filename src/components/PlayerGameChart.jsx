import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';

/** API ingested_time is US Eastern wall clock; trailing Z is not UTC. */
function formatIngestedTimeEastern(raw) {
    const match = String(raw).trim().match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/
    );
    if (!match) return null;
    const [, year, month, day, hour, minute] = match;
    const stamp = new Date(Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
    ));
    const label = new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(stamp);
    return `${label} ET`;
}

/**
 * Shared component for displaying player game statistics charts
 * Used by both NBA and NFL player charts
 * 
 * @param {Object} props
 * @param {string} props.title - Chart title
 * @param {Array<string>} props.dates - Array of formatted dates (YYYY-MM-DD)
 * @param {Object} props.stats - Object with stat names as keys and arrays of values
 * @param {string} props.selectedStat - Currently selected stat key
 * @param {Function} props.onStatChange - Callback when stat selection changes
 * @param {Array<{key: string, label: string}>} props.statOptions - Available stat options
 * @param {number|string} props.propLine - Prop line value
 * @param {Function} props.onPropLineChange - Callback when prop line changes
 * @param {number} props.numberOfGames - Number of games displayed
 * @param {Function} props.onNumberOfGamesChange - Callback when number of games changes
 * @param {Array<number>} props.numberOfGamesOptions - Available number of games options
 * @param {Object} props.secondaryMetric - Optional secondary metric config (single)
 * @param {Array<Object>} props.secondaryMetrics - Optional list of line metrics (overrides secondaryMetric when set)
 * @param {Array<number|null>} props.secondaryMetric.values - Secondary metric values
 * @param {string} props.secondaryMetric.name - Secondary metric name
 * @param {string} props.secondaryMetric.yaxisTitle - Secondary metric y-axis title
 * @param {string} props.secondaryMetric.color - Secondary metric line color
 * @param {Array} props.odds - Optional array of odds data
 * @param {boolean} props.oddsLoading - Whether odds are loading
 * @param {Function} props.onRefreshOdds - Re-fetch latest odds from the API
 * @param {Object} props.chartConfig - Chart styling configuration
 * @param {boolean} props.chartConfig.lightTheme - Use light theme for chart
 * @param {number} props.chartConfig.height - Chart height
 */
const PlayerGameChart = ({
    title,
    dates,
    stats,
    selectedStat,
    onStatChange,
    statOptions,
    propLine,
    onPropLineChange,
    numberOfGames,
    onNumberOfGamesChange,
    numberOfGamesOptions = [5, 10, 15, 20, 30],
    secondaryMetric,
    secondaryMetrics,
    odds = [],
    oddsLoading = false,
    onRefreshOdds,
    chartConfig = {
        lightTheme: true,
        height: 450
    }
}) => {
    // Get current stat values
    const currentStatValues = useMemo(() => {
        if (!stats || !stats[selectedStat]) return [];
        return stats[selectedStat];
    }, [stats, selectedStat]);

    // Get stat display name
    const getStatDisplayName = (statKey) => {
        const option = statOptions.find(opt => opt.key === statKey);
        return option ? option.label : statKey.charAt(0).toUpperCase() + statKey.slice(1);
    };

    const statDisplayName = getStatDisplayName(selectedStat);

    const lineMetrics = useMemo(() => {
        if (secondaryMetrics?.length) return secondaryMetrics;
        if (secondaryMetric) return [secondaryMetric];
        return [];
    }, [secondaryMetric, secondaryMetrics]);

    const buildLineMetricTrace = (metric, yaxisId) => {
        const yHover = metric.yHoverFormat ?? '%{y:.1f}';
        return {
        x: dates,
        y: metric.values,
        type: 'scatter',
        mode: 'lines+markers',
        name: metric.name,
        yaxis: yaxisId,
        line: {
            color: metric.color || '#f59e0b',
            width: 2.5
        },
        marker: {
            color: metric.color || '#f59e0b',
            size: 7,
            line: {
                color: metric.color || '#d97706',
                width: 1
            }
        },
        hovertemplate: metric.customdata
            ? `<b>%{x}</b><br>${yHover}${metric.unit || ''}<br>Snaps: %{customdata}<extra>${metric.name}</extra>`
            : `<b>%{x}</b><br>${metric.name}: ${yHover}${metric.unit || ''}<extra></extra>`,
        hoverlabel: {
            bgcolor: chartConfig.lightTheme ? 'white' : '#1f2937',
            bordercolor: chartConfig.lightTheme ? '#d1d5db' : '#4b5563',
            font: {
                color: chartConfig.lightTheme ? '#1f2937' : '#e5e7eb',
                size: 12
            }
        },
        ...(metric.customdata ? { customdata: metric.customdata } : {})
        };
    };

    const overlayYAxisKey = (index) => (index === 0 ? 'y2' : 'y3');

    // Calculate prop line stats
    const propLineStats = useMemo(() => {
        if (!propLine || !currentStatValues.length) return null;
        const above = currentStatValues.filter(v => Number(v) >= Number(propLine)).length;
        const below = currentStatValues.length - above;
        const abovePct = ((above / currentStatValues.length) * 100).toFixed(1);
        const belowPct = ((below / currentStatValues.length) * 100).toFixed(1);
        return { above, below, abovePct, belowPct };
    }, [currentStatValues, propLine]);

    // Build chart traces
    const traces = useMemo(() => {
        if (!dates || !currentStatValues.length) return [];

        const traces = [];

        // Main stat bar chart
        traces.push({
            x: dates,
            y: currentStatValues,
            type: 'bar',
            name: statDisplayName,
            marker: {
                color: propLine
                    ? currentStatValues.map(v => Number(v) >= Number(propLine) ? '#22c55e' : '#ef4444')
                    : '#3b82f6',
                line: {
                    color: propLine
                        ? currentStatValues.map(v => Number(v) >= Number(propLine) ? '#16a34a' : '#dc2626')
                        : '#2563eb',
                    width: 0.5
                },
                opacity: 0.9,
            },
            hovertemplate: `<b>%{x}</b><br>${statDisplayName}: %{y}<extra></extra>`,
            hoverlabel: {
                bgcolor: chartConfig.lightTheme ? 'white' : '#1f2937',
                bordercolor: chartConfig.lightTheme ? '#d1d5db' : '#4b5563',
                font: { 
                    color: chartConfig.lightTheme ? '#1f2937' : '#e5e7eb', 
                    size: 12 
                }
            },
        });

        lineMetrics.forEach((metric, index) => {
            if (!metric?.values?.some(v => v != null)) return;
            traces.push(buildLineMetricTrace(metric, overlayYAxisKey(index)));
        });

        // Prop line (if set)
        if (propLine) {
            traces.push({
                x: dates,
                y: Array(dates.length).fill(Number(propLine)),
                type: 'scatter',
                mode: 'lines',
                line: {
                    color: chartConfig.lightTheme ? '#6b7280' : '#9ca3af',
                    dash: 'dash',
                    width: 2,
                },
                name: 'Prop Line',
                hovertemplate: '<b>Prop Line</b><br>%{y}<extra></extra>',
                hoverlabel: {
                    bgcolor: chartConfig.lightTheme ? 'white' : '#1f2937',
                    bordercolor: chartConfig.lightTheme ? '#d1d5db' : '#4b5563',
                    font: { 
                        color: chartConfig.lightTheme ? '#1f2937' : '#e5e7eb', 
                        size: 12 
                    }
                },
            });
        }

        return traces;
    }, [dates, currentStatValues, statDisplayName, propLine, lineMetrics, chartConfig.lightTheme]);

    // Chart layout configuration
    const layout = useMemo(() => ({
        autosize: true,
        margin: { t: 40, r: 50, b: 80, l: 60 },
        font: {
            family: 'Inter, system-ui, sans-serif',
            color: chartConfig.lightTheme ? '#1f2937' : '#e5e7eb',
            size: 12
        },
        xaxis: {
            title: {
                text: 'Game Date',
                font: { 
                    size: 14, 
                    color: chartConfig.lightTheme ? '#374151' : '#e5e7eb' 
                }
            },
            tickangle: -45,
            automargin: true,
            type: 'category',
            tickmode: 'array',
            ticktext: dates,
            tickvals: Array.from({ length: dates.length }, (_, i) => i),
            gridcolor: chartConfig.lightTheme 
                ? 'rgba(0, 0, 0, 0.1)' 
                : 'rgba(75, 85, 99, 0.3)',
            gridwidth: 1,
            zeroline: false,
            linecolor: chartConfig.lightTheme ? '#d1d5db' : '#4b5563',
            tickfont: { 
                color: chartConfig.lightTheme ? '#6b7280' : '#9ca3af', 
                size: 11 
            },
        },
        yaxis: {
            title: {
                text: statDisplayName,
                font: { 
                    size: 14, 
                    color: chartConfig.lightTheme ? '#374151' : '#e5e7eb' 
                }
            },
            zeroline: false,
            gridcolor: chartConfig.lightTheme 
                ? 'rgba(0, 0, 0, 0.1)' 
                : 'rgba(75, 85, 99, 0.3)',
            gridwidth: 1,
            linecolor: chartConfig.lightTheme ? '#d1d5db' : '#4b5563',
            tickfont: { 
                color: chartConfig.lightTheme ? '#6b7280' : '#9ca3af', 
                size: 11 
            },
        },
        yaxis2: {
            title: lineMetrics[0]?.yaxisTitle || '',
            overlaying: 'y',
            side: 'right',
            rangemode: 'tozero',
            zeroline: false,
            showgrid: false,
            showticklabels: false,
            showline: false,
        },
        ...(lineMetrics.length > 1
            ? {
                yaxis3: {
                    title: lineMetrics[1]?.yaxisTitle || '',
                    overlaying: 'y',
                    side: 'right',
                    rangemode: 'tozero',
                    zeroline: false,
                    showgrid: false,
                    showticklabels: false,
                    showline: false,
                },
            }
            : {}),
        showlegend: true,
        legend: {
            x: 0.5,
            y: -0.45,
            xanchor: 'center',
            orientation: 'h',
            bgcolor: chartConfig.lightTheme 
                ? 'rgba(255,255,255,0.8)' 
                : 'rgba(0,0,0,0)',
            bordercolor: chartConfig.lightTheme ? '#e5e7eb' : 'rgba(0,0,0,0)',
            borderwidth: chartConfig.lightTheme ? 1 : 0,
            font: { 
                color: chartConfig.lightTheme ? '#374151' : '#e5e7eb', 
                size: 12 
            }
        },
        paper_bgcolor: chartConfig.lightTheme ? 'white' : 'rgba(0,0,0,0)',
        plot_bgcolor: chartConfig.lightTheme ? 'white' : 'rgba(0,0,0,0)',
        height: chartConfig.height || 450,
    }), [dates, statDisplayName, lineMetrics, chartConfig]);

    const oddsByBook = useMemo(() => {
        if (!odds?.length) return [];
        return [...odds].sort((a, b) => {
            if (a.sportbook === 'FanDuel') return -1;
            if (b.sportbook === 'FanDuel') return 1;
            return String(a.sportbook || '').localeCompare(String(b.sportbook || ''));
        });
    }, [odds]);

    const formatOddsPrice = (value) => {
        if (value == null || value === '') return '—';
        const n = Number(value);
        if (!Number.isFinite(n)) return String(value);
        return n > 0 ? `+${n}` : String(n);
    };

    const oddsAsOfLabel = useMemo(() => {
        const entry = odds?.find(
            (o) => o?.ingested_time != null || o?.ingestedTime != null
        );
        const raw = entry?.ingested_time ?? entry?.ingestedTime;
        if (raw == null || raw === '') return null;
        return formatIngestedTimeEastern(raw) ?? String(raw);
    }, [odds]);

    return (
        <div className="rounded-xl bg-neutral-900 p-6 shadow-lg">
            <h2 className="text-white text-2xl font-bold mb-6">
                {title || `Last ${numberOfGames} Games ${statDisplayName} History`}
            </h2>

            {/* Stat Selector Buttons */}
            <div className="mb-6 flex flex-wrap gap-2">
                {statOptions.map(option => (
                    <button
                        key={option.key}
                        onClick={() => onStatChange(option.key)}
                        className={`stat-button ${selectedStat === option.key ? 'active' : 'inactive'}`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Odds Display */}
            {onRefreshOdds && (
                <div className="mb-6 overflow-hidden rounded-xl border border-neutral-700/80 bg-neutral-800/60">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-700/80 px-4 py-3">
                        <h3 className="text-white text-sm font-semibold tracking-wide">
                            Betting Odds
                            {oddsAsOfLabel && !oddsLoading && (
                                <span className="ml-2 font-normal text-neutral-400">
                                    · As of {oddsAsOfLabel}
                                </span>
                            )}
                            {oddsLoading && (
                                <span className="ml-2 font-normal text-neutral-500">· Updating…</span>
                            )}
                        </h3>
                        <button
                            type="button"
                            onClick={onRefreshOdds}
                            disabled={oddsLoading}
                            className="rounded-md border border-neutral-600 bg-neutral-700/80 px-3 py-1 text-xs font-medium text-neutral-200 transition hover:bg-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Refresh odds
                        </button>
                    </div>
                    {oddsByBook.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[280px] border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-neutral-700/60">
                                    <th
                                        scope="col"
                                        className="sticky left-0 z-10 bg-neutral-800/95 px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-neutral-500"
                                    />
                                    {oddsByBook.map((odd) => (
                                        <th
                                            key={odd.sportbook}
                                            scope="col"
                                            className="px-3 py-2.5 text-center font-normal"
                                        >
                                            <span className="block text-neutral-100 font-semibold">
                                                {odd.sportbook}
                                            </span>
                                            {odd.line != null && (
                                                <span className="mt-0.5 block text-xs font-medium text-neutral-400 tabular-nums">
                                                    {odd.line}
                                                </span>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-neutral-700/40">
                                    <th
                                        scope="row"
                                        className="sticky left-0 z-10 bg-neutral-800/95 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-emerald-400/90"
                                    >
                                        Over
                                    </th>
                                    {oddsByBook.map((odd) => (
                                        <td
                                            key={`${odd.sportbook}-over`}
                                            className="px-3 py-3 text-center font-semibold tabular-nums text-white"
                                        >
                                            {formatOddsPrice(odd.over)}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <th
                                        scope="row"
                                        className="sticky left-0 z-10 bg-neutral-800/95 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-rose-400/90"
                                    >
                                        Under
                                    </th>
                                    {oddsByBook.map((odd) => (
                                        <td
                                            key={`${odd.sportbook}-under`}
                                            className="px-3 py-3 text-center font-semibold tabular-nums text-white"
                                        >
                                            {formatOddsPrice(odd.under)}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    )}
                    {oddsByBook.length === 0 && (
                        <p className="px-4 py-6 text-center text-sm text-neutral-400">
                            {oddsLoading ? 'Loading odds…' : 'No odds available. Try refresh.'}
                        </p>
                    )}
                </div>
            )}

            {/* Controls */}
            <div className="prop-line-container flex flex-col items-center justify-center gap-4 p-4 rounded-lg shadow bg-neutral-800 mb-6">
                <div className="prop-line-and-games flex items-center gap-8">
                    <div className="prop-line-input flex items-center gap-2">
                        <label htmlFor="propLine" className="text-white font-medium">Prop Line:</label>
                        <input
                            id="propLine"
                            type="number"
                            value={propLine}
                            onChange={(e) => onPropLineChange(e.target.value)}
                            className="w-20 px-2 py-1 border rounded text-center bg-neutral-700 text-white border-neutral-600"
                            placeholder="0.5"
                        />
                    </div>
                    <div className="number-of-games-container flex items-center gap-2">
                        <label htmlFor="gameCount" className="text-white font-medium">Number of Games:</label>
                        <select
                            id="gameCount"
                            value={numberOfGames}
                            onChange={(e) => onNumberOfGamesChange(Number(e.target.value))}
                            className="px-3 py-2 border rounded-md bg-neutral-700 text-white border-neutral-600"
                        >
                            {numberOfGamesOptions.map(num => (
                                <option key={num} value={num}>
                                    {num} {num === 1 ? 'game' : 'games'}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {propLineStats && (
                    <div className="prop-line-stats flex items-center gap-4 text-sm">
                        <span className="font-bold text-green-500">
                            Above: {propLineStats.above} ({propLineStats.abovePct}%)
                        </span>
                        <span className="font-bold text-red-500">
                            Below: {propLineStats.below} ({propLineStats.belowPct}%)
                        </span>
                    </div>
                )}
            </div>

            {/* Chart */}
            {dates && dates.length > 0 && currentStatValues.length > 0 && (
                <div className={`rounded-xl ${chartConfig.lightTheme ? 'bg-white ring-1 ring-gray-200' : 'bg-neutral-950/80 ring-1 ring-neutral-800/80'} p-6 shadow-sm`}>
                    <Plot
                        data={traces}
                        layout={layout}
                        config={{
                            responsive: true,
                            displayModeBar: false,
                        }}
                        className="w-full"
                    />
                </div>
            )}
        </div>
    );
};

export default PlayerGameChart;

