import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVoting } from '../context/VotingContext'
import Header from '../components/Header'
import CandidateCard from '../components/CandidateCard'
import Button from '../components/Button'
import Modal from '../components/Modal'
import LoadingModal from '../components/LoadingModal'
import './Voting.css'

export default function Voting() {
  const navigate = useNavigate()
  const { user, candidates, selectedCandidate, selectCandidate, confirmVote, hasVoted, tipoVotacion } = useVoting()

  const MODULE_LABELS = { copasst: 'COPASST', convivencia: 'Convivencia Laboral' }
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Redirigir si no hay usuario logueado
    if (!user) {
      navigate('/')
    }
    if (!tipoVotacion) {
      navigate('/')
    }
    // Redirigir si ya votó
    if (hasVoted) {
      navigate('/confirmation')
    }
  }, [user, hasVoted, navigate])

  const handleSelectCandidate = (candidate) => {
    selectCandidate(candidate)
  }

  const handleConfirmClick = () => {
    if (selectedCandidate) {
      setShowConfirmModal(true)
    }
  }

  const handleFinalConfirm = async () => {
    setIsSubmitting(true)
    try {
      const success = await confirmVote()
      if (success) {
        setShowConfirmModal(false)
        navigate('/confirmation')
      }
    } catch (error) {
      console.error('Error al confirmar voto:', error)
      alert('Hubo un error al procesar tu voto. Por favor intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="voting-page">
      <Header 
        title={`Sistema de Votación — ${MODULE_LABELS[tipoVotacion] || 'Colombia'}`}
        showLogout={true}
      />

      <div className="voting-container">
        <div className="voting-instructions">
          <h2 className="instructions-title">Instrucciones</h2>
          <ol className="instructions-list">
            <li>Seleccione el candidato de su preferencia</li>
            <li>Confirme su voto (esta acción es irreversible)</li>
          </ol>
        </div>

        <div className="candidates-grid">
          {candidates.map(candidate => (
            <div key={candidate.id} className="candidate-card-wrapper">
              <CandidateCard
                candidate={candidate}
                onSelect={handleSelectCandidate}
                isSelected={selectedCandidate?.id === candidate.id}
              />
            </div>
          ))}
        </div>

        {selectedCandidate && (
          <div className="voting-actions">
            <div className="selected-info">
              <span className="selected-icon">✓</span>
              Has seleccionado a <strong>{selectedCandidate.name}</strong>
            </div>
            <Button onClick={handleConfirmClick} variant="success">
              Confirmar mi Voto
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar Voto"
      >
        <div className="confirm-modal-content">
          <div className="confirm-icon">⚠️</div>
          <p className="confirm-text">
            ¿Está seguro de que desea votar por este candidato?
          </p>
          <div className="confirm-candidate">
            <img 
              src={selectedCandidate?.photo} 
              alt={selectedCandidate?.name}
              className="confirm-photo"
            />
            <div>
              <h3>{selectedCandidate?.name}</h3>
            </div>
          </div>
          <p className="confirm-warning">
            <strong>Importante:</strong> Esta acción no se puede deshacer. 
            No podrá cambiar su voto después de confirmar.
          </p>
          <div className="confirm-actions">
            <Button 
              onClick={() => setShowConfirmModal(false)}
              variant="secondary"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleFinalConfirm}
              variant="success"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : 'Sí, confirmar mi voto'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de carga */}
      <LoadingModal 
        isOpen={isSubmitting} 
        message="Procesando su voto"
      />
    </div>
  )
}
