import { useState } from 'react';
import './App.css';
import { useEffect } from 'react';
import axios from 'axios';
import Scoreboard from './components/Scoreboard';
import MainContainer from './components/MainContainer';

const specialCases = {
  'LA Lakers': 'Los Angeles Lakers',
  
  'Golden State': 'Golden State',
  'New York': 'New York',
  'New Orleans': 'New Orleans',
  'San Antonio': 'San Antonio',
  'Oklahoma City': 'Oklahoma City',
  'LA Clippers': 'Los Angeles Clippers' // Add this mapping
};
const processTeamName = (teamName) => {
  // Check if the teamName exists in specialCases
  if (specialCases[teamName]) {
      return specialCases[teamName];
  }
  // Return the original teamName if no mapping is found
  return teamName;
};


function App() {
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [homeRoster, setHomeRoster] = useState(() => {
    // Load home roster from localStorage if it exists
    const savedHomeRoster = localStorage.getItem('homeRoster');
    return savedHomeRoster ? JSON.parse(savedHomeRoster) : { players: [] };
});

const [awayRoster, setAwayRoster] = useState(() => {
    // Load away roster from localStorage if it exists
    const savedAwayRoster = localStorage.getItem('awayRoster');
    return savedAwayRoster ? JSON.parse(savedAwayRoster) : { players: [] };
});
    const [selectedTeams, setSelectedTeams] = useState({ homeTeam: '', awayTeam: '' });
    const [homeTeamName, setHomeTeamName] = useState("");
    const [awayTeamName, setAwayTeamName] = useState("");
    const [selectedGame, setSelectedGame] = useState(null);

  // Handle team selection
    const handleTeamSelect = (teamName) => {
    setSelectedTeam(teamName);
  };

  // Handle game selection and fetch roster data
  const handleGameSelect = async (homeTeam, awayTeam) => {
    
    console.log("Game app.jsx selected:", homeTeam, awayTeam);
    setSelectedTeams({ homeTeam, awayTeam });

    try {
      setSelectedGame(`${homeTeam} vs ${awayTeam}`);
      const client = axios.create({ baseURL: 'http://localhost:8000' });

      const processedHomeTeam = processTeamName(homeTeam);
      const processedAwayTeam = processTeamName(awayTeam);

      const homeResponse = await client.get(`/team-roster/${processedHomeTeam}`);
      const awayResponse = await client.get(`/team-roster/${processedAwayTeam}`);

      console.log("Home app.jsx response data:", homeResponse.data);
      console.log("Away app.jsx response data:", awayResponse.data);

      const homeRosterData = homeResponse.data || []; // Ensure the data exists
      const awayRosterData = awayResponse.data || []; // Ensure the data exists

      

      console.log("Setting Home Roster:", homeRosterData);
      console.log("Setting Away Roster:", awayRosterData);
      setHomeTeamName(homeTeam); // Save home team name
      setAwayTeamName(awayTeam); // Save away team name

      setHomeRoster(homeRosterData);
      setAwayRoster(awayRosterData);
    } catch (error) {
      console.error("Error fetching rosters:", error);
    }
  };


  
  return (
    <div className="min-h-screen bg-neutral-800">
      {/* Render Scoreboard at the top */}
      <Scoreboard onTeamSelect={handleTeamSelect} onGameSelect={handleGameSelect} />

      {/* Pass data to MainContainer for roster and team display */}
      <div className="bg-neutral-800 h-screen">
        <MainContainer
          teamName={selectedTeam}
          homeRoster={homeRoster}
          awayRoster={awayRoster}
          homeTeamName={homeTeamName} // Pass the home team name
          awayTeamName={awayTeamName} // Pass the away team name
          selectedTeams={selectedTeams}
        />
      </div>
    </div>
  );
}

export default App;