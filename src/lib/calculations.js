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
 * Returns { level, cutoff, gap } or null if already at AAAA.
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
  return {
    level: nextLevel,
    cutoff,
    gap: +(timeSec - cutoff).toFixed(2),   // seconds to drop
    pct: +(cutoff / timeSec * 100).toFixed(1), // how close % (cutoff is smaller)
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
  if (age <= 8) return "8U"
  if (age <= 10) return "9-10"
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
  return {
    event,
    bestSec,
    goalSec,
    currentLevel,
    nextLevel: next ? next.level : null,
    deltaToNext: next ? next.gap : null,
    deltaToGoal: bestSec != null && goalSec != null ? +(bestSec - goalSec).toFixed(2) : null,
  }
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
