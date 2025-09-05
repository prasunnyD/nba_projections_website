import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { getApiBaseUrl, logApiCall } from '../utils/apiConfig';


const NFLPlayerStatistics = ({ playerName, position }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const client = axios.create({
        baseURL: getApiBaseUrl()
    });

    useEffect(() => {

        // Only fetch if playerName is not empty
        if (!playerName) return;
        if (!position) return;
        const fetchPlayerStatistics = async () => {
            setLoading(true);
            try {
                if (position === 'WR' || position === 'TE' || position === 'RB') {
                    console.log(`Fetching player statistics for ${playerName} with position ${position}`);
                    let rec_response = await client.get(`api/v1/nfl/players/${playerName}/receiving-stats`);
                    let rush_response = await client.get(`api/v1/nfl/players/${playerName}/rushing-stats`);
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
                    let pass_response = await client.get(`api/v1/nfl/players/${playerName}/passing-stats`);
                    let rush_response = await client.get(`api/v1/nfl/players/${playerName}/rushing-stats`);
                }
    
            } catch (error) {
                console.error('API Error:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchPlayerStatistics();
    }, [playerName]);

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
        {data && (
            <div className="p-4">
                <h4 className="text-xl font-bold text-white mb-4">Season Averages</h4>
                <div className="overflow-x-auto bg-neutral-800 rounded-lg p-4 mb-6">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="px-4 py-2 text-md font-large text-gray-300">Total Offensive Plays : {data.TotalOffensivePlays.value}</th>
                                <th className="px-4 py-2 text-md font-large text-gray-300">Net Yards Per Game : {data.NetYardsPerGame.value}</th>
                                <th className="px-4 py-2 text-md font-large text-gray-300">Average Gain : {data.AvgGain.value}</th>
                            </tr>
                        </thead>
                    </table>
                </div>
                
                {/* Receiving Stats Table */}
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
                            {data.ReceivingFirstDowns.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data.ReceivingTargets.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data.YardsPerReception.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data.YardsFromScrimmagePerGame.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data.ReceivingYardsAfterCatch.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data.ReceivingYardsAtCatch.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data.ReceivingYardsPerGame.value}
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </div>
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
                            {data.RushingFirstDowns.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data.RushingAttempts.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data.RushingYards.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data.RushingYardsPerGame.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data.RushingYards.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data.RushingTouchdowns.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data.LongRushing.value}
                        </td>
                        <td className="px-4 py-2 text-left text-white">
                            {data.RushingFumbles.value}
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </div>
            </div>
        )}
        </div>
    );
};

export default NFLPlayerStatistics;