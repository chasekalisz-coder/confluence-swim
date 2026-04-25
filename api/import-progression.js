// ============================================================
// /api/import-progression.js
// ============================================================
// One-shot endpoint that bulk-loads all 11 athletes' progression data
// from the parsed JSON files into Neon.
//
// Why this exists: Chase clicks "Import progression data" on the admin
// page; the button POSTs here.
//
// What it does (per athlete):
//   1. Fetch the current record from Neon
//   2. MERGE-mode append parsed entries that aren't already there
//      (dedupes by event + time + date + meet)
//   3. Write the updated record back
//   4. Log a row to change_log
//
// JSON files are imported directly (not read from disk at runtime) so
// Vercel statically bundles them with the function.
// ============================================================

import { neon } from '@neondatabase/serverless'

import ben    from './data/ath_ben.json'    with { type: 'json' }
import farris from './data/ath_farris.json' with { type: 'json' }
import grace  from './data/ath_grace.json'  with { type: 'json' }
import hannah from './data/ath_hannah.json' with { type: 'json' }
import jon    from './data/ath_jon.json'    with { type: 'json' }
import kaden  from './data/ath_kaden.json'  with { type: 'json' }
import lana   from './data/ath_lana.json'   with { type: 'json' }
import liam   from './data/ath_liam.json'   with { type: 'json' }
import marley from './data/ath_marley.json' with { type: 'json' }
import mason  from './data/ath_mason.json'  with { type: 'json' }
import pace   from './data/ath_pace.json'   with { type: 'json' }

const PARSED = {
  ath_ben:    ben,
  ath_farris: farris,
  ath_grace:  grace,
  ath_hannah: hannah,
  ath_jon:    jon,
  ath_kaden:  kaden,
  ath_lana:   lana,
  ath_liam:   liam,
  ath_marley: marley,
  ath_mason:  mason,
  ath_pace:   pace,
}

const sql = neon(process.env.DATABASE_URL)

function entryKey(e) {
  return `${e.event}|${e.time}|${e.date || ''}|${e.meet || ''}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const summary = []

    // Make sure change_log exists so each merge writes a log row
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

    for (const [athleteId, parsedEntries] of Object.entries(PARSED)) {
      const rows = await sql`SELECT id, data FROM athletes WHERE id = ${athleteId}`
      const found = rows[0]
      if (!found) {
        summary.push({
          athleteId,
          status: 'skipped',
          reason: 'athlete not found in DB',
          parsedCount: parsedEntries.length,
        })
        continue
      }

      const current      = found.data || {}
      const existingProg = Array.isArray(current.progression) ? current.progression : []
      const seen         = new Set(existingProg.map(entryKey))

      let added = 0
      const merged = [...existingProg]
      for (const e of parsedEntries) {
        const k = entryKey(e)
        if (seen.has(k)) continue
        seen.add(k)
        merged.push(e)
        added += 1
      }

      const updated = { ...current, progression: merged }

      await sql`
        UPDATE athletes
        SET data = ${JSON.stringify(updated)}::jsonb, updated_at = now()
        WHERE id = ${athleteId}
      `

      await sql`
        INSERT INTO change_log (entity_type, entity_id, action, summary)
        VALUES ('athlete', ${athleteId}, 'progression-import', ${'Imported ' + added + ' entries (merge)'})
      `

      summary.push({
        athleteId,
        status: 'ok',
        name: current.name || `${current.first || ''} ${current.last || ''}`.trim() || athleteId,
        parsedCount: parsedEntries.length,
        addedNew: added,
        duplicatesSkipped: parsedEntries.length - added,
        finalTotal: merged.length,
      })
    }

    return res.status(200).json({ ok: true, summary })
  } catch (e) {
    console.error('import-progression error:', e)
    return res.status(500).json({ ok: false, error: e.message })
  }
}
