// ============================================================
// SlotRequestsAdmin.jsx
// ============================================================
// Coach-side view of all slot requests for the current month.
//
// Two views:
//   - "Combined" — all families overlaid on one calendar. Each slot
//     shows stacked initials/badges of who picked it (with primary
//     vs backup distinction). At-a-glance conflict view.
//   - "Per family" — pick a family, see their picks isolated.
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
  const [view, setView] = useState('combined') // 'combined' | 'per-family'
  const [selectedAthleteId, setSelectedAthleteId] = useState(null)

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
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
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
