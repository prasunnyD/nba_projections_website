import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Scoreboard from './components/Scoreboard';
import MainContainer from './components/MainContainer';
import NFLStats from './components/NFLStats';

function App() {
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [homeTeam, setHomeTeam] = useState('');
    const [awayTeam, setAwayTeam] = useState('');

  // Handle team selection
  const handleTeamSelect = (teamName) => {setSelectedTeam(teamName)};

  // Handle game selection
  const handleGameSelect =  (homeTeam, awayTeam) => {
    setHomeTeam(homeTeam);
    setAwayTeam(awayTeam);
  };

  return (
    <Router>
      <div className="min-h-screen bg-neutral-800">
        {/* Render Scoreboard at the top */}
        <Scoreboard onTeamSelect={handleTeamSelect} onGameSelect={handleGameSelect} />

        {/* Define routes for different pages */}
        <Routes>
          <Route 
            path="/" 
            element={
              <>
                <Scoreboard onTeamSelect={handleTeamSelect} onGameSelect={handleGameSelect} />
                <div className="bg-neutral-800 h-screen">
                  <MainContainer
                    teamName={selectedTeam}
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                  />
                </div>
              </>
            } 
          />
          <Route path="/nfl" element={<NFLStats/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;