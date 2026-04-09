import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Handshake, Vote, Users, Building2, Factory, Loader2, Inbox, Trophy, Award, ClipboardList } from 'lucide-react'
import Header from '../components/Header'
import Button from '../components/Button'
import Card from '../components/Card'
import { obtenerResultados, obtenerHistorial } from '../config/neonApi'
import { candidatesCopasst, candidatesConvivencia } from '../data/candidates'
import './Results.css'

const MODULES = [
  { key: 'copasst',     label: 'COPASST',            Icon: ShieldCheck },
  { key: 'convivencia', label: 'Convivencia Laboral', Icon: Handshake },
]

const CANDIDATES_MAP = {
  copasst: candidatesCopasst,
  convivencia: candidatesConvivencia,
}

export default function Results() {
  const navigate = useNavigate()
  const [tabActivo, setTabActivo] = useState('copasst')
  const [resultados, setResultados] = useState([])
  const [historial, setHistorial] = useState([])
  const [totalVotos, setTotalVotos] = useState(0)
  const [porSucursal, setPorSucursal] = useState({})
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null)
  const [loading, setLoading] = useState(true)

  const candidates = CANDIDATES_MAP[tabActivo]
  const fotoMap  = Object.fromEntries(candidates.map(c => [c.id, c.photo]))
  const colorMap = Object.fromEntries(candidates.map(c => [c.id, c.color]))

  const cargarDatos = useCallback(async (tipo) => {
    setLoading(true)
    const [resResultados, resHistorial] = await Promise.all([
      obtenerResultados(tipo),
      obtenerHistorial(tipo)
    ])
    setResultados(resResultados.resultados || [])
    setTotalVotos(resResultados.totalVotos || 0)
    setPorSucursal(resResultados.porSucursal || {})
    setHistorial(resHistorial.historial || [])
    setUltimaActualizacion(new Date())
    setLoading(false)
  }, [])

  useEffect(() => {
    cargarDatos(tabActivo)
    const interval = setInterval(() => cargarDatos(tabActivo), 10000)
    return () => clearInterval(interval)
  }, [cargarDatos, tabActivo])

  const resultadosOrdenados = [...resultados].sort((a, b) => b.votos - a.votos)

  return (
    <div className="results-page">
      <Header title="Resultados en Tiempo Real" showLogout={false} />

      <div className="results-container">

        {/* Tabs de módulos */}
        <div className="results-tabs">
          {MODULES.map(mod => (
            <button
              key={mod.key}
              className={`results-tab ${tabActivo === mod.key ? 'results-tab--active' : ''}`}
              onClick={() => setTabActivo(mod.key)}
            >
              <mod.Icon size={18} /> {mod.label}
            </button>
          ))}
        </div>

        {/* Estadísticas */}
        <div className="results-header">
          <div className="results-stats">
            <Card className="stat-card">
              <div className="stat-icon"><Vote size={40} /></div>
              <div className="stat-content">
                <div className="stat-value">{totalVotos}</div>
                <div className="stat-label">Votos Totales</div>
              </div>
            </Card>
            <Card className="stat-card">
              <div className="stat-icon"><Users size={40} /></div>
              <div className="stat-content">
                <div className="stat-value">222</div>
                <div className="stat-label">Votantes Habilitados</div>
              </div>
            </Card>
          </div>

          <div className="results-sucursal-row">
            <Card className="stat-card stat-card--sucursal">
              <div className="stat-icon"><Building2 size={40} /></div>
              <div className="stat-content">
                <div className="stat-value">{porSucursal['S&P'] ?? 0}</div>
                <div className="stat-label">Votos S&amp;P</div>
              </div>
            </Card>
            <Card className="stat-card stat-card--sucursal">
              <div className="stat-icon"><Factory size={40} /></div>
              <div className="stat-content">
                <div className="stat-value">{porSucursal['EOR'] ?? 0}</div>
                <div className="stat-label">Votos EOR</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Resultados por candidato */}
        <div className="results-list">
          <h2 className="results-list-title">Resultados por Candidato</h2>

          {loading ? (
            <Card className="no-votes-card">
              <div className="no-votes-content">
                <Loader2 size={56} className="no-votes-icon spin-icon" />
                <h3>Cargando resultados...</h3>
              </div>
            </Card>
          ) : totalVotos === 0 ? (
            <Card className="no-votes-card">
              <div className="no-votes-content">
                <Inbox size={56} className="no-votes-icon" />
                <h3>Aún no hay votos registrados</h3>
                <p>Los resultados aparecerán aquí cuando se registren votos</p>
              </div>
            </Card>
          ) : (
            resultadosOrdenados.map((candidato, index) => (
              <Card key={candidato.candidatoId} className="result-card">
                <div className="result-rank">
                  {index === 0 && <span className="rank-badge gold"><Trophy size={22} /></span>}
                  {index === 1 && <span className="rank-badge silver"><Award size={22} /></span>}
                </div>

                <div className="result-candidate">
                  <img
                    src={fotoMap[candidato.candidatoId] || '/imagen_voto_blanco.webp'}
                    alt={candidato.candidatoNombre}
                    className="result-photo"
                  />
                  <div className="result-info">
                    <h3 className="result-name">{candidato.candidatoNombre}</h3>
                  </div>
                </div>

                <div className="result-stats">
                  <div className="result-votes">
                    <span className="votes-number">{candidato.votos}</span>
                    <span className="votes-label">votos</span>
                  </div>
                  <div className="result-percentage">{candidato.porcentaje}%</div>
                </div>

                <div className="result-bar-container">
                  <div
                    className="result-bar"
                    style={{
                      width: `${candidato.porcentaje}%`,
                      backgroundColor: colorMap[candidato.candidatoId] || '#1e3a8a'
                    }}
                  >
                    <div className="result-bar-glow"></div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Historial de votantes */}
        <div className="results-list" style={{ marginTop: '32px' }}>
          <h2 className="results-list-title"><Users size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Historial de Votantes</h2>

          {historial.length === 0 ? (
            <Card className="no-votes-card">
              <div className="no-votes-content">
                <ClipboardList size={56} className="no-votes-icon" />
                <h3>Sin registros aún</h3>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="historial-table-wrapper">
                <table className="historial-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Fecha y Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((v, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{v.nombre}</td>
                        <td>
                          {new Date(v.fechaHora).toLocaleString('es-CO', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        <div className="results-actions">
          <Button onClick={() => navigate('/')} variant="primary">
            Volver al Inicio
          </Button>
          <button
            className="btn-download-pdf"
            onClick={() => {
              const container = document.querySelector('.results-container')
              if (container) {
                container.setAttribute('data-fecha', new Date().toLocaleString('es-CO'))
              }
              window.print()
            }}
          >
            📄 Descargar PDF
          </button>
        </div>

        <div className="results-footer">
          <p className="footer-text">
            ℹ️ Los resultados se actualizan automáticamente cada 10 segundos
          </p>
          {ultimaActualizacion && (
            <p className="footer-timestamp">
              Última actualización: {ultimaActualizacion.toLocaleString('es-CO')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
