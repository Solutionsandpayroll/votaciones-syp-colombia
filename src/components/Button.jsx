import './Button.css'

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  type = 'button',
  fullWidth = false 
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${fullWidth ? 'btn-full-width' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
