import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVoting } from '../context/VotingContext'
import { Info } from 'lucide-react'
import Button from '../components/Button'
import './Home.css'

const MODULES = [
  { key: 'copasst',     label: 'COPASST', abbr: null,  desc: 'Comité Paritario de Seguridad y Salud en el Trabajo' },
  { key: 'convivencia', label: 'CCL',     abbr: null,  desc: 'Comité de Convivencia Laboral' },
]

export default function Home() {
  const navigate = useNavigate()
  const { seleccionarModulo, sucursal } = useVoting()
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
          <img src="/Logo syp.png" alt="Logo S&P" className="home-logo" />
          <h1 className="home-title">Sistema de Votación</h1>
          <p className="home-subtitle">S&P Colombia &mdash; Elecciones 2026</p>
        </div>

        <p className="home-instruction">Seleccione el comité al que desea votar</p>

        <div className="home-notice">
          <Info size={15} strokeWidth={2.2} className="home-notice-icon" />
          <span>Recuerda que debes votar en <strong>ambos comités</strong> por separado.</span>
        </div>

        <div className="modules-grid">
          {MODULES.map(mod => (
            <button
              key={mod.key}
              className="module-card"
              onClick={() => handleSelectModule(mod.key)}
            >
              <div className="module-card-text">
                <span className="module-label">
                  {mod.label}
                  {mod.abbr && <span className="module-abbr">{mod.abbr}</span>}
                </span>
                <span className="module-desc">{mod.desc}</span>
              </div>
              <span className="module-arrow" aria-hidden="true">&#8594;</span>
            </button>
          ))}
        </div>

        {sucursal === "S&P" && (
          <button
            className="results-link"
            onClick={() => { setShowResultsModal(true); setPasswordError(''); setResultsPassword('') }}
          >
            Ver resultados
          </button>
        )}
      </div>

      {showResultsModal && (
        <div className="modal-overlay" onClick={() => setShowResultsModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Acceso a Resultados</h2>
            <p className="modal-sub">Ingrese la contraseña de administrador</p>
            <form onSubmit={handleResultsAccess} className="modal-form">
              <input
                type="password"
                value={resultsPassword}
                onChange={e => { setResultsPassword(e.target.value); setPasswordError('') }}
                placeholder="Contraseña"
                className="modal-input"
                autoFocus
              />
              {passwordError && (
                <p className="modal-error">⚠ {passwordError}</p>
              )}
              <Button type="submit" variant="primary" fullWidth>Acceder</Button>
              <button type="button" className="modal-cancel" onClick={() => setShowResultsModal(false)}>
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
