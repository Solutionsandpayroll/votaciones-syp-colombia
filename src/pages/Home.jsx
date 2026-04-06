import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVoting } from '../context/VotingContext'
import Button from '../components/Button'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const { seleccionarModulo } = useVoting()
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [resultsPassword, setResultsPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleSelectModule = (tipo) => {
    seleccionarModulo(tipo)
    navigate('/login')
  }

  const handleResultsAccess = (e) => {
    e.preventDefault()
    setPasswordError('')
    const correctPassword = import.meta.env.VITE_RESULTS_PASSWORD
    if (resultsPassword === correctPassword) {
      setShowResultsModal(false)
      setResultsPassword('')
      navigate('/results')
    } else {
      setPasswordError('Contraseña incorrecta')
    }
  }

  return (
    <div className="home-page">
      <div className="home-container">

        <div className="home-header">
          <div className="home-logo">
            <img src="/Logo syp.png" alt="Logo S&P" className="logo-image" />
          </div>
          <h1 className="home-title">Sistema de Votación</h1>
          <p className="home-subtitle">S&P Colombia — Elecciones SST 2026</p>
        </div>

        <p className="home-instruction">Seleccione el comité al que desea votar</p>

        <div className="modules-grid">
          <button
            className="module-card module-copasst"
            onClick={() => handleSelectModule('copasst')}
          >
            <div className="module-icon">🛡️</div>
            <h2 className="module-title">COPASST</h2>
            <p className="module-desc">Comité Paritario de Seguridad y Salud en el Trabajo</p>
            <span className="module-cta">Ir a votar →</span>
          </button>

          <button
            className="module-card module-convivencia"
            onClick={() => handleSelectModule('convivencia')}
          >
            <div className="module-icon">🤝</div>
            <h2 className="module-title">Convivencia Laboral</h2>
            <p className="module-desc">Comité de Convivencia Laboral</p>
            <span className="module-cta">Ir a votar →</span>
          </button>
        </div>

        <div className="results-access">
          <button
            className="results-link"
            onClick={() => { setShowResultsModal(true); setPasswordError(''); setResultsPassword('') }}
          >
            📊 Ver Resultados
          </button>
        </div>
      </div>

      {showResultsModal && (
        <div className="modal-overlay" onClick={() => setShowResultsModal(false)}>
          <div className="modal-content results-modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">🔒 Acceso a Resultados</h2>
            <p className="modal-subtitle">Ingrese la contraseña de administrador</p>
            <form onSubmit={handleResultsAccess} className="password-form">
              <input
                type="password"
                value={resultsPassword}
                onChange={e => { setResultsPassword(e.target.value); setPasswordError('') }}
                placeholder="Contraseña"
                className="form-input password-input"
                autoFocus
              />
              {passwordError && (
                <div className="error-message">
                  <span className="error-icon">⚠</span>
                  {passwordError}
                </div>
              )}
              <div className="modal-actions">
                <Button type="submit" variant="primary" fullWidth>
                  Acceder
                </Button>
                <button
                  type="button"
                  className="cancel-link"
                  onClick={() => setShowResultsModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
