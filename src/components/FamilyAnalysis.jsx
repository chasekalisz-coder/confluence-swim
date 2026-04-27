// ============================================================
// FamilyAnalysis.jsx
// ============================================================
// Family-facing Analysis page. Landing point for two tools:
//   1. Meet Analyzer — paste splits, compare to elite template
//   2. Race Pace Calculator — set goal, get target splits
//
// Also lists recent analyses below. Both tools are not yet built as
// interactive flows — this page is the entry point that will launch
// them when they exist. For now the tool cards are placeholders that
// alert on click.
//
// The "Latest Insight" hero is derived from Chasing Next (closest cut)
// so it shows a real, dynamic tidbit rather than a hardcoded sentence.
// ============================================================

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import FamilyNav from './FamilyNav.jsx'
import FamilyFooter from './FamilyFooter.jsx'
import FamilyTabBar from './FamilyTabBar.jsx'
import RacePaceCalculator from './RacePaceCalculator.jsx'
import { getTier } from '../lib/tiers.js'
import { PROGRESSION_DEMO_DATA, CHASE_BEST_TIMES, CHASE_DEMO_AGE, CHASE_DEMO_GENDER, CHASE_DEMO_ATHLETE } from '../data/progression-demo.js'
import {
  TimesTable,
  ChampionshipTable,
  AgeUpPreview,
  ProgressionChart,
  PowerRankingsList,
  SpecialtyBloom,
  ColorLegend,
} from './FamilyProfile.jsx'
import {
  pickNextCut,
  formatTime,
  ageFromDob,
  parseTime,
  eventPowerRankings,
} from '../lib/calculations.js'

export default function FamilyAnalysis({ athlete, onBack, onNavigate, onLogoClick, linkedAthletes, onSwitchAthlete }) {
  // View state: 'index' (default), 'analyzer', 'pace'
  const [view, setView] = useState('index')

  // Course toggles for the mirrored sections moved from Profile (Session 14
  // tier-matrix restructure). Each section has its own toggle so families
  // can compare SCY vs LCM independently per section.
  const [courseTimesGoals, setCourseTimesGoals] = useState('SCY')
  const [courseChampionship, setCourseChampionship] = useState('SCY')
  const [courseAgeUp, setCourseAgeUp] = useState('SCY')
  const [courseRankings, setCourseRankings] = useState('SCY')

  useEffect(() => {
    document.body.classList.add('v2-active')
    return () => { document.body.classList.remove('v2-active') }
  }, [])

  const initials = useMemo(() => {
    if (!athlete) return ''
    const f = (athlete.first || '').charAt(0).toUpperCase()
    const l = (athlete.last || '').charAt(0).toUpperCase()
    return f + l || '??'
  }, [athlete])

  // Gender: admin-only source of truth (falls back to pronouns for legacy records)
  const gender = athlete?.gender
    || (athlete?.pronouns === 'she' ? 'F' : 'M')

  // Auto-aging: use DOB to compute today's age. Same logic as FamilyProfile
  // so the Analysis page stays in sync when an athlete crosses a birthday.
  const effectiveAge = useMemo(() => {
    if (!athlete) return null
    const computed = ageFromDob({ dob: athlete.dob, fallbackAge: athlete.age })
    return computed ?? athlete.age
  }, [athlete?.dob, athlete?.age])

  // Compute the single biggest story we can tell right now
  const nextCut = useMemo(() => {
    if (!athlete) return null
    return pickNextCut({
      age: effectiveAge,
      gender,
      course: 'SCY',
      meetTimes: athlete.meetTimes || [],
    })
  }, [athlete, effectiveAge, gender])

  // Goal times — accept map or array shape (same logic as FamilyProfile)
  const goalTimes = useMemo(() => {
    const raw = athlete?.goalTimes
    if (!raw) return {}
    if (Array.isArray(raw)) {
      const out = {}
      for (const g of raw) {
        if (g?.event && g?.time) out[g.event] = g.time
      }
      return out
    }
    return raw
  }, [athlete?.goalTimes])

  // Best-time lookup keyed by event (same logic as FamilyProfile)
  const bestTimes = useMemo(() => {
    const out = {}
    for (const mt of (athlete?.meetTimes || [])) {
      const sec = parseTime(mt.time)
      if (sec == null) continue
      if (out[mt.event] == null || sec < parseTime(out[mt.event])) {
        out[mt.event] = mt.time
      }
    }
    return out
  }, [athlete?.meetTimes])

  // Event power rankings (moved from Profile)
  const rankings = useMemo(() => {
    if (!athlete) return []
    return eventPowerRankings({
      age: effectiveAge,
      gender,
      course: courseRankings,
      meetTimes: athlete.meetTimes || [],
    })
  }, [athlete, effectiveAge, gender, courseRankings])

  // Past analyses — stored on athlete object if Chase has wired them,
  // otherwise empty state
  const recentAnalyses = athlete?.analyses || []

  if (!athlete) {
    return (
      <div className="v2">
        <FamilyNav active="Performance Analysis" onNavigate={onNavigate} onLogoClick={onLogoClick} currentAthleteId={athlete?.id} linkedAthletes={linkedAthletes} onSwitchAthlete={onSwitchAthlete} />
        <main className="v2-main">
          <div style={{ color:"var(--text-muted)", fontSize:13, padding:"20px 0", lineHeight:1.6 }}>No athlete selected.</div>
        </main>
        <FamilyFooter />
      </div>
    )
  }

  // Tier check for tool-card UI affordances. Used to show/hide the Gold
  // Development badge on Meet Analyzer and the demo-availability hint
  // on the Race Pace card.
  const isGold = !athlete || getTier(athlete) === 'gold'

  // Progression access — Silver and Gold tiers see the athlete's own
  // progression chart with their full event list. Skills and Bronze
  // tiers see a "DEMO · Chase Kalisz" preview using Chase's career
  // LCM data (200 Fly, 200 IM, 400 IM) so they understand what
  // progression tracking looks like at the elite level. Admin (no
  // athlete) defaults to access (treated like Gold).
  const tier = athlete ? getTier(athlete) : 'gold'
  const hasProgressionAccess = tier === 'silver' || tier === 'gold'

  // Range access — Gold only per the tier matrix. Skills/Bronze/Silver
  // see a "DEMO · Chase Kalisz" bloom rendered against Senior/OPEN
  // standards (Chase is 32 → routes to the OPEN age bucket in the
  // standards lookup). Shows what a fully developed Olympic-medalist
  // bloom looks like across all five strokes.
  const hasRangeAccess = tier === 'gold'

  return (
    <div className="v2">
      <FamilyNav active="Performance Analysis" athleteInitials={initials} onNavigate={onNavigate} onLogoClick={onLogoClick} currentAthleteId={athlete?.id} linkedAthletes={linkedAthletes} onSwitchAthlete={onSwitchAthlete} />
      <main className="v2-main">
        {view === 'analyzer' && (
          <MeetAnalyzerTool athlete={athlete} onClose={() => setView('index')} />
        )}
        {view === 'pace' && (
          <RacePaceTool athlete={athlete} onClose={() => setView('index')} />
        )}
        {view === 'index' && (
          <>
        {onBack && <button className="back" onClick={onBack}>← Back to Profile</button>}

        <div className="page-title">Performance Analysis</div>
        <div className="page-sub">
          Performance Analysis lays out the swimming data that defines where {athlete.first} is and where {(() => {
            const p = subjectPronoun(athlete)
            return p === 'they' ? "they're" : `${p}'s`
          })()} headed. Faster swims start with knowing what's underneath them.
        </div>

        {/* ===== Hero insight ===== */}
        {nextCut ? (
          <div className="analysis-hero">
            <div className="ah-tag">Latest Insight</div>
            <div className="ah-title">
              {athlete.first} is <span className="accent">{nextCut.next.gap.toFixed(2)}s</span> from {possessive(athlete)} {nextCut.event} {nextCut.next.level} cut
            </div>
            <div className="ah-sub">
              Current best is {formatTime(nextCut.timeSec)} · Cut is {formatTime(nextCut.next.cutoff)}.
              Open the Meet Analyzer to see exactly where that time lives in {pronounThem(athlete)}'s
              most recent race.
            </div>
          </div>
        ) : (
          <div className="analysis-hero">
            <div className="ah-tag">Latest Insight</div>
            <div className="ah-title">No race data yet</div>
            <div className="ah-sub">
              Once meet times are entered, this card will highlight the biggest opportunity
              {athlete.first} has to close the gap on a new USA Swimming standard.
            </div>
          </div>
        )}

        {/* ===== Times & Goals (mirrored from Profile per Session 14
             tier-matrix restructure — same component, same data, families
             see it on both pages) ===== */}
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
        </section>

        {/* ===== Tool cards ===== */}
        <div className="tools-grid">
          {/* Meet Analyzer is gated until launch — onClick removed, Soon badge
              shown. The MeetAnalyzerTool placeholder remains in the file but
              is no longer reachable. Restore onClick when the tool ships. */}
          <div
            className="tool-card analyzer tool-card-locked"
            aria-disabled="true"
            title="Coming soon"
          >
            <span className="tc-soon-badge">Soon</span>
            <span className="tc-tier-badge">Gold Development</span>
            <div className="icon-ring">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="M7 15l4-4 4 4 6-6" />
              </svg>
            </div>
            <div className="tc-name">Meet Analyzer</div>
            <div className="tc-desc">
              Enter splits from any race and compare them against the elite race template.
              See exactly where time is lost — and what adjustments unlock the next standard.
            </div>
            <div className="tc-meta">
              <span className="status-dot" />
              <span>Coming soon</span>
            </div>
          </div>

          <div
            className="tool-card pace"
            onClick={() => setView('pace')}
          >
            <span className="tc-tier-badge">Gold Development</span>
            <div className="icon-ring">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
            </div>
            <div className="tc-name">Race Pace Calculator</div>
            <div className="tc-desc">
              Set a goal time for any event and see the exact splits {athlete.first} needs to swim.
              Pre-populated with {pronounThem(athlete)}'s goal times, built on elite-level race
              distribution data.
            </div>
            <div className="tc-meta">
              <span className="status-dot" />
              <span>
                {!isGold
                  ? '2 demo runs available every 5 days'
                  : (() => {
                      const paces = (athlete.analyses || []).filter(a => a.tool === 'pace').length
                      if (paces === 0) return 'No race pace history yet'
                      if (paces === 1) return '1 race pace calculated'
                      return `${paces} race paces calculated`
                    })()}
              </span>
            </div>
            <div className="arrow">›</div>
          </div>
        </div>

        {/* ===== Progression chart (moved from Profile) =====
             Silver + Gold tiers see the athlete's own progression with
             the full event list. Skills + Bronze see a "DEMO · Chase
             Kalisz" preview using Chase's career LCM data — gives them
             a feel for what progression looks like at the elite level. */}
        <section>
          <h2 className="section-title">
            Progression
            <span className="section-tier-badge-silver">Silver</span>
            <span className="section-tier-badge">Gold Development</span>
          </h2>
          {hasProgressionAccess ? (
            <>
              <p className="section-lede">
                How {athlete.first}'s times have dropped over past meets. Each line is
                one event. Lower on the chart = faster.
              </p>
              <ProgressionChart
                data={athlete.progression || []}
                athleteName={athlete.first}
              />
            </>
          ) : (
            <>
              <div className="demo-banner">
                <span className="demo-banner-tag">Demo</span>
                <span className="demo-banner-name">Chase Kalisz</span>
                <span className="demo-banner-sub">Olympic medalist career progression — 200 Fly, 200 IM, 400 IM (LCM)</span>
              </div>
              <ProgressionChart
                data={PROGRESSION_DEMO_DATA}
                athleteName="Chase"
              />
            </>
          )}
        </section>

        {/* ===== Event Power Rankings (moved from Profile) ===== */}
        <section>
          <div className="section-header-row">
            <h2 className="section-title">
              Event Power Rankings
              <span className="section-tier-badge-bronze">Bronze</span>
              <span className="section-tier-badge-silver">Silver</span>
              <span className="section-tier-badge">Gold Development</span>
            </h2>
            <div className="section-pill-toggle">
              <button className={courseRankings === 'SCY' ? 'active' : ''} onClick={() => setCourseRankings('SCY')}>SCY</button>
              <button className={courseRankings === 'LCM' ? 'active' : ''} onClick={() => setCourseRankings('LCM')}>LCM</button>
            </div>
          </div>
          <PowerRankingsList
            rankings={rankings}
            age={effectiveAge}
            gender={gender}
            course={courseRankings}
            bestTimes={bestTimes}
          />
        </section>

        {/* ===== Championship Standards (moved from Profile — toggle-gated by
             athlete.showChampionshipCuts the same way it was on Profile) ===== */}
        {athlete.showChampionshipCuts && (
          <section>
            <div className="section-header-row">
              <h2 className="section-title">
                Championship Standards
                <span className="section-tier-badge-bronze">Bronze</span>
                <span className="section-tier-badge-silver">Silver</span>
                <span className="section-tier-badge">Gold Development</span>
              </h2>
              <div className="section-pill-toggle">
                <button className={courseChampionship === 'SCY' ? 'active' : ''} onClick={() => setCourseChampionship('SCY')}>SCY</button>
                <button className={courseChampionship === 'LCM' ? 'active' : ''} onClick={() => setCourseChampionship('LCM')}>LCM</button>
              </div>
            </div>
            <p className="section-lede">
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
          </section>
        )}

        {/* ===== Age-Up Preview (moved from Profile) ===== */}
        <section>
          <AgeUpPreview
            age={effectiveAge}
            gender={gender}
            course={courseAgeUp}
            setCourse={setCourseAgeUp}
            primaryEvents={athlete.events || []}
            bestTimes={bestTimes}
          />
        </section>

        {/* ===== Range / Specialty bloom (moved from Profile) =====
             Gold tier only per matrix. Skills/Bronze/Silver see Chase's
             bloom against OPEN/Senior standards as a demo — shows
             what a fully developed bloom looks like at the top of
             the sport. Same demo-banner pattern as Progression. */}
        <section>
          <h2 className="section-title">
            Range
            <span className="section-tier-badge">Gold Development</span>
          </h2>
          {hasRangeAccess ? (
            <>
              <p className="section-lede">
                The whole swimmer in one look. Each glowing petal is an event,
                grouped by stroke around the circle. Petal length climbs the full
                ladder from B → BB → A → AA → AAA → AAAA, then up through the
                championship cuts (Futures, Sectionals, Jr Nats, Nats). The further
                and hotter a petal, the closer {athlete.first} is to the top.
                Untested events don't glow. SCY on the left, LCM on the right.
              </p>
              <SpecialtyBloom athlete={athlete} age={effectiveAge} gender={gender} bestTimes={bestTimes} />
            </>
          ) : (
            <>
              <div className="demo-banner">
                <span className="demo-banner-tag">Demo</span>
                <span className="demo-banner-name">Chase Kalisz</span>
                <span className="demo-banner-sub">Olympic medalist career bests across all five strokes — measured against Senior/OPEN standards</span>
              </div>
              <p className="section-lede">
                The whole swimmer in one look. Each glowing petal is an event,
                grouped by stroke around the circle. Petal length climbs the full
                ladder from B → BB → A → AA → AAA → AAAA, then up through the
                championship cuts (Futures, Sectionals, Jr Nats, Nats). The further
                and hotter a petal, the closer Chase is to the top.
                Untested events don't glow. SCY on the left, LCM on the right.
              </p>
              <SpecialtyBloom
                athlete={CHASE_DEMO_ATHLETE}
                age={CHASE_DEMO_AGE}
                gender={CHASE_DEMO_GENDER}
                bestTimes={CHASE_BEST_TIMES}
              />
            </>
          )}
        </section>

        {/* ===== Aerobic Development Chart ===== */}
        <AerobicDevelopmentChart athlete={athlete} />

        {/* ===== Recent Analyses ===== */}
        <section>
          <div className="recent-header">
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Recent Analyses
              <span className="section-soon-badge">Soon</span>
              <span className="section-tier-badge">Gold Development</span>
            </h2>
          </div>

          {recentAnalyses.length === 0 ? (
            <div className="empty-state">
              Tool runs will show up here. Each time a race goes through the
              Meet Analyzer or a goal time through the Race Pace Calculator,
              the inputs and the result are saved — tap any row later to re-open
              and tweak from where you left off.
            </div>
          ) : (
            <div className="analysis-feed">
              {recentAnalyses.map((a, i) => (
                <AnalysisRow key={i} analysis={a} />
              ))}
            </div>
          )}
        </section>

        {/* ===== Coming Soon — Future Tools ===== */}
        {/* Four placeholder sections marking tools planned for first launch.
            Same visual treatment as Aerobic Development / Recent Analyses
            (section heading + Soon badge + empty-state card). No tier gating
            yet — when these ship, gating gets wired up alongside. */}

        <section>
          <div className="recent-header">
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Event Rankings
              <span className="section-soon-badge">Soon</span>
              <span className="section-tier-badge">Gold Development</span>
            </h2>
          </div>
          <div className="empty-state">
            See where {athlete.first} stands against every other swimmer in the LSC, state, and nationally — for each event {subjectPronoun(athlete)} swims. Rankings update with every new meet result.
          </div>
        </section>

        <section>
          <div className="recent-header">
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Sprint vs Endurance Profile
              <span className="section-soon-badge">Soon</span>
              <span className="section-tier-badge">Gold Development</span>
            </h2>
          </div>
          <div className="empty-state">
            A read on whether {athlete.first}'s race times skew sprint, endurance, or balanced — and how that profile is shifting over time. Helps frame which events to invest in and which training emphasis fits best.
          </div>
        </section>

        <section>
          <div className="recent-header">
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              IMX Score Tracker
              <span className="section-soon-badge">Soon</span>
              <span className="section-tier-badge">Gold Development</span>
            </h2>
          </div>
          <div className="empty-state">
            {athlete.first}'s IMX score across the five required events, tracked over time with a feed of every score change. Compare against national IMX benchmarks for {possessive(athlete)} age group.
          </div>
        </section>

        <section>
          <div className="recent-header">
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Tempo / DPS / Velocity Tracker
              <span className="section-soon-badge">Soon</span>
              <span className="section-tier-badge">Gold Development</span>
            </h2>
          </div>
          <div className="empty-state">
            Stroke rate, distance per stroke, and velocity captured at race pace and in training. The companion data layer to Race Pace planning — see exactly what tempo and DPS combinations produce {possessive(athlete)} fastest splits.
          </div>
        </section>

          </>
        )}
      </main>
      <FamilyFooter />
      <FamilyTabBar active="analysis" onNavigate={onNavigate} />
    </div>
  )
}

// ============================================================
// One row in the recent-analyses feed
// ============================================================
function AnalysisRow({ analysis }) {
  // analysis: { tool: 'analyzer' | 'pace', eventDistance, stroke, title, sub, date }
  const dist = analysis.eventDistance || ''
  const stroke = analysis.stroke || ''
  return (
    <div className="analysis-row">
      <div className={`tag ${analysis.tool || 'analyzer'}`}>
        {dist}{stroke ? <><br />{stroke}</> : null}
      </div>
      <div>
        <div className="an-title">{analysis.title || 'Analysis'}</div>
        {analysis.sub && <div className="an-sub">{analysis.sub}</div>}
      </div>
      <div className="an-date">{analysis.date || ''}</div>
    </div>
  )
}

// ============================================================
// AerobicDevelopmentChart
// ============================================================
// Scatter chart: x = HR count (10-sec), y = pace (seconds).
// Each dot = one rep from a saved training session.
// Zone color bands (White 23-25 / Pink 26-27 / Red 28-29).
// Dot opacity encodes season phase (early → faded, recent → solid).
// Adaptation direction: down + left = aerobic engine developing.
//
// Data source: listAthleteSessions → session.data.mainSet.reps
// Only aerobic/threshold sessions with rep-level HR data are used.
// Empty state shown if no qualifying reps exist yet.
// ============================================================
function AerobicDevelopmentChart({ athlete }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeDists, setActiveDists] = useState(new Set([100, 200]))
  const [tooltip, setTooltip] = useState(null)
  const svgRef = useRef(null)

  // Fetch sessions for this athlete
  useEffect(() => {
    if (!athlete?.id) return
    setLoading(true)
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'listAthleteSessions', athleteId: athlete.id }),
    })
      .then(r => r.json())
      .then(d => {
        setSessions(d.sessions || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [athlete?.id])

  // Extract reps from sessions — only aerobic/threshold, only reps with HR
  const reps = useMemo(() => {
    const out = []
    const sorted = [...sessions].sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    const n = sorted.length
    sorted.forEach((s, idx) => {
      const d = s.data || {}
      if (!['aerobic','threshold'].includes(s.category)) return
      const sets = d.sets || (d.mainSet ? [d.mainSet] : [])
      sets.forEach(set => {
        if (!set?.reps?.length) return
        set.reps.forEach(rep => {
          if (!rep.hr || !rep.time) return
          const timeSec = parseRepTime(rep.time)
          if (!timeSec) return
          const dist = parseInt(rep.distance, 10)
          if (!dist) return
          const phase = idx < n * 0.33 ? 0 : idx < n * 0.66 ? 1 : 2
          out.push({
            session: s.date || 'unknown',
            dist,
            zone: set.zone || 'white',
            time: timeSec,
            hr: parseInt(rep.hr, 10),
            phase,
          })
        })
      })
    })
    return out
  }, [sessions])

  const filtered = useMemo(() =>
    reps.filter(r => activeDists.has(r.dist)),
    [reps, activeDists]
  )

  const toggleDist = useCallback((dist) => {
    setActiveDists(prev => {
      const next = new Set(prev)
      if (next.has(dist)) { if (next.size > 1) next.delete(dist) }
      else next.add(dist)
      return next
    })
  }, [])

  // Chart geometry
  const W = 680, H = 380
  const padL = 58, padR = 24, padT = 28, padB = 48
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const xMin = 21, xMax = 31
  const xScale = hr => padL + ((hr - xMin) / (xMax - xMin)) * plotW
  // y: lower time = faster = higher on chart (inverted)
  const yMin = filtered.length ? Math.min(...filtered.map(r => r.time)) * 0.97 : 25
  const yMax = filtered.length ? Math.max(...filtered.map(r => r.time)) * 1.03 : 320
  const yScale = t => padT + ((yMax - t) / (yMax - yMin)) * plotH

  const zoneColors = { white: '#a0a09a', pink: '#d4698a', red: '#e24b4a' }
  const phaseAlpha = [0.28, 0.62, 1.0]
  const dotRadius = d => d <= 50 ? 4 : d <= 100 ? 5.5 : d <= 200 ? 7 : d <= 300 ? 8.5 : 10

  function fmtT(sec) {
    const m = Math.floor(sec / 60)
    const s = (sec % 60).toFixed(1).padStart(4, '0')
    return m > 0 ? `${m}:${s}` : `${s}s`
  }

  // Y-axis ticks
  const yTicks = []
  for (let t = Math.ceil(yMin / 10) * 10; t <= yMax; t += 10) yTicks.push(t)

  // Zone bands (x-axis)
  const zoneBands = [
    { min: 22.5, max: 25.5, color: 'rgba(160,160,154,0.07)', label: 'WHITE' },
    { min: 25.5, max: 27.5, color: 'rgba(212,105,138,0.07)', label: 'PINK' },
    { min: 27.5, max: 29.5, color: 'rgba(226,75,74,0.07)', label: 'RED' },
  ]

  if (loading) {
    return (
      <section style={{ margin: '32px 0' }}>
        <h2 className="section-title">
          Aerobic Development
          <span className="section-soon-badge">Soon</span>
          <span className="section-tier-badge">Gold Development</span>
        </h2>
        <div style={{ color:"var(--text-muted)", fontSize:13, padding:"20px 0" }}>Loading session data…</div>
      </section>
    )
  }

  if (!loading && reps.length === 0) {
    return (
      <section style={{ margin: '32px 0' }}>
        <h2 className="section-title">
          Aerobic Development
          <span className="section-soon-badge">Soon</span>
          <span className="section-tier-badge">Gold Development</span>
        </h2>
        <div className="empty-state">
          This chart populates once aerobic training sessions with rep-level data are saved.
          Each dot will represent one rep — pace on the y-axis, HR count on the x-axis.
          As the season progresses, the dots drift down and left — faster pace, lower HR.
          That's the aerobic engine developing.
        </div>
      </section>
    )
  }

  return (
    <section style={{ margin: '32px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ fontSize:16, fontWeight:500, color:"var(--text-primary)", margin:"0 0 2px", display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            Aerobic Development
            <span className="section-soon-badge">Soon</span>
            <span className="section-tier-badge">Gold Development</span>
          </h2>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Each dot = one rep. Down + left = aerobic engine improving.</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Distance:</span>
          {[50, 100, 200, 300, 400].map(d => (
            <button
              key={d}
              onClick={() => toggleDist(d)}
              style={{
                padding: '3px 10px', fontSize: 11, borderRadius: 20,
                border: '0.5px solid', cursor: 'pointer',
                borderColor: activeDists.has(d) ? 'rgba(148,163,184,0.5)' : 'rgba(148,163,184,0.2)',
                background: activeDists.has(d) ? 'rgba(148,163,184,0.12)' : 'transparent',
                color: activeDists.has(d) ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: activeDists.has(d) ? 500 : 400,
              }}
            >{d}</button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
        {[['white', '#a0a09a', '23–25'], ['pink', '#d4698a', '26–27'], ['red', '#e24b4a', '28–29']].map(([z, c, range]) => (
          <span key={z} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }} />
            {z.charAt(0).toUpperCase() + z.slice(1)} {range}
          </span>
        ))}
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>· Opacity = season phase (faded=early, solid=recent)</span>
      </div>

      <div style={{ position: 'relative' }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Zone bands */}
          {zoneBands.map(b => (
            <g key={b.label}>
              <rect
                x={xScale(b.min)} y={padT}
                width={xScale(b.max) - xScale(b.min)}
                height={plotH}
                fill={b.color}
              />
              <text x={xScale(b.min) + 5} y={padT + 13} fill="rgba(128,128,128,0.5)" fontSize="9" fontFamily="-apple-system,sans-serif" letterSpacing="0.08em">{b.label}</text>
            </g>
          ))}

          {/* Gridlines */}
          {yTicks.map(t => (
            <g key={t}>
              <line x1={padL} x2={W - padR} y1={yScale(t)} y2={yScale(t)} stroke="rgba(148,163,184,0.07)" strokeWidth="1" />
              <text x={padL - 8} y={yScale(t)} textAnchor="end" dominantBaseline="middle" fill="#64748b" fontSize="10" fontFamily="SF Mono,ui-monospace,monospace">{fmtT(t)}</text>
            </g>
          ))}

          {/* X-axis ticks */}
          {[22,23,24,25,26,27,28,29,30].map(hr => (
            <g key={hr}>
              <line x1={xScale(hr)} x2={xScale(hr)} y1={padT} y2={padT + plotH} stroke="rgba(148,163,184,0.07)" strokeWidth="1" />
              <text x={xScale(hr)} y={H - padB + 16} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="-apple-system,sans-serif">{hr}</text>
            </g>
          ))}

          {/* Axis labels */}
          <text x={W / 2} y={H - 4} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="-apple-system,sans-serif">HR count (beats per 10 sec)</text>
          <text x={14} y={padT + plotH / 2} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="-apple-system,sans-serif" transform={`rotate(-90, 14, ${padT + plotH / 2})`}>pace (faster ↑)</text>

          {/* Dots */}
          {filtered.map((r, i) => {
            const cx = xScale(r.hr)
            const cy = yScale(r.time)
            const col = zoneColors[r.zone] || '#a0a09a'
            const alpha = phaseAlpha[r.phase] ?? 1
            const fill = col + Math.round(alpha * 255).toString(16).padStart(2, '0')
            return (
              <circle
                key={i}
                cx={cx} cy={cy}
                r={dotRadius(r.dist)}
                fill={fill}
                stroke={col}
                strokeWidth="1"
                strokeOpacity={Math.min(alpha + 0.15, 1)}
                style={{ cursor: 'pointer' }}
                onMouseEnter={e => {
                  const svgRect = svgRef.current?.getBoundingClientRect()
                  const vbScale = svgRect ? svgRect.width / W : 1
                  setTooltip({ r, x: cx * vbScale, y: cy * vbScale })
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            )
          })}

          {/* Adaptation arrow */}
          <defs>
            <marker id="adArr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#475569" />
            </marker>
          </defs>
          <line x1={W - padR - 10} y1={H - padB - 10} x2={W - padR - 50} y2={H - padB - 30} stroke="#475569" strokeWidth="1.5" strokeDasharray="3,2" markerEnd="url(#adArr)" opacity="0.6" />
          <text x={W - padR - 55} y={H - padB - 34} textAnchor="end" fill="#64748b" fontSize="9" fontFamily="-apple-system,sans-serif" fontStyle="italic">adaptation</text>
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div style={{
            position: 'absolute',
            left: tooltip.x + 12,
            top: tooltip.y - 10,
            background: '#0f1729',
            border: '0.5px solid rgba(148,163,184,0.2)',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            color: '#e2e8f0',
            pointerEvents: 'none',
            zIndex: 20,
            whiteSpace: 'nowrap',
            lineHeight: 1.6,
          }}>
            <div style={{ fontWeight: 500 }}>{tooltip.r.session}</div>
            <div style={{ color: '#94a3b8' }}>{tooltip.r.dist}m · {tooltip.r.zone} zone</div>
            <div>Pace: {fmtT(tooltip.r.time)}</div>
            <div>HR count: {tooltip.r.hr}/10s</div>
          </div>
        )}
      </div>

      {/* Adaptation direction note */}
      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Faster pace at lower HR count = aerobic engine developing. Watch the cloud migrate down and left across the season.
      </div>
    </section>
  )
}

function parseRepTime(raw) {
  if (!raw) return null
  const s = String(raw).trim()
  if (s.includes(':')) {
    const [m, sec] = s.split(':')
    const v = parseInt(m, 10) * 60 + parseFloat(sec)
    return isNaN(v) ? null : v
  }
  const v = parseFloat(s)
  return isNaN(v) ? null : v
}


// Read from `gender` first (new admin-only source of truth),
// fall back to legacy `pronouns` field for records not yet migrated.
// ============================================================
function pronounThem(athlete) {
  if (!athlete) return 'them'
  const g = (athlete.gender || '').toUpperCase()
  if (g === 'M') return 'him'
  if (g === 'F') return 'her'
  const p = (athlete.pronouns || '').toLowerCase()
  if (p === 'he') return 'him'
  if (p === 'she') return 'her'
  return 'them'
}
function possessive(athlete) {
  if (!athlete) return 'their'
  const g = (athlete.gender || '').toUpperCase()
  if (g === 'M') return 'his'
  if (g === 'F') return 'her'
  const p = (athlete.pronouns || '').toLowerCase()
  if (p === 'he') return 'his'
  if (p === 'she') return 'her'
  return 'their'
}
function subjectPronoun(athlete) {
  if (!athlete) return 'they'
  const g = (athlete.gender || '').toUpperCase()
  if (g === 'M') return 'he'
  if (g === 'F') return 'she'
  const p = (athlete.pronouns || '').toLowerCase()
  if (p === 'he') return 'he'
  if (p === 'she') return 'she'
  return 'they'
}

// ============================================================
// MeetAnalyzerTool — coming soon page
// ============================================================
// Tool isn't built yet. Shows a clean placeholder explaining what's
// coming and a back button. The full preview shape was removed —
// disabled inputs were misleading more than informative.
// ============================================================
function MeetAnalyzerTool({ athlete, onClose }) {
  return (
    <div className="tool-view">
      <button className="back" onClick={onClose}>← Back to Analysis</button>

      <div className="tool-header">
        <div className="tool-tag">Tool</div>
        <h1 className="tool-title">Meet Analyzer</h1>
        <p className="tool-sub">
          Paste {possessive(athlete)} splits from any race and compare them against the
          elite race template. See exactly where time is lost — and what adjustments
          unlock the next standard.
        </p>
      </div>

      <div className="coming-soon-card">
        <div className="cs-tag">Coming Soon</div>
        <div className="cs-title">Currently in development</div>
        <div className="cs-sub">
          This tool is still being built.
        </div>
      </div>
    </div>
  )
}

// ============================================================
// RacePaceTool — native React component
function RacePaceTool({ athlete, onClose }) {
  return (
    <div className="tool-view">
      <button className="back" onClick={onClose}>← Back to Analysis</button>
      <RacePaceCalculator athlete={athlete} />
    </div>
  )
}
