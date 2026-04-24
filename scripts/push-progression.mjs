#!/usr/bin/env node
// ============================================================
// push-progression.mjs
// ============================================================
// Pushes parsed progression JSON for ONE athlete into the live Neon
// database via the deployed /api/db endpoint. Designed to run on
// Confluence Swim's production-or-preview API, no direct DB access.
//
// Run:
//   node scripts/push-progression.mjs --athlete=ath_farris
//   node scripts/push-progression.mjs --athlete=ath_jon
//   node scripts/push-progression.mjs --athlete=ath_farris --dry
//
// Optional flags:
//   --dry                    Show what would be sent, don't POST
//   --api=<url>              Override API base (default: production)
//   --replace                Replace existing progression instead of merging
//
// Default behavior is MERGE: existing progression entries on the
// athlete record are preserved; parsed entries from the markdown doc
// are appended. Duplicates (same event + time + date + meet) are
// deduped. Use --replace only if Chase explicitly wants to wipe what's
// there and start fresh from the doc.
//
// Safety rails:
//   • One athlete per invocation. No "all athletes" mode.
//   • Reads current athlete data first; aborts if athlete not found.
//   • Prints before/after counts and asks for confirmation by env var
//     CONFIRM=yes (so accidental Enter doesn't ship anything).
// ============================================================

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const REPO_ROOT  = path.resolve(__dirname, '..')

const DEFAULT_API = 'https://confluence-swim.vercel.app/api/db'

// --- args ------------------------------------------------------------

const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? true]
  })
)

const athleteId  = args.athlete
const apiUrl     = args.api || DEFAULT_API
const dryRun     = !!args.dry
const replace    = !!args.replace
const confirmed  = process.env.CONFIRM === 'yes'

if (!athleteId) {
  console.error('Usage: node scripts/push-progression.mjs --athlete=ath_<id> [--dry] [--replace]')
  process.exit(1)
}

const parsedPath = path.join(REPO_ROOT, 'scripts', 'parsed', `${athleteId}.json`)
if (!fs.existsSync(parsedPath)) {
  console.error(`ERROR: parsed JSON not found at ${parsedPath}`)
  console.error('Run: node scripts/parse-progression.mjs first.')
  process.exit(1)
}

const parsedEntries = JSON.parse(fs.readFileSync(parsedPath, 'utf8'))

// --- helpers ---------------------------------------------------------

async function apiPost(action, params) {
  const r = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...params }),
  })
  if (!r.ok) {
    const text = await r.text()
    throw new Error(`API ${action} failed: ${r.status} ${text}`)
  }
  return r.json()
}

function entryKey(e) {
  return `${e.event}|${e.time}|${e.date || ''}|${e.meet || ''}`
}

// --- main ------------------------------------------------------------

async function main() {
  console.log(`API:     ${apiUrl}`)
  console.log(`Athlete: ${athleteId}`)
  console.log(`Mode:    ${replace ? 'REPLACE' : 'MERGE'}`)
  console.log(`Dry run: ${dryRun ? 'YES' : 'no'}`)
  console.log('')

  // 1. Load current athlete record
  const list = await apiPost('listAthletes', {})
  const found = (list.athletes || []).find(a => a.id === athleteId)
  if (!found) {
    console.error(`ERROR: athlete ${athleteId} not found in DB.`)
    console.error('Add the athlete first via the admin UI, then re-run.')
    process.exit(1)
  }

  const current      = found.data || {}
  const existingProg = Array.isArray(current.progression) ? current.progression : []

  console.log(`Current DB record:`)
  console.log(`  name:                ${current.name || '(missing)'}`)
  console.log(`  progression entries: ${existingProg.length}`)
  console.log('')
  console.log(`Parsed from markdown:`)
  console.log(`  entries to push:     ${parsedEntries.length}`)
  console.log('')

  // 2. Compute final progression
  let finalProg
  if (replace) {
    finalProg = parsedEntries
  } else {
    const seen = new Set(existingProg.map(entryKey))
    const merged = [...existingProg]
    let added = 0
    for (const e of parsedEntries) {
      const k = entryKey(e)
      if (seen.has(k)) continue
      seen.add(k)
      merged.push(e)
      added += 1
    }
    finalProg = merged
    console.log(`Merge result:`)
    console.log(`  added new:           ${added}`)
    console.log(`  duplicates skipped:  ${parsedEntries.length - added}`)
    console.log(`  final total:         ${finalProg.length}`)
    console.log('')
  }

  // 3. Dry run prints and exits
  if (dryRun) {
    console.log('DRY RUN — no write performed.')
    console.log('First 3 entries that would be persisted:')
    finalProg.slice(0, 3).forEach((e, i) => console.log(`  [${i}]`, e))
    return
  }

  // 4. Real run requires CONFIRM=yes env var
  if (!confirmed) {
    console.log('Refusing to write without CONFIRM=yes.')
    console.log('Re-run with: CONFIRM=yes node scripts/push-progression.mjs --athlete=' + athleteId)
    process.exit(2)
  }

  // 5. Push the updated record
  const updated = { ...current, progression: finalProg }
  const result  = await apiPost('updateAthlete', {
    athleteId,
    data: updated,
  })
  console.log('updateAthlete →', result)

  // 6. Read it back to verify
  const verifyList = await apiPost('listAthletes', {})
  const verifyAth  = (verifyList.athletes || []).find(a => a.id === athleteId)
  const verifyProg = Array.isArray(verifyAth?.data?.progression) ? verifyAth.data.progression : []
  console.log('')
  console.log(`Verified after write: ${verifyProg.length} progression entries persisted.`)
  if (verifyProg.length !== finalProg.length) {
    console.error('WARNING: persisted count does not match expected count.')
    process.exit(3)
  }
  console.log('OK.')
}

main().catch(err => {
  console.error('FATAL:', err.message)
  process.exit(1)
})
