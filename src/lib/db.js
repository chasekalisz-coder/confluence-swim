

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
    // pastMeets, gender). DB wins for user-editable fields (meetTimes,
    // goalTimes, events, age, dob, progression) that the admin may have
    // updated since the seed. This prevents stale DB records from dropping
    // fields the local data file has added.
    //
    // progression: DB wins when present (even empty [] counts as "DB has
    // authoritative data for this athlete"). Fixture fallback only fires
    // if the DB record has no progression key at all — covers athletes
    // seeded before the progression column was user-writable.
    const ordered = ATHLETES.map(a => {
      const dbRec = byId[a.id]
      if (!dbRec) return a
      const dbHasProgression = Array.isArray(dbRec.progression)
      return {
        ...a,           // local wins for new fields
        ...dbRec,       // DB overrides where both exist
        // ...then re-assert local for fields we know DB won't have
        showChampionshipCuts: a.showChampionshipCuts ?? dbRec.showChampionshipCuts,
        mockSessions:        a.mockSessions        ?? dbRec.mockSessions,
        upcomingMeets:       a.upcomingMeets       ?? dbRec.upcomingMeets,
        pastMeets:           a.pastMeets           ?? dbRec.pastMeets,
        // progression: DB wins if it has an entry (even empty []); fixture
        // fallback only for un-migrated athletes.
        progression:         dbHasProgression ? dbRec.progression : a.progression,
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
  //
  // NOTE: `progression` used to be on this list because it was demo-only
  // fixture data. As of Step 6 (meet results UI prep), progression is
  // user-editable through the admin meet results form and must persist
  // to the DB. Merge layer in loadAthletes() now treats DB as source of
  // truth for progression and falls back to fixture only when the DB
  // has no progression for that athlete.
  const {
    mockSessions,
    upcomingMeets,
    pastMeets,
    ...cleanData
  } = data

  const result = await callDb('updateAthlete', { athleteId, data: cleanData })

  // Verification round-trip: read the athlete back from DB and compare
  // representative counts to prove the save actually persisted. Gives
  // Chase a loud, explicit failure if something went sideways.
  try {
    const { athletes: rows } = await callDb('listAthletes')
    const saved = (rows || []).find(r => r.id === athleteId)
    if (!saved) {
      throw new Error(`Save appeared to succeed but athlete ${athleteId} not found on readback.`)
    }
    // Spot-check counts on the three user-editable list fields. Mismatch
    // on any one is a persistence failure.
    const sentTimes   = (cleanData.meetTimes   || []).length
    const readTimes   = (saved.data?.meetTimes   || []).length
    const sentGoals   = (cleanData.goalTimes   || []).length
    const readGoals   = (saved.data?.goalTimes   || []).length
    const sentProg    = Array.isArray(cleanData.progression) ? cleanData.progression.length : null
    const readProg    = Array.isArray(saved.data?.progression) ? saved.data.progression.length : null

    if (sentTimes !== readTimes) {
      console.error(`[updateAthlete] meetTimes count mismatch — sent ${sentTimes}, DB has ${readTimes}`, { sent: cleanData.meetTimes, got: saved.data?.meetTimes })
      throw new Error(`Save failed to persist: sent ${sentTimes} meetTimes, DB has ${readTimes}.`)
    }
    if (sentGoals !== readGoals) {
      console.error(`[updateAthlete] goalTimes count mismatch — sent ${sentGoals}, DB has ${readGoals}`, { sent: cleanData.goalTimes, got: saved.data?.goalTimes })
      throw new Error(`Save failed to persist: sent ${sentGoals} goalTimes, DB has ${readGoals}.`)
    }
    // Only verify progression if the caller actually sent it. Edits from
    // a page that doesn't touch progression won't include the field.
    if (sentProg !== null && sentProg !== readProg) {
      console.error(`[updateAthlete] progression count mismatch — sent ${sentProg}, DB has ${readProg}`, { sent: cleanData.progression, got: saved.data?.progression })
      throw new Error(`Save failed to persist: sent ${sentProg} progression entries, DB has ${readProg}.`)
    }
    console.log(`[updateAthlete ${athleteId}] verified — ${sentTimes} times, ${sentGoals} goals${sentProg !== null ? `, ${sentProg} progression entries` : ''} persisted`)
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
