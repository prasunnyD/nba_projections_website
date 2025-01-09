import { useState } from 'react'
import '../App.css'

import GameHistoryForm from './GameHistoryForm'
import PlayerScoresChart from './PlayerScoresChart';
import TeamStatistics from './TeamStatistics';
import Roster from './Roster';
import Scoreboard from './Scoreboard'; // Ensure the path is correct



export default function MainContainer({teamName, homeTeam, awayTeam,homeTeamName, awayTeamName}) {
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [numberOfGames, setNumberOfGames] = useState(10);
    const [selectedPlayerName, setSelectedPlayerName] = useState('');


    const handleGameHistorySubmit = (playerName, gameCount) => {
      setSelectedPlayer(playerName);
      setNumberOfGames(gameCount);
    };
    const handlePlayerSelect = (playerName) => {
        setSelectedPlayerName(playerName); // Update the state with the selected player's name
        handleGameHistorySubmit(playerName, 10);
    };

    return (
        <div className="m-4 flex gap-4 bg-neutral-800">
            
            {/* Left Column - 25% */}

            <div className="w-1/4 rounded-lg bg-neutral-900 shadow p-4">
                <h2 className="text-xl font-bold text-white mb-4">Team Rosters</h2>
               
                <Roster
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                    homeTeamName={homeTeamName} // Pass the home team name
                    awayTeamName={awayTeamName} // Pass the away team name
                    onPlayerSelect={handlePlayerSelect}
                />
            </div>
    
            {/* Middle Column - 50% */}
            <div className="w-2/4 rounded-lg bg-neutral-800 shadow">
                <div className="form-container">
                    <GameHistoryForm onSubmit={handleGameHistorySubmit} />
                    {selectedPlayerName} 
                    {setSelectedPlayerName} 
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