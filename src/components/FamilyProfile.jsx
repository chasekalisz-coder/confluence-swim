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
import { fullName } from '../data/athletes.js'
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
  TAGS_ELIGIBLE_BUCKETS,
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

  // Goal times: accept two shapes for backward compatibility.
  //   • Map format: { "50 Free SCY": "25.49", ... } — used by seed data
  //   • Array format: [{ event: "50 Free SCY", time: "25.49" }, ...] — used by admin edit UI
  // Normalize to map shape for the downstream lookup (goalTimes[eventKey]).
  const goalTimes = useMemo(() => {
    const raw = athlete.goalTimes
    if (!raw) return {}
    if (Array.isArray(raw)) {
      const out = {}
      for (const g of raw) {
        if (g?.event && g?.time) out[g.event] = g.time
      }
      return out
    }
    return raw
  }, [athlete.goalTimes])

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
            {fullName(athlete)}
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
                {effectiveAge <= 14 ? (
                  <>
                    The pathway beyond USA Swimming motivationals.
                    <strong> TAGS</strong> · <strong>Sectionals</strong> ·
                    <strong> Futures</strong> · <strong>Jr Nats</strong> ·
                    <strong> Nationals</strong>.
                  </>
                ) : (
                  <>
                    The national pathway beyond USA Swimming motivationals.
                    <strong> Sectionals</strong> · <strong>Futures</strong> ·
                    <strong> Jr Nats</strong> · <strong>Nationals</strong>.
                  </>
                )}
              </p>
              <ChampionshipTable
                age={effectiveAge}
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

        {/* ============ SPECIALTY — radial heat bloom ============ */}
        <section>
          <h2 className="section-title">Range</h2>
          <p className="section-lede">
            The whole swimmer in one look. Each glowing petal is an event,
            grouped by stroke around the circle. Petals reach further and
            run hotter where {athlete.first} is closer to the top of the
            time-standard ladder. Untested events don't glow. SCY on the
            left, LCM on the right.
          </p>
          <SpecialtyBloom athlete={athlete} age={effectiveAge} gender={gender} />
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
function ChampionshipTable({ age, gender, course, bestTimes }) {
  // Default state: all families collapsed. Click a family header to
  // expand. Saves enormous vertical space — most families don't need
  // to see 19 events at once; they open the stroke they care about.
  const [openFamilies, setOpenFamilies] = useState(new Set())
  const toggle = (label) => {
    setOpenFamilies(prev => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  // Age-bucket for TAGS lookup. TAGS is a 14 & Under meet so any athlete
  // in the 15-16 or 17-18 brackets gets the TAGS column filtered out
  // entirely (not just rendered as "—" cells).
  const bucket = ageBucket(age)
  const tiers = CHAMPIONSHIP_TIERS.filter(t => {
    if (t === 'TAGS' && !TAGS_ELIGIBLE_BUCKETS.has(bucket)) return false
    return true
  })

  return (
    <div className="championship-accordion">
      {/* Column headers row — stays visible at the top */}
      <div className="ca-header" style={{ gridTemplateColumns: `70px 1fr ${'1.2fr '.repeat(tiers.length).trim()}` }}>
        <div className="ca-h-event">Event</div>
        <div className="ca-h-best">Best</div>
        {tiers.map(tier => (
          <div key={tier} className="ca-h-tier">{CHAMPIONSHIP_TIER_LABELS[tier]}</div>
        ))}
      </div>

      {STROKE_FAMILIES.map(fam => {
        const isOpen = openFamilies.has(fam.label)
        return (
          <div key={fam.label} className={`ca-family ${isOpen ? 'open' : ''}`}>
            <button
              className="ca-family-header"
              onClick={() => toggle(fam.label)}
              aria-expanded={isOpen}
            >
              <span className="ca-chev">{isOpen ? '▾' : '▸'}</span>
              <span className="ca-family-name">{fam.label}</span>
              <span className="ca-family-count">{fam.distances.length} events</span>
            </button>

            {isOpen && (
              <div className="ca-family-body">
                {fam.distances.map(dist => {
                  const baseEvent = `${dist} ${fam.stroke}`
                  const eventKey = `${baseEvent} ${course}`
                  const best = bestTimes[eventKey]
                  const bestSec = best ? parseTime(best) : null

                  return (
                    <div
                      className="ca-event-row"
                      key={eventKey}
                      style={{ gridTemplateColumns: `70px 1fr ${'1.2fr '.repeat(tiers.length).trim()}` }}
                    >
                      <div className="ca-ev-name">{dist}</div>
                      <div className="ca-ev-best mono">
                        {bestSec != null ? formatTime(bestSec) : '—'}
                      </div>
                      {tiers.map(tier => {
                        const cut = championshipCut({
                          tier,
                          gender,
                          course,
                          event: baseEvent,
                          ageBucket: bucket,
                        })
                        const gap = (bestSec != null && cut != null) ? gapToCut(bestSec, cut) : null
                        return (
                          <div key={tier} className="ca-cell">
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
            )}
          </div>
        )
      })}
    </div>
  )
}

function AgeUpPreview({ age, gender, course, primaryEvents, bestTimes }) {
  // Unified grid — every event gets the same treatment. No accordion,
  // no "primary events get a different layout" split. Dense 6-per-row
  // so the family can scan every event at once without scrolling.
  // Order: strictly by stroke family (Free / Fly / Back / Breast / IM),
  // short distance to long within each family. Primary events are NOT
  // reordered to the front — keeps the grid readable and predictable.
  const allEvents = []
  for (const fam of STROKE_FAMILIES) {
    for (const dist of fam.distances) {
      const base = `${dist} ${fam.stroke}`
      if (!allEvents.includes(base)) allEvents.push(base)
    }
  }

  const nextAgeBucket = age <= 8 ? '9-10'
    : age <= 10 ? '11-12'
    : age <= 12 ? '13-14'
    : age <= 14 ? '15-16'
    : age <= 16 ? '17-18'
    : null
  if (!nextAgeBucket) return null

  // Helper — compute card data for one event
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

  return (
    <div className="age-up">
      <div className="caption">Age-Up Preview</div>
      <div className="title">
        Current times in the next age group
        <span className="age-pill">{nextAgeBucket}</span>
      </div>

      {/* Unified grid — 6 cards per row, every event the same treatment */}
      <div className="age-up-grid">
        {allEvents.map(ev => (
          <AgeUpCard key={ev} data={project(ev)} />
        ))}
      </div>
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
  // Two-column layout — split the rankings in half so 15 events render as
  // ~8 rows instead of 15. Compact rows: rank / event / std / gap / %.
  // No progress bar — the bars were all 92-99% filled which carried zero
  // visual information. Percentages and standard badges carry the signal.
  const mid = Math.ceil(rankings.length / 2)
  const left = rankings.slice(0, mid)
  const right = rankings.slice(mid)

  return (
    <div className="rankings-compact">
      <div className="rc-col">
        {left.map((r, i) => (
          <PowerRankRow key={r.event} rank={i + 1} r={r} />
        ))}
      </div>
      <div className="rc-col">
        {right.map((r, i) => (
          <PowerRankRow key={r.event} rank={mid + i + 1} r={r} />
        ))}
      </div>
    </div>
  )
}

function PowerRankRow({ rank, r }) {
  return (
    <div className="rc-row">
      <div className="rc-rank mono">{String(rank).padStart(2, '0')}</div>
      <div className="rc-event">{r.event}</div>
      <div className="rc-std">
        {r.currentLevel
          ? <span className={`std ${r.currentLevel}`}>{r.currentLevel}</span>
          : <span className="std none">—</span>}
      </div>
      <div className="rc-gap mono">
        {r.gapToNext != null ? `−${r.gapToNext.toFixed(2)}s` : '—'}
      </div>
      <div className="rc-pct mono">{r.pct}%</div>
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
// SpecialtyBloom — radial heat map
// ============================================================
// The whole swimmer in one visual. Two circles side-by-side (SCY / LCM).
//
// Spokes = events, grouped by stroke family in order:
//   Free / Fly / Back / Breast / IM
//
// Rings = time-standard tiers from center outward:
//   B → BB → A → AA → AAA → AAAA → Futures → Sectionals → Jr Nats → Nats
//   (Pro Swim Series + Olympic Trials will slot in when their data lands)
//
// Each cell's fill = how close this athlete is to that tier for that event.
// Rendered as a heat gradient from cool (far off) through warm (approaching)
// to hot (achieved). Cells blend into neighbors — no hard dividing lines —
// so the whole bloom reads as one organic shape.
//
// The SHAPE is the story. A pure sprinter lights up the 50/100 spokes
// across all strokes. A distance swimmer lights up the Free spokes at
// 500/1000/1650. An IMer has a lit band across the IM spokes. Weak
// events stay cool. Untested events are cold.
// ============================================================

const BLOOM_TIERS = [
  'B', 'BB', 'A', 'AA', 'AAA', 'AAAA',
  'FUTURES', 'SECTIONALS', 'JR_NATS', 'NATIONALS'
]

// Event order on spokes — stroke-grouped per Chase's spec:
// Free / Fly / Back / Breast / IM
const BLOOM_STROKE_ORDER = [
  { label: 'FREE',   stroke: 'Free',   distances: { SCY: [50,100,200,500,1000,1650], LCM: [50,100,200,400,800,1500] } },
  { label: 'FLY',    stroke: 'Fly',    distances: { SCY: [50,100,200],               LCM: [50,100,200]              } },
  { label: 'BACK',   stroke: 'Back',   distances: { SCY: [50,100,200],               LCM: [50,100,200]              } },
  { label: 'BREAST', stroke: 'Breast', distances: { SCY: [50,100,200],               LCM: [50,100,200]              } },
  { label: 'IM',     stroke: 'IM',     distances: { SCY: [100,200,400],              LCM: [200,400]                 } },
]

function SpecialtyBloom({ athlete, age, gender }) {
  return (
    <div>
      <div className="bloom-pair">
        <BloomCircle label="SCY" course="SCY" athlete={athlete} age={age} gender={gender} />
        <BloomCircle label="LCM" course="LCM" athlete={athlete} age={age} gender={gender} />
      </div>
      <BloomLegend />
    </div>
  )
}

// Legend — explains how to read the bloom.
// Two dimensions encoded:
//   1. How FAR each petal reaches from center = tier ladder position.
//      Short petal = still around B level on that event. Long petal =
//      pushing championship tiers on that event.
//   2. Petal COLOR temperature = same ladder, expressed as heat. Pale
//      blue at B → yellow at AA/AAA → orange at AAAA/Futures → deep
//      red at Jr Nats/Nats. So the color reinforces the reach.
// An untested event draws nothing — the bloom only glows where the
// swimmer has actually competed.
function BloomLegend() {
  const tierLabels = ['B','BB','A','AA','AAA','AAAA','Futures','Sectionals','Jr Nats','Nats']
  return (
    <div className="bloom-legend">
      <div className="bl-row">
        <div className="bl-label">TIER LADDER · short petal → long petal</div>
        <div className="bl-tiers">
          {tierLabels.map((t, i) => (
            <span key={i} className="bl-tier">{t}</span>
          ))}
        </div>
      </div>
      <div className="bl-row">
        <div className="bl-label">HEAT · cool (early tiers) → hot (championship)</div>
        <div className="bl-gradient">
          <div className="bl-grad-bar" />
          <div className="bl-grad-labels">
            <span>B · BB</span>
            <span>AA · AAA · AAAA</span>
            <span>Futures → Nats</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function BloomCircle({ label, course, athlete, age, gender }) {
  // -----------------------------------------------------------------
  // SPOKE LAYOUT — each stroke family gets an EQUAL slice of the circle.
  // -----------------------------------------------------------------
  // Prior bug: per-event equal spacing, so Free (6 events) hogged a third
  // of the wheel while Breast (3 events) got squeezed. Users expected the
  // 5 stroke families (FREE / FLY / BACK / BREAST / IM) to look equally
  // weighted around the rim.
  //
  // New model:
  //   - 5 families → 72° each
  //   - Within a family, events split that 72° equally among themselves
  //   - Free's 50 SCY gets 12°; Breast's 50 SCY gets 24° — but the FREE
  //     region itself still occupies 72°, just the same as BREAST.
  //
  // Each spoke records its own center angle + angular width.

  // Families that have ≥1 event for this course, in display order
  const activeFamilies = BLOOM_STROKE_ORDER
    .map(fam => ({ ...fam, distances: fam.distances[course] || [] }))
    .filter(fam => fam.distances.length > 0)

  if (activeFamilies.length === 0) return null

  const sectorWidth = (Math.PI * 2) / activeFamilies.length  // 72° for 5 families
  const startAngle = -Math.PI / 2 - sectorWidth / 2           // align first family so TOP is center of FREE

  const spokes = []
  const strokeBoundaries = []
  activeFamilies.forEach((fam, famIdx) => {
    const famStartAngle = startAngle + famIdx * sectorWidth
    const famEndAngle   = famStartAngle + sectorWidth
    const spokeAngWidth = sectorWidth / fam.distances.length
    const startIdx = spokes.length
    fam.distances.forEach((dist, i) => {
      const a0 = famStartAngle + i * spokeAngWidth
      const a1 = a0 + spokeAngWidth
      spokes.push({
        event: `${dist} ${fam.stroke}`,
        label: `${dist}`,
        family: fam.label,
        a0,
        a1,
        aMid: (a0 + a1) / 2,
        aWidth: spokeAngWidth,
      })
    })
    strokeBoundaries.push({
      family: fam.label,
      startAngle: famStartAngle,
      endAngle: famEndAngle,
      midAngle: (famStartAngle + famEndAngle) / 2,
      startIdx,
      endIdx: spokes.length - 1,
    })
  })

  const spokeCount = spokes.length

  // -----------------------------------------------------------------
  // Best times + tier lookup
  // -----------------------------------------------------------------
  const bestBySpoke = spokes.map(s => {
    const key = `${s.event} ${course}`
    const timeStr = (athlete.meetTimes || []).find(t => t.event === key)?.time
    return timeStr ? parseTime(timeStr) : null
  })

  function cutFor(tier, event) {
    if (['B','BB','A','AA','AAA','AAAA'].includes(tier)) {
      const stds = eventStandards({ age, gender, course, event })
      return stds?.[tier] ?? null
    }
    const tierMap = { FUTURES: 'FUTURES', SECTIONALS: 'SECTIONALS', JR_NATS: 'JR_NATS', NATIONALS: 'NATIONALS' }
    return championshipCut({
      tier: tierMap[tier],
      gender,
      course,
      event,
      ageBucket: ageBucket(age),
    })
  }

  // -----------------------------------------------------------------
  // PER-SPOKE REACH — 0..1 along the tier ladder.
  // -----------------------------------------------------------------
  // Reach computes "where on the ladder is this athlete's best time?" by
  // finding the highest tier achieved and interpolating proximity to the
  // next tier.
  //
  // Then a √ curve is applied so that mid-ladder reach (AAAA-ish) reads as
  // mid-to-long visually, not stubby-short. Elite tiers still have
  // headroom at the top.
  const reachBySpoke = spokes.map((spoke, si) => {
    const best = bestBySpoke[si]
    if (best == null) return 0

    let highestAchievedIdx = -1
    for (let t = 0; t < BLOOM_TIERS.length; t++) {
      const cut = cutFor(BLOOM_TIERS[t], spoke.event)
      if (cut != null && best <= cut) highestAchievedIdx = t
    }

    let raw
    if (highestAchievedIdx === -1) {
      const bCut = cutFor('B', spoke.event)
      if (bCut == null) return 0
      const floor = bCut * 1.25
      if (best >= floor) return 0
      raw = Math.max(0, 1 - (best - bCut) / (floor - bCut)) * (1 / 9) * 0.6
    } else if (highestAchievedIdx === BLOOM_TIERS.length - 1) {
      raw = 1
    } else {
      const achCut = cutFor(BLOOM_TIERS[highestAchievedIdx], spoke.event)
      const nextCut = cutFor(BLOOM_TIERS[highestAchievedIdx + 1], spoke.event)
      if (achCut == null || nextCut == null) {
        raw = highestAchievedIdx / (BLOOM_TIERS.length - 1)
      } else {
        const prox = Math.max(0, Math.min(1, (achCut - best) / (achCut - nextCut)))
        const base = highestAchievedIdx / (BLOOM_TIERS.length - 1)
        const step = 1 / (BLOOM_TIERS.length - 1)
        raw = base + prox * step
      }
    }

    // √ curve: 0.25 → 0.5, 0.55 → 0.74, 0.8 → 0.89. Mid-ladder reads big.
    return Math.sqrt(Math.max(0, Math.min(1, raw)))
  })

  // -----------------------------------------------------------------
  // SVG LAYOUT — bigger canvas, outer label margin
  // -----------------------------------------------------------------
  const size = 520                // was 440
  const cx = size / 2
  const cy = size / 2
  const innerR = 12
  const outerR = 180              // reach radius for the bloom itself
  const distLabelR = outerR + 18  // distance numbers
  const familyLabelR = outerR + 62 // family labels outside everything

  // -----------------------------------------------------------------
  // HEAT PALETTE — reach position → color
  // -----------------------------------------------------------------
  function heatAt(tierPos) {
    const stops = [
      { p: 0.00, c: [110, 185, 220] },
      { p: 0.20, c: [130, 205, 175] },
      { p: 0.40, c: [235, 225, 120] },
      { p: 0.60, c: [250, 175, 75]  },
      { p: 0.80, c: [240, 110, 55]  },
      { p: 1.00, c: [220, 60, 55]   },
    ]
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i], b = stops[i+1]
      if (tierPos >= a.p && tierPos <= b.p) {
        const t = (tierPos - a.p) / (b.p - a.p)
        const r = Math.round(a.c[0] + t * (b.c[0] - a.c[0]))
        const g = Math.round(a.c[1] + t * (b.c[1] - a.c[1]))
        const bl = Math.round(a.c[2] + t * (b.c[2] - a.c[2]))
        return `rgb(${r},${g},${bl})`
      }
    }
    return 'rgb(220,60,55)'
  }

  // -----------------------------------------------------------------
  // PETAL SHAPE — bell-curve silhouettes, no straight radial edges
  // -----------------------------------------------------------------
  // Hard edges on wedges produce visible spoke-lines radiating from the
  // center even after blur. The solution: draw each petal as a bell
  // shape — narrow at the base, widest at mid-radius, narrow at the tip.
  // Adjacent petals curve into each other instead of sharing flat sides.
  //
  // Each petal is sampled as a series of points along its radius:
  // at each step, the petal's half-width follows a bell curve
  // (sine-shaped) so the silhouette is organic, not pie-sliced.
  function wedgeShape(a0, a1, reach) {
    const rMax = innerR + reach * (outerR - innerR)
    const aMid = (a0 + a1) / 2
    const halfSlice = (a1 - a0) / 2
    // Max petal half-width (angular) — expanded so adjacent petals overlap
    const maxHalfWidth = halfSlice * 1.8

    // Sample the petal outline — N points along the LEFT edge going out,
    // then N points along the RIGHT edge coming back. Half-width at each
    // radial position follows a sine bell: narrow at base + tip, wide
    // at mid.
    const STEPS = 18
    const leftPts = []
    const rightPts = []
    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS                     // 0 at base, 1 at tip
      const r = innerR + t * (rMax - innerR)  // current radius
      // sin(πt) bell curve: 0 at t=0, peak at t=0.5, 0 at t=1
      const bell = Math.sin(t * Math.PI)
      const halfW = maxHalfWidth * bell
      const aLeft = aMid - halfW
      const aRight = aMid + halfW
      leftPts.push([cx + r * Math.cos(aLeft), cy + r * Math.sin(aLeft)])
      rightPts.push([cx + r * Math.cos(aRight), cy + r * Math.sin(aRight)])
    }
    // Build path: start at base-left, go out along left edge to tip,
    // come back along right edge.
    const parts = []
    parts.push(`M ${leftPts[0][0]} ${leftPts[0][1]}`)
    for (let i = 1; i <= STEPS; i++) {
      parts.push(`L ${leftPts[i][0]} ${leftPts[i][1]}`)
    }
    for (let i = STEPS; i >= 0; i--) {
      parts.push(`L ${rightPts[i][0]} ${rightPts[i][1]}`)
    }
    parts.push('Z')
    return parts.join(' ')
  }

  return (
    <div className="bloom-circle">
      <div className="bloom-label">{label}</div>
      <svg viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Heavy blur filter for the halo layer — creates the soft
              atmospheric glow that bleeds between neighbors. */}
          <filter
            id={`bloom-blur-${course}`}
            x="-15%" y="-15%" width="130%" height="130%"
          >
            <feGaussianBlur stdDeviation="9" />
          </filter>
          {/* Subtle blur for the core layer — softens petal edges without
              dissolving them. Keeps color vibrant. */}
          <filter
            id={`bloom-core-blur-${course}`}
            x="-5%" y="-5%" width="110%" height="110%"
          >
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>

        {/* Family-sector separators — dim guide lines at each 72° boundary */}
        <g stroke="rgba(120,125,135,0.06)" strokeWidth="1">
          {strokeBoundaries.map((b, i) => {
            const a = b.startAngle
            return (
              <line
                key={i}
                x1={cx + innerR * Math.cos(a)}
                y1={cy + innerR * Math.sin(a)}
                x2={cx + outerR * Math.cos(a)}
                y2={cy + outerR * Math.sin(a)}
              />
            )
          })}
        </g>

        {/* Faint guide rings */}
        <g fill="none" stroke="rgba(120,125,135,0.07)" strokeWidth="1">
          <circle cx={cx} cy={cy} r={innerR + (outerR - innerR) * 0.55} />
          <circle cx={cx} cy={cy} r={innerR + (outerR - innerR) * 0.77} />
          <circle cx={cx} cy={cy} r={outerR} />
        </g>

        {/* HALO LAYER — heavily blurred, low opacity. Sits underneath
            and provides the soft color bleed/glow between neighbors.
            Does the "clouds" work. */}
        <g filter={`url(#bloom-blur-${course})`} opacity="0.55">
          {spokes.map((spoke, si) => {
            const reach = reachBySpoke[si]
            if (reach < 0.03) return null
            return (
              <path
                key={si}
                d={wedgeShape(spoke.a0, spoke.a1, reach)}
                fill={heatAt(reach)}
                stroke="none"
              />
            )
          })}
        </g>

        {/* CORE LAYER — barely blurred, full color. Sits on top and
            provides the visible, vibrant shape. This is what makes the
            bloom feel alive instead of frosted-glass. */}
        <g filter={`url(#bloom-core-blur-${course})`} opacity="0.95">
          {spokes.map((spoke, si) => {
            const reach = reachBySpoke[si]
            if (reach < 0.03) return null
            return (
              <path
                key={si}
                d={wedgeShape(spoke.a0, spoke.a1, reach)}
                fill={heatAt(reach)}
                stroke="none"
              />
            )
          })}
        </g>

        {/* Center dot — drawn AFTER everything so the center stays crisp */}
        <circle cx={cx} cy={cy} r={innerR * 0.5} fill="#0a0a0b" />

        {/* Distance labels at each spoke — positioned just outside outerR */}
        <g fontFamily="SF Mono, ui-monospace, monospace" fontSize="9" fontWeight="500" fill="rgba(180,180,185,0.7)">
          {spokes.map((spoke, si) => {
            const a = spoke.aMid
            const x = cx + distLabelR * Math.cos(a)
            const y = cy + distLabelR * Math.sin(a)
            return (
              <text
                key={si}
                x={x} y={y}
                textAnchor="middle" dominantBaseline="middle"
              >
                {spoke.label}
              </text>
            )
          })}
        </g>

        {/* Stroke family labels — positioned well outside the distance
            labels so nothing overlaps */}
        <g fontFamily="-apple-system, sans-serif" fontSize="11" fontWeight="700" fill="#D4A853" letterSpacing="0.14em">
          {strokeBoundaries.map(b => {
            const a = b.midAngle
            const x = cx + familyLabelR * Math.cos(a)
            const y = cy + familyLabelR * Math.sin(a)
            return (
              <text
                key={b.family}
                x={x} y={y}
                textAnchor="middle" dominantBaseline="middle"
              >
                {b.family}
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
