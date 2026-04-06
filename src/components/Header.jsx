import { useNavigate } from 'react-router-dom'
import { useVoting } from '../context/VotingContext'
import './Header.css'

export default function Header({ title, showLogout = false }) {
  const navigate = useNavigate()
  const { logout, user } = useVoting()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <img 
              src="/Logo syp.png" 
              alt="Logo S&P" 
              className="header-logo-img"
            />
          </div>
          <div>
            <h1 className="header-title">{title}</h1>
            {user && <p className="header-subtitle">Usuario: {user.identifier}</p>}
          </div>
        </div>
        <div className="header-actions">
          {showLogout && (
            <button onClick={handleLogout} className="header-btn header-btn-logout">
              Cerrar Sesión
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
