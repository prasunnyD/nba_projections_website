import { useState } from 'react'
import './App.css'
import GameHistoryForm from './components/GameHistoryForm'
import PlayerScoresChart from './components/PlayerScoresChart';
import Scoreboard from './components/Scoreboard';
function App() {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [numberOfGames, setNumberOfGames] = useState(10);
  
  const handleGameHistorySubmit = (playerName, gameCount) => {
    setSelectedPlayer(playerName);
    setNumberOfGames(gameCount);
  };
  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col space-y-8"> {/* Added space-y-8 for vertical spacing */}
        <div className="scoreboard-container">
          <Scoreboard />
        </div>
        <div className="form-container">
          <GameHistoryForm onSubmit={handleGameHistorySubmit} />
        </div>
        <div className="chart-container">
          <PlayerScoresChart playerName={selectedPlayer} numberOfGames={numberOfGames}/>
        </div>
      </div>
    </div>
  )
}

export default App


