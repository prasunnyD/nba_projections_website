import React, { useMemo, useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

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
 * @param {Object} props.secondaryMetric - Optional secondary metric config
 * @param {Array<number|null>} props.secondaryMetric.values - Secondary metric values
 * @param {string} props.secondaryMetric.name - Secondary metric name
 * @param {string} props.secondaryMetric.yaxisTitle - Secondary metric y-axis title
 * @param {string} props.secondaryMetric.color - Secondary metric line color
 * @param {Array} props.odds - Optional array of odds data
 * @param {boolean} props.oddsLoading - Whether odds are loading
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
    odds = [],
    oddsLoading = false,
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

        // Secondary metric (if provided)
        if (secondaryMetric && secondaryMetric.values && secondaryMetric.values.some(v => v != null)) {
            traces.push({
                x: dates,
                y: secondaryMetric.values,
                type: 'scatter',
                mode: 'lines+markers',
                name: secondaryMetric.name,
                yaxis: 'y2',
                line: { 
                    color: secondaryMetric.color || '#f59e0b', 
                    width: 2.5 
                },
                marker: { 
                    color: secondaryMetric.color || '#f59e0b', 
                    size: 7, 
                    line: { 
                        color: secondaryMetric.color || '#d97706', 
                        width: 1 
                    } 
                },
                hovertemplate: secondaryMetric.customdata 
                    ? `<b>%{x}</b><br>%{y:.1f}${secondaryMetric.unit || ''}<br>Snaps: %{customdata}<extra>${secondaryMetric.name}</extra>`
                    : `<b>%{x}</b><br>${secondaryMetric.name}: %{y:.1f}${secondaryMetric.unit || ''}<extra></extra>`,
                hoverlabel: {
                    bgcolor: chartConfig.lightTheme ? 'white' : '#1f2937',
                    bordercolor: chartConfig.lightTheme ? '#d1d5db' : '#4b5563',
                    font: { 
                        color: chartConfig.lightTheme ? '#1f2937' : '#e5e7eb', 
                        size: 12 
                    }
                },
                ...(secondaryMetric.customdata ? { customdata: secondaryMetric.customdata } : {})
            });
        }

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
    }, [dates, currentStatValues, statDisplayName, propLine, secondaryMetric, chartConfig.lightTheme]);

    // Detect mobile screen size
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Chart layout configuration
    const layout = useMemo(() => ({
        autosize: true,
        margin: isMobile 
            ? { t: 20, r: 20, b: 60, l: 40 }
            : { t: 40, r: 50, b: 80, l: 60 },
        font: {
            family: 'Inter, system-ui, sans-serif',
            color: chartConfig.lightTheme ? '#1f2937' : '#e5e7eb',
            size: isMobile ? 10 : 12
        },
        xaxis: {
            title: {
                text: 'Game Date',
                font: { 
                    size: isMobile ? 12 : 14, 
                    color: chartConfig.lightTheme ? '#374151' : '#e5e7eb' 
                }
            },
            tickangle: isMobile ? -60 : -45,
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
                size: isMobile ? 9 : 11 
            },
        },
        yaxis: {
            title: {
                text: statDisplayName,
                font: { 
                    size: isMobile ? 12 : 14, 
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
                size: isMobile ? 9 : 11 
            },
        },
        yaxis2: {
            title: secondaryMetric?.yaxisTitle || '',
            overlaying: 'y',
            side: 'right',
            rangemode: 'tozero',
            zeroline: false,
            showgrid: false,
            showticklabels: false,
            showline: false,
        },
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
        height: isMobile ? 300 : (chartConfig.height || 450),
    }), [dates, statDisplayName, secondaryMetric, chartConfig, isMobile]);

    return (
        <div className="rounded-xl bg-neutral-900 p-3 md:p-4 lg:p-6 shadow-lg">
            <h2 className="text-white text-lg md:text-xl lg:text-2xl font-bold mb-3 md:mb-4 lg:mb-6">
                {title || `Last ${numberOfGames} Games ${statDisplayName} History`}
            </h2>

            {/* Stat Selector Buttons */}
            <div className="mb-3 md:mb-4 lg:mb-6 flex flex-wrap gap-1.5 md:gap-2">
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
            {odds && odds.length > 0 && (
                <div className="mb-3 md:mb-4 lg:mb-6 rounded-lg bg-neutral-800 p-2 md:p-3 lg:p-4 shadow">
                    <h3 className="text-white text-sm md:text-base lg:text-lg font-semibold mb-2 md:mb-3">Betting Odds</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                        {odds.map((odd, index) => (
                            <div
                                key={index}
                                className="bg-neutral-700 rounded-lg p-3 border border-neutral-600"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-white font-bold">{odd.sportbook}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold">Line: {odd.line}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-2">
                                    <div className="flex-1 bg-green-600/20 rounded px-2 py-1 text-center">
                                        <p className="text-green-400 text-xs font-semibold">Over</p>
                                        <p className="text-white text-sm font-bold">{odd.over}</p>
                                    </div>
                                    <div className="flex-1 bg-red-600/20 rounded px-2 py-1 text-center">
                                        <p className="text-red-400 text-xs font-semibold">Under</p>
                                        <p className="text-white text-sm font-bold">{odd.under}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {oddsLoading && (
                <div className="mb-6 text-neutral-400 text-center">Loading odds...</div>
            )}

            {/* Controls */}
            <div className="prop-line-container flex flex-col items-center justify-center gap-2 md:gap-3 lg:gap-4 p-2 md:p-3 lg:p-4 rounded-lg shadow bg-neutral-800 mb-3 md:mb-4 lg:mb-6">
                <div className="prop-line-and-games flex flex-col sm:flex-row items-center gap-3 md:gap-4 lg:gap-8 w-full">
                    <div className="prop-line-input flex items-center gap-2">
                        <label htmlFor="propLine" className="text-white text-sm md:text-base font-medium">Prop Line:</label>
                        <input
                            id="propLine"
                            type="number"
                            value={propLine}
                            onChange={(e) => onPropLineChange(e.target.value)}
                            className="w-16 md:w-20 px-2 py-1 border rounded text-center bg-neutral-700 text-white border-neutral-600 text-sm md:text-base"
                            placeholder="0.5"
                        />
                    </div>
                    <div className="number-of-games-container flex items-center gap-2">
                        <label htmlFor="gameCount" className="text-white text-sm md:text-base font-medium">Games:</label>
                        <select
                            id="gameCount"
                            value={numberOfGames}
                            onChange={(e) => onNumberOfGamesChange(Number(e.target.value))}
                            className="px-3 md:px-3 py-2 md:py-2 border rounded-md bg-neutral-700 text-white border-neutral-600 text-sm md:text-base min-h-[44px] appearance-none cursor-pointer hover:bg-neutral-600 transition-colors"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: 'right 0.5rem center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '1.5em 1.5em',
                                paddingRight: '2.5rem'
                            }}
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
                    <div className="prop-line-stats flex flex-col sm:flex-row items-center gap-2 md:gap-4 text-xs md:text-sm">
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
                <div className={`rounded-xl ${chartConfig.lightTheme ? 'bg-white ring-1 ring-gray-200' : 'bg-neutral-950/80 ring-1 ring-neutral-800/80'} p-2 md:p-4 lg:p-6 shadow-sm overflow-x-auto`}>
                    <div className="min-w-full">
                        <Plot
                            data={traces}
                            layout={layout}
                            config={{
                                responsive: true,
                                displayModeBar: false,
                            }}
                            className="w-full"
                            style={{ width: '100%', minHeight: isMobile ? '300px' : '450px' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerGameChart;

