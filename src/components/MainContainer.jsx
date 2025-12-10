import { useState } from 'react'
import '../App.css'
import NBAPlayerScoresChart from './NBAPlayerScoresChart';
import TeamStatistics from './TeamStatistics';
import PlayerStatistics from './PlayerStatistics';
import TeamsDropdown from './TeamsDropdown';
import ShotChartContainer from './ShotChartContainer'; // Shotchart
import NBATeamOffensiveStatistics from './NBATeamOffensiveStatistics';
import { getTeamLogoUrl, getCityForLogo } from '../helpers/teamLogoUtils';
import { getPlayerImageUrlByName } from '../helpers/playerImageUtils';

export default function MainContainer({ teamName, homeTeam, awayTeam }) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [numberOfGames, setNumberOfGames] = useState(10);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [rosterData, setRosterData] = useState([]);
  const [activeMobileTab, setActiveMobileTab] = useState('teams'); // 'teams', 'player', 'stats'

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
    <div className="m-2 md:m-4 flex flex-col xl:flex-row gap-2 md:gap-4 bg-neutral-800">
      {/* Mobile/Tablet Tab Navigation */}
      <div className="xl:hidden flex gap-2 mb-2 bg-neutral-900 p-2 rounded-lg">
        <button
          onClick={() => setActiveMobileTab('teams')}
          className={`flex-1 py-2 px-3 rounded text-sm font-semibold transition-colors ${
            activeMobileTab === 'teams'
              ? 'bg-blue-600 text-white'
              : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
          }`}
        >
          Teams
        </button>
        <button
          onClick={() => setActiveMobileTab('player')}
          className={`flex-1 py-2 px-3 rounded text-sm font-semibold transition-colors ${
            activeMobileTab === 'player'
              ? 'bg-blue-600 text-white'
              : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
          }`}
        >
          Player
        </button>
        <button
          onClick={() => setActiveMobileTab('stats')}
          className={`flex-1 py-2 px-3 rounded text-sm font-semibold transition-colors ${
            activeMobileTab === 'stats'
              ? 'bg-blue-600 text-white'
              : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
          }`}
        >
          Stats
        </button>
      </div>

      {/* Left Column - 25% */}
      <div className={`w-full xl:w-1/4 rounded-lg bg-neutral-900 shadow p-2 md:p-4 ${
        activeMobileTab !== 'teams' ? 'hidden xl:block' : ''
      }`}>
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-2 md:mb-4">NBA Teams</h2>
        <TeamsDropdown
          onTeamSelect={handleTeamSelect}
          onRosterData={handleRosterData}
          onPlayerSelect={handlePlayerSelect}
          homeTeam={homeTeam}
        />
        <div className="space-y-2 md:space-y-4 mt-2 md:mt-4">
          {/* Offensive Statistics */}
          <div>
            <h3 className="text-sm md:text-base lg:text-lg font-semibold text-white mb-2">Team Offensive Statistics</h3>
            <NBATeamOffensiveStatistics selectedTeam={selectedTeam} />
          </div>
        </div>
      </div>

      {/* Middle Column - Player and Chart */}
      <div className={`w-full xl:w-1/2 rounded-lg bg-neutral-900 shadow p-2 md:p-4 ${
        activeMobileTab !== 'player' ? 'hidden xl:block' : ''
      }`}>
        {/* Player Info */}
        <div className="mb-2 md:mb-4">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-2 md:mb-4 flex flex-col sm:flex-row items-center justify-center gap-2">
            {selectedTeam && (
              <>
                {getTeamLogoUrl(getCityForLogo(selectedTeam), 'L') && (
                  <img 
                    src={getTeamLogoUrl(getCityForLogo(selectedTeam), 'L')} 
                    alt={`${selectedTeam} logo`}
                    className="w-12 h-12 md:w-16 md:h-16 lg:w-24 lg:h-24 object-contain flex-shrink-0"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <span className="text-center sm:text-left">{selectedTeam} - </span>
              </>
            )}
            <span className="text-center sm:text-left">Player Selected: {selectedPlayer || 'None'}</span>
            {selectedPlayer && getPlayerImageUrlByName(selectedPlayer, rosterData) && (
              <img 
                src={getPlayerImageUrlByName(selectedPlayer, rosterData)} 
                alt={`${selectedPlayer} headshot`}
                className="w-12 h-[60px] md:w-16 md:h-[80px] lg:w-24 lg:h-[120px] object-contain flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
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
              <div className="mt-3 md:mt-4 lg:mt-6">
                <ShotChartContainer playerName={selectedPlayer} opponentTeam={awayTeam} />
              </div>
            </>
          ) : (
            <div className="p-2 md:p-4 text-gray-500 bg-gray-100 rounded-lg text-sm md:text-base">
              Select a game card and then select a player to view their statistics.
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Team Statistics */}
      <div className={`w-full xl:w-1/4 rounded-lg bg-neutral-800 shadow p-2 md:p-4 ${
        activeMobileTab !== 'stats' ? 'hidden xl:block' : ''
      }`}>
        <h2 className="text-base md:text-lg lg:text-xl font-bold text-white mb-2 md:mb-4">Team Statistics</h2>
        <div>
          <TeamStatistics awayTeam={awayTeam} />
        </div>
      </div>
    </div>
  );
}
