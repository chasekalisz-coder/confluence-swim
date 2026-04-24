#!/usr/bin/env node
// ============================================================
// parse-progression.mjs
// ============================================================
// Reads all 11 progression master markdown docs in docs/progression/,
// normalizes each entry into the canonical { event, time, date, meet }
// shape that AthleteProfile.jsx writes to the DB, and emits one JSON
// file per athlete in scripts/parsed/ so Chase can spot-check before
// anything touches Neon.
//
// Run:
//   node scripts/parse-progression.mjs
//
// Output:
//   scripts/parsed/<athlete_id>.json    — array of progression entries
//   scripts/parsed/_summary.json        — totals + diagnostics
//
// This script never touches the network or the database. It is purely
// a doc-to-JSON transform. The push-to-Neon step is a separate script.
// ============================================================

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const REPO_ROOT  = path.resolve(__dirname, '..')

const PROGRESSION_DIR = path.join(REPO_ROOT, 'docs', 'progression')
const OUT_DIR         = path.join(REPO_ROOT, 'scripts', 'parsed')

// Map of progression doc filename → athlete ID. The IDs match what's
// used in src/data/athletes.js and the live Neon `athletes` table.
const FILE_TO_ATHLETE = {
  'ben-progression-master.md':     'ath_ben',
  'farris-progression-master.md':  'ath_farris',
  'grace-progression-master.md':   'ath_grace',
  'hannah-progression-master.md':  'ath_hannah',
  'jon-progression-master.md':     'ath_jon',
  'kaden-progression-master.md':   'ath_kaden',
  'lana-progression-master.md':    'ath_lana',
  'liam-progression-master.md':    'ath_liam',
  'marley-progression-master.md':  'ath_marley',
  'mason-progression-master.md':   'ath_mason',
  'pace-progression-master.md':    'ath_pace',
}

// Storage format the codebase expects (see src/lib/canonicalEvents.js).
// Long stroke names in the docs need to collapse to these short ones.
const STROKE_NORMALIZE = {
  'Freestyle':         'Free',
  'Free':              'Free',
  'Butterfly':         'Fly',
  'Fly':               'Fly',
  'Backstroke':        'Back',
  'Back':              'Back',
  'Breaststroke':      'Breast',
  'Breast':            'Breast',
  'Individual Medley': 'IM',
  'IM':                'IM',
}

// Canonical events the app knows about (must exactly match canonicalEvents.js).
const CANONICAL_EVENTS = new Set([
  '50 Free SCY','100 Free SCY','200 Free SCY','500 Free SCY','1000 Free SCY','1650 Free SCY',
  '50 Fly SCY','100 Fly SCY','200 Fly SCY',
  '50 Back SCY','100 Back SCY','200 Back SCY',
  '50 Breast SCY','100 Breast SCY','200 Breast SCY',
  '100 IM SCY','200 IM SCY','400 IM SCY',
  '50 Free LCM','100 Free LCM','200 Free LCM','400 Free LCM','800 Free LCM','1500 Free LCM',
  '50 Fly LCM','100 Fly LCM','200 Fly LCM',
  '50 Back LCM','100 Back LCM','200 Back LCM',
  '50 Breast LCM','100 Breast LCM','200 Breast LCM',
  '200 IM LCM','400 IM LCM',
])

// --- helpers ---------------------------------------------------------

function normalizeEventHeader(raw) {
  // Input examples:
  //   "50 Freestyle SCY"  →  "50 Free SCY"
  //   "100 Butterfly LCM" →  "100 Fly LCM"
  //   "50 Free SCY"       →  "50 Free SCY"  (already short)
  //   "200 Individual Medley LCM" → "200 IM LCM"
  const trimmed = raw.replace(/^###\s+/, '').trim()

  // Split into [distance, ...stroke words..., course]. Course is the last
  // token and must be SCY or LCM. Stroke is everything between distance
  // and course.
  const parts  = trimmed.split(/\s+/)
  if (parts.length < 3) return null
  const dist   = parts[0]
  const course = parts[parts.length - 1]
  if (course !== 'SCY' && course !== 'LCM') return null

  const strokeRaw = parts.slice(1, -1).join(' ')
  const stroke    = STROKE_NORMALIZE[strokeRaw]
  if (!stroke) return null

  const canonical = `${dist} ${stroke} ${course}`
  return canonical
}

function normalizeDate(raw) {
  if (!raw) return ''
  const s = raw.trim()
  if (!s) return ''

  // Already ISO?
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s

  // "Feb 1, 2026" style
  const months = {
    Jan:'01', Feb:'02', Mar:'03', Apr:'04', May:'05', Jun:'06',
    Jul:'07', Aug:'08', Sep:'09', Oct:'10', Nov:'11', Dec:'12',
  }
  const m = s.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/)
  if (m) {
    const mon = months[m[1].slice(0,3)]
    if (!mon) return s
    const day = m[2].padStart(2, '0')
    return `${m[3]}-${mon}-${day}`
  }

  // Anything else — return as-is, flag in diagnostics
  return s
}

function parseDoc(filePath, athleteId) {
  const text  = fs.readFileSync(filePath, 'utf8')
  const lines = text.split(/\r?\n/)

  const entries = []
  const diagnostics = {
    file: path.basename(filePath),
    athleteId,
    skippedRows: [],
    unknownEvents: [],
    weirdDates: [],
  }

  let currentEvent = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Event header
    if (line.startsWith('### ')) {
      const canonical = normalizeEventHeader(line)
      if (!canonical) {
        diagnostics.skippedRows.push(`Header could not normalize: "${line.trim()}"`)
        currentEvent = null
        continue
      }
      if (!CANONICAL_EVENTS.has(canonical)) {
        diagnostics.unknownEvents.push(canonical)
        currentEvent = null
        continue
      }
      currentEvent = canonical
      continue
    }

    // Data row: starts with "|" and the first cell looks like a swim time.
    // Skip header row (| Time | Date | Meet |) and separator (|------|).
    if (!line.startsWith('|')) continue
    if (!currentEvent) continue

    const cells = line.split('|').slice(1, -1).map(c => c.trim())
    if (cells.length < 3) continue

    const timeCell = cells[0]
    if (!/^\d/.test(timeCell)) continue   // header / separator / blank

    const dateRaw = cells[1] || ''
    const meet    = cells[2] || ''
    const date    = normalizeDate(dateRaw)

    if (dateRaw && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      diagnostics.weirdDates.push({ event: currentEvent, time: timeCell, raw: dateRaw })
    }

    entries.push({
      event: currentEvent,
      time:  timeCell,
      date:  date,
      meet:  meet,
    })
  }

  return { entries, diagnostics }
}

// --- main ------------------------------------------------------------

function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

  const summary = {
    totals:      { athletes: 0, entries: 0 },
    perAthlete:  {},
    diagnostics: [],
  }

  for (const [filename, athleteId] of Object.entries(FILE_TO_ATHLETE)) {
    const filePath = path.join(PROGRESSION_DIR, filename)
    if (!fs.existsSync(filePath)) {
      console.warn(`MISSING: ${filename}`)
      continue
    }

    const { entries, diagnostics } = parseDoc(filePath, athleteId)

    fs.writeFileSync(
      path.join(OUT_DIR, `${athleteId}.json`),
      JSON.stringify(entries, null, 2)
    )

    summary.totals.athletes += 1
    summary.totals.entries  += entries.length
    summary.perAthlete[athleteId] = {
      file: filename,
      count: entries.length,
      events: [...new Set(entries.map(e => e.event))].length,
    }
    summary.diagnostics.push(diagnostics)
  }

  fs.writeFileSync(
    path.join(OUT_DIR, '_summary.json'),
    JSON.stringify(summary, null, 2)
  )

  // Console summary
  console.log('\n=== PARSE SUMMARY ===')
  console.log(`Athletes parsed: ${summary.totals.athletes}`)
  console.log(`Total entries:   ${summary.totals.entries}`)
  console.log('')
  for (const [id, info] of Object.entries(summary.perAthlete)) {
    console.log(`  ${id.padEnd(14)}  ${String(info.count).padStart(4)} entries / ${info.events} events  (${info.file})`)
  }

  // Diagnostics
  let issueCount = 0
  for (const d of summary.diagnostics) {
    if (d.skippedRows.length || d.unknownEvents.length || d.weirdDates.length) {
      if (issueCount === 0) console.log('\n=== DIAGNOSTICS (review before pushing) ===')
      console.log(`\n${d.file} (${d.athleteId}):`)
      d.skippedRows.forEach(r => console.log(`  skipped row: ${r}`))
      d.unknownEvents.forEach(e => console.log(`  unknown event: ${e}`))
      d.weirdDates.forEach(w => console.log(`  weird date:  ${w.event}  ${w.time}  raw="${w.raw}"`))
      issueCount += 1
    }
  }
  if (issueCount === 0) {
    console.log('\nNo parse diagnostics — all events recognized, all dates normalized.')
  }

  console.log(`\nWrote per-athlete JSON to: ${path.relative(REPO_ROOT, OUT_DIR)}/`)
}

main()
