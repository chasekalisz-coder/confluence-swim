// One-shot endpoint to rename athletes with random-suffix IDs to clean ones.
// Called once from the admin panel, then never needed again.
import { neon } from '@neondatabase/serverless'
const sql = neon(process.env.DATABASE_URL)

const RENAMES = [
  { from: 'ath_mason_mo7lcska', to: 'ath_mason' },
  { from: 'ath_pace_mocz8f4z',  to: 'ath_pace'  },
  { from: 'ath_chase_mocvn2yn', to: 'ath_chase'  },
  { from: 'ath_jelena_mo75byga',to: 'ath_jelena' },
]

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  const results = []
  for (const { from, to } of RENAMES) {
    try {
      // Check if the old ID exists
      const existing = await sql`SELECT id FROM athletes WHERE id = ${from}`
      if (existing.length === 0) { results.push({ from, to, status: 'not found' }); continue }
      // Check if the new ID already exists
      const target = await sql`SELECT id FROM athletes WHERE id = ${to}`
      if (target.length > 0) { results.push({ from, to, status: 'target already exists' }); continue }
      // Rename
      await sql`UPDATE athletes SET id = ${to} WHERE id = ${from}`
      results.push({ from, to, status: 'renamed' })
    } catch (e) {
      results.push({ from, to, status: 'error', error: e.message })
    }
  }
  return res.status(200).json({ ok: true, results })
}
