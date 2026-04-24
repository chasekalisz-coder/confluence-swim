

import { ATHLETES } from '../data/athletes.js'

async function callDb(action, params = {}) {
  let res, data
  try {
    res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...params })
    })
  } catch (netErr) {
    console.error(`[callDb ${action}] network error:`, netErr)
    throw new Error(`Network error: ${netErr.message}`)
  }

  const rawText = await res.text()
  try {
    data = rawText ? JSON.parse(rawText) : {}
  } catch (parseErr) {
    console.error(`[callDb ${action}] response not JSON:`, rawText.slice(0, 200))
    throw new Error(`Bad response (HTTP ${res.status}): ${rawText.slice(0, 120)}`)
  }

  if (!res.ok) {
    console.error(`[callDb ${action}] HTTP ${res.status}:`, data)
    throw new Error(data.error || `HTTP ${res.status} from /api/db`)
  }

  console.log(`[callDb ${action}] ok`, data)
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
  // Strip fields that live in local src/data/athletes.js — never write
  // placeholder/demo data into the DB. The merge layer in loadAthletes()
  // re-applies these from local on next read, so they don't need to be
  // round-tripped through storage.
  const {
    mockSessions,
    upcomingMeets,
    pastMeets,
    progression,
    ...cleanData
  } = data

  const result = await callDb('updateAthlete', { athleteId, data: cleanData })

  // Verification round-trip: read the athlete back from DB and compare
  // a representative field to prove the save actually persisted. Gives
  // Chase a loud, explicit failure if something went sideways.
  try {
    const { athletes: rows } = await callDb('listAthletes')
    const saved = (rows || []).find(r => r.id === athleteId)
    if (!saved) {
      throw new Error(`Save appeared to succeed but athlete ${athleteId} not found on readback.`)
    }
    // Spot-check meetTimes count — the field most commonly edited
    const sentCount  = (cleanData.meetTimes || []).length
    const readCount  = (saved.data?.meetTimes || []).length
    if (sentCount !== readCount) {
      console.error(`[updateAthlete] count mismatch — sent ${sentCount}, DB has ${readCount}`, { sent: cleanData.meetTimes, got: saved.data?.meetTimes })
      throw new Error(`Save failed to persist: sent ${sentCount} times, DB has ${readCount}.`)
    }
    console.log(`[updateAthlete ${athleteId}] verified — ${sentCount} times, ${(cleanData.goalTimes || []).length} goals persisted`)
  } catch (verifyErr) {
    // Throw — so the caller's .catch(err => alert(...)) fires.
    throw verifyErr
  }

  return result
}

export async function addAthlete(athlete) {
  return callDb('addAthlete', { athlete })
}

export async function deleteAthlete(athleteId) {
  return callDb('deleteAthlete', { athleteId })
}
