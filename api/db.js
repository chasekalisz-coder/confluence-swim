
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export default async function handler(req, res) {
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
        await sql`
          CREATE TABLE IF NOT EXISTS change_log (
            id bigserial PRIMARY KEY,
            entity_type text NOT NULL,
            entity_id text NOT NULL,
            action text NOT NULL,
            summary text,
            created_at timestamptz DEFAULT now()
          )
        `
        await sql`CREATE INDEX IF NOT EXISTS change_log_created_at_idx ON change_log(created_at DESC)`
        await sql`
          CREATE TABLE IF NOT EXISTS slot_requests (
            id bigserial PRIMARY KEY,
            athlete_id text NOT NULL,
            month text NOT NULL,
            picks jsonb NOT NULL,
            note text,
            submitted_at timestamptz DEFAULT now(),
            UNIQUE (athlete_id, month)
          )
        `
        await sql`CREATE INDEX IF NOT EXISTS slot_requests_month_idx ON slot_requests(month)`
        await sql`CREATE INDEX IF NOT EXISTS slot_requests_athlete_idx ON slot_requests(athlete_id)`
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

      case 'deleteSession': {
        const { sessionId } = params
        if (!sessionId) return res.status(400).json({ error: 'sessionId required' })
        await sql`DELETE FROM sessions WHERE id = ${sessionId}`
        return res.status(200).json({ ok: true, deleted: sessionId })
      }

      case 'updateAthlete': {
        const { athleteId, data } = params
        if (!athleteId || !data) return res.status(400).json({ error: 'athleteId and data required' })
        await sql`
          UPDATE athletes SET data = ${JSON.stringify(data)}::jsonb, updated_at = now()
          WHERE id = ${athleteId}
        `
        await sql`
          CREATE TABLE IF NOT EXISTS change_log (
            id bigserial PRIMARY KEY,
            entity_type text NOT NULL,
            entity_id text NOT NULL,
            action text NOT NULL,
            summary text,
            created_at timestamptz DEFAULT now()
          )
        `
        const summary = `Edited ${data.name || athleteId}`
        await sql`
          INSERT INTO change_log (entity_type, entity_id, action, summary)
          VALUES ('athlete', ${athleteId}, 'update', ${summary})
        `
        return res.status(200).json({ ok: true })
      }

      case 'addAthlete': {
        const { athlete } = params
        if (!athlete || !athlete.id) return res.status(400).json({ error: 'athlete with id required' })
        await sql`
          INSERT INTO athletes (id, data)
          VALUES (${athlete.id}, ${JSON.stringify(athlete)}::jsonb)
          ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
        `
        await sql`
          CREATE TABLE IF NOT EXISTS change_log (
            id bigserial PRIMARY KEY,
            entity_type text NOT NULL,
            entity_id text NOT NULL,
            action text NOT NULL,
            summary text,
            created_at timestamptz DEFAULT now()
          )
        `
        const summary = `Added ${athlete.name || athlete.id}`
        await sql`
          INSERT INTO change_log (entity_type, entity_id, action, summary)
          VALUES ('athlete', ${athlete.id}, 'add', ${summary})
        `
        return res.status(200).json({ ok: true, id: athlete.id })
      }

      case 'deleteAthlete': {
        const { athleteId } = params
        if (!athleteId) return res.status(400).json({ error: 'athleteId required' })
        await sql`DELETE FROM sessions WHERE athlete_id = ${athleteId}`
        await sql`DELETE FROM athletes WHERE id = ${athleteId}`
        await sql`
          CREATE TABLE IF NOT EXISTS change_log (
            id bigserial PRIMARY KEY,
            entity_type text NOT NULL,
            entity_id text NOT NULL,
            action text NOT NULL,
            summary text,
            created_at timestamptz DEFAULT now()
          )
        `
        await sql`
          INSERT INTO change_log (entity_type, entity_id, action, summary)
          VALUES ('athlete', ${athleteId}, 'delete', ${'Deleted ' + athleteId})
        `
        return res.status(200).json({ ok: true, deleted: athleteId })
      }

      case 'recentChanges': {
        const { limit } = params
        const max = Math.min(Number(limit) || 50, 200)
        await sql`
          CREATE TABLE IF NOT EXISTS change_log (
            id bigserial PRIMARY KEY,
            entity_type text NOT NULL,
            entity_id text NOT NULL,
            action text NOT NULL,
            summary text,
            created_at timestamptz DEFAULT now()
          )
        `
        const rows = await sql`
          SELECT id, entity_type, entity_id, action, summary, created_at
          FROM change_log
          ORDER BY created_at DESC
          LIMIT ${max}
        `
        return res.status(200).json({ ok: true, changes: rows })
      }

      case 'saveSlotRequest': {
        const { athleteId, month, picks, note } = params
        if (!athleteId || !month || !picks) {
          return res.status(400).json({ error: 'athleteId, month, picks required' })
        }
        // Ensure table exists (defensive — in case setupSchema hasn't run)
        await sql`
          CREATE TABLE IF NOT EXISTS slot_requests (
            id bigserial PRIMARY KEY,
            athlete_id text NOT NULL,
            month text NOT NULL,
            picks jsonb NOT NULL,
            note text,
            submitted_at timestamptz DEFAULT now(),
            UNIQUE (athlete_id, month)
          )
        `
        // Upsert: one request per athlete per month, latest wins
        await sql`
          INSERT INTO slot_requests (athlete_id, month, picks, note, submitted_at)
          VALUES (${athleteId}, ${month}, ${JSON.stringify(picks)}::jsonb, ${note || null}, now())
          ON CONFLICT (athlete_id, month)
          DO UPDATE SET picks = EXCLUDED.picks, note = EXCLUDED.note, submitted_at = now()
        `
        return res.status(200).json({ ok: true })
      }

      case 'getSlotRequest': {
        const { athleteId, month } = params
        if (!athleteId || !month) {
          return res.status(400).json({ error: 'athleteId, month required' })
        }
        const rows = await sql`
          SELECT athlete_id, month, picks, note, submitted_at
          FROM slot_requests
          WHERE athlete_id = ${athleteId} AND month = ${month}
          LIMIT 1
        `
        return res.status(200).json({ ok: true, request: rows[0] || null })
      }

      case 'listSlotRequests': {
        const { month } = params
        if (!month) return res.status(400).json({ error: 'month required' })
        const rows = await sql`
          SELECT athlete_id, month, picks, note, submitted_at
          FROM slot_requests
          WHERE month = ${month}
          ORDER BY submitted_at DESC
        `
        return res.status(200).json({ ok: true, requests: rows })
      }

      case 'deleteSlotRequest': {
        // Hard-delete a family's request row. Used when the family taps
        // "Clear and start fresh" from the confirmation card. Without this
        // the row hangs around in the DB and the family sees their old
        // picks reappear next time they load the page (because getSlotRequest
        // returns it and the UI flips submitted=true).
        const { athleteId, month } = params
        if (!athleteId || !month) {
          return res.status(400).json({ error: 'athleteId, month required' })
        }
        await sql`
          DELETE FROM slot_requests
          WHERE athlete_id = ${athleteId} AND month = ${month}
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
