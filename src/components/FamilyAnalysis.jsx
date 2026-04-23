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

import { useMemo, useEffect } from 'react'
import FamilyNav from './FamilyNav.jsx'
import FamilyFooter from './FamilyFooter.jsx'
import {
  pickNextCut,
  formatTime,
  ageFromDob,
} from '../lib/calculations.js'

export default function FamilyAnalysis({ athlete, onBack, onNavigate }) {
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

  // Past analyses — stored on athlete object if Chase has wired them,
  // otherwise empty state
  const recentAnalyses = athlete?.analyses || []

  if (!athlete) {
    return (
      <div className="v2">
        <FamilyNav active="Analysis" onNavigate={onNavigate} />
        <main className="v2-main">
          <div className="empty-state">No athlete selected.</div>
        </main>
        <FamilyFooter />
      </div>
    )
  }

  return (
    <div className="v2">
      <FamilyNav active="Analysis" athleteInitials={initials} onNavigate={onNavigate} />
      <main className="v2-main">
        {onBack && <button className="back" onClick={onBack}>← Back to Profile</button>}

        <div className="page-title">Analysis</div>
        <div className="page-sub">
          Tools to break down {athlete.first}'s races, plan target paces,
          and find the exact seconds between {pronounThem(athlete)} and the next cut.
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

        {/* ===== Tool cards ===== */}
        <div className="tools-grid">
          <div
            className="tool-card analyzer"
            onClick={() => alert('Meet Analyzer is coming soon.')}
          >
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
              <span>
                {(() => {
                  const races = recentAnalyses.filter(a => a.tool === 'analyzer').length
                  if (races === 0) return 'No races analyzed yet'
                  if (races === 1) return '1 race analyzed'
                  return `${races} races analyzed`
                })()}
              </span>
            </div>
            <div className="arrow">›</div>
          </div>

          <div
            className="tool-card pace"
            onClick={() => alert('Race Pace Calculator is coming soon.')}
          >
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
                {(() => {
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

        {/* ===== Recent Analyses ===== */}
        <section>
          <div className="recent-header">
            <h2 className="section-title" style={{ marginBottom: 0 }}>Recent Analyses</h2>
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
      </main>
      <FamilyFooter />
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
// Tiny helpers so the copy doesn't sound off if the athlete is female.
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
