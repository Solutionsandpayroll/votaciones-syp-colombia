import { neon } from '@neondatabase/serverless'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { nombre, tipoVotacion, sucursal } = req.body

  if (!nombre || !tipoVotacion || !sucursal) {
    return res.status(400).json({ error: 'Nombre, tipoVotacion y sucursal son requeridos' })
  }

  if (!['copasst', 'convivencia'].includes(tipoVotacion)) {
    return res.status(400).json({ error: 'tipoVotacion inválido' })
  }

  try {
    const sql = neon(process.env.DATABASE_URL)

    const result = await sql`
      SELECT id FROM votantes
      WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(${nombre}))
        AND tipo_votacion = ${tipoVotacion}
        AND sucursal = ${sucursal}
      LIMIT 1
    `

    return res.status(200).json({ hasVoted: result.length > 0 })
  } catch (error) {
    console.error('Error verificando votante:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
