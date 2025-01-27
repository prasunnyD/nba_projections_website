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

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token
    setAuthenticated(false); // Set authentication to false
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
                    />
                </div>
                <div className="bg-neutral-900 text-white py-4 flex justify-center items-center shadow-lg">
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full flex items-center justify-center space-x-2 text-lg font-medium transition duration-300 transform hover:scale-105 shadow-md"
                    >
                        <span>Logout</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 9V5.25a2.25 2.25 0 00-2.25-2.25h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18.75 12h-12m9 0l-3 3m3-3l-3-3"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        )}
    </div>
);
}

export default App;