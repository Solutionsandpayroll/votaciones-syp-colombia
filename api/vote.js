import { neon } from '@neondatabase/serverless'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { nombre, candidatoId, tipoVotacion, sucursal } = req.body

  if (!nombre || !candidatoId || !tipoVotacion || !sucursal) {
    return res.status(400).json({ error: 'Nombre, candidatoId, tipoVotacion y sucursal son requeridos' })
  }

  if (!['copasst', 'convivencia'].includes(tipoVotacion)) {
    return res.status(400).json({ error: 'tipoVotacion inválido' })
  }

  try {
    const sql = neon(process.env.DATABASE_URL)

    // Verificar que el candidato existe en el módulo correcto
    const candidatoExists = await sql`
      SELECT candidato_id FROM resultados
      WHERE candidato_id = ${candidatoId} AND tipo_votacion = ${tipoVotacion}
    `
    if (candidatoExists.length === 0) {
      return res.status(400).json({ error: 'Candidato no válido' })
    }

    // Verificar que el votante no haya votado en este módulo y sucursal
    const yaVoto = await sql`
      SELECT id FROM votantes
      WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(${nombre}))
        AND tipo_votacion = ${tipoVotacion}
        AND sucursal = ${sucursal}
      LIMIT 1
    `
    if (yaVoto.length > 0) {
      return res.status(409).json({ error: 'Este usuario ya ha votado' })
    }

    // Registrar el votante
    await sql`
      INSERT INTO votantes (nombre, tipo_votacion, sucursal) VALUES (${nombre}, ${tipoVotacion}, ${sucursal})
    `

    // Incrementar el contador del candidato
    await sql`
      UPDATE resultados
      SET total_votos = total_votos + 1
      WHERE candidato_id = ${candidatoId} AND tipo_votacion = ${tipoVotacion}
    `

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error registrando voto:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
