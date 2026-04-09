import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVoting } from '../context/VotingContext'
import { checkIfUserVoted } from '../config/neonApi'
import EMPLOYEES from '../data/employees'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingModal from '../components/LoadingModal'
import './Login.css'

const MODULE_LABELS = {
  copasst: 'COPASST',
  convivencia: 'Convivencia Laboral',
}

export default function Login() {
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const navigate = useNavigate()
  const { login, tipoVotacion, sucursal } = useVoting()

  useEffect(() => {
    if (!tipoVotacion) navigate('/')
  }, [tipoVotacion, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!fullName) {
      setError('Por favor seleccione su nombre')
      return
    }

    setShowConfirmModal(true)
  }

  const handleConfirmedSubmit = async () => {
    setShowConfirmModal(false)
    setIsVerifying(true)

    try {
      const verification = await checkIfUserVoted(fullName, tipoVotacion, sucursal)

      if (verification.hasVoted) {
        setError('Este usuario ya ha votado anteriormente')
        setIsVerifying(false)
        return
      }

      const result = login(fullName)
      if (result.success) {
        navigate('/voting')
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error('Error al verificar usuario:', error)
      setError('Error al verificar el usuario. Por favor intente nuevamente.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleNameChange = (e) => {
    setFullName(e.target.value)
    setError('')
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <img 
              src="/Logo syp.png" 
              alt="Logo S&P" 
              className="logo-image"
            />
          </div>
          <h1 className="login-title">Sistema de Votación</h1>
          <p className="login-subtitle">S&P Colombia — {MODULE_LABELS[tipoVotacion] || ''}</p>
        </div>

        <Card className="login-card">
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Seleccione su Nombre
              </label>
              <select
                id="fullName"
                value={fullName}
                onChange={handleNameChange}
                className="form-select"
                autoFocus
              >
                <option value="">-- Seleccione su nombre --</option>
                {EMPLOYEES.map((employee) => (
                  <option key={employee} value={employee}>
                    {employee}
                  </option>
                ))}
              </select>
              <p className="form-help">
                Seleccione su nombre completo de la lista
              </p>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠</span>
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              fullWidth 
              disabled={!fullName || isVerifying}
            >
              {isVerifying ? 'Verificando...' : 'Ingresar al Sistema'}
            </Button>
          </form>

          <div className="results-access">
            <button
              className="results-link"
              onClick={() => navigate('/')}
            >
              ← Cambiar módulo de votación
            </button>
          </div>
        </Card>
      </div>

      {/* Modal de carga */}
      <LoadingModal 
        isOpen={isVerifying} 
        message="Verificando usuario"
      />

      {/* Modal de confirmación de nombre */}
      {showConfirmModal && (
        <div className="confirm-modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="confirm-modal-box" onClick={e => e.stopPropagation()}>
            <p className="confirm-modal-question">
              ¿Tu nombre es <strong>{fullName}</strong>?
            </p>
            <p className="confirm-modal-hint">
              Si es correcto, pulsa &lsquo;Ingresar&rsquo;. Si no es tu nombre, cierra esta ventana para seleccionarlo de la lista.
            </p>
            <div className="confirm-modal-actions">
              <Button variant="primary" fullWidth onClick={handleConfirmedSubmit}>
                Ingresar
              </Button>
              <button
                type="button"
                className="confirm-modal-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
