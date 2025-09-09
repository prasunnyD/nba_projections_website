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
        {/* Navigation Buttons */}
        <div className="mb-4 flex gap-4 p-4 justify-center">
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
              Go to NBA Page
            </button>
            <button 
              onClick={() => window.location.href = '/nfl'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
              Go to NFL Page
            </button>
        </div>

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