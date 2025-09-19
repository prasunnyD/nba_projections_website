import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { getApiBaseUrl, logApiCall } from '../utils/apiConfig';


const NFLPlayerStatistics = ({ playerName, position }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Add a state to track if we're transitioning between positions
    const [isTransitioning, setIsTransitioning] = useState(false);

    const client = axios.create({
        baseURL: getApiBaseUrl(),
    });

    useEffect(() => {
        // Immediately clear data and show loading when position changes
        setData(null);
        setError(null);
        setLoading(true);
        setIsTransitioning(true);

        // Only fetch if playerName is not empty
        if (!playerName) return;
        if (!position) return;
        
        const fetchPlayerStatistics = async () => {
            try {
                if (position === 'WR' || position === 'TE' || position === 'RB') {
                    console.log(`Fetching player statistics for ${playerName} with position ${position}`);
                    let rec_response = await client.get(`nfl/players/${playerName}/receiving-stats`);
                    let rush_response = await client.get(`nfl/players/${playerName}/rushing-stats`);
                    const rec_data = rec_response.data?.stats;
                    const rush_data = rush_response.data?.stats;
                    setData({
                        AvgGain:{ value: rec_data.avgGain },
                        NetTotalYards:{ value: rec_data.netTotalYards },
                        NetYardsPerGame:{ value: rec_data.netYardsPerGame },
                        ReceivingFirstDowns:{ value: rec_data.receivingFirstDowns },
                        ReceivingTargets:{ value: rec_data.receivingTargets },
                        YardsPerReception:{ value: rec_data.yardsPerReception },
                        YardsFromScrimmagePerGame:{ value: rec_data.yardsFromScrimmagePerGame },
                        ReceivingYardsAfterCatch:{ value: rec_data.receivingYardsAfterCatch },
                        ReceivingYardsAtCatch:{ value: rec_data.receivingYardsAtCatch },
                        ReceivingYardsPerGame:{ value: rec_data.receivingYardsPerGame },
                        TotalOffensivePlays:{ value: rec_data.totalOffensivePlays },
                        RushingFirstDowns:{ value: rush_data.rushingFirstDowns },
                        RushingAttempts:{ value: rush_data.rushingAttempts },
                        RushingYards:{ value: rush_data.rushingYards },
                        RushingYardsPerGame:{ value: rush_data.rushingYardsPerGame },
                        RushingYardsPerCarry:{ value: rush_data.rushingYardsPerCarry },
                        RushingTouchdowns:{ value: rush_data.rushingTouchdowns },
                        LongRushing: { value: rush_data.longRushing },
                        RushingFumbles:{ value: rush_data.rushingFumbles },
                    });
                } else if (position === 'QB') {
                    let pass_response = await client.get(`nfl/players/${playerName}/passing-stats`);
                    let rush_response = await client.get(`nfl/players/${playerName}/rushing-stats`);
                    const pass_data = pass_response.data?.stats;
                    const rush_data = rush_response.data?.stats;
                    setData({
                        // Rushing stats
                        RushingFirstDowns: { value: rush_data.rushingFirstDowns },
                        RushingAttempts: { value: rush_data.rushingAttempts },
                        RushingYards: { value: rush_data.rushingYards },
                        RushingYardsPerGame: { value: rush_data.rushingYardsPerGame },
                        RushingYardsPerCarry: { value: rush_data.rushingYardsPerCarry },
                        RushingTouchdowns: { value: rush_data.rushingTouchdowns },
                        LongRushing: { value: rush_data.longRushing },
                        RushingFumbles: { value: rush_data.rushingFumbles },

                        // Additional fields from pass_data (using mapping as described)
                        AvgGain: { value: pass_data.avgGain },
                        CompletionPct: { value: pass_data.completionPct },
                        Completions: { value: pass_data.completions },
                        InterceptionPct: { value: pass_data.interceptionPct },
                        Interceptions: { value: pass_data.interceptions },
                        LongPassing: { value: pass_data.longPassing },
                        PassingYards: { value: pass_data.passingYards },
                        NetPassingYards: { value: pass_data.netPassingYards },
                        NetPassingYardsPerGame: { value: pass_data.netPassingYardsPerGame },
                        NetTotalYards: { value: pass_data.netTotalYards },
                        NetYardsPerGame: { value: pass_data.netYardsPerGame },
                        PassingAttempts: { value: pass_data.passingAttempts },
                        TotalOffensivePlays:{ value: pass_data.totalOffensivePlays },
                        Player_name: { value: pass_data.player_name },
                    });
                }
        
            } catch (error) {
                console.error('API Error:', error);
                setError(error);
                setIsTransitioning(false);
            } finally {
                setLoading(false);
            }
        };
    
        fetchPlayerStatistics();
    }, [playerName, position]); // Add position to dependency array

    return (
        <div className="bg-neutral-700 shadow-lg overflow-y-auto h-full">
        {loading && (
            <div className="flex items-center justify-center h-full">
                <div>Loading...</div>
            </div>
        )}
        {error && (
            <div className="flex items-center justify-center h-full">
                <div className="text-red-500">Error loading team statistics</div>
            </div>
        )}
        {data && !isTransitioning && (
            <div className="p-4">
                <h4 className="text-xl font-bold text-white mb-4">Season Averages</h4>
                <div className="overflow-x-auto bg-neutral-800 rounded-lg p-4 mb-6">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="px-4 py-2 text-md font-large text-gray-300">Total Offensive Plays : {data?.TotalOffensivePlays?.value || 0}</th>
                                <th className="px-4 py-2 text-md font-large text-gray-300">Net Yards Per Game : {(data?.NetYardsPerGame?.value || 0).toFixed(2)}</th>
                                <th className="px-4 py-2 text-md font-large text-gray-300">Average Gain : {(data?.AvgGain?.value || 0).toFixed(2)}</th>
                            </tr>
                        </thead>
                    </table>
                </div>
                
                {/* Receiving Stats Table */}
                {(position === 'WR' || position === 'TE' || position === 'RB') && (
                    <>
                    <h4 className="text-xl font-bold text-white mb-4">Receiving Stats</h4>
                    <div className="overflow-x-auto bg-neutral-800 rounded-lg p-4 mb-6">
                        <table className="min-w-full">
                            <thead>
                        <tr className="border-b border-gray-700">
                            <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Receiving First Downs</th>
                            <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Receiving Targets</th>
                            <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Yards Per Reception</th>
                            <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Yards From Scrimmage Per Game</th>
                            <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Receiving Yards After Catch</th>
                            <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Receiving Yards At Catch</th>
                            <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Receiving Yards Per Game</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="px-4 py-2 text-left text-white">
                                {data?.ReceivingFirstDowns?.value || 0}
                            </td>
                            <td className="px-4 py-2 text-left text-white">
                                {data?.ReceivingTargets?.value || 0}
                            </td>
                            <td className="px-4 py-2 text-left text-white">
                                {(data?.YardsPerReception?.value || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-left text-white">
                                {(data?.YardsFromScrimmagePerGame?.value || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-left text-white">
                                {data?.ReceivingYardsAfterCatch?.value}
                            </td>
                            <td className="px-4 py-2 text-left text-white">
                                {data?.ReceivingYardsAtCatch?.value}
                            </td>
                            <td className="px-4 py-2 text-left text-white">
                                {(data?.ReceivingYardsPerGame?.value || 0).toFixed(2)}
                            </td>
                            </tr>
                        </tbody>
                        </table>
                    </div>
                </>
                )}
                {/* Rushing Stats Table */}
                <h4 className="text-xl font-bold text-white mb-4">Rushing Stats</h4>
                <div className="overflow-x-auto bg-neutral-800 rounded-lg p-4 mb-6">
                    <table className="min-w-full">
                        <thead>
                    <tr className="border-b border-gray-700">
                        <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Rushing First Downs</th>
                        <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Rushing Attempts</th>
                        <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Rushing Yards</th>
                        <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Rushing Yards Per Game</th>
                        <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Rushing Yards Per Carry</th>
                        <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Rushing Touchdowns</th>
                        <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Long Rushing</th>
                        <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Rushing Fumbles</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="px-4 py-2 text-left text-white">
                            {data?.RushingFirstDowns?.value || 0}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data?.RushingAttempts?.value || 0}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data?.RushingYards?.value || 0}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {(data?.RushingYardsPerGame?.value || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data?.RushingYardsPerCarry?.value || 0}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data?.RushingTouchdowns?.value || 0}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data?.LongRushing?.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data?.RushingFumbles?.value || 0}
                        </td>
                        </tr>
                    </tbody>
                </table>
                </div>
                
                {/* Passing Stats Table - moved outside of rushing stats table */}
                {position === 'QB' && (
                    <>
                        <h4 className="text-xl font-bold text-white mb-4">Passing Stats</h4>
                        <div className="overflow-x-auto bg-neutral-800 rounded-lg p-4 mb-6">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Passing Attempts</th>
                                        <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Completions</th>
                                        <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Completion %</th>
                                        <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Passing Yards</th>
                                        <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Net Passing Yards</th>
                                        <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Net Passing Yards/Game</th>
                                        <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Net Total Yards</th>
                                        <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Net Yards/Game</th>
                                        <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Interceptions</th>
                                        <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Interception %</th>
                                        <th className="px-4 py-2 text-left text-md font-medium text-gray-300">Long Passing</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="px-4 py-2 text-left text-white">
                                            {data?.PassingAttempts?.value || 0}
                                        </td>
                                        <td className="px-4 py-2 text-left text-white">
                                            {data?.Completions?.value || 0}
                                        </td>
                                        <td className="px-4 py-2 text-left text-white">
                                            {(data?.CompletionPct?.value || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2 text-left text-white">
                                            {data?.PassingYards?.value || 0}
                                        </td>
                                        <td className="px-4 py-2 text-left text-white">
                                            {data?.NetPassingYards?.value || 0}
                                        </td>
                                        <td className="px-4 py-2 text-left text-white">
                                            {(data?.NetPassingYardsPerGame?.value || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2 text-left text-white">
                                            {data?.NetTotalYards?.value || 0}
                                        </td>
                                        <td className="px-4 py-2 text-left text-white">
                                            {(data?.NetYardsPerGame?.value || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2 text-left text-white">
                                            {data?.Interceptions?.value || 0}
                                        </td>
                                        <td className="px-4 py-2 text-left text-white">
                                            {(data?.InterceptionPct?.value || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2 text-left text-white">
                                            {data?.LongPassing?.value}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        )}
        </div>
    );
};

export default NFLPlayerStatistics;