import { useState } from 'react'
import './App.css'
import PostForm from './components/PostForm'
import TeamScoresChart from './components/TeamScoresChart';
import PlayerScoresChart from './components/PlayerScoresChart';

function App() {
  return (
    <div className="container mx-auto px-4">
      <div className="mt-8">
        <PlayerScoresChart/>
      </div>
      <PostForm />
    </div>
  )
}

export default App
