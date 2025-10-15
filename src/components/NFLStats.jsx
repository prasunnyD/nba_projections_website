import { useState } from 'react'
import '../App.css'
import NFLPlayerGameChart from './NFLPlayerGameChart';
import NFLPlayerStatistics from './NFLPlayerStatistics';
import NFLTeamDropdown from './NFLTeamDropdown';
import NFLTeamStatistics from './NFLTeamStatistics';
import NFLTeamOffensiveStatistics from './NFLTeamOffensiveStatistics';
import QBPassChart from './QBPassChart';

export default function MainContainer({teamName, homeTeam, awayTeam}) {
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [numberOfGames, setNumberOfGames] = useState(10);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [rosterData, setRosterData] = useState([]);
    const [playerPosition, setPlayerPosition] = useState('');

    const handlePlayerSelect = (playerName) => {
        setSelectedPlayer(playerName);
        setNumberOfGames(10);
    };

    const handleTeamSelect = (teamName) => {
        setSelectedTeam(teamName);
    };

    const handleRosterData = (roster) => {
        setRosterData(roster);
    };

    const handlePlayerPosition = (playerPosition) => {
        setPlayerPosition(playerPosition);
    };

    return (
        <div className="m-4 flex gap-4 bg-neutral-800">
            {/* Left Column - 25% */}
            <div className="w-1/4 rounded-lg bg-neutral-900 shadow p-4">
                <h2 className="text-2xl font-bold text-white mb-4">NFL Teams</h2>
                <NFLTeamDropdown
                    onTeamSelect={handleTeamSelect}
                    onRosterData={handleRosterData}
                    onPlayerSelect={handlePlayerSelect}
                    onPlayerPosition={handlePlayerPosition}
                />
                <div className="space-y-4">
                    {/* Offensive Statistics */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Team Offensive Statistics</h3>
                        <NFLTeamOffensiveStatistics selectedTeam={selectedTeam} />
                    </div>
                </div>
            </div>
            
    
            {/* Middle Column - Player and Chart */}
            <div className="w-1/2 rounded-lg bg-neutral-900 shadow p-4">
                {/* Player Info and Game History Form */}
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        {selectedTeam ? `${selectedTeam} - ` : ''}Player Selected: {selectedPlayer || 'None'}
                    </h2>
                    <NFLPlayerStatistics playerName={selectedPlayer} position={playerPosition} />
                </div>  

                {/* Player Scores Chart */}
                <div>
                    {selectedPlayer ? (
                        <>
                            <NFLPlayerGameChart
                                playerName={selectedPlayer}
                                numberOfGames={numberOfGames}
                                setNumberOfGames={setNumberOfGames}
                                position={playerPosition}
                            />
                        
                        <div className="mt-6">
                            <QBPassChart playerName={selectedPlayer} />
                        </div>
                        </>
                    ) : (
                        <div className="p-4 text-gray-500 bg-gray-100 rounded-lg">
                            Select a game card and then select a player to view their statistics.
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column - Team Statistics */}
            <div className="w-1/4 rounded-lg bg-neutral-900 shadow p-4">
                <h2 className="text-xl font-bold text-white mb-4">Opponent Team Statistics</h2>
                <div>
                    <NFLTeamStatistics />
                </div>
            </div>
        </div>
    );
}