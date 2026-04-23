// ============================================================
// FamilyProfile.jsx
// ============================================================
// The family-facing athlete profile page — Apple Dark design.
// Reads athlete data via props and renders every section with
// graceful empty states where data is missing.
//
// Sections rendered:
//  • Hero (name, age, primary events)
//  • Next Cut tracker
//  • Times & Goals table (SCY/LCM toggle)
//  • Age-up preview
//  • Event Power Rankings
//  • Specialty radar (simple static version for now)
//  • Training data (empty state for now)
//  • Meet Analyzer card
//  • Upcoming meets
//  • Scheduling
//  • Resources link
// ============================================================

import { useState, useMemo } from 'react'
import FamilyNav from './FamilyNav.jsx'
import FamilyFooter from './FamilyFooter.jsx'
import {
  parseTime,
  formatTime,
  formatDelta,
  pickNextCut,
  eventPowerRankings,
  timesTableRow,
  eventStandards,
  classifyTime,
  ageUpProjection,
  STROKE_FAMILIES,
  parseEventName,
} from '../lib/calculations.js'

export default function FamilyProfile({ athlete, onBack, onNavigate }) {
  const [course, setCourse] = useState('SCY')

  if (!athlete) {
    return (
      <div className="v2">
        <FamilyNav onNavigate={onNavigate} />
        <main className="v2-main">
          <div className="empty-state">No athlete selected.</div>
        </main>
        <FamilyFooter />
      </div>
    )
  }

  // Initials for nav avatar
  const initials = useMemo(() => {
    const f = (athlete.first || '').charAt(0).toUpperCase()
    const l = (athlete.last || '').charAt(0).toUpperCase()
    return f + l || '??'
  }, [athlete.first, athlete.last])

  // Primary events for hero pills — use first 2 as "primary"
  const primaryEvents = (athlete.events || []).slice(0, 2)
  const otherEvents = (athlete.events || []).slice(2)

  // Gender: athlete may not have this directly; infer from pronouns
  const gender = athlete.gender
    || (athlete.pronouns === 'she' ? 'F' : athlete.pronouns === 'he' ? 'M' : 'M')

  // Next cut across all events
  const nextCut = useMemo(() => pickNextCut({
    age: athlete.age,
    gender,
    course,
    meetTimes: athlete.meetTimes || [],
  }), [athlete.age, gender, course, athlete.meetTimes])

  // Event power rankings
  const rankings = useMemo(() => eventPowerRankings({
    age: athlete.age,
    gender,
    course,
    meetTimes: athlete.meetTimes || [],
  }), [athlete.age, gender, course, athlete.meetTimes])

  // Goal times: athlete.goalTimes is a map { "50 Free SCY": "25.49", ... }
  const goalTimes = athlete.goalTimes || {}

  // Meet-times lookup: { "50 Free SCY": "26.22", ... }
  const bestTimes = useMemo(() => {
    const out = {}
    for (const mt of (athlete.meetTimes || [])) {
      out[mt.event] = mt.time
    }
    return out
  }, [athlete.meetTimes])

  return (
    <div className="v2">
      <FamilyNav active="Profile" athleteInitials={initials} onNavigate={onNavigate} />

      <main className="v2-main">
        {onBack && (
          <button className="back" onClick={onBack}>← Back</button>
        )}

        {/* ============ HERO ============ */}
        <section className="hero">
          <div className="name">
            {athlete.first}{athlete.last ? ' ' + athlete.last : ''}
          </div>
          <div className="meta">
            <span className="age">{athlete.age} years old</span>
            {athlete.dob && <>
              <span className="dot" />
              <span className="age">Born {athlete.dob}</span>
            </>}
          </div>
          <div className="events">
            {primaryEvents.map(ev => (
              <span key={ev} className="event-pill primary">{ev}</span>
            ))}
            {otherEvents.map(ev => (
              <span key={ev} className="event-pill">{ev}</span>
            ))}
            {!athlete.events?.length && (
              <span className="event-pill" style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>
                Primary events not set
              </span>
            )}
          </div>
        </section>

        {/* ============ NEXT CUT ============ */}
        <NextCutCard nextCut={nextCut} />

        {/* ============ TIMES & GOALS ============ */}
        <section>
          <h2 className="section-title">Times & Goals</h2>
          <div className="pill-toggle">
            <button className={course === 'SCY' ? 'active' : ''} onClick={() => setCourse('SCY')}>SCY</button>
            <button className={course === 'LCM' ? 'active' : ''} onClick={() => setCourse('LCM')}>LCM</button>
          </div>
          <TimesTable
            age={athlete.age}
            gender={gender}
            course={course}
            bestTimes={bestTimes}
            goalTimes={goalTimes}
          />
          <AgeUpPreview
            age={athlete.age}
            gender={gender}
            course={course}
            primaryEvents={athlete.events || []}
            bestTimes={bestTimes}
          />
        </section>

        {/* ============ PROGRESSION (placeholder) ============ */}
        <section>
          <h2 className="section-title">Progression</h2>
          <div className="empty-state">
            Progression chart needs meet-history data (event, time, date).
            Once meet history is entered, this chart will populate automatically per event.
          </div>
        </section>

        {/* ============ EVENT POWER RANKINGS ============ */}
        <section>
          <h2 className="section-title">Event Power Rankings</h2>
          <PowerRankingsList rankings={rankings} />
        </section>

        {/* ============ SPECIALTY RADAR (placeholder shape) ============ */}
        <section>
          <h2 className="section-title">Specialty</h2>
          <SpecialtyRadar rankings={rankings} athlete={athlete} />
        </section>

        {/* ============ TRAINING (placeholder) ============ */}
        <section>
          <h2 className="section-title">Training</h2>
          <div className="empty-state">
            Training metrics (zone distribution by distance, session categories)
            will pull from saved session notes once the feed is wired up to this view.
          </div>
        </section>

        {/* ============ MEET ANALYZER CARD ============ */}
        <section>
          <h2 className="section-title">Last Race</h2>
          <div className="analyzer-card">
            <div>
              <div className="az-label">Meet Analyzer</div>
              <div className="az-title">Input your splits to compare against an elite template</div>
              <div className="az-insight">
                Once a race is entered, this card shows the largest time gap to close
                and what adjustments would unlock the next standard.
              </div>
            </div>
            <button className="az-cta" onClick={() => onNavigate && onNavigate('analysis')}>
              Open Analyzer →
            </button>
          </div>
        </section>

        {/* ============ UPCOMING MEETS ============ */}
        <section>
          <h2 className="section-title">Upcoming Meets</h2>
          {athlete.upcomingMeets?.length ? (
            <UpcomingMeetsList meets={athlete.upcomingMeets} />
          ) : (
            <div className="empty-state">
              No meets scheduled yet. Coach will add meets here as they're confirmed.
            </div>
          )}
        </section>

        {/* ============ SCHEDULING ============ */}
        <section>
          <h2 className="section-title">Scheduling</h2>
          <div className="sched-card">
            <div className="sc-title">Request session slots</div>
            <div className="sc-sub">
              Pick first and second choice for the coming month. Chase confirms within 48 hours.
            </div>
            <button className="sched-cta">Request Slots →</button>
          </div>
        </section>

        {/* ============ RESOURCES ============ */}
        <section>
          <h2 className="section-title">Resources</h2>
          <div className="resources-link" onClick={() => onNavigate && onNavigate('resources')}>
            <div>
              <div className="rl-title">For Families</div>
              <div className="rl-sub">Zones, training philosophy, meet-day checklist, glossary, FAQ</div>
            </div>
            <div className="chev">›</div>
          </div>
        </section>
      </main>

      <FamilyFooter />
    </div>
  )
}

// ============================================================
// Sub-components
// ============================================================

function NextCutCard({ nextCut }) {
  if (!nextCut) {
    return (
      <section>
        <div className="next-cut empty">
          <div>
            <div className="label">Chasing Next</div>
            <div className="chase">No times on file yet — enter meet times to see cuts.</div>
          </div>
        </div>
      </section>
    )
  }
  const pctFill = Math.round(nextCut.next.pct)
  return (
    <section>
      <div className="next-cut">
        <div>
          <div className="label">Chasing Next</div>
          <div className="chase">
            {nextCut.event} — <span className="accent">{nextCut.next.level}</span>
          </div>
          <div className="sub">
            Current {formatTime(nextCut.timeSec)} ·
            Cut {formatTime(nextCut.next.cutoff)} ·
            {' '}{pctFill}% of the way there
          </div>
          <div className="bar-wrap">
            <div className="bar-fill" style={{ width: `${pctFill}%` }} />
          </div>
        </div>
        <div className="numeric">
          <div className="gap">
            −{nextCut.next.gap.toFixed(2)}<span style={{ fontSize: '26px' }}>s</span>
          </div>
          <div className="gap-label">Seconds to Cut</div>
        </div>
      </div>
    </section>
  )
}

function TimesTable({ age, gender, course, bestTimes, goalTimes }) {
  return (
    <div className="times-table">
      <div className="times-row header">
        <div>Event</div>
        <div>Best</div>
        <div>Goal</div>
        <div>Current</div>
        <div>Next</div>
        <div>Δ to Next</div>
        <div>Δ to Goal</div>
      </div>

      {STROKE_FAMILIES.map(fam => (
        <div key={fam.label}>
          <div className="stroke-family-label">{fam.label}</div>
          {fam.distances.map(dist => {
            const baseEvent = `${dist} ${fam.stroke}`
            const eventKey = `${baseEvent} ${course}`
            const best = bestTimes[eventKey]
            const goal = goalTimes[eventKey]
            const row = timesTableRow({
              age, gender, course, event: baseEvent,
              bestTime: best, goalTime: goal,
            })
            return (
              <div className="times-row" key={eventKey}>
                <div className="event">{dist}</div>
                <div className="time mono">{best ? formatTime(row.bestSec) : '—'}</div>
                <div className={`goal mono ${!goal ? 'empty' : ''}`}>
                  {goal ? formatTime(row.goalSec) : '—'}
                </div>
                <div>
                  {row.currentLevel
                    ? <span className={`std ${row.currentLevel}`}>{row.currentLevel}</span>
                    : <span className="std none">—</span>}
                </div>
                <div>
                  {row.nextLevel
                    ? <span className={`std ${row.nextLevel}`}>{row.nextLevel}</span>
                    : <span className="std none">—</span>}
                </div>
                <div className={`delta mono ${row.deltaToNext != null && row.deltaToNext < 1 ? 'close' : ''}`}>
                  {row.deltaToNext != null ? formatDelta(-row.deltaToNext) : '—'}
                </div>
                <div className="delta mono">
                  {row.deltaToGoal != null ? formatDelta(-row.deltaToGoal) : '—'}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function AgeUpPreview({ age, gender, course, primaryEvents, bestTimes }) {
  // Pick up to 4 primary events that we can project
  const events = primaryEvents.slice(0, 4)
  if (!events.length) return null

  const nextAgeBucket = age <= 8 ? '9-10'
    : age <= 10 ? '11-12'
    : age <= 12 ? '13-14'
    : age <= 14 ? '15-16'
    : age <= 16 ? '17-18'
    : null
  if (!nextAgeBucket) return null

  return (
    <div className="age-up">
      <div className="caption">Age-Up Preview</div>
      <div className="title">
        Current times in the next age group
        <span className="age-pill">{nextAgeBucket}</span>
      </div>
      <div className="age-up-grid">
        {events.map(ev => {
          const eventKey = `${ev} ${course}`
          const t = bestTimes[eventKey]
          const timeSec = parseTime(t)
          const currentStds = eventStandards({ age, gender, course, event: ev })
          const currentLevel = timeSec != null && currentStds ? classifyTime(timeSec, currentStds) : null
          const proj = ageUpProjection({ currentAge: age, gender, course, event: ev, timeSec })
          const projLevel = proj ? proj.projectedLevel : null
          return (
            <div className="age-up-item" key={ev}>
              <div className="ev">{ev}</div>
              <div className="time-line">
                <span className="t mono">{timeSec != null ? formatTime(timeSec) : '—'}</span>
              </div>
              <div className="std-display">
                <span className={`std ${currentLevel || 'none'}`}>{currentLevel || '—'}</span>
                <span className="arrow">→</span>
                <span className={`std ${projLevel || 'none'}`}>{projLevel || '—'}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PowerRankingsList({ rankings }) {
  if (!rankings.length) {
    return <div className="empty-state">No meet times on file yet.</div>
  }
  return (
    <div className="rankings-list">
      <div className="ranking-row header">
        <div>#</div>
        <div>Event</div>
        <div />
        <div style={{ textAlign: 'right' }}>%</div>
        <div style={{ textAlign: 'right' }}>Gap to Next</div>
        <div style={{ textAlign: 'right' }}>Std</div>
      </div>
      {rankings.map((r, i) => (
        <div className="ranking-row" key={r.event}>
          <div className="rank-num mono">{String(i + 1).padStart(2, '0')}</div>
          <div className="rank-event">{r.event}</div>
          <div className="rank-bar">
            <div className="rank-bar-fill" style={{ width: `${r.pct}%` }} />
          </div>
          <div className="rank-pct">{r.pct}%</div>
          <div className="rank-gap">
            {r.gapToNext != null
              ? <>−{r.gapToNext.toFixed(2)}<span className="gap-label">s</span></>
              : '—'}
          </div>
          <div className="rank-std">
            {r.currentLevel
              ? <span className={`std ${r.currentLevel}`}>{r.currentLevel}</span>
              : <span className="std none">—</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

function SpecialtyRadar({ rankings, athlete }) {
  // Compute a "specialty value" per stroke family from this athlete's rankings.
  // 0 = no data, 100 = all events at top standard.
  const strokeAvg = (strokeKey) => {
    const matching = rankings.filter(r => {
      const parsed = parseEventName(r.event)
      return parsed && parsed.stroke === strokeKey
    })
    if (!matching.length) return 0
    const total = matching.reduce((a, r) => a + r.pct, 0)
    return total / matching.length
  }
  const distanceAvg = () => {
    const longEvents = rankings.filter(r => {
      const p = parseEventName(r.event)
      return p && p.distance >= 400
    })
    if (!longEvents.length) return 0
    return longEvents.reduce((a, r) => a + r.pct, 0) / longEvents.length
  }

  const values = {
    Free:   strokeAvg('Free'),
    Back:   strokeAvg('Back'),
    Breast: strokeAvg('Breast'),
    Fly:    strokeAvg('Fly'),
    IM:     strokeAvg('IM'),
    Distance: distanceAvg(),
  }

  // Describe the shape briefly
  const entries = Object.entries(values).filter(([,v]) => v > 0)
  let title = "Not enough data yet"
  let sub = "Enter meet times across more events to see the specialty shape."
  if (entries.length >= 3) {
    const top = [...entries].sort((a,b) => b[1]-a[1])
    title = `Strong in ${top[0][0]} & ${top[1][0]}`
    sub = `Shape leans toward ${top[0][0]} — that's where the current scores are highest.`
  }

  // Build the SVG polygon points (6 axes, 360° around)
  const cx = 210, cy = 210, maxR = 150
  const axes = ['Free', 'Back', 'Breast', 'Fly', 'IM', 'Distance']
  const points = axes.map((axis, i) => {
    const angle = (-90 + i * 60) * Math.PI / 180
    const r = (values[axis] / 100) * maxR
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')

  // Ring guides
  const ringPts = (scale) => axes.map((_, i) => {
    const angle = (-90 + i * 60) * Math.PI / 180
    const r = scale * maxR
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')

  // Label positions (just outside the outer ring)
  const labelAt = (i, extraR = 20) => {
    const angle = (-90 + i * 60) * Math.PI / 180
    const r = maxR + extraR
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  return (
    <div className="radar-wrap">
      <svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="radarFill" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#D4A853" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8a6d2f" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {/* concentric rings */}
        <g fill="none" stroke="rgba(84,84,88,0.3)" strokeWidth="0.5">
          <polygon points={ringPts(1)} />
          <polygon points={ringPts(0.66)} />
          <polygon points={ringPts(0.33)} />
        </g>
        {/* athlete shape */}
        <polygon points={points} fill="url(#radarFill)" stroke="#D4A853" strokeWidth="1.5" />
        {/* axes */}
        <g stroke="rgba(84,84,88,0.4)" strokeWidth="0.5">
          {axes.map((_, i) => {
            const angle = (-90 + i * 60) * Math.PI / 180
            return (
              <line
                key={i}
                x1={cx} y1={cy}
                x2={cx + maxR * Math.cos(angle)}
                y2={cy + maxR * Math.sin(angle)}
              />
            )
          })}
        </g>
        {/* labels */}
        <g fill="#a1a1a6" fontSize="11" fontWeight="600" fontFamily="-apple-system, sans-serif">
          {axes.map((axis, i) => {
            const { x, y } = labelAt(i)
            return (
              <text
                key={axis}
                x={x} y={y}
                textAnchor={x < cx - 10 ? 'end' : x > cx + 10 ? 'start' : 'middle'}
                dominantBaseline="middle"
              >
                {axis.toUpperCase()}
              </text>
            )
          })}
        </g>
      </svg>
      <div className="radar-legend">
        <div className="title">{title}</div>
        <div className="sub">{sub}</div>
        <div className="keys">
          <div className="key athlete">
            <span className="swatch" />
            <span>{athlete.first}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function UpcomingMeetsList({ meets }) {
  // meets: [{ name, location, startDate, endDate }]
  const today = new Date()
  const withDays = meets.map(m => {
    const start = new Date(m.startDate)
    const days = Math.max(0, Math.ceil((start - today) / (1000 * 60 * 60 * 24)))
    return { ...m, days }
  }).sort((a, b) => a.days - b.days)

  return (
    <div className="meets-list">
      {withDays.map((m, i) => (
        <div className="meet-row" key={i}>
          <div className={`countdown ${m.days <= 14 ? 'close' : ''}`}>
            <div className="num">{m.days}</div>
            <div className="unit">Days</div>
          </div>
          <div className="meet-info">
            <div className="name">{m.name}</div>
            <div className="loc">{m.location}</div>
          </div>
          <div className="meet-date mono">{m.dateRange || ''}</div>
        </div>
      ))}
    </div>
  )
}
