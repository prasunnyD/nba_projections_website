import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Scoreboard from './components/Scoreboard';
import MainContainer from './components/MainContainer';
import NFLStats from './components/NFLStats';

// Navigation component that uses useNavigate inside Router context
function Navigation() {
  const navigate = useNavigate();
  
  return (
    <div className="mb-4 flex gap-4 p-4 justify-center">
      <button 
        onClick={() => navigate('/')}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
      >
        Go to NBA Page
      </button>
      <button 
        onClick={() => navigate('/nfl')}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
      >
        Go to NFL Page
      </button>
    </div>
  );
}

// Main app content component
function AppContent() {
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
    <>
      <Navigation />
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
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-neutral-800">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;