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

import { useState, useMemo, useEffect } from 'react'
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
  ageFromDob,
  ageBucket,
  daysUntilBirthday,
  gapToCut,
} from '../lib/calculations.js'
import {
  CHAMPIONSHIP_TIERS,
  CHAMPIONSHIP_TIER_LABELS,
  championshipCut,
  txTagsCut,
} from '../lib/championship-standards.js'

export default function FamilyProfile({ athlete, onBack, onNavigate }) {
  const [course, setCourse] = useState('SCY')

  // While the v2 profile is mounted, flip the document body into dark mode
  // so the full viewport (including overscroll) is black — not just the
  // scoped .v2 wrapper. Cleanup on unmount returns legacy views to normal.
  useEffect(() => {
    document.body.classList.add('v2-active')
    return () => { document.body.classList.remove('v2-active') }
  }, [])

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

  // Gender is now the admin-only source of truth for standards lookups
  // and auto-copy pronouns. Falls back to inferring from legacy `pronouns`
  // field for any record that hasn't been migrated yet.
  const gender = athlete.gender
    || (athlete.pronouns === 'she' ? 'F' : 'M')

  // Effective age: auto-updates when DOB + birthday have passed.
  // Falls back to athlete.age if DOB is missing or unparseable.
  // This is what drives standards lookups — when an athlete turns 13
  // their entire profile flips from 11-12 → 13-14 automatically.
  const effectiveAge = useMemo(() => {
    const computed = ageFromDob({ dob: athlete.dob, fallbackAge: athlete.age })
    return computed ?? athlete.age
  }, [athlete.dob, athlete.age])

  const currentBucket = ageBucket(effectiveAge)
  const daysToBirthday = useMemo(
    () => daysUntilBirthday({ dob: athlete.dob }),
    [athlete.dob],
  )

  // Next cut across all events
  const nextCut = useMemo(() => pickNextCut({
    age: effectiveAge,
    gender,
    course,
    meetTimes: athlete.meetTimes || [],
  }), [effectiveAge, gender, course, athlete.meetTimes])

  // Event power rankings
  const rankings = useMemo(() => eventPowerRankings({
    age: effectiveAge,
    gender,
    course,
    meetTimes: athlete.meetTimes || [],
  }), [effectiveAge, gender, course, athlete.meetTimes])

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
            <span className="age">{effectiveAge} years old</span>
            {currentBucket && <>
              <span className="dot" />
              <span className="age-bucket">{currentBucket}</span>
            </>}
            {athlete.clubTeam && <>
              <span className="dot" />
              <span className="club">{athlete.clubTeam}</span>
            </>}
            {athlete.confluenceStart && <>
              <span className="dot" />
              <span className="club">Confluence since {athlete.confluenceStart}</span>
            </>}
            {daysToBirthday != null && daysToBirthday <= 30 && daysToBirthday > 0 && (<>
              <span className="dot" />
              <span className="birthday-soon">
                Turns {effectiveAge + 1} in {daysToBirthday} day{daysToBirthday === 1 ? '' : 's'}
              </span>
            </>)}
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
          <p className="section-lede">
            Personal bests against USA Swimming motivational time standards.
            <strong> Current</strong> shows the cut level {athlete.first}'s best time earns today.
            <strong> Next</strong> is the cut level we're chasing.
            The <strong>deltas</strong> are how far {athlete.first}'s best time still needs to drop
            to hit the next cut and the goal time.
          </p>
          <ColorLegend />
          <div className="pill-toggle">
            <button className={course === 'SCY' ? 'active' : ''} onClick={() => setCourse('SCY')}>SCY</button>
            <button className={course === 'LCM' ? 'active' : ''} onClick={() => setCourse('LCM')}>LCM</button>
          </div>
          <TimesTable
            age={effectiveAge}
            gender={gender}
            course={course}
            bestTimes={bestTimes}
            goalTimes={goalTimes}
          />

          {/* Championship Standards sits directly under main Times & Goals —
              same mental model (current time vs standards), just harder tiers.
              Toggle-gated: only visible for athletes close to or pushing
              these levels. */}
          {athlete.showChampionshipCuts && (
            <div className="championship-standards-block">
              <div className="cs-heading">Championship Standards</div>
              <p className="cs-lede">
                The national pathway beyond USA Swimming motivationals.
                <strong> Futures</strong> · <strong>Sectionals</strong> ·
                <strong> Jr Nats</strong> · <strong>Nationals</strong>.
              </p>
              <ChampionshipTable
                gender={gender}
                course={course}
                bestTimes={bestTimes}
              />
            </div>
          )}

          <AgeUpPreview
            age={effectiveAge}
            gender={gender}
            course={course}
            primaryEvents={athlete.events || []}
            bestTimes={bestTimes}
          />
        </section>

        {/* ============ PROGRESSION ============ */}
        <section>
          <h2 className="section-title">Progression</h2>
          <p className="section-lede">
            How {athlete.first}'s times have dropped over past meets. Each line is
            one event. Lower on the chart = faster.
          </p>
          <ProgressionChart
            data={athlete.progression || []}
            athleteName={athlete.first}
          />
        </section>

        {/* ============ EVENT POWER RANKINGS ============ */}
        <section>
          <h2 className="section-title">Event Power Rankings</h2>
          <PowerRankingsList rankings={rankings} />
        </section>

        {/* ============ SPECIALTY — two visual options to pick from ============ */}
        <section>
          <h2 className="section-title">Specialty</h2>
          <p className="section-lede">
            Where does {athlete.first} score best across strokes? Each axis is a
            0-100 score averaged from the standards earned across events in that
            stroke family.
          </p>
          <SpecialtyViz rankings={rankings} athlete={athlete} />
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
  // Display pct as 1 decimal so 73.3 doesn't round down to 73 and 99.5
  // doesn't ever round up to 100 (100% is impossible here by construction).
  const pctDisplay = nextCut.next.pct.toFixed(1)
  const pctFillWidth = Math.min(100, nextCut.next.pct)
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
            {' '}{pctDisplay}% of the way there
          </div>
          <div className="bar-wrap">
            <div className="bar-fill" style={{ width: `${pctFillWidth}%` }} />
            <div className="bar-marks">
              <span style={{ left: '25%' }} />
              <span style={{ left: '50%' }} />
              <span style={{ left: '75%' }} />
            </div>
          </div>
          <div className="bar-scale">
            <span>Previous cut</span>
            <span className="bar-scale-next">{nextCut.next.level} cut</span>
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
  // Current age bucket for TX TAGs lookup
  const bucket = ageBucket(age)
  return (
    <div className="times-table times-table-with-tags">
      <div className="times-row header">
        <div>Event</div>
        <div>Best</div>
        <div>Goal</div>
        <div>Current</div>
        <div>Next</div>
        <div>Δ to Next</div>
        <div>TX TAGs</div>
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

            // TX TAGs lookup + gap
            const tagsCut = txTagsCut({ gender, ageBucket: bucket, course, event: baseEvent })
            const tagsGap = (row.bestSec != null && tagsCut != null)
              ? gapToCut(row.bestSec, tagsCut)
              : null

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
                <div className={`delta mono delta-${row.colorToNext || 'neutral'}`}>
                  {row.deltaToNext != null ? (
                    <>
                      {formatDelta(-row.deltaToNext)}
                      {row.pctToNext != null && (
                        <span className="delta-pct">{row.pctToNext.toFixed(1)}%</span>
                      )}
                    </>
                  ) : '—'}
                </div>
                <div className="tags-cell">
                  {tagsGap?.achieved ? (
                    <span className="hit-pill">✓ Hit</span>
                  ) : tagsGap ? (
                    <div className={`stacked-gap delta-${tagsGap.color || 'neutral'}`}>
                      <div className="stacked-cut mono">{formatTime(tagsCut)}</div>
                      <div className="stacked-delta mono">−{tagsGap.deltaSec.toFixed(2)}</div>
                      <div className="stacked-pct">{tagsGap.pctOff.toFixed(1)}%</div>
                    </div>
                  ) : (
                    <span className="std none">—</span>
                  )}
                </div>
                <div className={`delta mono delta-${row.colorToGoal || 'neutral'}`}>
                  {row.deltaToGoal != null ? (
                    <>
                      {formatDelta(-row.deltaToGoal)}
                      {row.pctToGoal != null && (
                        <span className="delta-pct">{row.pctToGoal.toFixed(1)}%</span>
                      )}
                    </>
                  ) : '—'}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ============================================================
// ChampionshipTable
// ============================================================
// Higher-level domestic cuts: Futures / Sectionals / Jr Nats / Nationals.
// Toggle-gated by athlete.showChampionshipCuts so swimmers far from these
// standards aren't shown a discouraging wall of red deltas.
// Each cell shows cut time / gap / percentage using the unified color rule.
function ChampionshipTable({ gender, course, bestTimes }) {
  return (
    <div className="times-table championship-table">
      <div className="times-row header">
        <div>Event</div>
        <div>Best</div>
        {CHAMPIONSHIP_TIERS.map(tier => (
          <div key={tier}>{CHAMPIONSHIP_TIER_LABELS[tier]}</div>
        ))}
      </div>

      {STROKE_FAMILIES.map(fam => (
        <div key={fam.label}>
          <div className="stroke-family-label">{fam.label}</div>
          {fam.distances.map(dist => {
            const baseEvent = `${dist} ${fam.stroke}`
            const eventKey = `${baseEvent} ${course}`
            const best = bestTimes[eventKey]
            const bestSec = best ? parseTime(best) : null

            return (
              <div className="times-row" key={eventKey}>
                <div className="event">{dist}</div>
                <div className="time mono">{bestSec != null ? formatTime(bestSec) : '—'}</div>
                {CHAMPIONSHIP_TIERS.map(tier => {
                  const cut = championshipCut({ tier, gender, course, event: baseEvent })
                  const gap = (bestSec != null && cut != null) ? gapToCut(bestSec, cut) : null
                  return (
                    <div key={tier} className="tags-cell">
                      {gap?.achieved ? (
                        <span className="hit-pill">✓ Hit</span>
                      ) : gap ? (
                        <div className={`stacked-gap delta-${gap.color || 'neutral'}`}>
                          <div className="stacked-cut mono">{formatTime(cut)}</div>
                          <div className="stacked-delta mono">−{gap.deltaSec.toFixed(2)}</div>
                          <div className="stacked-pct">{gap.pctOff.toFixed(1)}%</div>
                        </div>
                      ) : (
                        <span className="std none">—</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function AgeUpPreview({ age, gender, course, primaryEvents, bestTimes }) {
  // Top 3 primary events get the full card treatment.
  // Everything else is a compact row that expands inline on click.
  const top3 = primaryEvents.slice(0, 3)
  const otherPrimary = primaryEvents.slice(3)

  // Build the full event list for the compact section:
  // start with athlete's other primary events (they opted into), then
  // fill in remaining events from STROKE_FAMILIES so the family can
  // explore any event even if it's not flagged as primary.
  const allEvents = []
  for (const ev of otherPrimary) allEvents.push(ev)
  for (const fam of STROKE_FAMILIES) {
    for (const dist of fam.distances) {
      const base = `${dist} ${fam.stroke}`
      if (top3.includes(base)) continue
      if (allEvents.includes(base)) continue
      allEvents.push(base)
    }
  }

  const nextAgeBucket = age <= 8 ? '9-10'
    : age <= 10 ? '11-12'
    : age <= 12 ? '13-14'
    : age <= 14 ? '15-16'
    : age <= 16 ? '17-18'
    : null
  if (!nextAgeBucket) return null

  // Helper that computes everything a card/row needs for one event
  const project = (ev) => {
    const eventKey = `${ev} ${course}`
    const t = bestTimes[eventKey]
    const timeSec = parseTime(t)
    const currentStds = eventStandards({ age, gender, course, event: ev })
    const currentLevel = timeSec != null && currentStds ? classifyTime(timeSec, currentStds) : null
    const proj = ageUpProjection({ currentAge: age, gender, course, event: ev, timeSec })
    const projLevel = proj ? proj.projectedLevel : null
    return { ev, timeSec, currentLevel, projLevel }
  }

  // Track which compact rows are expanded
  const [expanded, setExpanded] = useState(new Set())
  const toggle = (ev) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(ev)) next.delete(ev)
      else next.add(ev)
      return next
    })
  }

  // Top 3 always rendered as full cards
  const topCards = top3.length > 0 ? top3 : []
  // Fallback — if athlete has no primary events, promote first 3 from STROKE_FAMILIES
  const fallbackTop = topCards.length === 0
    ? allEvents.slice(0, 3)
    : topCards
  const fallbackRest = topCards.length === 0 ? allEvents.slice(3) : allEvents

  return (
    <div className="age-up">
      <div className="caption">Age-Up Preview</div>
      <div className="title">
        Current times in the next age group
        <span className="age-pill">{nextAgeBucket}</span>
      </div>

      {/* Top 3 — full cards, always visible */}
      <div className="age-up-grid">
        {fallbackTop.map(ev => {
          const d = project(ev)
          return <AgeUpCard key={ev} data={d} />
        })}
      </div>

      {/* Compact list below — expands inline on click */}
      {fallbackRest.length > 0 && (
        <div className="age-up-more">
          <div className="age-up-more-label">
            Other events · tap to expand
          </div>
          <div className="age-up-list">
            {fallbackRest.map(ev => {
              const d = project(ev)
              const isOpen = expanded.has(ev)
              return (
                <div
                  key={ev}
                  className={`age-up-row ${isOpen ? 'open' : ''}`}
                >
                  <button
                    className="age-up-row-summary"
                    onClick={() => toggle(ev)}
                    aria-expanded={isOpen}
                  >
                    <span className="ev">{ev}</span>
                    <span className="badges">
                      <span className={`std ${d.currentLevel || 'none'}`}>
                        {d.currentLevel || '—'}
                      </span>
                      <span className="arrow">→</span>
                      <span className={`std ${d.projLevel || 'none'}`}>
                        {d.projLevel || '—'}
                      </span>
                    </span>
                    <span className="chev">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="age-up-row-expand">
                      <AgeUpCard data={d} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// Single event card used by both the top 3 and the inline expansions.
// Keeps visual treatment identical between the two surfaces.
function AgeUpCard({ data }) {
  const { ev, timeSec, currentLevel, projLevel } = data
  return (
    <div className="age-up-item">
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

// ============================================================
// ProgressionChart
// ============================================================
// SVG line chart showing time drops over past meets, one line per event.
// Expects data shape: [{ event, date, time }]. Time is a string like
// "1:02.91" which is parsed to seconds. Lower on chart = faster.
//
// Plot math:
//   x-axis: date (earliest left, today right)
//   y-axis: time in seconds (lower = better, so y-axis is inverted visually)
//
// Event selector: dropdown shows all events with data. Only one event
// line drawn at a time — keeps visual load manageable.
// ============================================================
function ProgressionChart({ data, athleteName }) {
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Group by event
  const byEvent = useMemo(() => {
    const m = new Map()
    for (const row of data) {
      const sec = parseTime(row.time)
      if (sec == null) continue
      if (!row.date) continue
      const d = new Date(row.date)
      if (isNaN(d.getTime())) continue
      if (!m.has(row.event)) m.set(row.event, [])
      m.get(row.event).push({ date: d, time: sec, raw: row.time })
    }
    // Sort each event's points by date
    for (const [, arr] of m) {
      arr.sort((a, b) => a.date - b.date)
    }
    return m
  }, [data])

  const eventList = Array.from(byEvent.keys())

  // Default to the event with the most points
  useEffect(() => {
    if (!selectedEvent && eventList.length) {
      const best = eventList.reduce((a, b) =>
        byEvent.get(a).length >= byEvent.get(b).length ? a : b
      )
      setSelectedEvent(best)
    }
  }, [eventList, byEvent, selectedEvent])

  if (!eventList.length) {
    return (
      <div className="empty-state">
        Progression chart will populate once meet history is entered.
      </div>
    )
  }

  const points = selectedEvent ? byEvent.get(selectedEvent) || [] : []
  if (points.length < 2) {
    return (
      <div className="empty-state">
        Need at least 2 dated times for {selectedEvent} to draw progression.
      </div>
    )
  }

  // Plot dims
  const W = 700, H = 280
  const padL = 56, padR = 20, padT = 20, padB = 44
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  // Axes domain
  const dates = points.map(p => p.date.getTime())
  const times = points.map(p => p.time)
  const xMin = Math.min(...dates)
  const xMax = Math.max(...dates)
  const yMin = Math.min(...times)
  const yMax = Math.max(...times)
  const yPad = (yMax - yMin) * 0.1 || 1
  const yDomainMin = yMin - yPad
  const yDomainMax = yMax + yPad

  const xScale = (d) => padL + ((d - xMin) / (xMax - xMin || 1)) * plotW
  // Inverted y — fast at top, slow at bottom makes no sense for progression.
  // Convention here: fast at top (lower time = higher on chart)
  const yScale = (t) => padT + ((yDomainMax - t) / (yDomainMax - yDomainMin)) * plotH

  const pathD = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${xScale(p.date.getTime()).toFixed(1)} ${yScale(p.time).toFixed(1)}`
  ).join(' ')

  // Y-axis ticks — 4 evenly spaced
  const yTicks = [0, 1, 2, 3].map(i => {
    const t = yDomainMin + (i / 3) * (yDomainMax - yDomainMin)
    return { y: yScale(t), label: formatTime(t) }
  })

  // Drop first point → last point
  const firstPt = points[0]
  const lastPt = points[points.length - 1]
  const dropSec = firstPt.time - lastPt.time
  const dropPct = (dropSec / firstPt.time) * 100

  return (
    <div className="progression-chart">
      <div className="pc-head">
        <div className="pc-event-select">
          <label>Event</label>
          <select value={selectedEvent || ''} onChange={e => setSelectedEvent(e.target.value)}>
            {eventList.map(ev => (
              <option key={ev} value={ev}>{ev}</option>
            ))}
          </select>
        </div>
        <div className="pc-summary">
          <span className="pc-drop-label">Drop over span:</span>
          <span className="pc-drop-val mono">
            {dropSec > 0 ? '−' : '+'}{Math.abs(dropSec).toFixed(2)}s
          </span>
          <span className="pc-drop-pct">
            ({dropPct > 0 ? '−' : '+'}{Math.abs(dropPct).toFixed(1)}%)
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg">
        {/* Y-axis gridlines + labels */}
        <g>
          {yTicks.map((t, i) => (
            <g key={i}>
              <line
                x1={padL} x2={W - padR}
                y1={t.y} y2={t.y}
                stroke="rgba(84,84,88,0.2)"
                strokeWidth="0.5"
              />
              <text
                x={padL - 8} y={t.y}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#a1a1a6"
                fontSize="10"
                fontFamily="SF Mono, ui-monospace, monospace"
              >
                {t.label}
              </text>
            </g>
          ))}
        </g>

        {/* X-axis date labels — first / middle / last */}
        <g fill="#a1a1a6" fontSize="10" fontFamily="-apple-system, sans-serif">
          {[firstPt, points[Math.floor(points.length / 2)], lastPt].map((p, i, a) => (
            <text
              key={i}
              x={xScale(p.date.getTime())}
              y={H - padB + 16}
              textAnchor={i === 0 ? 'start' : i === a.length - 1 ? 'end' : 'middle'}
            >
              {p.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
            </text>
          ))}
        </g>

        {/* The line */}
        <path
          d={pathD}
          fill="none"
          stroke="#D4A853"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        <g>
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={xScale(p.date.getTime())}
                cy={yScale(p.time)}
                r="4"
                fill="#D4A853"
                stroke="#1a1a1c"
                strokeWidth="1.5"
              />
              {/* Time label above each point */}
              <text
                x={xScale(p.date.getTime())}
                y={yScale(p.time) - 10}
                textAnchor="middle"
                fill="#D4A853"
                fontSize="10"
                fontWeight="600"
                fontFamily="SF Mono, ui-monospace, monospace"
              >
                {p.raw}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}

// ============================================================
// SpecialtyViz
// ============================================================
// Two alternative visualizations, rendered side-by-side so Chase
// can pick the one he prefers on the live site. When the winner is
// chosen the other will be removed.
//
// Both render the same 6-axis score data (Free/Back/Breast/Fly/IM/Distance).
//
// Option A — Horizontal Bar Chart
//   Each stroke family on its own row with a bar showing 0-100 score.
//   Cleanest, most data-dense, zero "radar rip-off" feel.
//
// Option B — Radial Bloom
//   Each stroke family is a petal emanating from center. Petal length =
//   score. Keeps the "shape at a glance" feel without a hexagon.
// ============================================================
function SpecialtyViz({ rankings, athlete }) {
  // Compute a "specialty value" per stroke family from this athlete's rankings.
  // 0 = no data, 100 = all events at top standard.
  // NOTE: underlying scoring math is placeholder — see PLACEHOLDERS.md for the
  // Phase 3 plan to tune weights by standard tier.
  const strokeAvg = (strokeKey) => {
    const matching = rankings.filter(r => {
      const parsed = parseEventName(r.event)
      return parsed && parsed.stroke === strokeKey
    })
    if (!matching.length) return 0
    return matching.reduce((a, r) => a + r.pct, 0) / matching.length
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
    Free:     strokeAvg('Free'),
    Back:     strokeAvg('Back'),
    Breast:   strokeAvg('Breast'),
    Fly:      strokeAvg('Fly'),
    IM:       strokeAvg('IM'),
    Distance: distanceAvg(),
  }

  // Describe the shape briefly
  const entries = Object.entries(values).filter(([,v]) => v > 0)
  let title = "Not enough data yet"
  let sub = "Enter meet times across more events to see the specialty shape."
  if (entries.length >= 3) {
    const top = [...entries].sort((a,b) => b[1]-a[1])
    title = `Strong in ${top[0][0]} & ${top[1][0]}`
    sub = `The highest current scores come from ${top[0][0]} and ${top[1][0]} events.`
  }

  return (
    <div className="specialty-viz">
      <div className="specialty-head">
        <div className="title">{title}</div>
        <div className="sub">{sub}</div>
      </div>

      <div className="specialty-options">
        <div className="viz-option">
          <div className="viz-option-label">OPTION A — Bar Chart</div>
          <SpecialtyBars values={values} />
        </div>
        <div className="viz-option">
          <div className="viz-option-label">OPTION B — Radial Bloom</div>
          <SpecialtyBloom values={values} athlete={athlete} />
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Option A — Horizontal bar chart
// ============================================================
function SpecialtyBars({ values }) {
  const axes = ['Free', 'Back', 'Breast', 'Fly', 'IM', 'Distance']
  const max = Math.max(100, ...Object.values(values))
  return (
    <div className="specialty-bars">
      {axes.map(axis => {
        const v = values[axis] || 0
        const pct = Math.min(100, (v / max) * 100)
        return (
          <div key={axis} className="bar-row">
            <div className="bar-axis-label">{axis.toUpperCase()}</div>
            <div className="bar-channel">
              <div className="bar-fill-specialty" style={{ width: `${pct}%` }} />
              <div className="bar-ticks">
                <span style={{ left: '25%' }} />
                <span style={{ left: '50%' }} />
                <span style={{ left: '75%' }} />
              </div>
            </div>
            <div className="bar-score mono">{Math.round(v)}</div>
          </div>
        )
      })}
    </div>
  )
}

// ============================================================
// Option B — Radial bloom. Each axis is a petal; petal length = score.
// No connecting polygon (that's what makes a radar chart look
// like SwimCloud). Each petal is independent.
// ============================================================
function SpecialtyBloom({ values, athlete }) {
  const axes = ['Free', 'Back', 'Breast', 'Fly', 'IM', 'Distance']
  const cx = 180, cy = 180, maxR = 130, innerR = 18

  const firstInitial = (athlete?.first || '').charAt(0).toUpperCase() || '?'

  return (
    <div className="specialty-bloom-wrap">
      <svg viewBox="0 0 360 360" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="petalGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"  stopColor="#D4A853" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8a6d2f" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Subtle reference rings — no polygon shape */}
        <g fill="none" stroke="rgba(84,84,88,0.2)" strokeWidth="0.5">
          <circle cx={cx} cy={cy} r={maxR}      strokeDasharray="2 4" />
          <circle cx={cx} cy={cy} r={maxR*0.66} strokeDasharray="2 4" />
          <circle cx={cx} cy={cy} r={maxR*0.33} strokeDasharray="2 4" />
        </g>

        {/* Each axis is an independent petal — tapered bar shape */}
        {axes.map((axis, i) => {
          const angle = (-90 + i * 60) * Math.PI / 180
          const v = values[axis] || 0
          const petalR = innerR + (v / 100) * (maxR - innerR)

          // Petal is a narrow tapered wedge: wider at center, pointed at tip
          const petalWidth = 18 // radians equivalent... actually use pixel offset at base
          const perpAngle = angle + Math.PI / 2
          const dx = Math.cos(perpAngle) * 10
          const dy = Math.sin(perpAngle) * 10

          const baseX = cx + innerR * Math.cos(angle)
          const baseY = cy + innerR * Math.sin(angle)
          const tipX  = cx + petalR * Math.cos(angle)
          const tipY  = cy + petalR * Math.sin(angle)

          const p1 = `${baseX + dx},${baseY + dy}`
          const p2 = `${baseX - dx},${baseY - dy}`
          const tip = `${tipX},${tipY}`

          return (
            <polygon
              key={axis}
              points={`${p1} ${tip} ${p2}`}
              fill="url(#petalGradient)"
              stroke="#D4A853"
              strokeWidth="0.5"
              opacity={v > 0 ? 1 : 0.2}
            />
          )
        })}

        {/* Center bubble with athlete initial */}
        <circle cx={cx} cy={cy} r={innerR} fill="#111" stroke="#D4A853" strokeWidth="1" />
        <text
          x={cx} y={cy}
          textAnchor="middle" dominantBaseline="central"
          fill="#D4A853" fontSize="14" fontWeight="700"
          fontFamily="-apple-system, sans-serif"
        >
          {firstInitial}
        </text>

        {/* Axis labels */}
        <g fill="#a1a1a6" fontSize="10" fontWeight="600" fontFamily="-apple-system, sans-serif">
          {axes.map((axis, i) => {
            const angle = (-90 + i * 60) * Math.PI / 180
            const lblR = maxR + 20
            const x = cx + lblR * Math.cos(angle)
            const y = cy + lblR * Math.sin(angle)
            return (
              <text
                key={axis}
                x={x} y={y}
                textAnchor={x < cx - 5 ? 'end' : x > cx + 5 ? 'start' : 'middle'}
                dominantBaseline="middle"
              >
                {axis.toUpperCase()}
              </text>
            )
          })}
        </g>

        {/* Score value at each petal tip */}
        <g fill="#D4A853" fontSize="9" fontWeight="700" fontFamily="-apple-system, sans-serif">
          {axes.map((axis, i) => {
            const v = values[axis] || 0
            if (v === 0) return null
            const angle = (-90 + i * 60) * Math.PI / 180
            const petalR = innerR + (v / 100) * (maxR - innerR)
            const scoreR = petalR + 8
            const x = cx + scoreR * Math.cos(angle)
            const y = cy + scoreR * Math.sin(angle)
            return (
              <text
                key={axis}
                x={x} y={y}
                textAnchor="middle" dominantBaseline="middle"
              >
                {Math.round(v)}
              </text>
            )
          })}
        </g>
      </svg>
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

// ============================================================
// ColorLegend
// ============================================================
// Tiny inline key explaining the green/yellow/red delta color rule.
// Rendered under the lede on any table that uses pctColor().
// Each label is colored to match its dot so the legend self-teaches.
function ColorLegend() {
  return (
    <div className="color-legend">
      <span className="legend-item legend-green">
        <span className="legend-dot" /> Under 2%
      </span>
      <span className="legend-item legend-yellow">
        <span className="legend-dot" /> 2–3.5%
      </span>
      <span className="legend-item legend-red">
        <span className="legend-dot" /> 3.5%+
      </span>
    </div>
  )
}
