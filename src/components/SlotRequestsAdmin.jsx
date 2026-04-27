// ============================================================
// SlotRequestsAdmin.jsx
// ============================================================
// Coach-side view of all slot requests for the current month.
//
// Three views:
//   - "Resolver" (default) — actionable list. Every requested slot in
//     order of contention (most Requests → fewest → Alternatives-only).
//     Each row shows the families competing for that slot and an
//     "Assign" button per family. Used to actually do the puzzle work.
//   - "Combined" — calendar overlay of all families' picks. Read-only
//     scan view, useful for checking distribution across the month.
//   - "Per family" — pick a family, see their picks isolated.
//
// Assignments live in local UI state (not yet persisted to DB).
// Once we know the workflow holds up in real use, assignments will
// be saved to a new `slot_assignments` table for the family-side
// confirmation card and the Acuity export view.
//
// Print-friendly (browser print). Built for Chase to take one
// printout into Acuity and assign sessions.
// ============================================================

import { useState, useEffect, useMemo } from 'react'
import maySlots from '../data/may-2026-slots.json'
import { listSlotRequests } from '../lib/db.js'

export default function SlotRequestsAdmin({ athletes, onBack }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('resolver') // 'resolver' | 'combined' | 'per-family'
  const [selectedAthleteId, setSelectedAthleteId] = useState(null)
  // Local assignment state: slotId → athleteId (null/undef = unassigned).
  // Currently in-memory only — refreshing the page wipes assignments.
  // Persistence comes after the workflow is validated in real use.
  const [assignments, setAssignments] = useState({})

  useEffect(() => {
    let active = true
    setLoading(true)
    listSlotRequests(maySlots.month)
      .then(reqs => {
        if (!active) return
        setRequests(reqs || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('[SlotRequestsAdmin] load failed:', err)
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  // athletes with submitted requests
  const requestsByAthlete = useMemo(() => {
    const m = {}
    requests.forEach(r => { m[r.athlete_id] = r })
    return m
  }, [requests])

  const athletesWithRequests = useMemo(() => {
    return athletes.filter(a => requestsByAthlete[a.id])
  }, [athletes, requestsByAthlete])

  // For combined view: build slotId → array of { athleteId, initials, priority }
  const slotMap = useMemo(() => {
    const m = {}
    requests.forEach(r => {
      const athlete = athletes.find(a => a.id === r.athlete_id)
      if (!athlete) return
      const initials = ((athlete.first || '?')[0] + (athlete.last || '')[0]).toUpperCase()
      Object.entries(r.picks || {}).forEach(([slotId, priority]) => {
        if (!m[slotId]) m[slotId] = []
        m[slotId].push({ athleteId: r.athlete_id, name: `${athlete.first} ${athlete.last}`, initials, priority })
      })
    })
    return m
  }, [requests, athletes])

  // Resolver list: every slot anyone touched, flattened and sorted by demand.
  // Sort order: Requests count DESC (conflicts first), then Alternatives count
  // DESC, then date ASC. So the top of the list is "Mon May 4 8am — 3 families
  // want it" and the bottom is "Sat May 30 6pm — 2 alternatives, no requests".
  // Slot date+label come from the static slot definitions; we look them up by id.
  const resolverList = useMemo(() => {
    // First, build a slotId → { date, label } lookup from the slot-data file.
    const slotLookup = {}
    maySlots.days.forEach(day => {
      day.slots.forEach(slot => {
        slotLookup[slot.id] = { date: day.date, label: slot.label }
      })
    })

    const items = []
    Object.entries(slotMap).forEach(([slotId, picks]) => {
      const meta = slotLookup[slotId]
      if (!meta) return // shouldn't happen but defensive
      const requestPicks = picks.filter(p => p.priority === 'primary')
      const alternativePicks = picks.filter(p => p.priority === 'secondary')
      items.push({
        slotId,
        date: meta.date,
        label: meta.label,
        requestPicks,
        alternativePicks,
        totalPicks: picks.length,
        requestCount: requestPicks.length,
      })
    })

    items.sort((a, b) => {
      // Conflicts first
      if (b.requestCount !== a.requestCount) return b.requestCount - a.requestCount
      // Then by total demand (alternatives still matter for fill decisions)
      if (b.totalPicks !== a.totalPicks) return b.totalPicks - a.totalPicks
      // Tie-break by date for stable readability
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return a.slotId.localeCompare(b.slotId)
    })

    return items
  }, [slotMap])

  // Per-family scorecard: how many they Requested vs how many we've assigned.
  // Drives the right-rail "Smith 6/8 assigned" status during the puzzle work.
  const scorecard = useMemo(() => {
    return athletesWithRequests.map(a => {
      const req = requestsByAthlete[a.id]
      const picks = req?.picks || {}
      const requested = Object.values(picks).filter(v => v === 'primary').length
      const alternates = Object.values(picks).filter(v => v === 'secondary').length
      const assigned = Object.values(assignments).filter(athId => athId === a.id).length
      return { athlete: a, requested, alternates, assigned }
    })
  }, [athletesWithRequests, requestsByAthlete, assignments])

  const assignSlot = (slotId, athleteId) => {
    setAssignments(prev => {
      const next = { ...prev }
      if (next[slotId] === athleteId) {
        // Clicking the already-assigned chip clears the assignment
        delete next[slotId]
      } else {
        next[slotId] = athleteId
      }
      return next
    })
  }

  const monthLabel = useMemo(() => {
    const [y, mo] = maySlots.month.split('-').map(Number)
    return new Date(y, mo - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }, [])

  // Build calendar grid
  const calendarCells = useMemo(() => {
    const firstDay = maySlots.days[0]
    const firstDate = new Date(firstDay.date + 'T12:00:00')
    const firstWeekday = firstDate.getDay()
    const cells = []
    for (let i = 0; i < firstWeekday; i++) cells.push(null)
    maySlots.days.forEach(d => cells.push(d))
    return cells
  }, [])

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const selectedRequest = selectedAthleteId ? requestsByAthlete[selectedAthleteId] : null
  const selectedAthlete = selectedAthleteId ? athletes.find(a => a.id === selectedAthleteId) : null
  const selectedPicks = selectedRequest?.picks || {}

  return (
    <div className="page" style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn btn-outline" onClick={onBack}>← Back</button>
        <h1 style={{ margin: 0 }}>Slot Requests · {monthLabel}</h1>
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          className={view === 'resolver' ? 'btn btn-primary' : 'btn btn-outline'}
          onClick={() => setView('resolver')}
        >
          Resolver
        </button>
        <button
          className={view === 'combined' ? 'btn btn-primary' : 'btn btn-outline'}
          onClick={() => setView('combined')}
        >
          Combined ({athletesWithRequests.length} {athletesWithRequests.length === 1 ? 'family' : 'families'})
        </button>
        <button
          className={view === 'per-family' ? 'btn btn-primary' : 'btn btn-outline'}
          onClick={() => setView('per-family')}
        >
          Per Family
        </button>
        <div style={{ flex: 1 }} />
        <button className="btn btn-outline" onClick={() => window.print()}>
          🖨 Print
        </button>
      </div>

      {loading && (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
          Loading requests...
        </div>
      )}

      {!loading && requests.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b', background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
          No families have submitted slot requests for {monthLabel} yet.
        </div>
      )}

      {!loading && requests.length > 0 && view === 'resolver' && (
        <div className="adm-resolver">
          {/* Left: the slot list, sorted by contention. Each row is one decision. */}
          <div className="adm-resolver-list">
            {resolverList.map(item => {
              const dateObj = new Date(item.date + 'T12:00:00')
              const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
              const startLabel = item.label.split('–')[0]
              const isConflict = item.requestCount > 1
              const isEasy = item.requestCount === 1
              const isAltsOnly = item.requestCount === 0
              const assignedTo = assignments[item.slotId]
              const tier = isConflict ? 'conflict' : isEasy ? 'easy' : 'alts'
              return (
                <div key={item.slotId} className={`adm-row tier-${tier} ${assignedTo ? 'assigned' : ''}`}>
                  <div className="adm-row-head">
                    <div className="adm-row-time">
                      <span className="adm-row-clock">{startLabel}</span>
                      <span className="adm-row-date">{dateStr}</span>
                    </div>
                    <div className="adm-row-counts">
                      {item.requestCount > 0 && (
                        <span className={`adm-count-pill primary ${isConflict ? 'conflict' : ''}`}>
                          {item.requestCount} {item.requestCount === 1 ? 'Request' : 'Requests'}
                        </span>
                      )}
                      {item.alternativePicks.length > 0 && (
                        <span className="adm-count-pill secondary">
                          {item.alternativePicks.length} {item.alternativePicks.length === 1 ? 'Alt' : 'Alts'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="adm-row-families">
                    {item.requestPicks.map(p => {
                      const isAssigned = assignedTo === p.athleteId
                      const isLockedOther = assignedTo && assignedTo !== p.athleteId
                      return (
                        <button
                          key={p.athleteId}
                          className={`adm-family-chip primary ${isAssigned ? 'assigned' : ''} ${isLockedOther ? 'locked-out' : ''}`}
                          onClick={() => assignSlot(item.slotId, p.athleteId)}
                          title={isAssigned ? 'Click to unassign' : `Assign ${p.name}`}
                        >
                          <span className="adm-chip-tag">R</span>
                          <span className="adm-chip-name">{p.name}</span>
                          {isAssigned && <span className="adm-chip-check">✓</span>}
                        </button>
                      )
                    })}
                    {item.alternativePicks.map(p => {
                      const isAssigned = assignedTo === p.athleteId
                      const isLockedOther = assignedTo && assignedTo !== p.athleteId
                      return (
                        <button
                          key={p.athleteId}
                          className={`adm-family-chip secondary ${isAssigned ? 'assigned' : ''} ${isLockedOther ? 'locked-out' : ''}`}
                          onClick={() => assignSlot(item.slotId, p.athleteId)}
                          title={isAssigned ? 'Click to unassign' : `Fill with ${p.name} (Alternative)`}
                        >
                          <span className="adm-chip-tag">A</span>
                          <span className="adm-chip-name">{p.name}</span>
                          {isAssigned && <span className="adm-chip-check">✓</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            {resolverList.length === 0 && (
              <div style={{ padding: 30, color: '#64748b', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                No slots requested yet.
              </div>
            )}
          </div>

          {/* Right rail: per-family scorecard. Watch progress as you assign. */}
          <aside className="adm-scorecard">
            <div className="adm-scorecard-header">Family progress</div>
            {scorecard.map(({ athlete, requested, alternates, assigned }) => {
              const complete = assigned >= requested && requested > 0
              const over = assigned > requested
              return (
                <div key={athlete.id} className={`adm-score-row ${complete ? 'complete' : ''} ${over ? 'over' : ''}`}>
                  <div className="adm-score-name">{athlete.first} {athlete.last}</div>
                  <div className="adm-score-stats">
                    <span className="adm-score-fraction">
                      <strong>{assigned}</strong>/<span>{requested}</span>
                    </span>
                    {alternates > 0 && (
                      <span className="adm-score-alts">+{alternates} alts</span>
                    )}
                  </div>
                  <div className="adm-score-bar">
                    <div
                      className="adm-score-bar-fill"
                      style={{ width: `${Math.min(100, (assigned / Math.max(1, requested)) * 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </aside>
        </div>
      )}

      {!loading && requests.length > 0 && view === 'per-family' && (
        <div>
          {/* Family selector */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {athletesWithRequests.map(a => {
              const req = requestsByAthlete[a.id]
              const picks = req?.picks || {}
              const pCount = Object.values(picks).filter(v => v === 'primary').length
              const sCount = Object.values(picks).filter(v => v === 'secondary').length
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedAthleteId(a.id)}
                  className={selectedAthleteId === a.id ? 'btn btn-primary' : 'btn btn-outline'}
                  style={{ padding: '8px 14px' }}
                >
                  {a.first} {a.last} <span style={{ opacity: 0.6, fontSize: 11, marginLeft: 6 }}>{pCount}p · {sCount}b</span>
                </button>
              )
            })}
          </div>

          {!selectedAthleteId && (
            <div style={{ padding: 30, color: '#64748b', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
              Pick a family above to see their requests.
            </div>
          )}

          {selectedAthlete && (
            <>
              <div style={{ marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontSize: 18 }}>{selectedAthlete.first} {selectedAthlete.last}</h2>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  Submitted {new Date(selectedRequest.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  {selectedRequest.note && (
                    <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(212,168,83,0.08)', borderLeft: '2px solid #D4A853', borderRadius: 4, fontStyle: 'italic', color: '#cbd5e1' }}>
                      "{selectedRequest.note}"
                    </div>
                  )}
                </div>
              </div>
              <CalendarGrid
                calendarCells={calendarCells}
                weekdayLabels={weekdayLabels}
                renderSlot={(slot) => {
                  const pick = selectedPicks[slot.id]
                  if (!pick) return <div className="adm-slot empty">{slot.label.split('–')[0]}</div>
                  return (
                    <div className={`adm-slot ${pick}`}>
                      {slot.label.split('–')[0]}
                    </div>
                  )
                }}
              />
            </>
          )}
        </div>
      )}

      {!loading && requests.length > 0 && view === 'combined' && (
        <CalendarGrid
          calendarCells={calendarCells}
          weekdayLabels={weekdayLabels}
          renderSlot={(slot) => {
            const picks = slotMap[slot.id] || []
            if (picks.length === 0) {
              return <div className="adm-slot empty">{slot.label.split('–')[0]}</div>
            }
            const hasPrimary = picks.some(p => p.priority === 'primary')
            return (
              <div className={`adm-slot ${hasPrimary ? 'has-primary' : 'has-secondary'}`} title={picks.map(p => `${p.name} (${p.priority})`).join(', ')}>
                <div className="adm-slot-time">{slot.label.split('–')[0]}</div>
                <div className="adm-slot-badges">
                  {picks.map((p, i) => (
                    <span key={i} className={`adm-badge ${p.priority}`}>{p.initials}</span>
                  ))}
                </div>
              </div>
            )
          }}
        />
      )}
    </div>
  )
}

function CalendarGrid({ calendarCells, weekdayLabels, renderSlot }) {
  return (
    <div className="adm-cal">
      {weekdayLabels.map(w => (
        <div key={w} className="adm-cal-weekday">{w}</div>
      ))}
      {calendarCells.map((day, i) => (
        <div key={i} className={`adm-cal-cell ${!day ? 'empty' : ''}`}>
          {day && (
            <>
              <div className="adm-cal-date">{parseInt(day.date.split('-')[2])}</div>
              <div className="adm-cal-slots">
                {day.slots.map(s => (
                  <div key={s.id}>{renderSlot(s)}</div>
                ))}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
