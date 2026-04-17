import { ATHLETES } from '../data/athletes.js'

// Client-side wrapper that calls our Vercel serverless function at /api/db.
// The browser never sees the database connection string - that's server-only.

async function callDb(action, params = {}) {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...params })
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

// Check if /api/db is alive and can reach the database.
export async function checkDbHealth() {
  try {
    const res = await fetch('/api/db', { method: 'GET' })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok && data.dbConnected, data }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// Load all athletes. If the table is empty, seed it with the roster.
// Returns: { athletes: [...], status: 'ok' | 'no-table' | 'error', error?: string }
export async function loadAthletes() {
  try {
    // Make sure schema exists (idempotent, harmless to call every time)
    await callDb('setupSchema')

    const { athletes: rows } = await callDb('listAthletes')

    if (!rows || rows.length === 0) {
      // Seed with the 9 roster athletes
      await callDb('seedAthletes', { athletes: ATHLETES })
      return { athletes: ATHLETES, status: 'ok' }
    }

    // Return in roster order
    const byId = Object.fromEntries(rows.map(r => [r.id, r.data]))
    const ordered = ATHLETES.map(a => byId[a.id] || a)
    return { athletes: ordered, status: 'ok' }
  } catch (e) {
    console.warn('loadAthletes failed:', e.message)
    return { athletes: ATHLETES, status: 'error', error: e.message }
  }
}

export async function loadAthleteSessions(athleteId) {
  try {
    const { sessions } = await callDb('listAthleteSessions', { athleteId })
    return sessions || []
  } catch (e) {
    console.warn('loadAthleteSessions failed:', e.message)
    return []
  }
}

export async function saveSession(session) {
  return callDb('saveSession', { session })
}
