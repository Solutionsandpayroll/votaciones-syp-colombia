import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVoting } from '../context/VotingContext'
import Button from '../components/Button'
import './Confirmation.css'

export default function Confirmation() {
  const navigate = useNavigate()
  const { user, selectedCandidate, hasVoted } = useVoting()

  useEffect(() => {
    // Redirigir si no hay usuario o no ha votado
    if (!user || !hasVoted) {
      navigate('/')
    }
  }, [user, hasVoted, navigate])

  if (!user || !selectedCandidate) {
    return null
  }

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        <div className="success-animation">
          <div className="success-checkmark">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="58" stroke="#10B981" strokeWidth="4" fill="none">
                <animate 
                  attributeName="stroke-dasharray" 
                  from="0 400" 
                  to="400 400" 
                  dur="0.6s" 
                  fill="freeze"
                />
              </circle>
              <path 
                d="M35 60L52 77L85 43" 
                stroke="#10B981" 
                strokeWidth="6" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                strokeDasharray="100"
                strokeDashoffset="100"
              >
                <animate 
                  attributeName="stroke-dashoffset" 
                  from="100" 
                  to="0" 
                  dur="0.4s" 
                  begin="0.3s" 
                  fill="freeze"
                />
              </path>
            </svg>
          </div>
        </div>

        <h1 className="confirmation-title">¡Voto Registrado Exitosamente!</h1>
        <p className="confirmation-subtitle">
          Gracias por participar en el proceso democrático
        </p>

        <div className="vote-summary">
          <h2 className="summary-title">Resumen de tu voto</h2>
          <div className="summary-content">
            <img 
              src={selectedCandidate.photo} 
              alt={selectedCandidate.name}
              className="summary-photo"
            />
            <div className="summary-info">
              <h3 className="summary-name">{selectedCandidate.name}</h3>
              <div className="summary-badge">
                <span>Voto confirmado</span>
              </div>
            </div>
          </div>
        </div>

        <div className="confirmation-info">
          <div className="info-box">
            <span className="info-box-icon">👤</span>
            <div>
              <strong>Usuario:</strong> {user.identifier.split(' ')[0]}
            </div>
          </div>
          <div className="info-box">
            <span className="info-box-icon">📅</span>
            <div>
              <strong>Fecha:</strong> {new Date().toLocaleDateString('es-PE')}
            </div>
          </div>
          <div className="info-box">
            <span className="info-box-icon">🕐</span>
            <div>
              <strong>Hora:</strong> {new Date().toLocaleTimeString('es-PE')}
            </div>
          </div>
        </div>

        <div className="confirmation-actions">
          <Button 
            onClick={() => {
              navigate('/')
            }} 
            variant="primary"
            fullWidth
          >
            Salir
          </Button>
        </div>
      </div>
    </div>
  )
}
