import { useState, useMemo, useEffect } from 'react'
import { ELITE_SPLITS, RACE_INSIGHTS, DANGER_SPLITS } from '../data/elite-splits.js'
import { getTier } from '../lib/tiers.js'
import { updateAthlete } from '../lib/db.js'

// ============================================================
// RacePaceCalculator
//
// Full visual port of the legacy public/pace.html standalone
// page into a React component. Same atmospheric background,
// same hero, same selectors, same chart bars + animations,
// same insight/IM notice — minus the standalone page chrome
// (topbar, footer, tabbar) which is provided by the parent
// view (RacePaceTool in FamilyAnalysis.jsx).
//
// Design tokens, CSS classes, and the markup structure are
// scoped under .pace-tool (defined in apple-dark.css) so the
// styles don't collide with the rest of the v2 design system.
//
// The lock logic (non-Gold throttle, 5 runs per 5 days) lives
// here too — see DEMO_LOCK_MS and DEMO_RUNS_ALLOWED below.
// ============================================================

const COURSE_FULL = { scy: 'Short Course Yards', lcm: 'Long Course Meters', scm: 'Short Course Meters' }
const DEMO_LOCK_MS = 5 * 24 * 60 * 60 * 1000
const DEMO_RUNS_ALLOWED = 5

// Returns "N days" / "N hours" / "less than an hour" from a millisecond
// count. Rounds up — see Session 14 conversation: rounding up reads as
// generous and never sets up "I thought it'd unlock today" disappointment.
function formatLockRemaining(ms) {
  if (ms <= 0) return null
  const oneHour = 60 * 60 * 1000
  if (ms < oneHour) return 'less than an hour'
  const oneDay = 24 * oneHour
  if (ms < oneDay) {
    const hours = Math.ceil(ms / oneHour)
    return `${hours} hour${hours === 1 ? '' : 's'}`
  }
  const days = Math.ceil(ms / oneDay)
  return `${days} day${days === 1 ? '' : 's'}`
}

function fmtTime(s) {
  if (s >= 60) { const m = Math.floor(s / 60), sc = (s % 60).toFixed(2).padStart(5, '0'); return `${m}:${sc}` }
  return s.toFixed(2)
}

function fmtPace(s) {
  if (s >= 60) { const m = Math.floor(s / 60), sc = (s % 60).toFixed(1).padStart(4, '0'); return `${m}:${sc}` }
  return s.toFixed(1)
}

// Bar color matches the legacy pace.html palette: cyan first bar,
// green last bar, smooth blend through the middle.
function barColor(idx, total) {
  if (idx === 0) return 'rgba(0, 186, 230, 0.85)'
  if (idx === total - 1) return 'rgba(0, 230, 138, 0.75)'
  const ratio = idx / Math.max(1, total - 1)
  const r = Math.round(180 + ratio * 75)
  const g = Math.round(210 - ratio * 50)
  const b = Math.round(240 - ratio * 120)
  return `rgba(${r}, ${g}, ${b}, 0.7)`
}

// Map ELITE_SPLITS keys (_25s, _50s, etc) to display labels and unit text.
const UNIT_FROM_KEY = { _25s: '25', _50s: '50', _100s: '100', _200s: '200', _500s: '500' }

export default function RacePaceCalculator({ athlete = null }) {
  const [course, setCourse] = useState('scy')
  const [gender, setGender] = useState('men')
  const [event, setEvent] = useState('')
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  const [result, setResult] = useState(null)
  // In-session run timestamps not yet persisted — combined with the
  // athlete record's racePaceDemoRuns to drive the lock state.
  const [localRuns, setLocalRuns] = useState([])

  // ---- Tier + lock state ----
  const isGold = !athlete || getTier(athlete) === 'gold'
  const now = Date.now()
  const persistedRuns = Array.isArray(athlete?.racePaceDemoRuns)
    ? athlete.racePaceDemoRuns.map(ts => new Date(ts).getTime()).filter(t => !isNaN(t))
    : []
  const allRuns = [...new Set([...persistedRuns, ...localRuns])].sort((a, b) => a - b)
  const activeRuns = allRuns.filter(t => now - t < DEMO_LOCK_MS)
  const isLocked = !isGold && activeRuns.length >= DEMO_RUNS_ALLOWED
  const msRemaining = isLocked ? (activeRuns[0] + DEMO_LOCK_MS) - now : 0
  const runsLeftInWindow = isGold ? Infinity : Math.max(0, DEMO_RUNS_ALLOWED - activeRuns.length)

  // Hydrate the rendered result from the saved demo result while locked,
  // so non-Gold users see the plan they generated last time even after
  // navigating away and coming back.
  useEffect(() => {
    if (isLocked && athlete?.lastRacePaceDemoResult && !result) {
      setResult(athlete.lastRacePaceDemoResult)
    }
  }, [isLocked, athlete, result])

  const events = useMemo(() => Object.keys(ELITE_SPLITS[course]?.[gender] || {}), [course, gender])

  const goalSeconds = useMemo(() => {
    const m = minutes ? parseFloat(minutes) : 0
    const s = seconds ? parseFloat(seconds) : 0
    if (isNaN(m) || isNaN(s)) return null
    const total = m * 60 + s
    return total > 0 ? total : null
  }, [minutes, seconds])

  const isReady = !isLocked && event && goalSeconds && goalSeconds > 0

  const generate = async () => {
    if (!isReady) return
    const pcts = ELITE_SPLITS[course]?.[gender]?.[event]
    if (!pcts) return
    const newResult = { event, course, gender, totalSec: goalSeconds, pcts }
    setResult(newResult)

    // Non-Gold: append run timestamp + persist.
    if (!isGold && athlete?.id) {
      const runAt = Date.now()
      const newLocalRuns = [...localRuns, runAt]
      setLocalRuns(newLocalRuns)
      const newPersistedRuns = [...activeRuns, runAt].map(t => new Date(t).toISOString())
      try {
        await updateAthlete(athlete.id, {
          ...athlete,
          racePaceDemoRuns: newPersistedRuns,
          lastRacePaceDemoResult: newResult,
        })
      } catch (err) {
        console.warn('[RacePaceCalculator] failed to persist demo runs:', err)
      }
    }
  }

  const handleCourseChange = (c) => {
    setCourse(c)
    setEvent('')
    if (!isLocked) setResult(null)
  }
  const handleGenderChange = (g) => {
    setGender(g)
    setEvent('')
    if (!isLocked) setResult(null)
  }
  const handleEventChange = (e) => {
    setEvent(e)
    if (!isLocked) setResult(null)
  }

  return (
    <div className="pace-tool">
      {/* ─── Hero ─── */}
      <div className="pt-hero">
        <div className="pt-hero-pill-row">
          <div className="pt-pill">
            <span className="pt-pill-dot" />
            <span className="pt-pill-label">Race Pace Calculator</span>
          </div>
          <span className="pt-gold-badge">Gold Development</span>
        </div>
        <h1>Optimize your race using the pacing of the world's best swimmers.</h1>
        <p className="pt-sub">
          Enter your goal time and the tool returns the optimal way to pace your race.
          The pacing pattern is modeled from the fastest swims in history for your event,
          broken down split-by-split, averaged together, and scaled to the time you're chasing.
        </p>
        <div className="pt-im-banner">IM race pace is in development.</div>
      </div>

      {/* ─── Course ─── */}
      <div className="pt-selector-group">
        <div className="pt-section-label">Course</div>
        <div className="pt-selector-row">
          {['scy', 'lcm', 'scm'].map(c => (
            <button
              key={c}
              type="button"
              className={`pt-selector-btn ${course === c ? 'active' : ''}`}
              onClick={() => handleCourseChange(c)}
            >{c.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* ─── Gender ─── */}
      <div className="pt-selector-group">
        <div className="pt-section-label">Gender</div>
        <div className="pt-selector-row">
          {['men', 'women'].map(g => (
            <button
              key={g}
              type="button"
              className={`pt-selector-btn ${gender === g ? 'active' : ''}`}
              onClick={() => handleGenderChange(g)}
            >{g === 'men' ? 'Men' : 'Women'}</button>
          ))}
        </div>
      </div>

      {/* ─── Event ─── */}
      <div className="pt-selector-group">
        <div className="pt-section-label">Event</div>
        <div className="pt-event-grid">
          {events.map(e => (
            <button
              key={e}
              type="button"
              className={`pt-event-btn ${event === e ? 'active' : ''}`}
              onClick={() => handleEventChange(e)}
            >{e}</button>
          ))}
        </div>
      </div>

      {/* ─── Goal time + Generate ─── */}
      <div className="pt-selector-group">
        <div className="pt-section-label">Goal Time</div>
        <div className="pt-time-row">
          <div className="pt-time-input-wrap">
            <input
              type="text"
              className="pt-time-input pt-min"
              placeholder="M"
              maxLength={2}
              value={minutes}
              onChange={e => setMinutes(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => { if (e.key === 'Enter') generate() }}
            />
            <span className="pt-time-colon">:</span>
            <input
              type="text"
              className="pt-time-input pt-sec"
              placeholder="SS.00"
              maxLength={5}
              value={seconds}
              onChange={e => setSeconds(e.target.value.replace(/[^\d.]/g, ''))}
              onKeyDown={e => { if (e.key === 'Enter') generate() }}
            />
          </div>
          <button
            type="button"
            className={`pt-generate-btn ${isReady ? 'ready' : ''}`}
            onClick={generate}
            disabled={!isReady}
          >Generate</button>
        </div>
      </div>

      {/* ─── Demo throttle notices ─── */}
      {isLocked && (
        <div className="pt-demo-lock">
          <div className="pt-demo-lock-title">Demo limit reached</div>
          <div className="pt-demo-lock-body">
            Try again in {formatLockRemaining(msRemaining)}. Race Pace is part of Gold Development.
          </div>
        </div>
      )}
      {!isGold && !isLocked && activeRuns.length > 0 && (
        <div className="pt-demo-hint">
          {runsLeftInWindow === 1
            ? '1 demo generation left in this 5-day window.'
            : `${runsLeftInWindow} demo generations left in this 5-day window.`}
        </div>
      )}

      {/* ─── Results ─── */}
      {result && <Results result={result} />}
    </div>
  )
}

// ============================================================
// Results — split tables, animated bar charts, indicators,
// practice pace cards, insight, IM notice. Mirrors the markup
// structure that pace.html builds via innerHTML.
// ============================================================
function Results({ result }) {
  const { event, course, gender, totalSec, pcts } = result

  // For each split-level key in pcts, render a section-marker + table + chart.
  const splitGroups = []
  for (const [key, arr] of Object.entries(pcts)) {
    const unit = UNIT_FROM_KEY[key] || key.replace(/[_s]/g, '')
    const label = key.replace('_', '').replace('s', '')
    const splits = arr.map((p, i) => ({ pct: p, time: totalSec * p / 100, idx: i }))
    const minP = Math.min(...arr)
    const maxP = Math.max(...arr)
    const avg = totalSec / splits.length
    splitGroups.push({ key, unit, label, splits, minP, maxP, avg })
  }

  const insight = RACE_INSIGHTS[event]
  const danger = DANGER_SPLITS[event]

  // Practice pace math (pace clocks). Distance derived from event name.
  const dist = parseInt(event)
  let p50 = null, p100 = null
  if (dist >= 100) {
    if (event.includes('1650')) { p50 = totalSec / 33; p100 = totalSec / 16.5 }
    else if (event.includes('1500')) { p50 = totalSec / 30; p100 = totalSec / 15 }
    else if (event.includes('800')) { p50 = totalSec / 16; p100 = totalSec / 8 }
    else { p50 = totalSec / (dist / 50); p100 = totalSec / (dist / 100) }
  }

  return (
    <div className="pt-results">
      {/* Header card — event name, course/gender, big goal time */}
      <div className="pt-results-header">
        <div>
          <div className="pt-results-event">{event}</div>
          <div className="pt-results-meta">
            {COURSE_FULL[course]} · {gender === 'men' ? 'Men' : 'Women'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="pt-results-goal">{fmtTime(totalSec)}</div>
          <div className="pt-results-goal-label">GOAL TIME</div>
        </div>
      </div>

      {/* Split groups */}
      {splitGroups.map(group => (
        <SplitGroup key={group.key} group={group} />
      ))}

      {/* Critical split indicator (if event has one) */}
      {danger && (
        <div className="pt-indicator pt-indicator-danger">
          <div className="pt-indicator-circle">!</div>
          <div>
            <div className="pt-indicator-title">Critical Split</div>
            <div className="pt-indicator-desc">
              Split #{danger} is where the race separates. Biggest deceleration point —
              hold here and the back half takes care of itself.
            </div>
          </div>
        </div>
      )}

      {/* Practice pace clocks */}
      {(p50 || p100) && (
        <>
          <div className="pt-section-marker">
            <div className="pt-section-marker-bar" style={{ background: 'linear-gradient(180deg,#a78bfa,#818cf8)' }} />
            <span className="pt-section-marker-text">Practice Pace</span>
          </div>
          <div className="pt-pace-row">
            {p50 && (
              <div className="pt-pace-card pt-pace-animate">
                <div className="pt-pace-clock">
                  <div className="pt-pace-clock-track" />
                  <div className="pt-pace-clock-hand" />
                  <div className="pt-pace-clock-dot" />
                  <span className="pt-pace-clock-value">{fmtPace(p50)}</span>
                </div>
                <div className="pt-pace-label">Avg /50</div>
              </div>
            )}
            {p100 && (
              <div className="pt-pace-card pt-pace-animate">
                <div className="pt-pace-clock">
                  <div className="pt-pace-clock-track" />
                  <div className="pt-pace-clock-hand" />
                  <div className="pt-pace-clock-dot" />
                  <span className="pt-pace-clock-value">{fmtPace(p100)}</span>
                </div>
                <div className="pt-pace-label">Avg /100</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Race intelligence insight */}
      {insight && (
        <div className="pt-insight">
          <div className="pt-insight-label">Race Intelligence</div>
          <div className="pt-insight-text">{insight}</div>
        </div>
      )}

      {/* IM notice */}
      <div className="pt-im-notice">
        Individual Medley events are currently in development and will be available in a future update.
      </div>
    </div>
  )
}

// ============================================================
// SplitGroup — section marker + split table + bar chart +
// go-out indicator for one ELITE_SPLITS level. Bars expand
// from 0px to target height with a 2.2s transition; the
// useEffect kicks in 50ms after mount to trigger the
// animation, mirroring the IntersectionObserver pattern in
// pace.html.
// ============================================================
function SplitGroup({ group }) {
  const { unit, label, splits, minP, maxP, avg } = group
  const range = maxP - minP
  const safeRange = range < 0.01 ? 1 : range
  const minH = 25
  const span = 105
  const avgPct = 100 / splits.length
  const avgH = range < 0.01 ? minH + span / 2 : minH + ((avgPct - minP) / safeRange) * span
  const twoRows = splits.length > 10
  const halfIdx = twoRows ? Math.ceil(splits.length / 2) : splits.length

  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setAnimated(true), 50)
    return () => clearTimeout(id)
  }, [])

  const computeH = (pct) =>
    range < 0.01 ? minH + span / 2 : minH + ((pct - minP) / safeRange) * span

  const renderBarRow = (slice, startIdx, isFirstRow) => (
    <div className="pt-chart-bars" style={{ position: 'relative' }}>
      <div className="pt-chart-avg-line" style={{ bottom: `${avgH}px` }}>
        {isFirstRow && <span className="pt-chart-avg-tag">AVG</span>}
      </div>
      {slice.map((s, i) => {
        const realIdx = startIdx + i
        const targetH = computeH(s.pct)
        const c = barColor(realIdx, splits.length)
        const shadow = c.replace(/[\d.]+\)$/, '0.2)')
        const fontSize = twoRows ? 8 : 10
        const labelSize = twoRows ? 7 : 8
        return (
          <div key={realIdx} className="pt-chart-bar-col">
            <span className="pt-chart-bar-time" style={{ fontSize: `${fontSize}px` }}>{fmtTime(s.time)}</span>
            <div
              className="pt-chart-bar"
              style={{
                height: animated ? `${targetH}px` : '0px',
                background: c,
                boxShadow: `0 0 14px ${shadow}`,
                transitionDelay: `${realIdx * 130}ms`,
              }}
            />
            <span className="pt-chart-bar-label" style={{ fontSize: `${labelSize}px` }}>
              {label}#{realIdx + 1}
            </span>
          </div>
        )
      })}
    </div>
  )

  const goOutDelta = splits.length >= 2 ? (avg - splits[0].time).toFixed(1) : null

  return (
    <>
      {/* Section marker */}
      <div className="pt-section-marker">
        <div className="pt-section-marker-bar" style={{ background: 'linear-gradient(180deg,#00e68a,#00bae6)' }} />
        <span className="pt-section-marker-text">Target Splits — per {unit}</span>
      </div>

      {/* Split table */}
      <div className="pt-split-table">
        {splits.map((s, i) => (
          <div key={i} className={`pt-split-row${i === 0 ? ' first' : ''}`}>
            <span className="pt-split-label">{label}#{i + 1}</span>
            <span className="pt-split-time">{fmtTime(s.time)}</span>
            <span className="pt-split-pct">{s.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="pt-chart">
        {renderBarRow(splits.slice(0, halfIdx), 0, true)}
        {twoRows && (
          <div style={{ marginTop: 20 }}>
            {renderBarRow(splits.slice(halfIdx), halfIdx, false)}
          </div>
        )}
        <div className="pt-chart-avg">
          <span className="pt-chart-avg-text">AVG {fmtTime(avg)}/{unit}</span>
        </div>
      </div>

      {/* Go-out speed indicator */}
      {goOutDelta && (
        <div className="pt-indicator pt-indicator-goout">
          <div className="pt-indicator-circle">{goOutDelta}</div>
          <div>
            <div className="pt-indicator-title">Go-Out Speed</div>
            <div className="pt-indicator-desc">
              First {unit} is {goOutDelta}s faster than your average {unit.toLowerCase()} pace
            </div>
          </div>
        </div>
      )}
    </>
  )
}
