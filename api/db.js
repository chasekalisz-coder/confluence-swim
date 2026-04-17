// Vercel serverless function: all database operations for Confluence Swim.
// Browser calls POST /api/db with { action: '...', ...params }
// Server runs the query against Neon and returns the result.
// The connection string lives in Vercel env vars and NEVER touches the browser.

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export default async function handler(req, res) {
  // Allow simple health check via GET
  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT 1 as ok`
      return res.status(200).json({
        ok: true,
        dbConnected: Array.isArray(rows) && rows[0]?.ok === 1,
        hasConnectionString: Boolean(process.env.DATABASE_URL)
      })
    } catch (e) {
      return res.status(500).json({
        ok: false,
        error: e.message,
        hasConnectionString: Boolean(process.env.DATABASE_URL)
      })
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { action, ...params } = req.body || {}

  try {
    switch (action) {
      case 'setupSchema': {
        // Create tables if they don't exist. Idempotent.
        await sql`
          CREATE TABLE IF NOT EXISTS athletes (
            id text PRIMARY KEY,
            data jsonb NOT NULL,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
          )
        `
        await sql`
          CREATE TABLE IF NOT EXISTS sessions (
            id text PRIMARY KEY,
            athlete_id text NOT NULL,
            date text,
            category text,
            data jsonb NOT NULL,
            created_at timestamptz DEFAULT now()
          )
        `
        await sql`CREATE INDEX IF NOT EXISTS sessions_athlete_id_idx ON sessions(athlete_id)`
        await sql`CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON sessions(created_at DESC)`
        return res.status(200).json({ ok: true })
      }

      case 'listAthletes': {
        const rows = await sql`SELECT id, data FROM athletes ORDER BY id`
        return res.status(200).json({ ok: true, athletes: rows })
      }

      case 'seedAthletes': {
        const { athletes } = params
        if (!Array.isArray(athletes) || athletes.length === 0) {
          return res.status(400).json({ error: 'athletes array required' })
        }
        // Upsert each athlete
        for (const a of athletes) {
          await sql`
            INSERT INTO athletes (id, data)
            VALUES (${a.id}, ${JSON.stringify(a)}::jsonb)
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
          `
        }
        return res.status(200).json({ ok: true, count: athletes.length })
      }

      case 'listAthleteSessions': {
        const { athleteId } = params
        if (!athleteId) return res.status(400).json({ error: 'athleteId required' })
        const rows = await sql`
          SELECT id, athlete_id, date, category, data, created_at
          FROM sessions
          WHERE athlete_id = ${athleteId}
          ORDER BY created_at DESC
        `
        return res.status(200).json({ ok: true, sessions: rows })
      }

      case 'saveSession': {
        const { session } = params
        if (!session || !session.id || !session.athlete_id) {
          return res.status(400).json({ error: 'session with id and athlete_id required' })
        }
        await sql`
          INSERT INTO sessions (id, athlete_id, date, category, data)
          VALUES (
            ${session.id},
            ${session.athlete_id},
            ${session.date || null},
            ${session.category || null},
            ${JSON.stringify(session.data || session)}::jsonb
          )
          ON CONFLICT (id) DO UPDATE SET
            date = EXCLUDED.date,
            category = EXCLUDED.category,
            data = EXCLUDED.data
        `
        return res.status(200).json({ ok: true })
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` })
    }
  } catch (e) {
    console.error('DB error:', e)
    return res.status(500).json({ ok: false, error: e.message })
  }
}
