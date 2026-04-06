// Configuración de Power Automate
export const POWER_AUTOMATE_CONFIG = {
  // Endpoint para registrar votos (desde variables de entorno)
  endpoint: import.meta.env.VITE_POWER_AUTOMATE_VOTE_ENDPOINT || "",
  // Endpoint para verificar si un usuario ya votó (desde variables de entorno)
  checkVoterEndpoint: import.meta.env.VITE_POWER_AUTOMATE_CHECK_VOTER_ENDPOINT || "",
  enabled: true // Cambiar a false para deshabilitar el envío
}

/**
 * Envía los datos del voto a Power Automate
 * @param {Object} voteData - Datos del voto
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export async function sendVoteToPowerAutomate(voteData) {
  if (!POWER_AUTOMATE_CONFIG.enabled) {
    console.log('Power Automate deshabilitado. Voto no enviado:', voteData)
    return { success: true, local: true }
  }

  // Preparar datos para las dos tablas
  const payload = {
    // Tabla de Votantes
    votante: {
      nombreVotante: voteData.nombreVotante,
      fecha: voteData.fecha,
      hora: voteData.hora
    },
    // Tabla de Conteo
    candidato: {
      candidatoNombre: voteData.candidatoNombre,
      candidatoId: voteData.candidatoId
    }
  }

  try {
    const response = await fetch(POWER_AUTOMATE_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json().catch(() => ({ success: true }))
    console.log('✅ Voto enviado a Power Automate:', result)
    return { success: true, data: result }

  } catch (error) {
    console.error('❌ Error al enviar voto a Power Automate:', error)
    // No fallar el voto local si Power Automate falla
    return { success: false, error: error.message }
  }
}

/**
 * Verifica si un usuario ya votó consultando la tabla de Excel
 * Implementa retry mechanism para manejar race conditions con Excel
 * @param {string} nombreVotante - Nombre completo del votante
 * @param {number} maxRetries - Número máximo de intentos (default: 2)
 * @returns {Promise<Object>} - { hasVoted: boolean, error?: string }
 */
export async function checkIfUserVoted(nombreVotante, maxRetries = 2) {
  // Si no hay endpoint configurado o está deshabilitado, usar solo localStorage
  if (!POWER_AUTOMATE_CONFIG.enabled || !POWER_AUTOMATE_CONFIG.checkVoterEndpoint) {
    console.log('⚠️ Verificación contra Excel deshabilitada. Usando solo localStorage.')
    return { hasVoted: false, local: true }
  }

  // Función auxiliar para hacer un intento de verificación
  const attemptCheck = async () => {
    try {
      const response = await fetch(POWER_AUTOMATE_CONFIG.checkVoterEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombreVotante })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return { hasVoted: result.hasVoted || false }

    } catch (error) {
      throw error
    }
  }

  // Implementar retry con delays progresivos
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await attemptCheck()
      
      // Si encontró que ya votó, devolver inmediatamente
      if (result.hasVoted) {
        console.log(`✅ Verificación exitosa (intento ${attempt}/${maxRetries}): Usuario YA votó`)
        return result
      }

      // Si es el último intento, devolver el resultado
      if (attempt === maxRetries) {
        console.log(`✅ Verificación exitosa (intento ${attempt}/${maxRetries}): Usuario NO ha votado`)
        return result
      }

      // Si dice que no ha votado pero hay más intentos, esperar y reintentar
      // Esto maneja race conditions donde Excel aún no ha escrito el voto
      console.log(`⏳ Intento ${attempt}/${maxRetries}: No encontrado, esperando 800ms antes de reintentar...`)
      await new Promise(resolve => setTimeout(resolve, 800))

    } catch (error) {
      console.error(`❌ Error en intento ${attempt}/${maxRetries}:`, error)
      
      // Si es el último intento, fallar abierto (permitir votar)
      if (attempt === maxRetries) {
        console.warn('⚠️ Verificación falló después de todos los intentos. Permitiendo votar (fail-open)')
        return { hasVoted: false, error: error.message }
      }

      // Si hay más intentos, esperar y continuar
      await new Promise(resolve => setTimeout(resolve, 800))
    }
  }

  // Fallback (no debería llegar aquí)
  return { hasVoted: false, error: 'Max retries reached' }
}
