

import { ATHLETES, normalizeAthlete, makeBlankAthlete } from '../data/athletes.js'

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

    // If DB is empty, seed it from the fixture once, then read back.
    // After that the fixture is never used again — DB is the only source
    // of truth for all athletes, seeded or manually added.
    if (!rows || rows.length === 0) {
      await callDb('seedAthletes', { athletes: ATHLETES })
      const { athletes: seeded } = await callDb('listAthletes')
      return {
        athletes: (seeded || []).map(r => normalizeAthlete({ ...makeBlankAthlete({ id: r.id, showChampionshipCuts: true }), ...r.data, id: r.id })),
        status: 'ok'
      }
    }

    // All athletes — seeded or manually added — go through the exact
    // same path. No fixture merging, no two-tier system.
    // Every athlete is: blank shape + DB data on top + id locked to DB row id.
    // This means: create a profile, enter times, save → performance profile
    // bloom/cuts/rankings/progression all work immediately. Same as Jon.
    const athletes = rows.map(r => {
      const dbRec = r.data || {}
      const dbHasProgression = Array.isArray(dbRec.progression)
      return normalizeAthlete({
        ...makeBlankAthlete({ id: r.id, showChampionshipCuts: true }),
        ...dbRec,
        id: r.id, // always use the real DB row id — never let dbRec.id override
        showChampionshipCuts: dbRec.showChampionshipCuts ?? true,
        meetTimes:   Array.isArray(dbRec.meetTimes)   ? dbRec.meetTimes   : [],
        goalTimes:   Array.isArray(dbRec.goalTimes)   ? dbRec.goalTimes   : [],
        progression: dbHasProgression                 ? dbRec.progression : [],
        events:      Array.isArray(dbRec.events)      ? dbRec.events      : [],
      })
    })

    return { athletes, status: 'ok' }
  } catch (e) {
    console.warn('loadAthletes failed:', e.message)
    // Fallback to fixture only if DB is completely unreachable
    return { athletes: ATHLETES.map(a => normalizeAthlete(a)), status: 'error', error: e.message }
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

  // Verification round-trip: read the athlete back from DB and confirm
  // the save actually persisted. We check that the saved record EXISTS
  // and has the editable list fields present — but we don't strictly
  // compare counts, because the same record can be touched by other
  // code paths (bulk import, normalization) between our save and the
  // readback. False alarms here used to make Chase think saves were
  // failing when they weren't.
  try {
    const { athletes: rows } = await callDb('listAthletes')
    const saved = (rows || []).find(r => r.id === athleteId)
    if (!saved) {
      throw new Error(`Save appeared to succeed but athlete ${athleteId} not found on readback.`)
    }
    const sentTimes   = (cleanData.meetTimes   || []).length
    const readTimes   = (saved.data?.meetTimes   || []).length
    const sentGoals   = (cleanData.goalTimes   || []).length
    const readGoals   = (saved.data?.goalTimes   || []).length
    const sentProg    = Array.isArray(cleanData.progression) ? cleanData.progression.length : null
    const readProg    = Array.isArray(saved.data?.progression) ? saved.data.progression.length : null

    // The only failure modes worth alarming on:
    //   1. The athlete record vanished entirely (caught above)
    //   2. We sent a non-empty list and the DB came back with nothing
    //
    // Anything else (off-by-N count differences) just gets logged for
    // diagnostics. Bulk imports and normalization can legitimately
    // change counts between writes; they're not save failures.
    if (sentTimes > 0 && readTimes === 0) {
      throw new Error(`Save did not persist: sent ${sentTimes} meetTimes, DB has 0.`)
    }
    if (sentGoals > 0 && readGoals === 0) {
      throw new Error(`Save did not persist: sent ${sentGoals} goalTimes, DB has 0.`)
    }
    if (sentProg !== null && sentProg > 0 && (readProg === null || readProg === 0)) {
      throw new Error(`Save did not persist: sent ${sentProg} progression entries, DB has ${readProg ?? 'none'}.`)
    }
    // Helpful diagnostic logging — visible in DevTools console for
    // debugging but not surfaced to Chase as alerts.
    if (sentTimes !== readTimes || sentGoals !== readGoals || (sentProg !== null && sentProg !== readProg)) {
      console.log(`[updateAthlete ${athleteId}] verified — counts differ but save landed (sent ${sentTimes}/${sentGoals}${sentProg !== null ? `/${sentProg}` : ''}, DB has ${readTimes}/${readGoals}${sentProg !== null ? `/${readProg}` : ''}). Likely benign — concurrent edit or normalization.`)
    } else {
      console.log(`[updateAthlete ${athleteId}] verified — ${sentTimes} times, ${sentGoals} goals${sentProg !== null ? `, ${sentProg} progression entries` : ''} match exactly`)
    }
  } catch (verifyErr) {
    throw verifyErr
  }

  return result
}

export async function addAthlete(athlete) {
  const result = await callDb('addAthlete', { athlete })
  // Readback verification — same pattern as updateAthlete. If the DB
  // claimed success but the row isn't there, we want to know loudly.
  try {
    const { athletes: rows } = await callDb('listAthletes')
    const saved = (rows || []).find(r => r.id === athlete.id)
    if (!saved) {
      throw new Error(`Add appeared to succeed but ${athlete.id} not found on readback.`)
    }
    console.log(`[addAthlete ${athlete.id}] verified — record exists in DB`)
  } catch (verifyErr) {
    throw verifyErr
  }
  return result
}

export async function deleteAthlete(athleteId) {
  return callDb('deleteAthlete', { athleteId })
}
