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

import { useState, useMemo, useEffect, useRef } from 'react'
import FamilyNav from './FamilyNav.jsx'
import FamilyFooter from './FamilyFooter.jsx'
import { fullName } from '../data/athletes.js'
import {
  parseTime,
  formatTime,
  formatDelta,
  pickNextCut,
  topNextCuts,
  nextStandard,
  eventPowerRankings,
  timesTableRow,
  eventStandards,
  classifyTime,
  ageUpProjection,
  STROKE_FAMILIES,
  strokeDistances,
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

const ROMAN = ['','I','II','III','IV','V','VI','VII','VIII','IX','X']
const toRoman = (n) => ROMAN[parseInt(n)] || String(n)

export default function FamilyProfile({ athlete, onBack, onNavigate }) {
  const [courseTimesGoals, setCourseTimesGoals] = useState('SCY')
  const [courseChampionship, setCourseChampionship] = useState('SCY')
  const [courseAgeUp, setCourseAgeUp] = useState('SCY')
  const [courseRankings, setCourseRankings] = useState('SCY')

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

  // Top 3 events closest to next cut — for rotating Chasing Next card
  const topCuts = useMemo(() => topNextCuts({
    age: effectiveAge,
    gender,
    course: courseTimesGoals,
    meetTimes: athlete.meetTimes || [],
    n: 3,
  }), [effectiveAge, gender, courseTimesGoals, athlete.meetTimes])

  // Keep pickNextCut for any legacy usage
  const nextCut = topCuts[0] || null

  // Event power rankings
  const rankings = useMemo(() => eventPowerRankings({
    age: effectiveAge,
    gender,
    course: courseRankings,
    meetTimes: athlete.meetTimes || [],
  }), [effectiveAge, gender, courseRankings, athlete.meetTimes])

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
          {athlete.programType && (
            <div className="program-badge-wrap">
              <span className={`program-badge program-badge-${(athlete.programType || '').split(' ')[0].toLowerCase()}`}>
                {athlete.programType}{athlete.programLevel ? ` · ${toRoman(athlete.programLevel)}` : ''}
              </span>
            </div>
          )}
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
        <NextCutCard cuts={topCuts} />

        {/* ============ TIMES & GOALS ============ */}
        <section>
          <div className="section-header-row">
            <h2 className="section-title">Times & Goals</h2>
            <div className="section-pill-toggle">
              <button className={courseTimesGoals === 'SCY' ? 'active' : ''} onClick={() => setCourseTimesGoals('SCY')}>SCY</button>
              <button className={courseTimesGoals === 'LCM' ? 'active' : ''} onClick={() => setCourseTimesGoals('LCM')}>LCM</button>
            </div>
          </div>
          <p className="section-lede">
            Personal bests against USA Swimming motivational time standards.
            <strong> Current</strong> shows the cut level {athlete.first}'s best time earns today.
            <strong> Next</strong> is the cut level we're chasing.
            The <strong>gaps</strong> are how far {athlete.first}'s best time still needs to drop
            to hit the next cut and the goal time.
          </p>
          <ColorLegend />
          <TimesTable
            age={effectiveAge}
            gender={gender}
            course={courseTimesGoals}
            bestTimes={bestTimes}
            goalTimes={goalTimes}
          />

          {/* Championship Standards sits directly under main Times & Goals —
              same mental model (current time vs standards), just harder tiers.
              Toggle-gated: only visible for athletes close to or pushing
              these levels. */}
          {athlete.showChampionshipCuts && (
            <div className="championship-standards-block">
              <div className="section-header-row">
                <div className="cs-heading">Championship Standards</div>
                <div className="section-pill-toggle">
                  <button className={courseChampionship === 'SCY' ? 'active' : ''} onClick={() => setCourseChampionship('SCY')}>SCY</button>
                  <button className={courseChampionship === 'LCM' ? 'active' : ''} onClick={() => setCourseChampionship('LCM')}>LCM</button>
                </div>
              </div>
              <p className="cs-lede">
                {effectiveAge <= 14 ? (
                  <>
                    The pathway beyond USA Swimming motivationals.
                    <strong> Sectionals</strong> ·
                    <strong> Futures</strong> · <strong>Pro Swim</strong> ·
                    <strong> Jr Nats</strong> · <strong>Nationals</strong>.
                  </>
                ) : (
                  <>
                    The national pathway beyond USA Swimming motivationals.
                    <strong> Sectionals</strong> · <strong>Futures</strong> ·
                    <strong> Pro Swim</strong> · <strong>Jr Nats</strong> · <strong>Nationals</strong>.
                  </>
                )}
              </p>
              <ChampionshipTable
                age={effectiveAge}
                gender={gender}
                course={courseChampionship}
                bestTimes={bestTimes}
              />
            </div>
          )}

          <AgeUpPreview
            age={effectiveAge}
            gender={gender}
            course={courseAgeUp}
            setCourse={setCourseAgeUp}
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
          <div className="section-header-row">
            <h2 className="section-title">Event Power Rankings</h2>
            <div className="section-pill-toggle">
              <button className={courseRankings === 'SCY' ? 'active' : ''} onClick={() => setCourseRankings('SCY')}>SCY</button>
              <button className={courseRankings === 'LCM' ? 'active' : ''} onClick={() => setCourseRankings('LCM')}>LCM</button>
            </div>
          </div>
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

const LEVELS_ORDER = ['B','BB','A','AA','AAA','AAAA']

function NextCutCard({ cuts }) {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!cuts || cuts.length <= 1 || paused) return
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % cuts.length)
        setVisible(true)
      }, 1200)
    }, 5000)
    return () => clearInterval(timer)
  }, [cuts, paused])

  if (!cuts || !cuts.length) {
    return (
      <section>
        <div className="next-cut empty">
          <div className="label">Chasing Next</div>
          <div className="chase">No times on file yet — enter meet times to see cuts.</div>
        </div>
      </section>
    )
  }

  const cut = cuts[idx]

  // Tick positions + fill pct — both on the same B→AAAA time scale
  const tickPositions = (() => {
    if (!cut.hasAOrBetter || !cut.stds) return null
    const levels = LEVELS_ORDER.filter(l => cut.stds[l] != null)
    if (levels.length < 2) return null
    const slowest = cut.stds[levels[0]]             // B — slowest (highest seconds)
    const fastest = cut.stds[levels[levels.length - 1]] // AAAA — fastest
    const range = slowest - fastest
    if (range === 0) return null
    return levels.map(l => ({
      level: l,
      pos: ((slowest - cut.stds[l]) / range) * 100,
      achieved: LEVELS_ORDER.indexOf(l) <= LEVELS_ORDER.indexOf(cut.currentLevel),
      isNext: l === cut.next.level,
    }))
  })()

  // Fill pct: athlete's time mapped onto same B→AAAA scale as ticks
  // This ensures the fill head sits correctly relative to the tick marks
  const pct = (() => {
    if (cut.hasAOrBetter && tickPositions && cut.stds) {
      const levels = LEVELS_ORDER.filter(l => cut.stds[l] != null)
      const slowest = cut.stds[levels[0]]
      const fastest = cut.stds[levels[levels.length - 1]]
      const range = slowest - fastest
      if (range === 0) return 0
      return Math.min(99, Math.max(0, ((slowest - cut.timeSec) / range) * 100))
    }
    // Simple bar: pct between previous and next cut
    return Math.min(99, cut.next.pct)
  })()

  return (
    <section>
      <div
        className="next-cut-v2"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className={`nc-inner ${visible ? 'nc-visible' : 'nc-hidden'}`}>
          <div className="nc-top">
            <div>
              <div className="label">Chasing Next</div>
              <div className="nc-event">{cut.event}</div>
              <div className="nc-standard">
                {cut.currentLevel && <span className={`std ${cut.currentLevel}`}>{cut.currentLevel}</span>}
                <span className="nc-arrow">→</span>
                <span className={`std ${cut.next.level}`}>{cut.next.level}</span>
              </div>
              <div className="nc-sub">
                Current {formatTime(cut.timeSec)} · Cut {formatTime(cut.next.cutoff)}
              </div>
            </div>
            <div className="nc-right">
              <div className="nc-gap">−{cut.next.gap.toFixed(2)}<span>s</span></div>
              <div className="nc-gap-label">to cut</div>
            </div>
          </div>

          {/* BAR — conditional on hasAOrBetter */}
          {cut.hasAOrBetter && tickPositions ? (
            // Option A — ticked bar with standard labels
            <div className="nc-bar-wrap">
              <div className="nc-ticks-above">
                {tickPositions.map(t => (
                  <div
                    key={t.level}
                    className={`nc-tick-mark ${t.isNext ? 'next' : ''} ${t.achieved ? 'achieved' : ''}`}
                    style={{ left: `${t.pos}%` }}
                  />
                ))}
              </div>
              <div className="nc-bar-track">
                <div className="nc-bar-fill" style={{ width: `${pct}%` }}>
                  <div className="nc-pct-label">{cut.next.pct.toFixed(1)}%</div>
                </div>
                {tickPositions.map(t => (
                  <div
                    key={t.level}
                    className="nc-bar-tick"
                    style={{ left: `${t.pos}%` }}
                  />
                ))}
              </div>
              <div className="nc-tick-labels">
                {tickPositions.map(t => (
                  <div
                    key={t.level}
                    className={`nc-tick-label ${t.isNext ? 'next' : ''} ${t.achieved ? 'achieved' : ''}`}
                    style={{ left: `${t.pos}%` }}
                  >
                    {t.level}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Simple bar — below A
            <div className="nc-bar-wrap">
              <div className="nc-bar-track">
                <div className="nc-bar-fill" style={{ width: `${pct}%` }}>
                  <div className="nc-pct-label">{cut.next.pct.toFixed(1)}%</div>
                </div>
              </div>
              <div className="nc-bar-scale">
                <span>Previous cut</span>
                <span>{cut.next.level} cut</span>
              </div>
            </div>
          )}
        </div>

        {/* Dots */}
        {cuts.length > 1 && (
          <div className="nc-dots">
            {cuts.map((_, i) => (
              <div
                key={i}
                className={`nc-dot ${i === idx ? 'active' : ''}`}
                onClick={() => { setVisible(false); setTimeout(() => { setIdx(i); setVisible(true) }, 1200) }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function TimesTable({ age, gender, course, bestTimes, goalTimes }) {
  const bucket = ageBucket(age)
  return (
    <div className="times-table times-table-no-tags">
      <div className="times-row header">
        <div>Event</div>
        <div>Best</div>
        <div>Goal</div>
        <div>Current</div>
        <div>Next</div>
        <div>Gap to Goal</div>
        <div>TX TAGs</div>
      </div>

      {STROKE_FAMILIES.map(fam => (
        <div key={fam.label}>
          <div className="stroke-family-label">{fam.label}</div>
          {strokeDistances(fam, course).map(dist => {
            const baseEvent = `${dist} ${fam.stroke}`
            const eventKey = `${baseEvent} ${course}`
            const best = bestTimes[eventKey]
            const goal = goalTimes[eventKey]
            const row = timesTableRow({
              age, gender, course, event: baseEvent,
              bestTime: best, goalTime: goal,
            })

            // TX TAGs
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
                {/* Next — combined: standard badge + gap seconds + % */}
                <div className={`delta mono delta-${row.colorToNext || 'neutral'}`} style={{display:'flex', flexDirection:'column', gap:'2px', alignItems:'flex-start'}}>
                  {row.nextLevel
                    ? <span className={`std ${row.nextLevel}`}>{row.nextLevel}</span>
                    : <span className="std none">—</span>}
                  {row.deltaToNext != null && (
                    <span>
                      {formatDelta(-row.deltaToNext)}
                      {row.pctToNext != null && (
                        <span className="delta-pct">{row.pctToNext.toFixed(1)}%</span>
                      )}
                    </span>
                  )}
                </div>
                {/* Gap to Goal */}
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
                {/* TX TAGs */}
                <div className="tags-cell">
                  {tagsGap?.achieved ? (
                    <span className="hit-pill">✓ Hit</span>
                  ) : tagsGap ? (
                    <div className={`stacked-gap delta-${tagsGap.color || 'neutral'}`}>
                      <div className="stacked-cut mono">{formatTime(tagsCut)}</div>
                      <div className="stacked-delta-row">
                        <div className="stacked-delta mono">−{tagsGap.deltaSec.toFixed(2)}</div>
                        <div className="stacked-pct">{tagsGap.pctOff.toFixed(1)}%</div>
                      </div>
                    </div>
                  ) : (
                    <span className="std none">—</span>
                  )}
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
  const tiers = CHAMPIONSHIP_TIERS

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
              <span className="ca-family-count">
                {strokeDistances(fam, course).filter(dist => {
                  const baseEvent = `${dist} ${fam.stroke}`
                  return tiers.some(tier => championshipCut({ tier, gender, course, event: baseEvent, ageBucket: bucket }) != null)
                }).length} events
              </span>
            </button>

            {isOpen && (
              <div className="ca-family-body">
                {/* Repeat column headers inside each expanded section so
                    you always know what column is what when scrolled down */}
                <div
                  className="ca-sub-header"
                  style={{ gridTemplateColumns: `70px 1fr ${'1.2fr '.repeat(tiers.length).trim()}` }}
                >
                  <div>Event</div>
                  <div>Best</div>
                  {tiers.map(tier => (
                    <div key={tier}>{CHAMPIONSHIP_TIER_LABELS[tier]}</div>
                  ))}
                </div>
                {strokeDistances(fam, course).map(dist => {
                  const baseEvent = `${dist} ${fam.stroke}`
                  const eventKey = `${baseEvent} ${course}`
                  const best = bestTimes[eventKey]
                  const bestSec = best ? parseTime(best) : null

                  // Skip events with no cuts in any tier (e.g. 100 IM)
                  const hasAnyCut = tiers.some(tier => championshipCut({ tier, gender, course, event: baseEvent, ageBucket: bucket }) != null)
                  if (!hasAnyCut) return null

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
                            {cut == null ? (
                              <span className="std none">—</span>
                            ) : gap?.achieved ? (
                              <span className="hit-pill">✓ Hit</span>
                            ) : (
                              <div className={`stacked-gap delta-${gap?.color || 'neutral'}`}>
                                <div className="stacked-cut mono">{formatTime(cut)}</div>
                                {gap && (
                                  <div className="stacked-delta-row">
                                    <div className="stacked-delta mono">−{gap.deltaSec.toFixed(2)}</div>
                                    <div className="stacked-pct">{gap.pctOff.toFixed(1)}%</div>
                                  </div>
                                )}
                              </div>
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

function AgeUpPreview({ age, gender, course, setCourse, primaryEvents, bestTimes }) {
  // Unified grid — every event gets the same treatment. No accordion,
  // no "primary events get a different layout" split. Dense 6-per-row
  // so the family can scan every event at once without scrolling.
  // Order: strictly by stroke family (Free / Fly / Back / Breast / IM),
  // short distance to long within each family. Primary events are NOT
  // reordered to the front — keeps the grid readable and predictable.
  const allEvents = []
  for (const fam of STROKE_FAMILIES) {
    for (const dist of strokeDistances(fam, course)) {
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
    // Check if event exists in next age group
    const nextAge = nextAgeBucket === '9-10' ? 9
      : nextAgeBucket === '11-12' ? 11
      : nextAgeBucket === '13-14' ? 13
      : nextAgeBucket === '15-16' ? 15
      : nextAgeBucket === '17-18' ? 17
      : null
    const nextStds = nextAge != null ? eventStandards({ age: nextAge, gender, course, event: ev }) : null
    const existsInNextGroup = nextStds != null

    // Back-of-card: projected level in next age group + next two steps up
    // Shows where they land and what it takes to climb from there
    let backSteps = []
    if (nextStds && timeSec != null) {
      const projectedLevelInNext = classifyTime(timeSec, nextStds)
      // Find the next two standards above projectedLevel
      const LEVELS = ['B','BB','A','AA','AAA','AAAA']
      const projIdx = projectedLevelInNext ? LEVELS.indexOf(projectedLevelInNext) : -1
      const stepsAbove = LEVELS.slice(projIdx + 1, projIdx + 3)
      backSteps = stepsAbove.map(level => {
        const cut = nextStds[level]
        if (cut == null) return null
        const gap = gapToCut(timeSec, cut)
        return { level, cut, gap }
      }).filter(Boolean)
    }

    return { ev, timeSec, currentLevel, projLevel, existsInNextGroup, nextStds, backSteps }
  }

  // Only show events that exist in the next age group
  const displayEvents = allEvents.filter(ev => project(ev).existsInNextGroup)

  return (
    <div className="age-up">
      <div className="section-header-row">
        <div>
          <div className="caption">Age-Up Preview</div>
          <div className="title">
            Current times in the next age group
            <span className="age-pill">{nextAgeBucket}</span>
          </div>
        </div>
        <div className="section-pill-toggle">
          <button className={course === 'SCY' ? 'active' : ''} onClick={() => setCourse('SCY')}>SCY</button>
          <button className={course === 'LCM' ? 'active' : ''} onClick={() => setCourse('LCM')}>LCM</button>
        </div>
      </div>

      {/* Unified grid — 6 cards per row, events that exist in next age group only */}
      <div className="age-up-grid">
        {displayEvents.map(ev => (
          <AgeUpCard key={ev} data={project(ev)} />
        ))}
      </div>
    </div>
  )
}

function AgeUpCard({ data }) {
  const { ev, timeSec, currentLevel, projLevel, backSteps } = data

  // Color rule for gap: same as Times & Goals
  const gapColor = (pct) => {
    if (pct == null) return 'neutral'
    if (pct <= 2) return 'green'
    if (pct <= 3.5) return 'yellow'
    return 'red'
  }

  // Short event name for card (just the distance + stroke abbreviation)
  const shortEv = ev.replace('Free','Fr').replace('Butterfly','Fly').replace('Backstroke','Bk').replace('Breaststroke','Br').replace('Individual Medley','IM')

  return (
    <div className="au-card-wrap">
      <div className="au-card-inner">
        {/* FRONT */}
        <div className="au-front">
          <div className="au-ev">{shortEv}</div>
          <div className="au-time mono">{timeSec != null ? formatTime(timeSec) : '—'}</div>
          <div className="au-stds">
            <span className={`std ${currentLevel || 'none'}`}>{currentLevel || '—'}</span>
            <span className="au-arrow">→</span>
            <span className={`std ${projLevel || 'none'}`}>{projLevel || '—'}</span>
          </div>
        </div>
        {/* BACK */}
        <div className="au-back">
          <div className="au-back-top">
            <span className="au-back-time mono">{timeSec != null ? formatTime(timeSec) : '—'}</span>
            <span className={`std ${projLevel || 'none'}`}>{projLevel || '—'}</span>
          </div>
          <div className="au-back-steps">
            {backSteps.length ? backSteps.map(step => (
              <div key={step.level} className="au-back-row">
                <span className={`std ${step.level}`}>{step.level}</span>
                <div>
                  <span className="au-back-cut mono">{formatTime(step.cut)}</span>
                  {step.gap && !step.gap.achieved && (
                    <span className={`au-back-gap delta-${gapColor(step.gap.pctOff)}`}>
                      −{step.gap.deltaSec.toFixed(2)}s · {step.gap.pctOff.toFixed(1)}%
                    </span>
                  )}
                  {step.gap?.achieved && <span className="hit-pill">✓ Hit</span>}
                </div>
              </div>
            )) : (
              <div className="au-back-row" style={{color:'#475569', fontSize:'11px'}}>At top standard</div>
            )}
          </div>
        </div>
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
  const hasEnoughPoints = points.length >= 2

  // NOTE: If there aren't enough points we render the header + selector
  // but skip the chart. This lets the user pick a different event without
  // refreshing. (Previous version bailed out of the whole component with
  // an empty-state, which froze the page when switching from a rich event
  // to a sparse one — event selector disappeared, no way back without a
  // page refresh.)

  // Plot dims
  const W = 700, H = 300
  const padL = 64, padR = 28, padT = 28, padB = 52
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  // All the chart math depends on having >= 2 points. Guard it so we don't
  // divide by zero or build a broken path when an event only has 1 swim.
  let xScale, yScale, pathD, yTicks, pointsWithPRFlag, firstPt, lastPt, midPt,
      dropSec = 0, dropPct = 0, fmtAxisDate,
      solidSegments = [], dashSegments = []

  if (hasEnoughPoints) {
    // Axes domain
    const dates = points.map(p => p.date.getTime())
    const times = points.map(p => p.time)
    const xMin = Math.min(...dates)
    const xMax = Math.max(...dates)
    const yMin = Math.min(...times)
    const yMax = Math.max(...times)
    const yPad = (yMax - yMin) * 0.15 || 1
    const yDomainMin = yMin - yPad
    const yDomainMax = yMax + yPad

    xScale = (d) => padL + ((d - xMin) / (xMax - xMin || 1)) * plotW
    // Inverted y — fast at top, slow at bottom makes no sense for progression.
    // Convention here: fast at top (lower time = higher on chart)
    yScale = (t) => padT + ((yDomainMax - t) / (yDomainMax - yDomainMin)) * plotH

    // Tiny right margin so the last dot + label aren't flush against the edge.
    // 1.5% of span, capped at 2 weeks — the old 5% left a full month+ of
    // dead empty space on long-span events like Jon's 100 Free LCM.
    const MS_2_WEEKS = 1000 * 60 * 60 * 24 * 14
    const xSpanPad = Math.min((xMax - xMin) * 0.015, MS_2_WEEKS) || MS_2_WEEKS
    xScale = (d) => padL + ((d - xMin) / ((xMax + xSpanPad) - xMin || 1)) * plotW

    // Full path used for animation length measurement and area fill.
    pathD = points.map((p, i) =>
      `${i === 0 ? 'M' : 'L'} ${xScale(p.date.getTime()).toFixed(1)} ${yScale(p.time).toFixed(1)}`
    ).join(' ')

    // Single continuous line — no solid/dashed split
    solidSegments = [pathD]

    // Y-axis ticks — 4 evenly spaced
    yTicks = [0, 1, 2, 3].map(i => {
      const t = yDomainMin + (i / 3) * (yDomainMax - yDomainMin)
      return { y: yScale(t), label: formatTime(t) }
    })

    // Identify PRs (running min) — these are the candidate labeled points.
    // Then apply a de-clutter pass: if two PR labels would sit on top of
    // each other horizontally, keep only the most recent one (fastest).
    // 60px minimum — a time label like "1:05.82" is ~50px wide at 12px.
    let runningMin = Infinity
    pointsWithPRFlag = points.map(p => {
      const isPR = p.time < runningMin
      if (isPR) runningMin = p.time
      return { ...p, isPR, labelPR: isPR }
    })

    const MIN_LABEL_X_GAP = 60 // px
    const prIndices = pointsWithPRFlag
      .map((p, i) => ({ i, x: xScale(p.date.getTime()) }))
      .filter(({ i }) => pointsWithPRFlag[i].isPR)

    // Right-to-left: keep the final PR (hero) always, then suppress any
    // earlier PR whose label would land within MIN_LABEL_X_GAP of the
    // one we just decided to keep.
    let lastKeptX = Infinity
    for (let j = prIndices.length - 1; j >= 0; j--) {
      const { i, x } = prIndices[j]
      if (lastKeptX - x < MIN_LABEL_X_GAP) {
        pointsWithPRFlag[i].labelPR = false
      } else {
        lastKeptX = x
      }
    }

    // Drop first point → last point
    firstPt = points[0]
    lastPt = points[points.length - 1]
    midPt = points[Math.floor(points.length / 2)]
    dropSec = firstPt.time - lastPt.time
    dropPct = (dropSec / firstPt.time) * 100

    // Date axis: full month + 4-digit year, never the ambiguous 2-digit.
    fmtAxisDate = d => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

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
        {hasEnoughPoints && (
          <div className="pc-summary">
            <span className="pc-drop-label">Drop over span:</span>
            <span className="pc-drop-val mono">
              {dropSec > 0 ? '−' : '+'}{Math.abs(dropSec).toFixed(2)}s
            </span>
            <span className="pc-drop-pct">
              ({dropPct > 0 ? '−' : '+'}{Math.abs(dropPct).toFixed(1)}%)
            </span>
          </div>
        )}
      </div>

      {hasEnoughPoints ? (
        <AnimatedProgressionChart
          W={W} H={H}
          padL={padL} padR={padR} padT={padT} padB={padB}
          yTicks={yTicks}
          firstPt={firstPt}
          lastPt={lastPt}
          midPt={midPt}
          xScale={xScale}
          yScale={yScale}
          pathD={pathD}
          pointsWithPRFlag={pointsWithPRFlag}
          selectedEvent={selectedEvent}
          fmtAxisDate={fmtAxisDate}
          solidSegments={solidSegments}
          dashSegments={dashSegments}
        />
      ) : (
        <div className="empty-state">
          Need at least 2 dated times for {selectedEvent} to draw progression.
        </div>
      )}
    </div>
  )
}

// ============================================================
// AnimatedProgressionChart — the actual animated SVG.
// ============================================================
// The line draws itself across the chart over ~4 seconds with a
// cubic-bezier ease. As the line passes each data point, the dot
// (and time label, if it's a PR) appears.
//
// PR labels only on personal bests so labels never collide.
// Final PR gets a "CURRENT BEST" caption + a one-time glow pulse.
// Area fill sweeps in BEHIND the line head, locked to the actual
// line position (using getPointAtLength) — never gets ahead.
//
// Animation re-runs whenever selectedEvent changes.
// ============================================================
function AnimatedProgressionChart({
  W, H, padL, padR, padT, padB,
  yTicks, firstPt, lastPt, midPt,
  xScale, yScale, pathD, pointsWithPRFlag,
  selectedEvent, fmtAxisDate,
  solidSegments = [], dashSegments = [],
}) {
  const lineRef     = useRef(null)
  const revealRef   = useRef(null)
  const dotsGroupRef = useRef(null)

  // Identify the LAST PR (the current best) so we can give it the
  // hero treatment — bigger dot, "CURRENT BEST" caption, glow pulse.
  const lastPRIdx = (() => {
    for (let i = pointsWithPRFlag.length - 1; i >= 0; i--) {
      if (pointsWithPRFlag[i].isPR) return i
    }
    return -1
  })()

  // Compute path-distance for each point so we know when the drawing
  // line has passed it. We do this via a hidden <path> ref measurement
  // inside the effect — getPointAtLength + binary search would be more
  // accurate, but cumulative segment length is good enough here and
  // stays in sync with what the SVG actually renders.
  useEffect(() => {
    const lineEl   = lineRef.current
    const revealEl = revealRef.current
    if (!lineEl || !revealEl) return

    const totalLength = lineEl.getTotalLength()
    lineEl.style.strokeDasharray  = String(totalLength)
    lineEl.style.strokeDashoffset = String(totalLength)
    revealEl.setAttribute('width', '0')

    // For each point, find the path-distance at which the line head
    // reaches that point. We walk the line at small increments and
    // track when getPointAtLength is closest to each point's (x, y).
    const pointDists = pointsWithPRFlag.map(p => ({
      x: xScale(p.date.getTime()),
      y: yScale(p.time),
      bestDist: 0,
      bestErr: Infinity,
    }))
    const STEPS = 200
    for (let s = 0; s <= STEPS; s++) {
      const dist = (s / STEPS) * totalLength
      const pt = lineEl.getPointAtLength(dist)
      pointDists.forEach(pd => {
        const err = (pt.x - pd.x) ** 2 + (pt.y - pd.y) ** 2
        if (err < pd.bestErr) {
          pd.bestErr = err
          pd.bestDist = dist
        }
      })
    }

    // Reset all dot/label/caption visibility before starting.
    const allShownEls = dotsGroupRef.current?.querySelectorAll('[data-pidx]') || []
    allShownEls.forEach(el => el.classList.remove('apc-shown'))

    const totalDuration = 4000
    const easing = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    let rafId = null
    const startTime = performance.now()

    function frame(now) {
      const elapsed = now - startTime
      const t = Math.min(elapsed / totalDuration, 1)
      const eased = easing(t)
      const drawnLength = totalLength * eased
      lineEl.style.strokeDashoffset = String(totalLength - drawnLength)

      // Lock the area-fill mask to the actual line head x-position.
      const head = lineEl.getPointAtLength(drawnLength)
      revealEl.setAttribute('width', String(Math.max(0, head.x)))

      // Reveal each dot/label whose path-distance the line has passed.
      pointDists.forEach((pd, i) => {
        if (drawnLength >= pd.bestDist) {
          dotsGroupRef.current?.querySelectorAll(`[data-pidx="${i}"]`)
            .forEach(el => el.classList.add('apc-shown'))
        }
      })

      if (t < 1) rafId = requestAnimationFrame(frame)
    }
    rafId = requestAnimationFrame(frame)
    return () => { if (rafId) cancelAnimationFrame(rafId) }
  }, [selectedEvent, pathD]) // restart whenever event (or path) changes

  return (
    <>
      <style>{`
        .apc-pr-dot, .apc-small-dot, .apc-pr-label, .apc-pr-caption {
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-origin: center;
          transform-box: fill-box;
        }
        .apc-pr-dot, .apc-pr-label, .apc-pr-caption { transform: scale(0.6); }
        .apc-pr-dot.apc-shown, .apc-pr-label.apc-shown, .apc-pr-caption.apc-shown {
          opacity: 1; transform: scale(1);
        }
        .apc-small-dot.apc-shown { opacity: 1; }
        .apc-pr-dot.apc-final { animation: apcHeroPulse 1.8s ease-out 0.3s; }
        @keyframes apcHeroPulse {
          0%   { filter: drop-shadow(0 0 0 rgba(212,168,83,0)); }
          25%  { filter: drop-shadow(0 0 16px rgba(212,168,83,1)); }
          100% { filter: drop-shadow(0 0 0 rgba(212,168,83,0)); }
        }
      `}</style>
      <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="apc-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9C7A2E" />
            <stop offset="100%" stopColor="#FFD89C" />
          </linearGradient>
          <linearGradient id="apc-area-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D4A853" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#D4A853" stopOpacity="0" />
          </linearGradient>
          <filter id="apc-line-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="apc-dot-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id="apc-area-clip">
            <rect ref={revealRef} x="0" y="0" width="0" height={H} />
          </clipPath>
        </defs>

        {/* Y-axis gridlines + labels */}
        <g>
          {yTicks.map((t, i) => (
            <g key={i}>
              <line
                x1={padL} x2={W - padR}
                y1={t.y} y2={t.y}
                stroke="rgba(148,163,184,0.06)"
                strokeWidth="1"
              />
              <text
                x={padL - 10} y={t.y}
                textAnchor="end" dominantBaseline="middle"
                fill="#475569" fontSize="10"
                fontFamily="SF Mono, ui-monospace, monospace"
                style={{ letterSpacing: '0.05em' }}
              >
                {t.label}
              </text>
            </g>
          ))}
        </g>

        {/* X-axis date labels — drop the middle label if it would overlap
            first or last (small time spans with clustered meets). */}
        <g fill="#475569" fontSize="10" fontFamily="-apple-system, sans-serif" style={{ letterSpacing: '0.08em' }}>
          {(() => {
            const xMin = firstPt.date.getTime()
            const xMax = lastPt.date.getTime()
            const spanMs = xMax - xMin
            const spanDays = spanMs / (1000 * 60 * 60 * 24)

            // Pick tick interval based on span
            let intervalMs
            if (spanDays <= 90)       intervalMs = 1000 * 60 * 60 * 24 * 14      // 2 weeks
            else if (spanDays <= 365) intervalMs = 1000 * 60 * 60 * 24 * 60      // 2 months
            else if (spanDays <= 730) intervalMs = 1000 * 60 * 60 * 24 * 120     // 4 months
            else                       intervalMs = 1000 * 60 * 60 * 24 * 180     // 6 months

            // Generate tick dates snapped to month boundaries
            const ticks = []
            const startDate = new Date(xMin)
            startDate.setDate(1) // snap to month start
            let t = startDate.getTime()
            while (t <= xMax + intervalMs) {
              if (t >= xMin - intervalMs / 2) ticks.push(t)
              t += intervalMs
            }

            // Filter: must be within chart range and have enough pixel spacing
            const MIN_GAP = 65
            const filtered = []
            let lastX = -999
            for (const tick of ticks) {
              const x = xScale(Math.max(xMin, Math.min(xMax, tick)))
              if (x - lastX >= MIN_GAP) {
                filtered.push({ t: tick, x })
                lastX = x
              }
            }

            // Always include first and last
            const allLabels = [
              { t: xMin, x: xScale(xMin), anchor: 'start' },
              ...filtered.filter(f => f.x > xScale(xMin) + MIN_GAP && f.x < xScale(xMax) - MIN_GAP).map(f => ({ ...f, anchor: 'middle' })),
              { t: xMax, x: xScale(xMax), anchor: 'end' },
            ]

            return allLabels.map((item, i) => (
              <text
                key={i}
                x={item.x}
                y={H - padB + 22}
                textAnchor={item.anchor}
              >
                {fmtAxisDate(new Date(item.t)).toUpperCase()}
              </text>
            ))
          })()}
        </g>

        {/* Filled area, clipped by the reveal rect so it sweeps in behind the line head */}
        <path
          d={`${pathD} L ${xScale(lastPt.date.getTime())} ${H - padB} L ${xScale(firstPt.date.getTime())} ${H - padB} Z`}
          fill="url(#apc-area-grad)"
          clipPath="url(#apc-area-clip)"
        />

        {/* Hidden full path — used only for getTotalLength() animation measurement.
             Invisible (opacity 0) so it doesn't render, but the ref gives us
             the correct total path length regardless of how we split segments. */}
        <path
          ref={lineRef}
          d={pathD}
          fill="none"
          stroke="none"
          strokeWidth="0"
          opacity="0"
        />

        {/* Visible solid segments — active season swims */}
        {solidSegments.map((d, i) => (
          <path
            key={'s'+i}
            d={d}
            fill="none"
            stroke="url(#apc-line-grad)"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="url(#apc-line-glow)"
            clipPath="url(#apc-area-clip)"
          />
        ))}

        {/* Dots + PR labels + final caption.
            Rules:
            - PR dots: big glowing dot. Label if labelPR===true or it's the final PR.
            - Final PR: hero size (r=7), "CURRENT BEST" caption, pulse animation.
            - Last point overall: always gets a visible dot (r=4) + time label,
              even if it's not a PR. This terminates the line visually so the
              chart never looks like it cut off mid-data. */}
        <g ref={dotsGroupRef}>
          {pointsWithPRFlag.map((p, i) => {
            const cx = xScale(p.date.getTime())
            const cy = yScale(p.time)
            const isFinalPR   = i === lastPRIdx
            const isLastPoint = i === pointsWithPRFlag.length - 1

            // Smart label placement — pick above or below based on
            // neighbors. If nearby points are above this dot (higher y =
            // slower time = lower on chart), place label below. Otherwise above.
            const labelOffset = (() => {
              const prev = i > 0 ? yScale(pointsWithPRFlag[i-1].time) : null
              const next = i < pointsWithPRFlag.length - 1 ? yScale(pointsWithPRFlag[i+1].time) : null
              // Count how many neighbors are above (lower cy = higher on chart = faster)
              let neighborsAbove = 0
              if (prev != null && prev < cy) neighborsAbove++
              if (next != null && next < cy) neighborsAbove++
              // If line comes from above, label goes below. Otherwise above.
              const goBelow = neighborsAbove >= 1
              return goBelow ? 1 : -1  // 1 = below, -1 = above
            })()

            const labelY = (offset, gap) => cy + offset * gap

            if (p.isPR) {
              const showLabel = isFinalPR || p.labelPR
              const gap = isFinalPR ? 20 : 16
              const captionGap = isFinalPR ? 36 : 0
              return (
                <g key={i}>
                  <circle
                    cx={cx} cy={cy}
                    r={isFinalPR ? 7 : 5.5}
                    fill="#FFD89C"
                    stroke="#D4A853"
                    strokeWidth="1.5"
                    filter="url(#apc-dot-glow)"
                    className={`apc-pr-dot${isFinalPR ? ' apc-final' : ''}`}
                    data-pidx={i}
                  />
                  {showLabel && (
                    <text
                      x={cx} y={labelY(labelOffset, gap)}
                      textAnchor="middle"
                      dominantBaseline={labelOffset > 0 ? 'hanging' : 'auto'}
                      fill="#FFD89C"
                      fontSize={isFinalPR ? 15 : 12}
                      fontFamily="SF Mono, ui-monospace, monospace"
                      style={{ letterSpacing: '0.02em' }}
                      className="apc-pr-label"
                      data-pidx={i}
                    >
                      {p.raw}
                    </text>
                  )}
                  {isFinalPR && (
                    <text
                      x={cx} y={labelY(labelOffset, captionGap)}
                      textAnchor="middle"
                      dominantBaseline={labelOffset > 0 ? 'hanging' : 'auto'}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="-apple-system, sans-serif"
                      style={{ letterSpacing: '0.16em' }}
                      className="apc-pr-caption"
                      data-pidx={i}
                    >
                      CURRENT BEST
                    </text>
                  )}
                </g>
              )
            }

            if (isLastPoint) {
              return (
                <g key={i}>
                  <circle
                    cx={cx} cy={cy}
                    r="4"
                    fill="rgba(212,168,83,0.7)"
                    stroke="#D4A853"
                    strokeWidth="1"
                    className="apc-small-dot"
                    data-pidx={i}
                  />
                  <text
                    x={cx} y={labelY(labelOffset, 14)}
                    textAnchor="middle"
                    dominantBaseline={labelOffset > 0 ? 'hanging' : 'auto'}
                    fill="rgba(212,168,83,0.7)"
                    fontSize="11"
                    fontFamily="SF Mono, ui-monospace, monospace"
                    style={{ letterSpacing: '0.02em' }}
                    className="apc-small-dot"
                    data-pidx={i}
                  >
                    {p.raw}
                  </text>
                </g>
              )
            }

            // Regular non-PR, non-last point: small dim dot, no label.
            return (
              <circle
                key={i}
                cx={cx} cy={cy}
                r="2.5"
                fill="rgba(212,168,83,0.5)"
                stroke="transparent"
                strokeWidth="0"
                className="apc-small-dot"
                data-pidx={i}
              />
            )
          })}
        </g>
      </svg>
    </>
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
