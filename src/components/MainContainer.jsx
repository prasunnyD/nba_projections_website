import { useState } from 'react'
import '../App.css'
import NBAPlayerScoresChart from './NBAPlayerScoresChart';
import TeamStatistics from './TeamStatistics';
import PlayerStatistics from './PlayerStatistics';
import TeamsDropdown from './TeamsDropdown';
import ShotChartContainer from './ShotChartContainer'; // Shotchart

export default function MainContainer({ teamName, homeTeam, awayTeam }) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [numberOfGames, setNumberOfGames] = useState(10);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [rosterData, setRosterData] = useState([]);

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

  return (
    <div className="m-4 flex gap-4 bg-neutral-800">
      {/* Left Column - 25% */}
      <div className="w-1/4 rounded-lg bg-neutral-900 shadow p-4">
        <h2 className="text-2xl font-bold text-white mb-4">NBA Teams</h2>
        <TeamsDropdown
          onTeamSelect={handleTeamSelect}
          onRosterData={handleRosterData}
          onPlayerSelect={handlePlayerSelect}
        />
      </div>

      {/* Middle Column - Player and Chart */}
      <div className="w-1/2 rounded-lg bg-neutral-900 shadow p-4">
        {/* Player Info */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white mb-4">
            {selectedTeam ? `${selectedTeam} - ` : ''}Player Selected: {selectedPlayer || 'None'}
          </h2>
          <PlayerStatistics playerName={selectedPlayer} />
        </div>

        {/* Player Scores Chart + Shot Chart */}
        <div>
          {selectedPlayer ? (
            <>
              <NBAPlayerScoresChart
                playerName={selectedPlayer}
                numberOfGames={numberOfGames}
                setNumberOfGames={setNumberOfGames}
              />

              {/* Shot chart block (data & seasons handled inside the container) */}
              <div className="mt-6">
                <ShotChartContainer playerName={selectedPlayer} />
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
      <div className="w-1/4 rounded-lg bg-neutral-800 shadow p-4">
        <h2 className="text-xl font-bold text-white mb-4">Team Statistics</h2>
        <div>
          <TeamStatistics />
        </div>
      </div>
    </div>
  );
}
