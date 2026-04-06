import { neon } from '@neondatabase/serverless'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const tipoVotacion = req.query.tipo

  if (!tipoVotacion || !['copasst', 'convivencia'].includes(tipoVotacion)) {
    return res.status(400).json({ error: 'Parámetro tipo inválido. Use: copasst o convivencia' })
  }

  try {
    const sql = neon(process.env.DATABASE_URL)

    const resultados = await sql`
      SELECT candidato_id, candidato_nombre, total_votos
      FROM resultados
      WHERE tipo_votacion = ${tipoVotacion}
      ORDER BY candidato_id ASC
    `

    const totalVotos = resultados.reduce((sum, r) => sum + Number(r.total_votos), 0)

    const data = resultados.map(r => ({
      candidatoId: r.candidato_id,
      candidatoNombre: r.candidato_nombre,
      votos: Number(r.total_votos),
      porcentaje: totalVotos > 0
        ? ((Number(r.total_votos) / totalVotos) * 100).toFixed(1)
        : '0.0'
    }))

    return res.status(200).json({ resultados: data, totalVotos })
  } catch (error) {
    console.error('Error obteniendo resultados:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
