import './LoadingModal.css'

export default function LoadingModal({ isOpen, message = "Verificando..." }) {
  if (!isOpen) return null

  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal">
        <div className="loading-logo">
          <img 
            src="/Logo syp.png" 
            alt="Logo S&P" 
            className="loading-logo-image"
          />
        </div>
        
        <div className="loading-content">
          <h3 className="loading-title">{message}</h3>
          <p className="loading-subtitle">Por favor espere un momento</p>
          
          <div className="loading-bar-container">
            <div className="loading-bar"></div>
          </div>
        </div>

        <div className="loading-spinner">
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
        </div>
      </div>
    </div>
  )
}
