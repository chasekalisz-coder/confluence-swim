
import { ATHLETES } from '../data/athletes.js'

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

export async function checkDbHealth() {
  try {
    const res = await fetch('/api/db', { method: 'GET' })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok && data.dbConnected, data }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function loadAthletes() {
  try {
    await callDb('setupSchema')
    const { athletes: rows } = await callDb('listAthletes')
    if (!rows || rows.length === 0) {
      await callDb('seedAthletes', { athletes: ATHLETES })
      return { athletes: ATHLETES, status: 'ok' }
    }
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

export async function deleteSession(sessionId) {
  return callDb('deleteSession', { sessionId })
}
