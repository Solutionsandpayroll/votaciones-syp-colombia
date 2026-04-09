import Card from './Card'
import Button from './Button'
import './CandidateCard.css'

export default function CandidateCard({ candidate, onSelect, isSelected, showVoteButton = true }) {
  return (
    <Card
      hover={showVoteButton}
      selected={isSelected}
      className="candidate-card"
      onClick={showVoteButton ? () => onSelect(candidate) : undefined}
      style={showVoteButton ? { cursor: 'pointer' } : {}}
    >
      <div className="candidate-photo-container">
        <img 
          src={candidate.photo} 
          alt={candidate.name}
          className="candidate-photo"
          style={{ objectFit: candidate.photoFit || 'cover' }}
        />
      </div>
      
      <div className="candidate-info">
        <h3 className="candidate-name">{candidate.name}</h3>

        {showVoteButton && (
          <Button 
            onClick={(e) => { e.stopPropagation(); onSelect(candidate); }}
            variant={isSelected ? 'success' : 'primary'}
            fullWidth
          >
            {isSelected ? '✓ Seleccionado' : 'Seleccionar'}
          </Button>
        )}
      </div>
    </Card>
  )
}
