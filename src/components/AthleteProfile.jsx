

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
  return 'training'
}

const NOTE_TYPE_COLORS = {
  training: '#0B1E38', meetprep: '#B8921A', technique: '#2dd4bf', workout: '#8b5cf6',
}
const NOTE_TYPE_LABELS = {
  training: 'Training', meetprep: 'Meet Prep', technique: 'Technique', workout: 'Workout', sprint: 'Sprint Lab',
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
    sessionNotes: false,
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
      }
      console.log(`[saveEdit] writing ${updated.meetTimes.length} times + ${(updated.goalTimes || []).length} goals for ${athlete.id}`)
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

  const filteredSessions = sessions.filter(s => {
    const sessionPool = s.data?.poolType
    if (sessionPool && sessionPool !== poolFilter) return false
    if (typeFilter !== 'all') { if (getNoteType(s) !== typeFilter) return false }
    return true
  })
  const poolSessions = sessions.filter(s => { const p = s.data?.poolType; return !p || p === poolFilter })
  const typeCounts = {
    all: poolSessions.length,
    training: poolSessions.filter(s => getNoteType(s) === 'training').length,
    meetprep: poolSessions.filter(s => getNoteType(s) === 'meetprep').length,
    technique: poolSessions.filter(s => getNoteType(s) === 'technique').length,
    workout: poolSessions.filter(s => getNoteType(s) === 'workout').length,
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
                <div style={{color:'var(--text-dim)',fontSize:13}}>
                  Meet-by-meet progression data (what drives the progression chart
                  on the athlete performance profile). Add / edit / delete coming
                  in the next step.
                </div>
              </div>
            )}
          </div>

          {/* ========== SESSION NOTES — collapsed placeholder ========== */}
          <div className="edit-section">
            <button
              type="button"
              className="edit-section-header"
              onClick={() => toggleSection('sessionNotes')}
              aria-expanded={openSections.sessionNotes}
            >
              <span className="edit-section-title">Session Notes</span>
              <span className="edit-section-chev">{openSections.sessionNotes ? '▾' : '▸'}</span>
            </button>
            {openSections.sessionNotes && (
              <div className="edit-section-body">
                <div style={{color:'var(--text-dim)',fontSize:13}}>
                  Session notes are managed from the athlete's main profile page
                  (click Save to return, then click this athlete's name on the
                  grid). Inline management within the edit page is planned but
                  not yet implemented.
                </div>
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
              <p className="muted">No {typeFilter === 'all' ? poolFilter : NOTE_TYPE_LABELS[typeFilter]} sessions recorded yet.</p>
              <p className="muted small">Click + New Session above to generate the first one.</p>
            </div>
          ) : (
            <div className="session-list">
              {filteredSessions.map(s => {
                const noteType = getNoteType(s)
                const stroke = labelStroke(s.data?.stroke)
                const category = labelCategory(s.category)
                const accentColor = NOTE_TYPE_COLORS[noteType] || NOTE_TYPE_COLORS.training
                let subtitle = ''
                if (noteType === 'technique') { subtitle = stroke || 'Technique' }
                else if (noteType === 'meetprep') { subtitle = 'Meet Prep' }
                else { subtitle = stroke ? `${category} · ${stroke}` : category }
                return (
                  <div key={s.id} className="session-row clickable" onClick={() => onViewSession && onViewSession(s)}>
                    <div className="session-type-accent" style={{background: accentColor}} />
                    <div className="session-info">
                      <div className="session-date">{s.date}</div>
                      <div className="session-cat">{subtitle}</div>
                    </div>
                    <div className="session-type-badge" style={{color: accentColor}}>{NOTE_TYPE_LABELS[noteType] || 'Training'}</div>
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
