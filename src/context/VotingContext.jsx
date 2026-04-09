import { createContext, useContext, useState, useEffect } from 'react'
import { candidatesCopasst, candidatesConvivencia } from '../data/candidates'
import { registrarVoto } from '../config/neonApi'

const VotingContext = createContext()

const CANDIDATES_MAP = {
  copasst: candidatesCopasst,
  convivencia: candidatesConvivencia,
}

const SUCURSAL = import.meta.env.VITE_SUCURSAL || 'S&P'

export function VotingProvider({ children }) {
  const [tipoVotacion, setTipoVotacion] = useState(null) // 'copasst' | 'convivencia'
  const [user, setUser] = useState(null)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)

  const [votes, setVotes] = useState({})
  const [votedUsers, setVotedUsers] = useState([])

  // Recargar estado local al cambiar de módulo
  useEffect(() => {
    if (!tipoVotacion) return
    const savedVotes = localStorage.getItem(`votes_${tipoVotacion}`)
    const savedVotedUsers = localStorage.getItem(`votedUsers_${tipoVotacion}`)
    const currentCandidates = CANDIDATES_MAP[tipoVotacion]

    if (savedVotes) {
      setVotes(JSON.parse(savedVotes))
    } else {
      const initialVotes = {}
      currentCandidates.forEach(c => { initialVotes[c.id] = 0 })
      setVotes(initialVotes)
    }
    setVotedUsers(savedVotedUsers ? JSON.parse(savedVotedUsers) : [])
  }, [tipoVotacion])

  useEffect(() => {
    if (!tipoVotacion) return
    localStorage.setItem(`votes_${tipoVotacion}`, JSON.stringify(votes))
  }, [votes, tipoVotacion])

  useEffect(() => {
    if (!tipoVotacion) return
    localStorage.setItem(`votedUsers_${tipoVotacion}`, JSON.stringify(votedUsers))
  }, [votedUsers, tipoVotacion])

  const seleccionarModulo = (tipo) => {
    setTipoVotacion(tipo)
    setUser(null)
    setSelectedCandidate(null)
    setHasVoted(false)
  }

  const login = (identifier) => {
    if (votedUsers.includes(identifier)) {
      return { success: false, message: 'Este usuario ya ha votado anteriormente' }
    }
    setUser({ identifier })
    setHasVoted(false)
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    setSelectedCandidate(null)
    setHasVoted(false)
  }

  const selectCandidate = (candidate) => {
    setSelectedCandidate(candidate)
  }

  const confirmVote = async () => {
    if (selectedCandidate && user && !hasVoted && tipoVotacion) {
      const result = await registrarVoto(user.identifier, selectedCandidate.id, tipoVotacion, SUCURSAL)

      if (!result.success) {
        console.error('❌ Error registrando voto en Neon:', result.error)
        if (result.error?.includes('ya ha votado')) {
          return false
        }
      } else {
        console.log('✅ Voto registrado en Neon correctamente')
      }

      setVotes(prevVotes => ({
        ...prevVotes,
        [selectedCandidate.id]: (prevVotes[selectedCandidate.id] || 0) + 1
      }))
      setVotedUsers(prev => [...prev, user.identifier])
      setHasVoted(true)
      return true
    }
    return false
  }

  const candidates = tipoVotacion ? CANDIDATES_MAP[tipoVotacion] : []

  const value = {
    tipoVotacion,
    sucursal: SUCURSAL,
    seleccionarModulo,
    user,
    selectedCandidate,
    hasVoted,
    login,
    logout,
    selectCandidate,
    confirmVote,
    candidates,
  }

  return (
    <VotingContext.Provider value={value}>
      {children}
    </VotingContext.Provider>
  )
}

export function useVoting() {
  const context = useContext(VotingContext)
  if (!context) {
    throw new Error('useVoting must be used within a VotingProvider')
  }
  return context
}
