import { useState } from 'react'
import './App.css'
import GameHistoryForm from './components/GameHistoryForm'
import PlayerScoresChart from './components/PlayerScoresChart';

function App() {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [numberOfGames, setNumberOfGames] = useState(10);
  
  const handleGameHistorySubmit = (playerName, gameCount) => {
    setSelectedPlayer(playerName);
    setNumberOfGames(gameCount);
  };
  return (
    <div className="container mx-auto px-4">
      <div className="mt-8">
        <GameHistoryForm onSubmit={handleGameHistorySubmit} />
        <PlayerScoresChart playerName={selectedPlayer} numberOfGames={numberOfGames}/>
      </div>
    </div>
  )
}

export default App


