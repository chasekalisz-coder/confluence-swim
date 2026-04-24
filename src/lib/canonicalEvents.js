// ============================================================
// CANONICAL EVENT LIST
// ============================================================
// Single source of truth for the full set of events every athlete's
// meetTimes + goalTimes lists should contain. Used by:
//
//   • AthleteProfile edit form — always renders these 35 rows
//   • AthleteGrid Add Athlete — new athletes get blank entries for all 35
//
// Order: stroke family (Free / Fly / Back / Breast / IM), then course
// (SCY first then LCM), then shortest → longest within each group.
//
// Distance-event notes:
//   • SCY has 500 / 1000 / 1650 Free (no 800 / 1500)
//   • LCM has 400 / 800 / 1500 Free (no 500 / 1000 / 1650)
//   • SCY has 100 IM; LCM does not (not a USA Swimming LCM event)
//
// Storage format is "<distance> <short-stroke> <course>" — e.g. "100 Fly SCY".
// The short stroke names (Fly/Back/Breast/IM) are used EVERYWHERE in the
// codebase (standards tables, AI prompts, bloom chart, DB data). Do NOT
// rename these without a coordinated site-wide change.
//
// The UI surfaces a prettier display via displayEventName() below, so
// users see "100 Butterfly SCY" while storage stays "100 Fly SCY".
// ============================================================

export const CANONICAL_EVENTS = [
  // --- SCY ---
  '50 Free SCY',
  '100 Free SCY',
  '200 Free SCY',
  '500 Free SCY',
  '1000 Free SCY',
  '1650 Free SCY',

  '50 Fly SCY',
  '100 Fly SCY',
  '200 Fly SCY',

  '50 Back SCY',
  '100 Back SCY',
  '200 Back SCY',

  '50 Breast SCY',
  '100 Breast SCY',
  '200 Breast SCY',

  '100 IM SCY',
  '200 IM SCY',
  '400 IM SCY',

  // --- LCM ---
  '50 Free LCM',
  '100 Free LCM',
  '200 Free LCM',
  '400 Free LCM',
  '800 Free LCM',
  '1500 Free LCM',

  '50 Fly LCM',
  '100 Fly LCM',
  '200 Fly LCM',

  '50 Back LCM',
  '100 Back LCM',
  '200 Back LCM',

  '50 Breast LCM',
  '100 Breast LCM',
  '200 Breast LCM',

  '200 IM LCM',
  '400 IM LCM',
]

// Full stroke name lookup for display. Keeps storage format short while
// making the UI read with proper names.
const STROKE_FULL = {
  Free:    'Freestyle',
  Fly:     'Butterfly',
  Back:    'Backstroke',
  Breast:  'Breaststroke',
  IM:      'Individual Medley',
}

/**
 * Converts storage format to display format.
 *   "100 Fly SCY"     → "100 Butterfly SCY"
 *   "200 IM LCM"      → "200 Individual Medley LCM"
 *   "50 Free SCY"     → "50 Freestyle SCY"
 */
export function displayEventName(event) {
  if (!event) return ''
  // Match "<dist> <stroke> <course>"
  const m = event.match(/^(\d+)\s+(Free|Fly|Back|Breast|IM)\s+(SCY|LCM)$/)
  if (!m) return event  // unknown format, return as-is
  const [, dist, stroke, course] = m
  return `${dist} ${STROKE_FULL[stroke] || stroke} ${course}`
}

/**
 * Given an athlete's existing meetTimes or goalTimes array (which may be
 * partial or empty), returns a full 35-entry array in canonical order
 * with the athlete's existing times filled in and blanks for events they
 * haven't raced yet. Does NOT drop any entries — if an athlete somehow has
 * an event outside the canonical list, that entry is appended at the end
 * so nothing is lost.
 */
export function buildCanonicalTimesList(existing = []) {
  const existingByEvent = new Map()
  for (const t of existing) {
    if (t && t.event) existingByEvent.set(t.event, t)
  }

  const result = []
  for (const canonicalEvent of CANONICAL_EVENTS) {
    const existingEntry = existingByEvent.get(canonicalEvent)
    result.push(existingEntry || { event: canonicalEvent, time: '' })
    existingByEvent.delete(canonicalEvent)
  }

  // Anything left in the map is an event not in the canonical list —
  // preserve it at the end rather than silently dropping.
  for (const orphan of existingByEvent.values()) {
    result.push(orphan)
  }

  return result
}
