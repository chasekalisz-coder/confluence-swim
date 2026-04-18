// Vercel serverless function: get sessions for an athlete
// GET /api/athlete-sessions?athleteId=ath_jon&poolType=SCY&limit=20
//
// poolType filter is OPTIONAL for history display, but required if
// you want clean separation. The athlete profile UI should toggle.

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { athleteId, poolType, limit } = req.query;

    if (!athleteId) {
      return res.status(400).json({ error: 'athleteId is required' });
    }

    const max = Math.min(parseInt(limit, 10) || 50, 200);
    const sql = neon(process.env.DATABASE_URL);

    const rows = await sql`
      SELECT id, athlete_id, date, category, data, created_at
      FROM sessions
      WHERE athlete_id = ${athleteId}
      ORDER BY created_at DESC
      LIMIT ${max}
    `;

    // Filter by poolType if specified
    const sessions = rows
      .filter((r) => {
        if (!poolType) return true;
        return r.data?.poolType === poolType;
      })
      .map((r) => ({
        id: r.id,
        athleteId: r.athlete_id,
        date: r.date,
        category: r.category,
        poolType: r.data?.poolType,
        stroke: r.data?.stroke,
        summary: r.data?.summary,
        createdAt: r.created_at,
        // Full data available on a detail endpoint if needed
      }));

    return res.status(200).json({ sessions });
  } catch (err) {
    console.error('athlete-sessions error:', err);
    return res.status(500).json({ error: 'Internal error', detail: String(err) });
  }
}
