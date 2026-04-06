import './Card.css'

export default function Card({ children, className = '', hover = false, selected = false, onClick, style }) {
  return (
    <div
      className={`card ${hover ? 'card-hover' : ''} ${selected ? 'card-selected' : ''} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  )
}
