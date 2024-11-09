import { useState } from 'react'
import './App.css'
import PostForm from './components/PostForm'
import TeamScoresChart from './components/TeamScoresChart';

function App() {
  return (
    <div className="container mx-auto px-4">
      <div className="mt-8">
        <TeamScoresChart/>
      </div>
      <PostForm />
    </div>
  )
}

export default App
