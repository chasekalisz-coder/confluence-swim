// ============================================================
// FamilyMeets.jsx
// ============================================================
// Family-facing Meets page. Shows:
//   - Next Meet hero card (soonest upcoming meet with countdown)
//   - Upcoming / Past tabs
//   - Upcoming: countdown rows for each scheduled meet
//   - Past: per-meet result tables with times, deltas, standards, places
//
// Data source: athlete.upcomingMeets + athlete.pastMeets (both optional).
// When either is missing we show an empty state rather than fake data.
//
// Shape expectations:
//   upcomingMeets: [{ name, location, startDate, endDate, entries: [{event, seed}] }]
//   pastMeets:     [{ name, location, startDate, endDate, results: [{event, time, delta, standard, place, pb, round}] }]
// ============================================================

import { useState, useMemo, useEffect } from 'react'
import FamilyNav from './FamilyNav.jsx'
import FamilyFooter from './FamilyFooter.jsx'
import FamilyTabBar from './FamilyTabBar.jsx'
import { formatTime, parseTime, formatDelta } from '../lib/calculations.js'

export default function FamilyMeets({ athlete, onBack, onNavigate, onLogoClick, linkedAthletes, onSwitchAthlete }) {
  const [tab, setTab] = useState('upcoming')

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

  // Normalize upcoming meets and compute countdowns
  const upcoming = useMemo(() => {
    if (!athlete?.upcomingMeets) return []
    const today = new Date()
    return athlete.upcomingMeets
      .map(m => ({
        ...m,
        startDateObj: parseMeetDate(m.startDate),
        endDateObj: parseMeetDate(m.endDate),
      }))
      .map(m => ({
        ...m,
        days: m.startDateObj
          ? Math.max(0, Math.ceil((m.startDateObj - today) / (1000 * 60 * 60 * 24)))
          : null,
      }))
      .sort((a, b) => {
        if (a.startDateObj && b.startDateObj) return a.startDateObj - b.startDateObj
        return 0
      })
  }, [athlete])

  const past = useMemo(() => {
    if (!athlete?.pastMeets) return []
    return athlete.pastMeets
      .map(m => ({
        ...m,
        startDateObj: parseMeetDate(m.startDate),
        endDateObj: parseMeetDate(m.endDate),
      }))
      .sort((a, b) => {
        if (a.startDateObj && b.startDateObj) return b.startDateObj - a.startDateObj
        return 0
      })
  }, [athlete])

  const nextMeet = upcoming[0]

  if (!athlete) {
    return (
      <div className="v2">
        <FamilyNav active="Meets" onNavigate={onNavigate} onLogoClick={onLogoClick} currentAthleteId={athlete?.id} linkedAthletes={linkedAthletes} onSwitchAthlete={onSwitchAthlete} />
        <main className="v2-main">
          <div className="empty-state">No athlete selected.</div>
        </main>
        <FamilyFooter />
      </div>
    )
  }

  return (
    <div className="v2">
      <FamilyNav active="Meets" athleteInitials={initials} onNavigate={onNavigate} onLogoClick={onLogoClick} currentAthleteId={athlete?.id} linkedAthletes={linkedAthletes} onSwitchAthlete={onSwitchAthlete} />
      <main className="v2-main">
        {onBack && <button className="back" onClick={onBack}>← Back to Profile</button>}

        <div className="page-title">Meets</div>
        <div className="page-sub">
          Upcoming races and past results. Tap any past meet to see full splits and analysis.
        </div>

        {/* ===== Next Meet hero ===== */}
        {nextMeet ? (
          <div className="next-meet">
            <div className="nm-grid">
              <div className="nm-countdown">
                <div className="num">{nextMeet.days != null ? nextMeet.days : '—'}</div>
                <div className="unit">Days</div>
              </div>
              <div className="nm-details">
                <div className="tag">Next Meet</div>
                <div className="name">{nextMeet.name || 'Untitled Meet'}</div>
                <div className="sub">
                  {nextMeet.location && <span>{nextMeet.location}</span>}
                  {nextMeet.location && (nextMeet.startDateObj || nextMeet.endDateObj) && <span className="dot" />}
                  <span className="mono">{formatDateRange(nextMeet.startDateObj, nextMeet.endDateObj)}</span>
                </div>
              </div>
            </div>
            {nextMeet.entries && nextMeet.entries.length > 0 && (
              <div className="entries-list">
                <div className="label">Events Entered · Seed Times</div>
                <div className="entries-grid">
                  {nextMeet.entries.map((e, i) => (
                    <div className="entry-card" key={i}>
                      <div className="ev">{e.event}</div>
                      <div className="seed">{e.seed || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state" style={{ marginBottom: '56px' }}>
            No upcoming meet on the calendar yet. Coach will add meets here as they're confirmed.
          </div>
        )}

        {/* ===== Tabs ===== */}
        <div className="tabs">
          <button
            className={`tab ${tab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setTab('upcoming')}
          >
            {/* Upcoming tab excludes the first meet since it's already shown
                in the Next Meet hero above — prevents duplication. */}
            Upcoming {upcoming.length > 1 && <span className="count">{upcoming.length - 1}</span>}
          </button>
          <button
            className={`tab ${tab === 'past' ? 'active' : ''}`}
            onClick={() => setTab('past')}
          >
            Past {past.length > 0 && <span className="count">{past.length}</span>}
          </button>
        </div>

        {/* ===== Upcoming tab ===== */}
        {tab === 'upcoming' && (() => {
          // Skip index 0 — that meet is already shown in the Next Meet hero above.
          const upcomingRest = upcoming.slice(1)
          if (upcomingRest.length === 0) {
            return (
              <div className="empty-state">
                {upcoming.length === 0
                  ? 'No upcoming meets yet.'
                  : 'No other meets after the one shown above.'}
              </div>
            )
          }
          return (
            <section>
              <div className="meets-list">
                {upcomingRest.map((m, i) => (
                  <div className="meet-row" key={i}>
                    <div className={`countdown ${m.days != null && m.days <= 14 ? 'close' : ''}`}>
                      <div className="num">{m.days != null ? m.days : '—'}</div>
                      <div className="unit">Days</div>
                    </div>
                    <div className="meet-info">
                      <div className="name">{m.name || 'Untitled Meet'}</div>
                      <div className="loc">{m.location || ''}</div>
                    </div>
                    <div className="meet-date mono">
                      {formatDateRange(m.startDateObj, m.endDateObj)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })()}

        {/* ===== Past tab ===== */}
        {tab === 'past' && (
          past.length === 0 ? (
            <div className="empty-state">
              No past meet results on file. Results will appear here as meets are completed and entered.
            </div>
          ) : (
            <section>
              {past.map((m, i) => (
                <PastMeetCard key={i} meet={m} onNavigate={onNavigate} />
              ))}
            </section>
          )
        )}
      </main>
      <FamilyFooter />
      <FamilyTabBar active="meets" onNavigate={onNavigate} />
    </div>
  )
}

// ============================================================
// Past meet card — one card per completed meet
// ============================================================
function PastMeetCard({ meet, onNavigate }) {
  return (
    <div className="past-meet">
      <div className="past-meet-head">
        <div>
          <div className="name">{meet.name || 'Untitled Meet'}</div>
          {meet.location && <div className="loc">{meet.location}</div>}
        </div>
        <div className="date mono">
          {formatDateRange(meet.startDateObj, meet.endDateObj)}
        </div>
      </div>

      {meet.results && meet.results.length > 0 ? (
        <>
          <div className="results-table">
            <div className="result-row header">
              <div>Event</div>
              <div style={{ textAlign: 'right' }}>Time</div>
              <div style={{ textAlign: 'right' }}>Δ</div>
              <div style={{ textAlign: 'right' }}>Standard</div>
              <div style={{ textAlign: 'right' }}>Place</div>
            </div>
            {meet.results.map((r, i) => (
              <ResultRow key={i} result={r} />
            ))}
          </div>
          <button
            className="analyzer-link"
            onClick={() => onNavigate && onNavigate('analysis')}
          >
            Open in Meet Analyzer →
          </button>
        </>
      ) : (
        <div className="empty-state" style={{ marginTop: '16px' }}>
          No event results recorded for this meet.
        </div>
      )}
    </div>
  )
}

function ResultRow({ result }) {
  // result: { event, round?, time, delta?, standard?, place?, pb? }
  const eventLabel = result.round
    ? `${result.event} ${result.round}`
    : result.event
  const deltaNum = typeof result.delta === 'number'
    ? result.delta
    : parseFloat(result.delta)
  const isDrop = deltaNum != null && !isNaN(deltaNum) && deltaNum < 0
  const isRise = deltaNum != null && !isNaN(deltaNum) && deltaNum > 0

  return (
    <div className="result-row">
      <div className="ev">
        {eventLabel}
        {result.pb && <span className="pb-badge">PB</span>}
      </div>
      <div className="time mono">{result.time || '—'}</div>
      <div className={`delta mono ${isDrop ? 'drop' : isRise ? 'rise' : ''}`}>
        {deltaNum != null && !isNaN(deltaNum)
          ? formatDelta(deltaNum)
          : (result.delta || '—')}
      </div>
      <div style={{ textAlign: 'right' }}>
        {result.standard
          ? <span className={`std ${result.standard}`}>{result.standard}</span>
          : <span className="std none">—</span>}
      </div>
      <div className="place">{result.place || '—'}</div>
    </div>
  )
}

// ============================================================
// Helpers
// ============================================================

function parseMeetDate(str) {
  if (!str) return null
  const d = new Date(str)
  return isNaN(d.getTime()) ? null : d
}

function formatDateRange(start, end) {
  if (!start && !end) return ''
  if (start && !end) return formatShortDate(start)
  if (!start && end) return formatShortDate(end)
  // Both present
  const sameYear = start.getFullYear() === end.getFullYear()
  const sameMonth = sameYear && start.getMonth() === end.getMonth()
  if (sameMonth) {
    const m = start.toLocaleString('en-US', { month: 'short' })
    return `${m} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`
  }
  if (sameYear) {
    const ms = start.toLocaleString('en-US', { month: 'short' })
    const me = end.toLocaleString('en-US', { month: 'short' })
    return `${ms} ${start.getDate()} – ${me} ${end.getDate()}, ${end.getFullYear()}`
  }
  return `${formatShortDate(start)} – ${formatShortDate(end)}`
}

function formatShortDate(d) {
  if (!d) return ''
  const m = d.toLocaleString('en-US', { month: 'short' })
  return `${m} ${d.getDate()}, ${d.getFullYear()}`
}
