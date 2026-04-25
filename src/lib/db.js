

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
      if (!dbRec) return normalizeAthlete(a)
      const dbHasProgression = Array.isArray(dbRec.progression)
      return normalizeAthlete({
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
      })
    })
    // Manually-added athletes — not in the fixture but exist in DB.
    // Give them the EXACT same merge treatment as fixture athletes so
    // their meetTimes, goalTimes, events, age, gender, progression all
    // flow through to the performance profile identically to Jon etc.
    rows.forEach(r => {
      if (!ATHLETES.some(a => a.id === r.id)) {
        const dbRec = r.data || {}
        const dbHasProgression = Array.isArray(dbRec.progression)
        const base = makeBlankAthlete({ id: r.id, showChampionshipCuts: true })
        ordered.push(normalizeAthlete({
          ...base,
          ...dbRec,
          id: r.id,
          showChampionshipCuts: dbRec.showChampionshipCuts ?? true,
          meetTimes:   Array.isArray(dbRec.meetTimes)   ? dbRec.meetTimes   : [],
          goalTimes:   Array.isArray(dbRec.goalTimes)   ? dbRec.goalTimes   : [],
          progression: dbHasProgression                 ? dbRec.progression : [],
          events:      Array.isArray(dbRec.events)      ? dbRec.events      : [],
        }))
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
