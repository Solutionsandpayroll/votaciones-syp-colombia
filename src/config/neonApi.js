/**
 * Cliente frontend para comunicarse con las API routes de Vercel
 * Las credenciales de Neon NUNCA llegan al navegador — viven en el servidor
 */

/**
 * Verifica si un votante ya ha votado en un módulo específico
 * @param {string} nombre
 * @param {string} tipoVotacion - 'copasst' | 'convivencia'
 * @returns {Promise<{ hasVoted: boolean }>}
 */
export async function checkIfUserVoted(nombre, tipoVotacion, sucursal) {
  try {
    const res = await fetch('/api/check-voter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, tipoVotacion, sucursal })
    })
    if (!res.ok) throw new Error(`Error ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('Error verificando votante:', error)
    return { hasVoted: false, error: error.message }
  }
}

/**
 * Registra un voto en Neon
 * @param {string} nombre
 * @param {number} candidatoId
 * @param {string} tipoVotacion - 'copasst' | 'convivencia'
 * @returns {Promise<{ success: boolean }>}
 */
export async function registrarVoto(nombre, candidatoId, tipoVotacion, sucursal) {
  try {
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, candidatoId, tipoVotacion, sucursal })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
    return { success: true }
  } catch (error) {
    console.error('Error registrando voto:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtiene los resultados de un módulo
 * @param {string} tipoVotacion - 'copasst' | 'convivencia'
 * @returns {Promise<{ resultados: Array, totalVotos: number }>}
 */
export async function obtenerResultados(tipoVotacion) {
  try {
    const res = await fetch(`/api/results?tipo=${tipoVotacion}`)
    if (!res.ok) throw new Error(`Error ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('Error obteniendo resultados:', error)
    return { resultados: [], totalVotos: 0 }
  }
}

/**
 * Obtiene el historial de votantes de un módulo
 * @param {string} tipoVotacion - 'copasst' | 'convivencia'
 * @returns {Promise<{ historial: Array, total: number }>}
 */
export async function obtenerHistorial(tipoVotacion) {
  try {
    const res = await fetch(`/api/history?tipo=${tipoVotacion}`)
    if (!res.ok) throw new Error(`Error ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('Error obteniendo historial:', error)
    return { historial: [], total: 0 }
  }
}
