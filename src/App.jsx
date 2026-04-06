import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { VotingProvider } from './context/VotingContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Voting from './pages/Voting'
import Confirmation from './pages/Confirmation'
import Results from './pages/Results'
import './styles/App.css'

function App() {
  return (
    <VotingProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/voting" element={<Voting />} />
            <Route path="/confirmation" element={<Confirmation />} />
            <Route path="/results" element={<Results />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </VotingProvider>
  )
}

export default App
