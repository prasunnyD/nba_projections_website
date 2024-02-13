import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PostForm from './components/PostForm'

function App() {
  const [count, setCount] = useState(0)

  return (
    <PostForm/>
  )
}

export default App
