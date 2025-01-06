import { useState } from 'react'
import '../App.css'

import GameHistoryForm from './GameHistoryForm'
import PlayerScoresChart from './PlayerScoresChart';
import TeamStatistics from './TeamStatistics';
export default function MainContainer({teamName}) {
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [numberOfGames, setNumberOfGames] = useState(10);
    
    const handleGameHistorySubmit = (playerName, gameCount) => {
      setSelectedPlayer(playerName);
      setNumberOfGames(gameCount);
    };
    return (
        <div className="m-4 flex gap-4 bg-neutral-800">
            {/* Left Column - 25% */}
            <div className="w-1/4 rounded-lg bg-neutral-800 shadow">
                ROSTER API RESPONSE
            </div>
    
            {/* Middle Column - 50% */}
            <div className="w-2/4 rounded-lg bg-neutral-800 shadow">
                <div className="form-container">
                    <GameHistoryForm onSubmit={handleGameHistorySubmit} />
                </div>
                <div className="chart-container">
                    <PlayerScoresChart playerName={selectedPlayer} numberOfGames={numberOfGames}/>
                </div>
            </div>
    
            {/* Right Column - 25% */}
            <div className="w-1/4 rounded-lg bg-neutral-800 shadow">
                <h2 className="text-xl font-bold p-4">Team Statistics</h2>
                <div>
                    {teamName ? (
                        <TeamStatistics teamName={teamName} />
                    ) : (
                        <div className="p-4 text-gray-500 bg-gray-100 rounded-lg">
                            Select a team from the scoreboard above to view statistics
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}