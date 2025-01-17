import { useState } from 'react'
import '../App.css'
import PlayerScoresChart from './PlayerScoresChart';
import TeamStatistics from './TeamStatistics';
import PlayerStatistics from './PlayerStatistics';
import Roster from './Roster';

export default function MainContainer({teamName, homeTeam, awayTeam}) {
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [numberOfGames, setNumberOfGames] = useState(10);

    const handlePlayerSelect = (playerName) => {
        setSelectedPlayer(playerName);
        setNumberOfGames(10);
    };

    return (
        <div className="m-4 flex gap-4 bg-neutral-800">
            {/* Left Column - 25% */}
            <div className="w-1/4 rounded-lg bg-neutral-900 shadow p-4">
                <h2 className="text-2xl font-bold text-white mb-4">Team Rosters</h2>
                <Roster
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                    onPlayerSelect={handlePlayerSelect}
                />
            </div>
    
            {/* Middle Column - Player and Chart */}
            <div className="w-1/2 rounded-lg bg-neutral-900 shadow p-4">
                {/* Player Info and Game History Form */}
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        Player Selected: {selectedPlayer || 'None'}
                    </h2>
                    <PlayerStatistics playerName={selectedPlayer} />
                </div>  

                {/* Player Scores Chart */}
                <div>
                    {selectedPlayer ? (
                        <>
                            <PlayerScoresChart
                                playerName={selectedPlayer}
                                numberOfGames={numberOfGames}
                                setNumberOfGames={setNumberOfGames}
                            />
                        </>
                    ) : (
                        <div className="p-4 text-gray-500 bg-gray-100 rounded-lg">
                            Select a game card and then select a player to view their statistics.
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column - Team Statistics */}
            <div className="w-1/4 rounded-lg bg-neutral-800 shadow p-4">
                <h2 className="text-xl font-bold text-white mb-4">Team Statistics</h2>
                <div>
                    {teamName ? (
                        <TeamStatistics teamName={teamName} />
                    ) : (
                        <div className="p-4 text-gray-500 bg-gray-100 rounded-lg">
                            Select a team from the scoreboard above to view statistics.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}