import { useState } from 'react';
import './App.css';
import Scoreboard from './components/Scoreboard';
import MainContainer from './components/MainContainer';
import Login from './components/Login';
import Register from './components/Register';

function App() {
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [homeTeam, setHomeTeam] = useState('');
    const [awayTeam, setAwayTeam] = useState('');
    const [isAuthenticated, setAuthenticated] = useState(false); // New state for authentication
    const [showRegister, setShowRegister] = useState(false); // New state for registration

  // Handle team selection
  const handleTeamSelect = (teamName) => {setSelectedTeam(teamName)};

  // Handle game selection
  const handleGameSelect =  (homeTeam, awayTeam) => {
    setHomeTeam(homeTeam);
    setAwayTeam(awayTeam);
  };

  return (
    <div className="min-h-screen bg-neutral-800 flex flex-col">
        {!isAuthenticated ? (
            showRegister ? (
                <Register setShowRegister={setShowRegister} />
            ) : (
                <Login
                    setAuthenticated={setAuthenticated}
                    setShowRegister={setShowRegister}
                />
            )
        ) : (
            <div className="flex-grow flex flex-col">
                <Scoreboard
                    onTeamSelect={handleTeamSelect}
                    onGameSelect={handleGameSelect}
                />
                <div className="bg-neutral-800 flex-grow">
                    <MainContainer
                        teamName={selectedTeam}
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                        setAuthenticated={setAuthenticated} 
                    />
                </div>
            </div>
        )}
    </div>
);
}

export default App;