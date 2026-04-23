

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
    // Merge local + DB. Local is source of truth for schema/structure and
    // the new v2 fields (showChampionshipCuts, mockSessions, upcomingMeets,
    // pastMeets, progression, gender). DB wins for user-editable fields
    // (meetTimes, goalTimes, events, age, dob) that the admin may have
    // updated since the seed. This prevents stale DB records from dropping
    // fields the local data file has added.
    const ordered = ATHLETES.map(a => {
      const dbRec = byId[a.id]
      if (!dbRec) return a
      return {
        ...a,           // local wins for new fields
        ...dbRec,       // DB overrides where both exist
        // ...then re-assert local for fields we know DB won't have
        showChampionshipCuts: a.showChampionshipCuts ?? dbRec.showChampionshipCuts,
        mockSessions:        a.mockSessions        ?? dbRec.mockSessions,
        upcomingMeets:       a.upcomingMeets       ?? dbRec.upcomingMeets,
        pastMeets:           a.pastMeets           ?? dbRec.pastMeets,
        progression:         a.progression         ?? dbRec.progression,
        gender:              a.gender              ?? dbRec.gender,
      }
    })
    // Append any athletes from DB that aren't in the hardcoded list
    rows.forEach(r => {
      if (!ATHLETES.some(a => a.id === r.id)) {
        ordered.push(r.data)
      }
    })
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

export async function updateAthlete(athleteId, data) {
  return callDb('updateAthlete', { athleteId, data })
}

export async function addAthlete(athlete) {
  return callDb('addAthlete', { athlete })
}

export async function deleteAthlete(athleteId) {
  return callDb('deleteAthlete', { athleteId })
}
