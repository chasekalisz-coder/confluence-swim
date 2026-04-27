// ============================================================
// FamilyNotes.jsx
// ============================================================
// Family-facing Session Notes feed. Shows every saved session
// for the athlete, grouped by month, filterable by category
// and searchable by title/preview text.
//
// Reads real sessions via loadAthleteSessions(athleteId) from db.js.
// Uses the shared Apple Dark design (FamilyNav / FamilyFooter / .v2).
// ============================================================

import { useState, useMemo, useEffect } from 'react'
import FamilyNav from './FamilyNav.jsx'
import FamilyFooter from './FamilyFooter.jsx'
import FamilyTabBar from './FamilyTabBar.jsx'
import { loadAthleteSessions } from '../lib/db.js'

// How each stored session.category maps to a family-facing label + color key.
// Color keys each get a distinct hue (see CSS .cat-stripe and .cat-label styles).
//
// Note: 'workout' category (workout-builder outputs) is NOT mapped here —
// those are filtered out upstream before they ever reach this component.
// See the load effect below for the filter. Workout-builder outputs belong
// in an admin-only library, not on the family-facing Session Notes feed.
const CATEGORY_MAP = {
  // Training-note categories — families all see as distinct but unified under
  // "training-type" sessions when filtering. Session title never reads
  // "Workout session" — it reads the category name as the descriptor.
  training:    { label: 'Aerobic',      key: 'aerobic'    },
  aerobic:     { label: 'Aerobic',      key: 'aerobic'    },
  threshold:   { label: 'Threshold',    key: 'threshold'  },
  quality:     { label: 'Quality',      key: 'quality'    },
  sprint:      { label: 'Sprint',       key: 'sprint'     },
  active_rest: { label: 'Active Rest',  key: 'activerest' },
  power:       { label: 'Power',        key: 'power'      },
  recovery:    { label: 'Recovery',     key: 'recovery'   },
  // Standalone note types
  technique:   { label: 'Technique',    key: 'technique'  },
  meetprep:    { label: 'Meet Prep',    key: 'meetprep'   },
  meet_prep:   { label: 'Meet Prep',    key: 'meetprep'   },
  workout:     { label: 'Workout',      key: 'workout'    },
}

// Filter chips — 'all' now means "all actual sessions" (training + meet
// prep + technique). Workout is a separate tab so workout notes don't
// clutter the primary session review view. Training sub-categories are
// grouped under 'Training' headers visually.
const FILTER_CHIPS = [
  { id: 'all',         label: 'All' },
  { id: 'training',    label: 'Training' },
  { id: 'meetprep',    label: 'Meet Prep' },
  { id: 'technique',   label: 'Technique' },
  { id: 'workout',     label: 'Workout' },
]

export default function FamilyNotes({ athlete, onBack, onNavigate, onViewSession, onLogoClick, linkedAthletes, onSwitchAthlete }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [query, setQuery] = useState('')

  // Flip body into v2 dark mode for the whole viewport
  useEffect(() => {
    document.body.classList.add('v2-active')
    return () => { document.body.classList.remove('v2-active') }
  }, [])

  // Load sessions for this athlete.
  // If athlete has mockSessions (placeholder data for walkthrough/demo),
  // merge them in. Real DB sessions always take precedence; mocks fill
  // empty category tabs so the page isn't all empty states.
  //
  // Filter: "workout" category sessions are workout-builder outputs,
  // not training notes. They have no real session data (times, zones,
  // HR) — just the workout plan before it happened. Families should
  // only see actual training notes with data, not these empty shells.
  // Workout-builder outputs will get their own admin-only library.
  useEffect(() => {
    if (!athlete) return
    let active = true
    setLoading(true)
    loadAthleteSessions(athlete.id).then(s => {
      if (!active) return
      // Include workouts in the raw list — they're hidden from the 'all'
      // filter view but surfaced when the Workout chip is explicitly
      // selected. Mocks get the same treatment as real sessions.
      const real = (s || [])
      const mocks = (athlete.mockSessions || []).map(m => ({
        ...m,
        id: `mock_${m.id || Math.random().toString(36).slice(2, 8)}`,
        isMock: true,
      }))
      setSessions([...real, ...mocks])
      setLoading(false)
    })
    return () => { active = false }
  }, [athlete?.id])

  const initials = useMemo(() => {
    if (!athlete) return ''
    const f = (athlete.first || '').charAt(0).toUpperCase()
    const l = (athlete.last || '').charAt(0).toUpperCase()
    return f + l || '??'
  }, [athlete])

  // Pre-process sessions: normalize category, extract preview text, sort by date desc
  // Maps the fine-grained catKey to the four top-level note TYPES.
  // The note TYPE drives the LEFT-BAR STRIPE color on the card, so a
  // glance at the list tells you what kind of work the session was.
  // Training sub-categories (aerobic, threshold, quality, sprint, power,
  // activerest, recovery) all collapse to 'training'.
  const resolveNoteType = (catKey) => {
    if (catKey === 'technique') return 'technique'
    if (catKey === 'meetprep') return 'meetprep'
    if (catKey === 'workout') return 'workout'
    return 'training'  // default — catches all training sub-types
  }

  const normalized = useMemo(() => {
    return sessions
      .map(s => {
        // Unmapped categories land as 'aerobic' (most common default)
        // rather than leaking raw category strings like "workout" into
        // the UI. The upstream filter already removes workout-type sessions;
        // this is insurance against any other uncategorized sessions.
        const mapped = CATEGORY_MAP[s.category]
        const catKey = mapped?.key || 'aerobic'
        const catLabel = mapped?.label || 'Session'
        const data = s.data || {}
        return {
          id: s.id,
          raw: s,                           // keep original for onViewSession
          date: s.date || data.date || '',
          dateObj: parseSessionDate(s.date || data.date),
          category: s.category,
          catKey,
          catLabel,
          noteTypeKey: resolveNoteType(catKey),
          // SCY / LCM tag — stored in session data.poolType at save time.
          // Falls back to raw poolType field on the root session object in
          // case older data used a different shape.
          poolType: (data.poolType || s.poolType || '').toUpperCase() || null,
          title: data.title || deriveTitle(s),
          preview: derivePreview(data),
        }
      })
      .sort((a, b) => (b.dateObj?.getTime() || 0) - (a.dateObj?.getTime() || 0))
  }, [sessions])

  // Chip counts — each chip shows how many sessions it would surface.
  // 'all' counts everything EXCEPT workouts. Each noteTypeKey gets its own
  // count. (catKey counts aren't needed since sub-types don't have chips.)
  const counts = useMemo(() => {
    const c = { all: 0, training: 0, meetprep: 0, technique: 0, workout: 0 }
    for (const n of normalized) {
      const k = n.noteTypeKey
      c[k] = (c[k] || 0) + 1
      if (k !== 'workout') c.all += 1
    }
    return c
  }, [normalized])

  // Filtered list — filter semantics:
  //   'all'       → everything EXCEPT workouts (main session review)
  //   'training'  → only sessions whose noteTypeKey is 'training'
  //   'meetprep'  → only meet-prep notes
  //   'technique' → only technique notes
  //   'workout'   → ONLY workout notes (its own dedicated tab)
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return normalized.filter(n => {
      if (activeFilter === 'all') {
        if (n.noteTypeKey === 'workout') return false
      } else if (n.noteTypeKey !== activeFilter) {
        return false
      }
      if (q) {
        const hay = (n.title + ' ' + n.preview + ' ' + n.catLabel).toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [normalized, activeFilter, query])

  // Group by Month YYYY for the dividers
  const grouped = useMemo(() => {
    const groups = []
    let currentMonth = null
    for (const n of visible) {
      const m = n.dateObj
        ? n.dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' })
        : 'Undated'
      if (m !== currentMonth) {
        groups.push({ month: m, items: [] })
        currentMonth = m
      }
      groups[groups.length - 1].items.push(n)
    }
    return groups
  }, [visible])

  // Stats strip — counts EXCLUDE workouts. Workouts are workout-builder
  // outputs (planned sets), not actual training sessions, and shouldn't
  // inflate the session count.
  const stats = useMemo(() => {
    const sessionsOnly = normalized.filter(n => n.noteTypeKey !== 'workout')
    const total = sessionsOnly.length
    const thisMonth = countThisMonth(sessionsOnly)
    const mostCommon = findMostCommon(sessionsOnly) || '—'
    const lastSession = sessionsOnly[0]?.dateObj
      ? relativeDate(sessionsOnly[0].dateObj)
      : '—'
    return { total, thisMonth, mostCommon, lastSession }
  }, [normalized])

  if (!athlete) {
    return (
      <div className="v2">
        <FamilyNav active="Session Notes" onNavigate={onNavigate} onLogoClick={onLogoClick} currentAthleteId={athlete?.id} currentAthlete={athlete} linkedAthletes={linkedAthletes} onSwitchAthlete={onSwitchAthlete} />
        <main className="v2-main">
          <div className="empty-state">No athlete selected.</div>
        </main>
        <FamilyFooter />
      </div>
    )
  }

  return (
    <div className="v2">
      <FamilyNav active="Session Notes" athleteInitials={initials} onNavigate={onNavigate} onLogoClick={onLogoClick} currentAthleteId={athlete?.id} currentAthlete={athlete} linkedAthletes={linkedAthletes} onSwitchAthlete={onSwitchAthlete} />
      <main className="v2-main">
        {onBack && <button className="back" onClick={onBack}>← Back to Profile</button>}

        <div className="page-title">Session Notes</div>
        <div className="page-sub">
          Every coaching note written for {athlete.first}. Tap any note to read the full breakdown.
        </div>

        {/* Stats strip */}
        <div className="stats-strip">
          <div className="stat">
            <div className="label">Total Sessions</div>
            <div className="value">{stats.total}</div>
          </div>
          <div className="stat">
            <div className="label">This Month</div>
            <div className="value">{stats.thisMonth}</div>
          </div>
          <div className="stat">
            <div className="label">Most Common</div>
            <div className="value sm">{stats.mostCommon}</div>
          </div>
          <div className="stat">
            <div className="label">Last Session</div>
            <div className="value sm">{stats.lastSession}</div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="filter-chips">
            {FILTER_CHIPS.map(chip => {
              const count = counts[chip.id] || 0
              return (
                <button
                  key={chip.id}
                  className={`chip ${activeFilter === chip.id ? 'active' : ''}`}
                  onClick={() => setActiveFilter(chip.id)}
                >
                  {chip.label}
                  {count > 0 && <span className="count-badge">{count}</span>}
                </button>
              )
            })}
          </div>
          <input
            type="text"
            className="search-input"
            placeholder="Search notes…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {/* Feed */}
        {loading ? (
          <div className="empty-state">Loading sessions…</div>
        ) : grouped.length === 0 ? (
          <div className="empty-state">
            {normalized.length === 0
              ? 'No sessions saved yet. New coaching notes will appear here.'
              : 'No sessions match your filters.'}
          </div>
        ) : (
          <div className="notes-feed">
            {grouped.map(group => (
              <div key={group.month} className="notes-group">
                <div className="month-header">{group.month}</div>
                {group.items.map(n => (
                  <div
                    key={n.id}
                    className="note-card"
                    onClick={() => onViewSession && onViewSession(n.raw)}
                  >
                    <div className={`cat-stripe type-${n.noteTypeKey}`} />
                    <div className="note-body">
                      <div className="meta">
                        <span className={`cat-label ${n.catKey}`}>{n.catLabel}</span>
                        <span className="dot" />
                        <span className="date">{formatDate(n.dateObj)}</span>
                        {n.poolType && (
                          <>
                            <span className="dot" />
                            <span className="pool-tag">{n.poolType}</span>
                          </>
                        )}
                      </div>
                      <div className="title">{n.title}</div>
                      {n.preview && <div className="preview">{n.preview}</div>}
                    </div>
                    <div className="chev">›</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </main>
      <FamilyFooter />
      <FamilyTabBar active="notes" onNavigate={onNavigate} currentAthlete={athlete} />
    </div>
  )
}

// ============================================================
// Helpers
// ============================================================

function parseSessionDate(dateStr) {
  if (!dateStr) return null
  // Accept various formats — ISO "2026-04-20", "04/20/2026", "Apr 20, 2026", etc.
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

function formatDate(d) {
  if (!d) return 'Undated'
  const weekday = d.toLocaleString('en-US', { weekday: 'short' })
  const month = d.toLocaleString('en-US', { month: 'short' })
  return `${weekday} · ${month} ${d.getDate()}, ${d.getFullYear()}`
}

function relativeDate(d) {
  if (!d) return '—'
  const diffMs = Date.now() - d.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days < 0) return 'Upcoming'
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 14) return '1 week ago'
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 60) return '1 month ago'
  return `${Math.floor(days / 30)} months ago`
}

function countThisMonth(items) {
  const now = new Date()
  return items.filter(n =>
    n.dateObj &&
    n.dateObj.getMonth() === now.getMonth() &&
    n.dateObj.getFullYear() === now.getFullYear()
  ).length
}

function findMostCommon(items) {
  if (!items.length) return null
  const counts = {}
  for (const n of items) {
    counts[n.catLabel] = (counts[n.catLabel] || 0) + 1
  }
  let best = null
  let bestCount = 0
  for (const [label, count] of Object.entries(counts)) {
    if (count > bestCount) { best = label; bestCount = count }
  }
  return best
}

// Best-effort session-title derivation.
// Training notes save to data.{title, sessionName, focus, setOverview}.
// If none of those exist, we fall back to the category label alone —
// NEVER the literal string "X session" (fixes the "Workout session" /
// "Aerobic session" placeholder titles).
function deriveTitle(session) {
  const data = session.data || {}
  if (data.title) return data.title
  if (data.sessionName) return data.sessionName
  if (data.focus) return data.focus
  if (data.setOverview) {
    // setOverview is often a longer string — take just the first clause
    const first = String(data.setOverview).split(/[.—•]/)[0].trim()
    if (first) return first.length > 70 ? first.slice(0, 67) + '…' : first
  }
  if (data.category && data.distance) return `${data.category} — ${data.distance} yd`
  // Bare minimum: just use the clean category label
  return CATEGORY_MAP[session.category]?.label || 'Session'
}

function derivePreview(data) {
  if (!data) return ''
  // Try a few common fields; strip HTML if present; truncate
  const candidates = [
    data.summary,
    data.preview,
    data.whatWeDid,
    data.noteHtml,
    data.note,
  ].filter(Boolean)
  if (!candidates.length) return ''
  let text = String(candidates[0]).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (text.length > 280) text = text.slice(0, 277).trimEnd() + '…'
  return text
}
