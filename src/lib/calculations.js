// ============================================================
// calculations.js — PURE DATA HELPERS
// ============================================================
// All functions here are pure: same inputs → same outputs,
// no side effects. Safe to call from anywhere.

import { STANDARDS, LEVELS, standardsKey } from './standards.js'

// ------------------------------------------------------------
// TIME PARSING & FORMATTING
// ------------------------------------------------------------

/**
 * Parse a swim time string into seconds (float).
 * Accepts "26.22", "1:02.91", "2:35.92", "18:07.89"
 * Returns null if unparseable.
 */
export function parseTime(t) {
  if (t == null || t === "") return null
  if (typeof t === "number") return t
  const s = String(t).trim()
  if (!s) return null

  const parts = s.split(":")
  try {
    if (parts.length === 1) {
      const n = parseFloat(parts[0])
      return isNaN(n) ? null : n
    }
    if (parts.length === 2) {
      const min = parseFloat(parts[0])
      const sec = parseFloat(parts[1])
      if (isNaN(min) || isNaN(sec)) return null
      return min * 60 + sec
    }
    if (parts.length === 3) {
      const hr = parseFloat(parts[0])
      const min = parseFloat(parts[1])
      const sec = parseFloat(parts[2])
      if (isNaN(hr) || isNaN(min) || isNaN(sec)) return null
      return hr * 3600 + min * 60 + sec
    }
  } catch { return null }
  return null
}

/**
 * Format seconds back into a swim time string.
 * < 60s → "26.22"
 * ≥ 60s → "1:02.91"
 */
export function formatTime(seconds) {
  if (seconds == null || isNaN(seconds)) return "—"
  const total = Math.max(0, seconds)
  if (total < 60) {
    return total.toFixed(2)
  }
  const min = Math.floor(total / 60)
  const sec = total - min * 60
  const secStr = sec < 10 ? `0${sec.toFixed(2)}` : sec.toFixed(2)
  return `${min}:${secStr}`
}

/**
 * Format a signed delta in seconds ("−2.42", "+1.38", "0.00").
 * decimals defaults to 2.
 */
export function formatDelta(deltaSec, decimals = 2) {
  if (deltaSec == null || isNaN(deltaSec)) return "—"
  const sign = deltaSec < 0 ? "−" : deltaSec > 0 ? "+" : ""
  return `${sign}${Math.abs(deltaSec).toFixed(decimals)}`
}

// ------------------------------------------------------------
// EVENT NAME NORMALIZATION
// ------------------------------------------------------------

/**
 * Turn "50 Free SCY" → { distance: 50, stroke: "Free", course: "SCY", base: "50 Free" }
 */
export function parseEventName(ev) {
  if (!ev) return null
  const m = ev.match(/^(\d+)\s+(Free|Back|Breast|Fly|IM)(?:\s+(SCY|LCM|SCM))?$/i)
  if (!m) return null
  return {
    distance: parseInt(m[1], 10),
    stroke: titleCase(m[2]),
    course: m[3] ? m[3].toUpperCase() : null,
    base: `${m[1]} ${titleCase(m[2])}`,
  }
}

function titleCase(s) {
  if (!s) return s
  const up = s.toUpperCase()
  if (up === "IM") return "IM"
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

// ------------------------------------------------------------
// STANDARD LOOKUPS
// ------------------------------------------------------------

/**
 * Look up the event standards for an athlete, event, course.
 * Returns { B, BB, A, AA, AAA, AAAA } in seconds, or null.
 */
export function eventStandards({ age, gender, course = "SCY", event }) {
  const key = standardsKey(age, gender, course)
  const table = STANDARDS[key]
  if (!table) return null
  // `event` might be "50 Free SCY" or just "50 Free"
  const parsed = parseEventName(event)
  const baseEvent = parsed ? parsed.base : event
  return table[baseEvent] || null
}

/**
 * Given a time (seconds) and the standards for that event,
 * return the slowest standard that the time meets or beats.
 * Returns null if the time doesn't meet even B.
 */
export function classifyTime(timeSec, standards) {
  if (timeSec == null || !standards) return null
  // Walk slowest → fastest; return highest level achieved.
  let achieved = null
  for (const level of LEVELS) {
    const cutoff = standards[level]
    if (cutoff != null && timeSec <= cutoff) {
      achieved = level
    }
  }
  return achieved
}

/**
 * Given a time and standards, return the NEXT standard above what's achieved.
 * Returns { level, cutoff, gap, pct } or null if already at AAAA.
 *
 * pct = how far between the PREVIOUS standard (current level the athlete
 * has achieved) and the NEXT standard their time sits. 0% means they just
 * barely made the previous standard. 100% means they're right at the next
 * cut. Above 100% is impossible — once they beat the next cut, classifyTime
 * bumps them up to that level and `nextStandard` re-computes against the
 * one above it.
 *
 * If the athlete hasn't even made B yet, pct is measured from a virtual
 * "no standard" floor at 2x the B cutoff (rough approximation — really
 * early swimmers just see a small %, which is honest).
 */
export function nextStandard(timeSec, standards) {
  if (timeSec == null || !standards) return null
  const current = classifyTime(timeSec, standards)
  const currentIdx = current == null ? -1 : LEVELS.indexOf(current)
  const nextIdx = currentIdx + 1
  if (nextIdx >= LEVELS.length) return null
  const nextLevel = LEVELS[nextIdx]
  const cutoff = standards[nextLevel]
  if (cutoff == null) return null

  // Previous standard cutoff — the "floor" from which we measure progress.
  // If they haven't made B yet, use 1.25x the B cut as a conservative floor.
  // (2x was too generous — a time well above B would display 60%+.)
  const prevLevel = currentIdx >= 0 ? LEVELS[currentIdx] : null
  const prevCutoff = prevLevel ? standards[prevLevel] : (standards.B ? standards.B * 1.25 : cutoff * 1.25)

  // Progress = how much of the (prev → next) time range has been closed.
  // Smaller time = faster = better. So:
  //   prevCutoff = slowest edge (0% progress)
  //   cutoff     = fastest edge (100% progress)
  const range = prevCutoff - cutoff
  let pct = range > 0
    ? +(((prevCutoff - timeSec) / range) * 100).toFixed(1)
    : 0
  // Clamp to [0, 99.9]: 100 is impossible (they'd have crossed into the next level),
  // and below 0 means slower than the virtual floor — display as 0.
  if (pct < 0) pct = 0
  if (pct > 99.9) pct = 99.9

  return {
    level: nextLevel,
    cutoff,
    gap: +(timeSec - cutoff).toFixed(2),   // seconds to drop (positive = still above cut)
    pct,
  }
}

/**
 * Convenience: combined current + next summary for one event.
 */
export function standardSummary({ age, gender, course, event, timeSec }) {
  const stds = eventStandards({ age, gender, course, event })
  if (!stds) return null
  return {
    standards: stds,
    current: classifyTime(timeSec, stds),
    next: nextStandard(timeSec, stds),
  }
}

// ------------------------------------------------------------
// AGE-UP PROJECTION
// ------------------------------------------------------------

/**
 * What standard would the athlete's current time earn in the next age group?
 * Returns { projectedLevel, nextAgeBucket } or null.
 */
export function ageUpProjection({ currentAge, gender, course = "SCY", event, timeSec }) {
  if (timeSec == null) return null
  let nextAge
  if (currentAge <= 8) nextAge = 9
  else if (currentAge <= 10) nextAge = 11
  else if (currentAge <= 12) nextAge = 13
  else if (currentAge <= 14) nextAge = 15
  else if (currentAge <= 16) nextAge = 17
  else return null

  const stds = eventStandards({ age: nextAge, gender, course, event })
  if (!stds) return null
  return {
    projectedLevel: classifyTime(timeSec, stds),
    nextAgeBucket: ageBucketForAge(nextAge),
  }
}

function ageBucketForAge(age) {
  // Matches ageBucket() in standards.js — USA Swimming uses 5 age groups
  // (10 & Under, 11-12, 13-14, 15-16, 17-18) with no split below age 11.
  if (age <= 10) return "10U"
  if (age <= 12) return "11-12"
  if (age <= 14) return "13-14"
  if (age <= 16) return "15-16"
  return "17-18"
}

// ------------------------------------------------------------
// NEXT CUT PICKER — across all events, which is the most motivating?
// ------------------------------------------------------------

/**
 * Given an athlete's meet times, find the event where they're CLOSEST
 * to hitting their next standard cut (by %).
 *
 * meetTimes: [{ event: "50 Free SCY", time: "26.22" }, ...]
 * Returns { event, timeSec, currentLevel, next: { level, cutoff, gap, pct } } | null
 */
export function pickNextCut({ age, gender, course = "SCY", meetTimes }) {
  if (!Array.isArray(meetTimes) || !meetTimes.length) return null
  let best = null
  for (const mt of meetTimes) {
    const parsed = parseEventName(mt.event)
    if (!parsed) continue
    if (parsed.course && parsed.course !== course) continue
    const timeSec = parseTime(mt.time)
    if (timeSec == null) continue
    const stds = eventStandards({ age, gender, course, event: parsed.base })
    if (!stds) continue
    const next = nextStandard(timeSec, stds)
    if (!next) continue
    // "Closest" = highest pct of the cut achieved (ie. smallest gap / time).
    const closeness = 1 - (next.gap / timeSec)
    if (!best || closeness > best.closeness) {
      best = {
        event: parsed.base,
        eventWithCourse: mt.event,
        timeSec,
        currentLevel: classifyTime(timeSec, stds),
        next,
        closeness,
      }
    }
  }
  return best
}

// ------------------------------------------------------------
// EVENT POWER RANKINGS
// ------------------------------------------------------------

/**
 * Rank every (individual) event by % of top cut achieved.
 *
 * Returns array sorted strongest → weakest:
 *   [{ event, timeSec, currentLevel, pct, gapToNext, nextLevel }, ...]
 */
export function eventPowerRankings({ age, gender, course = "SCY", meetTimes }) {
  if (!Array.isArray(meetTimes)) return []
  const out = []
  const seen = new Set() // de-dupe if same event appears twice
  for (const mt of meetTimes) {
    const parsed = parseEventName(mt.event)
    if (!parsed) continue
    if (parsed.course && parsed.course !== course) continue
    if (seen.has(parsed.base)) continue
    seen.add(parsed.base)
    const timeSec = parseTime(mt.time)
    if (timeSec == null) continue
    const stds = eventStandards({ age, gender, course, event: parsed.base })
    if (!stds) continue
    const currentLevel = classifyTime(timeSec, stds)
    const next = nextStandard(timeSec, stds)
    // pct: how close to the *top* (AAAA) cut the time is.
    const top = stds.AAAA || stds.AAA || stds.AA
    const pct = top ? Math.max(0, Math.min(100, +(top / timeSec * 100).toFixed(0))) : 0
    out.push({
      event: parsed.base,
      eventWithCourse: mt.event,
      timeSec,
      currentLevel,
      pct,
      gapToNext: next ? next.gap : null,
      nextLevel: next ? next.level : null,
    })
  }
  return out.sort((a, b) => b.pct - a.pct)
}

// ------------------------------------------------------------
// GOAL TIME COMPARISON
// ------------------------------------------------------------

/**
 * For an athlete's event, combine current best + goal + standards into a table row.
 *
 * Returns { event, bestSec, goalSec, deltaToNext, deltaToGoal,
 *            currentLevel, nextLevel } — all may be null if not known.
 */
export function timesTableRow({ age, gender, course, event, bestTime, goalTime }) {
  const bestSec = parseTime(bestTime)
  const goalSec = parseTime(goalTime)
  const stds = eventStandards({ age, gender, course, event })
  const currentLevel = bestSec != null && stds ? classifyTime(bestSec, stds) : null
  const next = bestSec != null && stds ? nextStandard(bestSec, stds) : null

  // Unified color rule — applies to every delta on the site.
  const nextGap = next ? gapToCut(bestSec, next.cutoff) : null
  const goalGap = (bestSec != null && goalSec != null) ? gapToCut(bestSec, goalSec) : null

  return {
    event,
    bestSec,
    goalSec,
    currentLevel,
    nextLevel: next ? next.level : null,
    deltaToNext: next ? next.gap : null,
    pctToNext: next ? next.pct : null,
    colorToNext: nextGap ? nextGap.color : null,
    deltaToGoal: bestSec != null && goalSec != null ? +(bestSec - goalSec).toFixed(2) : null,
    pctToGoal: goalGap ? goalGap.pctOff : null,
    colorToGoal: goalGap ? goalGap.color : null,
  }
}

// ------------------------------------------------------------
// UNIFIED DELTA COLOR RULE
// ------------------------------------------------------------
// One rule applied wherever a time-gap appears on the site:
//   under 2%    → green (close enough to hunt this season)
//   2-3.5%      → yellow (reachable with focus)
//   3.5%+       → red (long-term)
// Regression (bestSec > cutSec by more than noise) → neutral, not red —
// regressions get their own treatment per-context.

export const PCT_COLOR_GREEN_MAX = 2.0
export const PCT_COLOR_YELLOW_MAX = 3.5

/**
 * Given a percent-off-cut value, return 'green' | 'yellow' | 'red' | null.
 * Null = gap is 0 or negative (already hit the cut).
 */
export function pctColor(pctOff) {
  if (pctOff == null) return null
  if (pctOff <= 0) return null
  if (pctOff < PCT_COLOR_GREEN_MAX) return 'green'
  if (pctOff < PCT_COLOR_YELLOW_MAX) return 'yellow'
  return 'red'
}

/**
 * Given the athlete's best time and a target cut time (both seconds),
 * return { achieved, deltaSec, pctOff, color }.
 *
 *   achieved = true iff best <= cut
 *   deltaSec = seconds still to drop (positive). Null if already hit.
 *   pctOff   = percent above the cut (positive). Null if already hit.
 *   color    = pctColor classification.
 */
export function gapToCut(bestSec, cutSec) {
  if (bestSec == null || cutSec == null) {
    return { achieved: false, deltaSec: null, pctOff: null, color: null }
  }
  if (bestSec <= cutSec) {
    return { achieved: true, deltaSec: 0, pctOff: 0, color: null }
  }
  const deltaSec = +(bestSec - cutSec).toFixed(2)
  const pctOff = +((deltaSec / cutSec) * 100).toFixed(1)
  return { achieved: false, deltaSec, pctOff, color: pctColor(pctOff) }
}

// ------------------------------------------------------------
// STROKE FAMILY GROUPING — for table layout
// ------------------------------------------------------------

export const STROKE_FAMILIES = [
  { label: "Freestyle",        stroke: "Free",   distances: [50, 100, 200, 500, 1000, 1650] },
  { label: "Butterfly",        stroke: "Fly",    distances: [50, 100, 200] },
  { label: "Backstroke",       stroke: "Back",   distances: [50, 100, 200] },
  { label: "Breaststroke",     stroke: "Breast", distances: [50, 100, 200] },
  { label: "Individual Medley", stroke: "IM",    distances: [100, 200, 400] },
]

// ------------------------------------------------------------
// DOB / AGE — auto age-up when the birthday passes
// ------------------------------------------------------------

const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]

/**
 * Parse a DOB string into a {month, day, year?} shape.
 *
 * Accepts:
 *   "June 4"           → { month: 5, day: 4, year: null }
 *   "June 4, 2013"     → { month: 5, day: 4, year: 2013 }
 *   "2013-06-04"       → { month: 5, day: 4, year: 2013 }
 *   "06/04/2013"       → { month: 5, day: 4, year: 2013 }
 *   "March"            → { month: 2, day: 1, year: null }  (day defaults to 1)
 *
 * Returns null if unparseable. Month is 0-indexed to match JS Date.
 */
export function parseDob(dobString) {
  if (!dobString) return null
  const s = String(dobString).trim()
  if (!s) return null

  // ISO: 2013-06-04
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (iso) {
    return { month: parseInt(iso[2], 10) - 1, day: parseInt(iso[3], 10), year: parseInt(iso[1], 10) }
  }

  // Slash: 06/04/2013 or 6/4/13
  const slash = s.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/)
  if (slash) {
    let year = slash[3] ? parseInt(slash[3], 10) : null
    if (year != null && year < 100) year += year < 30 ? 2000 : 1900
    return { month: parseInt(slash[1], 10) - 1, day: parseInt(slash[2], 10), year }
  }

  // "June 4" or "June 4, 2013" or just "March"
  const named = s.match(/^([A-Za-z]+)\s*(\d{1,2})?(?:,?\s*(\d{4}))?$/)
  if (named) {
    const monthIdx = MONTH_NAMES.indexOf(named[1].toLowerCase())
    if (monthIdx === -1) return null
    return {
      month: monthIdx,
      day: named[2] ? parseInt(named[2], 10) : 1,
      year: named[3] ? parseInt(named[3], 10) : null,
    }
  }

  return null
}

/**
 * Compute the athlete's current age given their DOB.
 *
 * If DOB includes a year → exact calculation using today's date.
 * If DOB has no year → uses the provided `fallbackAge` as a floor and bumps
 *   it up by 1 if today is on or after the birthday in the current year AND
 *   the fallbackAge is stale (hasn't been updated past the birthday).
 *
 * This means: Chase enters "age: 12" + "dob: April 24" once. Tomorrow
 * (April 24) Jon turns 13 and the display flips automatically. When Chase
 * eventually edits the record, the year will be filled in and this becomes
 * exact going forward.
 */
export function ageFromDob({ dob, fallbackAge, today = new Date() }) {
  const parsed = parseDob(dob)
  if (!parsed) return fallbackAge ?? null

  // Exact path: we have a birth year.
  if (parsed.year != null) {
    let age = today.getFullYear() - parsed.year
    const before = today.getMonth() < parsed.month
      || (today.getMonth() === parsed.month && today.getDate() < parsed.day)
    if (before) age -= 1
    return age
  }

  // Year-unknown path: start from fallbackAge, bump if today >= birthday this year.
  if (fallbackAge == null) return null
  const birthdayThisYear = new Date(today.getFullYear(), parsed.month, parsed.day)
  // If the birthday this year has already passed (or is today), the fallback age
  // is stale the moment we cross into a new birth year. But without a birth year
  // we can't know for sure; best effort: if fallbackAge was entered BEFORE the
  // birthday and the birthday has now passed, bump by 1. We can't detect "when
  // was this entered" so we default to NOT bumping — relying on admin to update.
  // The one safe case is when the birthday is TODAY: celebrate.
  const isToday = today.getMonth() === parsed.month && today.getDate() === parsed.day
  return isToday ? fallbackAge + 1 : fallbackAge
}

/**
 * USA Swimming age bucket for time standards.
 * 8-under / 9-10 / 11-12 / 13-14 / 15-16 / 17-18 / open
 */
export function ageBucket(age) {
  if (age == null) return null
  if (age <= 8) return '8-under'
  if (age <= 10) return '9-10'
  if (age <= 12) return '11-12'
  if (age <= 14) return '13-14'
  if (age <= 16) return '15-16'
  if (age <= 18) return '17-18'
  return 'open'
}

/**
 * Number of days between today and the athlete's next birthday.
 * Handy for UI like "Turns 13 in 23 days".
 */
export function daysUntilBirthday({ dob, today = new Date() }) {
  const parsed = parseDob(dob)
  if (!parsed) return null
  let birthday = new Date(today.getFullYear(), parsed.month, parsed.day)
  if (birthday < today) {
    birthday = new Date(today.getFullYear() + 1, parsed.month, parsed.day)
  }
  const diffMs = birthday - today
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

