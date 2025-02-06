import { useState } from 'react'
import '../App.css'
import PlayerScoresChart from './PlayerScoresChart';
import TeamStatistics from './TeamStatistics';
import PlayerStatistics from './PlayerStatistics';
import Roster from './Roster';

export default function MainContainer({teamName, homeTeam, awayTeam,setAuthenticated }) {
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [numberOfGames, setNumberOfGames] = useState(10);

    const handlePlayerSelect = (playerName) => {
        setSelectedPlayer(playerName);
        setNumberOfGames(10);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setAuthenticated(false);
    };

    return (
        <div className="flex flex-col min-h-screen bg-neutral-800">
            {/* Main Content */}
            <div className="flex flex-grow gap-4 m-4">
                {/* Left Column - Team Rosters */}
                <div className="w-1/4 rounded-lg bg-neutral-900 shadow p-4">
                    <h2 className="text-2xl font-bold text-white mb-4">Team Rosters</h2>
                    <Roster homeTeam={homeTeam} awayTeam={awayTeam} onPlayerSelect={handlePlayerSelect} />
                </div>

                {/* Middle Column - Player and Chart */}
                <div className="w-1/2 rounded-lg bg-neutral-900 shadow p-4">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            Player Selected: {selectedPlayer || 'None'}
                        </h2>
                        <PlayerStatistics playerName={selectedPlayer} />
                    </div>  

                    <div>
                        {selectedPlayer ? (
                            <PlayerScoresChart
                                playerName={selectedPlayer}
                                numberOfGames={numberOfGames}
                                setNumberOfGames={setNumberOfGames}
                            />
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
                    {teamName ? (
                        <TeamStatistics teamName={teamName} />
                    ) : (
                        <div className="p-4 text-gray-500 bg-gray-100 rounded-lg">
                            Select a team from the scoreboard above to view statistics.
                        </div>
                    )}
                </div>
            </div>

            {/* Logout Button Fixed at Bottom */}
            <div className="w-full flex justify-center bg-neutral-900 py-4">
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full text-lg font-medium transition duration-300 transform hover:scale-105 shadow-md"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}