import { useState } from 'react';
import './App.css';
import Scoreboard from './components/Scoreboard';
import MainContainer from './components/MainContainer';

function App() {
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [homeTeam, setHomeTeam] = useState('');
    const [awayTeam, setAwayTeam] = useState('');
    const [selectedTeams, setSelectedTeams] = useState({ homeTeam: '', awayTeam: '' });

  // Handle team selection
  const handleTeamSelect = (teamName) => {setSelectedTeam(teamName)};

  // Handle game selection
  const handleGameSelect =  (homeTeam, awayTeam) => {
    setHomeTeam(homeTeam);
    setAwayTeam(awayTeam);
  };

  return (
    <div className="min-h-screen bg-neutral-800">
      {/* Render Scoreboard at the top */}
      <Scoreboard onTeamSelect={handleTeamSelect} onGameSelect={handleGameSelect} />

      {/* Pass data to MainContainer for roster and team display */}
      <div className="bg-neutral-800 h-screen">
        <MainContainer
          teamName={selectedTeam}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          selectedTeams={selectedTeams}
        />
      </div>
    </div>
  );
}

export default App;