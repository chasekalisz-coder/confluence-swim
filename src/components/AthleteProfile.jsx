

import { useEffect, useState } from 'react'
import { fullName, initials } from '../data/athletes.js'
import { loadAthleteSessions, deleteSession, updateAthlete, deleteAthlete } from '../lib/db.js'
import { CANONICAL_EVENTS, displayEventName, buildCanonicalTimesList } from '../lib/canonicalEvents.js'

const ALL_EVENTS = [
  '50 Free','100 Free','200 Free','500 Free','1000 Free','1650 Free',
  '50 Back','100 Back','200 Back',
  '50 Breast','100 Breast','200 Breast',
  '50 Fly','100 Fly','200 Fly',
  '100 IM','200 IM','400 IM',
]

const CATEGORY_DISPLAY = {
  aerobic: 'Aerobic', threshold: 'Threshold', active_rest: 'Active Rest',
  recovery: 'Recovery', quality: 'Quality', power: 'Power',
  meet_prep: 'Meet Prep', technique: 'Technique',
}
const STROKE_DISPLAY = {
  mixed: '', free: 'Freestyle', back: 'Backstroke', breast: 'Breaststroke',
  fly: 'Butterfly', im: 'IM', freestyle: 'Freestyle', backstroke: 'Backstroke',
  breaststroke: 'Breaststroke', butterfly: 'Butterfly', kick: 'Kick',
  turns: 'Turns', starts: 'Starts', underwaters: 'Underwaters',
}
function labelCategory(cat) { return CATEGORY_DISPLAY[cat] || cat }
function labelStroke(stroke) { return STROKE_DISPLAY[stroke] || '' }

function getNoteType(session) {
  if (session.data?.noteType) return session.data.noteType
  if (session.category === 'technique') return 'technique'
  if (session.category === 'meet_prep') return 'meetprep'
  if (session.category === 'workout') return 'workout'
  if (session.category === 'sprint') return 'sprint'
  return 'training'
}

// TYPE stripe colors — matches FamilyNotes / apple-dark.css. Each note
// TYPE (big bucket) gets a distinct colored stripe on the card edge.
const NOTE_TYPE_COLORS = {
  training:  '#BF5AF2',   // purple — all training sub-types share this bar
  meetprep:  '#D4A853',   // gold
  technique: '#FF9F0A',   // orange
  workout:   '#64D2FF',   // teal
  sprint:    '#FF6482',   // pink — Sprint Lab is its own system (Coach McEvoy)
}
const NOTE_TYPE_LABELS = {
  training: 'Training', meetprep: 'Meet Prep', technique: 'Technique', workout: 'Workout', sprint: 'Sprint Lab',
}

// Training sub-type text colors — reveals the fine-grained session type
// while the parent stripe stays purple. Aligned with apple-dark.css.
const SUBTYPE_COLORS = {
  aerobic:     '#0A84FF',  // blue
  threshold:   '#64D2FF',  // teal
  quality:     '#FFD60A',  // yellow
  sprint:      '#FF9F0A',  // orange
  power:       '#FF6482',  // pink
  active_rest: '#30D158',  // green
  recovery:    '#5EEAD4',  // sage
  technique:   '#FF9F0A',  // orange (standalone, matches its type stripe)
  meetprep:    '#D4A853',  // gold
  meet_prep:   '#D4A853',
  workout:     '#64D2FF',  // teal
}
function subtypeColor(category) {
  return SUBTYPE_COLORS[category] || '#a1a1a6'
}

// Display labels for the category (training sub-type or note type label)
const CATEGORY_LABELS = {
  aerobic:     'Aerobic',
  threshold:   'Threshold',
  quality:     'Quality',
  sprint:      'Sprint',
  power:       'Power',
  active_rest: 'Active Rest',
  recovery:    'Recovery',
  technique:   'Technique',
  meetprep:    'Meet Prep',
  meet_prep:   'Meet Prep',
  workout:     'Workout',
}

export default function AthleteProfile({ athlete, onBack, onNewSession, onViewSession, onAthleteUpdated, onAthleteDeleted }) {
  const [sessions, setSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [poolFilter, setPoolFilter] = useState('SCY')
  const [typeFilter, setTypeFilter] = useState('all')
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState(null)
  const [saving, setSaving] = useState(false)

  // Track which collapsible sections are open on the edit page. Basics is
  // always open (no entry in this object = open/default). Everything else
  // starts collapsed so the edit page is scannable when first opened.
  const [openSections, setOpenSections] = useState({
    meetTimes: false,
    goalTimes: false,
    meetResults: false,
  })
  const toggleSection = (key) => setOpenSections(s => ({ ...s, [key]: !s[key] }))

  useEffect(() => {
    let active = true
    setLoadingSessions(true)
    loadAthleteSessions(athlete.id).then(s => {
      if (active) { setSessions(s); setLoadingSessions(false) }
    })
    return () => { active = false }
  }, [athlete.id])

  const handleDelete = async (sessionId, e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this session? This cannot be undone.')) return
    try {
      await deleteSession(sessionId)
      setSessions(prev => prev.filter(s => s.id !== sessionId))
    } catch (err) { alert('Delete failed: ' + err.message) }
  }

  const startEdit = () => {
    setEditData({
      first: athlete.first || '',
      last: athlete.last || '',
      age: athlete.age != null ? String(athlete.age) : '',
      dob: athlete.dob || '',
      gender: athlete.gender || '',
      showChampionshipCuts: athlete.showChampionshipCuts ?? true,
      events: [...(athlete.events || [])],
      // Canonical expansion — every athlete's edit form shows the same
      // 35 events in the same order. Existing times are preserved; missing
      // events become empty rows ready to fill in.
      meetTimes: buildCanonicalTimesList(athlete.meetTimes || []),
      goalTimes: buildCanonicalTimesList(athlete.goalTimes || []),
      // Progression (meet results). Read-only in Step 7, editable in
      // Step 8. Not canonical-expanded — each entry is a real recorded
      // swim, not a placeholder slot.
      progression: Array.isArray(athlete.progression) ? [...athlete.progression] : [],
    })
    setEditing(true)
  }

  const saveEdit = async () => {
    setSaving(true)
    try {
      const age = editData.age ? parseInt(editData.age) : athlete.age
      const updated = {
        ...athlete,
        first: editData.first,
        last: editData.last,
        dob: editData.dob,
        age,
        gender: editData.gender || null,
        showChampionshipCuts: editData.showChampionshipCuts,
        events: editData.events,
        meetTimes: editData.meetTimes,
        goalTimes: editData.goalTimes,
        // Progression is a first-class field now (Step 6 — it persists
        // to the DB). Send it explicitly so nothing accidentally falls
        // back on the stale ...athlete spread during edit sessions.
        progression: editData.progression || [],
      }
      console.log(`[saveEdit] writing ${updated.meetTimes.length} times + ${(updated.goalTimes || []).length} goals + ${updated.progression.length} progression entries for ${athlete.id}`)
      await updateAthlete(athlete.id, updated)
      setEditing(false)
      if (onAthleteUpdated) onAthleteUpdated(updated)
      console.log(`[saveEdit] ${athlete.id} saved + verified`)
    } catch (err) {
      console.error('[saveEdit] failed:', err)
      alert('Save failed: ' + err.message + '\n\nOpen DevTools → Console for full details.')
    }
    setSaving(false)
  }

  const handleDeleteAthlete = async () => {
    if (!window.confirm('Delete ' + fullName(athlete) + ' and ALL their sessions? This cannot be undone.')) return
    try {
      await deleteAthlete(athlete.id)
      if (onAthleteDeleted) onAthleteDeleted(athlete.id)
    } catch (err) { alert('Delete failed: ' + err.message) }
  }

  const filteredTimes = (editing ? editData.meetTimes : athlete.meetTimes).filter(t => t.event.endsWith(poolFilter))
  const goalTimes = (editing ? editData.goalTimes : (athlete.goalTimes || [])).filter(t => t.event.endsWith(poolFilter))

  // Session filter:
  //   'all'       → every session EXCEPT workouts and sprint lab
  //                 (main training review view)
  //   named type  → only that note type (training / meetprep / technique
  //                 / workout / sprint)
  // NOTE: the SCY/LCM poolFilter deliberately does NOT apply here anymore.
  // Sessions span both courses and should always be visible regardless
  // of which pool the times table is showing. Each card shows its own
  // SCY/LCM tag so you can still see the pool per session.
  const filteredSessions = sessions.filter(s => {
    const nt = getNoteType(s)
    if (typeFilter === 'all') {
      // Sprint Lab is a parallel system (Coach McEvoy), kept out of the
      // main review view the same way workouts are. Its own chip surfaces
      // them when wanted.
      return nt !== 'workout' && nt !== 'sprint'
    }
    return nt === typeFilter
  })

  // Counts — 'all' excludes workouts AND sprint lab, matching the filter.
  const typeCounts = {
    all: sessions.filter(s => {
      const nt = getNoteType(s)
      return nt !== 'workout' && nt !== 'sprint'
    }).length,
    training:  sessions.filter(s => getNoteType(s) === 'training').length,
    meetprep:  sessions.filter(s => getNoteType(s) === 'meetprep').length,
    technique: sessions.filter(s => getNoteType(s) === 'technique').length,
    workout:   sessions.filter(s => getNoteType(s) === 'workout').length,
    sprint:    sessions.filter(s => getNoteType(s) === 'sprint').length,
  }

  if (editing) {
    return (
      <div className="page">
        <button className="back-link" onClick={() => setEditing(false)}>← Cancel editing</button>
        <h1 style={{fontFamily:'var(--font-serif)',marginBottom:24}}>Edit Athlete</h1>
        <div style={{maxWidth:720}}>

          {/* ========== BASICS — always open ========== */}
          <div className="edit-section">
            <div className="edit-section-header edit-section-header--static">
              <span className="edit-section-title">Basics</span>
            </div>
            <div className="edit-section-body">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                <div><label className="edit-label">First Name</label><input className="edit-input" value={editData.first} onChange={e => setEditData({...editData, first: e.target.value})} /></div>
                <div><label className="edit-label">Last Name</label><input className="edit-input" value={editData.last} onChange={e => setEditData({...editData, last: e.target.value})} /></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'100px 1fr',gap:12,marginBottom:16}}>
                <div><label className="edit-label">Age</label><input className="edit-input" type="number" value={editData.age} onChange={e => setEditData({...editData, age: e.target.value})} placeholder="12" /></div>
                <div><label className="edit-label">Birthday (e.g., June 4)</label><input className="edit-input" value={editData.dob} onChange={e => setEditData({...editData, dob: e.target.value})} placeholder="June 4" /></div>
              </div>

              {/* Gender — drives USA Swimming time-standard lookups. */}
              <div style={{marginBottom:16}}>
                <label className="edit-label">Gender</label>
                <select
                  className="edit-input"
                  value={editData.gender}
                  onChange={e => setEditData({...editData, gender: e.target.value})}
                >
                  <option value="">— Select —</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>

              {/* Championship toggle. */}
              <div style={{marginBottom:16}}>
                <label
                  className="edit-label"
                  style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}
                >
                  <input
                    type="checkbox"
                    checked={editData.showChampionshipCuts ?? true}
                    onChange={e => setEditData({...editData, showChampionshipCuts: e.target.checked})}
                    style={{width:18,height:18,cursor:'pointer'}}
                  />
                  Show championship standards on this athlete's profile
                </label>
              </div>

              {/* Primary Events */}
              <div style={{marginBottom:0}}>
                <label className="edit-label">Primary Events</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:8}}>
                  {editData.events.map((ev, i) => (
                    <span key={i} className="event-chip">{ev} <button className="chip-x" onClick={() => setEditData({...editData, events: editData.events.filter((_,j) => j !== i)})}>x</button></span>
                  ))}
                </div>
                <select className="edit-input" value="" onChange={e => { if (e.target.value && !editData.events.includes(e.target.value)) setEditData({...editData, events: [...editData.events, e.target.value]}); e.target.value = '' }}>
                  <option value="">+ Add event...</option>
                  {ALL_EVENTS.filter(ev => !editData.events.includes(ev)).map(ev => <option key={ev} value={ev}>{ev}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ========== MEET TIMES — collapsed by default ========== */}
          <div className="edit-section">
            <button
              type="button"
              className="edit-section-header"
              onClick={() => toggleSection('meetTimes')}
              aria-expanded={openSections.meetTimes}
            >
              <span className="edit-section-title">Meet Times</span>
              <span className="edit-section-chev">{openSections.meetTimes ? '▾' : '▸'}</span>
            </button>
            {openSections.meetTimes && (
              <div className="edit-section-body">
                <div className="pool-toggle" style={{marginBottom:12}}>
                  <button className={poolFilter === 'SCY' ? 'active' : ''} onClick={() => setPoolFilter('SCY')}>SCY</button>
                  <button className={poolFilter === 'LCM' ? 'active' : ''} onClick={() => setPoolFilter('LCM')}>LCM</button>
                </div>
                {filteredTimes.map((t) => {
                  const globalIdx = editData.meetTimes.indexOf(t)
                  return (
                    <div key={t.event} style={{display:'grid',gridTemplateColumns:'1fr 120px',gap:8,alignItems:'center',marginBottom:4}}>
                      <div style={{fontSize:13,color:'var(--text-dim)'}}>
                        {displayEventName(t.event)}
                      </div>
                      <input
                        className="edit-input"
                        style={{marginBottom:0,fontFamily:'monospace'}}
                        value={t.time}
                        placeholder="—"
                        onChange={e => {
                          const mt = [...editData.meetTimes]
                          mt[globalIdx] = { ...t, time: e.target.value }
                          setEditData({...editData, meetTimes: mt})
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ========== GOAL TIMES — collapsed by default ========== */}
          <div className="edit-section">
            <button
              type="button"
              className="edit-section-header"
              onClick={() => toggleSection('goalTimes')}
              aria-expanded={openSections.goalTimes}
            >
              <span className="edit-section-title">Goal Times</span>
              <span className="edit-section-chev">{openSections.goalTimes ? '▾' : '▸'}</span>
            </button>
            {openSections.goalTimes && (
              <div className="edit-section-body">
                <div className="pool-toggle" style={{marginBottom:12}}>
                  <button className={poolFilter === 'SCY' ? 'active' : ''} onClick={() => setPoolFilter('SCY')}>SCY</button>
                  <button className={poolFilter === 'LCM' ? 'active' : ''} onClick={() => setPoolFilter('LCM')}>LCM</button>
                </div>
                {goalTimes.map((t) => {
                  const globalIdx = (editData.goalTimes || []).indexOf(t)
                  return (
                    <div key={t.event} style={{display:'grid',gridTemplateColumns:'1fr 120px',gap:8,alignItems:'center',marginBottom:4}}>
                      <div style={{fontSize:13,color:'var(--text-dim)'}}>
                        {displayEventName(t.event)}
                      </div>
                      <input
                        className="edit-input"
                        style={{marginBottom:0,fontFamily:'monospace'}}
                        value={t.time}
                        placeholder="—"
                        onChange={e => {
                          const gt = [...editData.goalTimes]
                          gt[globalIdx] = { ...t, time: e.target.value }
                          setEditData({...editData, goalTimes: gt})
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ========== MEET RESULTS — collapsed placeholder (Step 7+) ========== */}
          <div className="edit-section">
            <button
              type="button"
              className="edit-section-header"
              onClick={() => toggleSection('meetResults')}
              aria-expanded={openSections.meetResults}
            >
              <span className="edit-section-title">Meet Results</span>
              <span className="edit-section-chev">{openSections.meetResults ? '▾' : '▸'}</span>
            </button>
            {openSections.meetResults && (
              <div className="edit-section-body">
                <MeetResultsReadOnly progression={editData.progression} />
              </div>
            )}
          </div>

          {/* ========== Bottom action bar ========== */}
          <div style={{display:'flex',gap:8,justifyContent:'space-between',marginTop:24}}>
            <button className="btn-danger" onClick={handleDeleteAthlete}>Delete Athlete</button>
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <button className="back-link" onClick={onBack}>← All athletes</button>
      <div className="profile-header">
        <div className="profile-avatar-lg">{initials(athlete)}</div>
        <div>
          <h1 className="profile-name">{fullName(athlete)}</h1>
          <div className="profile-meta">
            Age {athlete.age}
            {athlete.dob ? ` · Birthday ${athlete.dob}` : ''}
          </div>
          <div className="profile-events">
            <span className="label">PRIMARY EVENTS</span>
            <div>{athlete.events.join(' · ')}</div>
          </div>
        </div>
        <div className="profile-action">
          <button className="btn btn-outline" style={{marginRight:8}} onClick={startEdit}>Edit Profile</button>
          <button className="btn btn-primary" onClick={() => onNewSession(athlete)}>+ New Session</button>
        </div>
      </div>
      <div className="profile-grid">
        <section className="profile-section">
          <div className="section-header">
            <h2>Meet Times</h2>
            <div className="pool-toggle">
              <button className={poolFilter === 'SCY' ? 'active' : ''} onClick={() => setPoolFilter('SCY')}>SCY</button>
              <button className={poolFilter === 'LCM' ? 'active' : ''} onClick={() => setPoolFilter('LCM')}>LCM</button>
            </div>
          </div>
          {filteredTimes.length === 0 ? (
            <p className="muted">No {poolFilter} times on file yet.</p>
          ) : (
            <div className="meet-times-list">
              {filteredTimes.map((t, i) => (
                <div key={i} className="meet-time-row">
                  <span className="event">{t.event.replace(` ${poolFilter}`, '')}</span>
                  <span className="time">{t.time}</span>
                </div>
              ))}
            </div>
          )}
          {goalTimes.length > 0 && (
            <>
              <div className="section-header" style={{marginTop:24}}><h2>Goal Times</h2></div>
              <div className="meet-times-list">
                {goalTimes.map((t, i) => (
                  <div key={i} className="meet-time-row">
                    <span className="event">{t.event.replace(` ${poolFilter}`, '')}</span>
                    <span className="time" style={{color:'var(--gold)'}}>{t.time}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
        <section className="profile-section">
          <div className="section-header">
            <h2>Session History</h2>
            <span className="muted">{filteredSessions.length} session{filteredSessions.length === 1 ? '' : 's'}</span>
          </div>
          <div className="type-filter">
            {[{key:'all',label:'All'},{key:'training',label:'Training'},{key:'meetprep',label:'Meet Prep'},{key:'technique',label:'Technique'},{key:'workout',label:'Workout'},{key:'sprint',label:'Sprint Lab'}].map(f => (
              <button key={f.key} className={`type-filter-btn ${typeFilter === f.key ? 'active' : ''}`} onClick={() => setTypeFilter(f.key)}>
                {f.label}{typeCounts[f.key] > 0 && <span className="type-count">{typeCounts[f.key]}</span>}
              </button>
            ))}
          </div>
          {loadingSessions ? (
            <p className="muted">Loading...</p>
          ) : filteredSessions.length === 0 ? (
            <div className="empty-history">
              <p className="muted">No {typeFilter === 'all' ? '' : NOTE_TYPE_LABELS[typeFilter] + ' '}sessions recorded yet.</p>
              <p className="muted small">Click + New Session above to generate the first one.</p>
            </div>
          ) : (
            <div className="session-list">
              {filteredSessions.map(s => {
                const noteType = getNoteType(s)
                const typeStripeColor = NOTE_TYPE_COLORS[noteType] || NOTE_TYPE_COLORS.training
                // For standalone note types (sprint lab, technique, meetprep,
                // workout), the label matches the note type — ignoring the raw
                // category so a Sprint Lab session (category='sprint',
                // noteType='sprint') shows 'SPRINT LAB' in pink, not 'SPRINT'
                // in orange (which is the training sub-type color).
                // For training notes, the category IS the sub-type and
                // reveals the fine-grained flavor (aerobic/threshold/sprint
                // /power/active_rest/recovery/quality) with its own color.
                const isStandalone = noteType !== 'training'
                const labelKey = isStandalone ? noteType : (s.category || 'aerobic')
                const catLabelColor = isStandalone
                  ? (NOTE_TYPE_COLORS[noteType] || '#a1a1a6')
                  : subtypeColor(labelKey)
                const catLabelText = (
                  isStandalone
                    ? (NOTE_TYPE_LABELS[noteType] || 'Session')
                    : (CATEGORY_LABELS[labelKey] || labelKey || 'Session')
                ).toUpperCase()
                const poolTag = (s.data?.poolType || '').toUpperCase() || null
                return (
                  <div key={s.id} className="session-row clickable" onClick={() => onViewSession && onViewSession(s)}>
                    <div className="session-type-accent" style={{background: typeStripeColor}} />
                    <div className="session-info">
                      <div className="session-meta-row">
                        <span className="session-cat-label" style={{color: catLabelColor}}>{catLabelText}</span>
                        <span className="session-meta-dot" />
                        <span className="session-date">{s.date}</span>
                        {poolTag && (
                          <>
                            <span className="session-meta-dot" />
                            <span className="session-pool-tag">{poolTag}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button className="session-delete" title="Delete session" onClick={(e) => handleDelete(s.id, e)}>×</button>
                    <div className="session-arrow">→</div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function calcAge(dob) {
  if (!dob) return null
  let d
  if (dob.includes('-')) { d = new Date(dob) }
  else {
    const months = {january:0,february:1,march:2,april:3,may:4,june:5,july:6,august:7,september:8,october:9,november:10,december:11}
    const parts = dob.toLowerCase().trim().split(/[\s,]+/)
    const monthName = parts[0]
    const day = parseInt(parts[1]) || 1
    const mo = months[monthName]
    if (mo === undefined) return null
    d = new Date(2012, mo, day)
  }
  if (isNaN(d.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age
}

// ========================================================================
// MeetResultsReadOnly
// ------------------------------------------------------------------------
// Step 7: read-only render of the athlete's progression data, grouped by
// event in canonical order (SCY first, then LCM; within course Free → Fly
// → Back → Breast → IM; within stroke shortest → longest). Within each
// event the fastest time floats to the top; remaining entries sort by
// date newest-first so recent results are visible without scrolling deep.
//
// Empty state for athletes with no progression yet — the 12 non-Jon
// athletes today. Step 8 will swap the '(read-only)' label for an Add
// button and per-row Edit/Delete controls, and Step 11 will bulk-load
// Jon's 275-entry real progression through this same UI.
// ========================================================================
function MeetResultsReadOnly({ progression }) {
  const entries = Array.isArray(progression) ? progression : []

  if (entries.length === 0) {
    return (
      <div style={{color:'var(--text-dim)',fontSize:13,padding:'12px 0'}}>
        No meet results recorded yet.
        <div style={{fontSize:11,marginTop:6,color:'var(--text-muted)'}}>
          Add / edit / delete controls coming in the next step.
        </div>
      </div>
    )
  }

  // Group entries by event
  const byEvent = {}
  for (const e of entries) {
    const ev = e.event || 'Unknown'
    if (!byEvent[ev]) byEvent[ev] = []
    byEvent[ev].push(e)
  }

  // Order the groups: canonical events in their defined order first,
  // then any non-canonical events (legacy data) alphabetically at the end.
  const canonicalPresent = CANONICAL_EVENTS.filter(ev => byEvent[ev])
  const extras = Object.keys(byEvent).filter(ev => !CANONICAL_EVENTS.includes(ev)).sort()
  const orderedEvents = [...canonicalPresent, ...extras]

  // Within an event: fastest first, then by date newest-first for ties
  // and remaining entries. Times are "M:SS.xx" strings — convert to
  // seconds for comparison.
  const timeToSec = (t) => {
    if (!t) return Infinity
    const s = String(t).trim()
    if (s.includes(':')) {
      const [m, rest] = s.split(':')
      return (parseInt(m, 10) || 0) * 60 + (parseFloat(rest) || 0)
    }
    return parseFloat(s) || Infinity
  }
  const dateToSortable = (d) => {
    if (!d) return ''
    // ISO dates sort lexicographically already. "pending" / non-ISO sinks.
    return /^\d{4}-\d{2}-\d{2}/.test(String(d)) ? String(d) : ''
  }

  const totalCount = entries.length
  const eventCount = orderedEvents.length

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <div style={{color:'var(--text-dim)',fontSize:12,letterSpacing:'0.04em',textTransform:'uppercase'}}>
        {totalCount} result{totalCount === 1 ? '' : 's'} across {eventCount} event{eventCount === 1 ? '' : 's'} · read-only
      </div>

      {orderedEvents.map(ev => {
        const list = [...byEvent[ev]].sort((a, b) => {
          const ta = timeToSec(a.time)
          const tb = timeToSec(b.time)
          if (ta !== tb) return ta - tb
          return dateToSortable(b.date).localeCompare(dateToSortable(a.date))
        })
        const fastest = timeToSec(list[0]?.time)

        return (
          <div key={ev} className="meet-results-event-group">
            <div className="meet-results-event-header">
              <span className="meet-results-event-name">{displayEventName(ev)}</span>
              <span className="meet-results-event-count">{list.length} result{list.length === 1 ? '' : 's'}</span>
            </div>
            <div className="meet-results-rows">
              {list.map((row, i) => {
                const isBest = timeToSec(row.time) === fastest && i === 0
                return (
                  <div key={i} className={`meet-results-row ${isBest ? 'is-best' : ''}`}>
                    <span className="meet-results-time">{row.time || '—'}</span>
                    <span className="meet-results-date">{formatMeetDate(row.date)}</span>
                    <span className="meet-results-meet">{row.meet || ''}</span>
                    {isBest && <span className="meet-results-best-tag">BEST</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// "2026-02-14" → "Feb 14, 2026". Pass-through for "pending" / empty / other.
function formatMeetDate(d) {
  if (!d) return ''
  const s = String(d).trim()
  if (!/^\d{4}-\d{2}-\d{2}/.test(s)) return s  // "pending" etc.
  const date = new Date(s + 'T12:00:00')
  if (isNaN(date.getTime())) return s
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
