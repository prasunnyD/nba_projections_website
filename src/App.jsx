import { useState } from 'react'
import './App.css'

import Scoreboard from './components/Scoreboard';
import MainContainer from './components/MainContainer'; 
function App() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  const handleTeamSelect = (teamName) => {
    setSelectedTeam(teamName);
  };
  return (
    <>
    <div className="min-h-screen bg-neutral-800">
      <div class="bg-neutral-800 shadow">
        <div className="scoreboard-container">
          <Scoreboard onTeamSelect={handleTeamSelect} />
        </div>
      </div>
    </div>
    <div class="bg-neutral-800 h-screen">
      <MainContainer teamName={selectedTeam} />
    </div>
  </>
  )
}

export default App


