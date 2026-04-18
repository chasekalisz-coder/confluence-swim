

import { useEffect, useState } from 'react'
import { fullName, initials } from '../data/athletes.js'
import { loadAthleteSessions } from '../lib/db.js'

const CATEGORY_DISPLAY = {
  aerobic: 'Aerobic',
  threshold: 'Threshold',
  active_rest: 'Active Rest',
  recovery: 'Recovery',
  quality: 'Quality',
  power: 'Power',
  meet_prep: 'Meet Prep',
  technique: 'Technique',
}

const STROKE_DISPLAY = {
  mixed: '',
  free: 'Freestyle',
  back: 'Backstroke',
  breast: 'Breaststroke',
  fly: 'Butterfly',
  im: 'IM',
  freestyle: 'Freestyle',
  backstroke: 'Backstroke',
  breaststroke: 'Breaststroke',
  butterfly: 'Butterfly',
  kick: 'Kick',
  turns: 'Turns',
  starts: 'Starts',
  underwaters: 'Underwaters',
}

function labelCategory(cat) {
  return CATEGORY_DISPLAY[cat] || cat
}
function labelStroke(stroke) {
  return STROKE_DISPLAY[stroke] || ''
}

function getNoteType(session) {
  if (session.data?.noteType) return session.data.noteType
  if (session.category === 'technique') return 'technique'
  if (session.category === 'meet_prep') return 'meetprep'
  return 'training'
}

const NOTE_TYPE_COLORS = {
  training: '#0B1E38',
  meetprep: '#B8921A',
  technique: '#2dd4bf',
}

const NOTE_TYPE_LABELS = {
  training: 'Training',
  meetprep: 'Meet Prep',
  technique: 'Technique',
}

export default function AthleteProfile({ athlete, onBack, onNewSession }) {
  const [sessions, setSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [poolFilter, setPoolFilter] = useState('SCY')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    let active = true
    setLoadingSessions(true)
    loadAthleteSessions(athlete.id).then(s => {
      if (active) {
        setSessions(s)
        setLoadingSessions(false)
      }
    })
    return () => { active = false }
  }, [athlete.id])

  const filteredTimes = athlete.meetTimes.filter(t => t.event.endsWith(poolFilter))

  const filteredSessions = sessions.filter(s => {
    const sessionPool = s.data?.poolType
    if (sessionPool && sessionPool !== poolFilter) return false
    if (typeFilter !== 'all') {
      const noteType = getNoteType(s)
      if (noteType !== typeFilter) return false
    }
    return true
  })

  const poolSessions = sessions.filter(s => {
    const sessionPool = s.data?.poolType
    return !sessionPool || sessionPool === poolFilter
  })
  const typeCounts = {
    all: poolSessions.length,
    training: poolSessions.filter(s => getNoteType(s) === 'training').length,
    meetprep: poolSessions.filter(s => getNoteType(s) === 'meetprep').length,
    technique: poolSessions.filter(s => getNoteType(s) === 'technique').length,
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
            {athlete.pronouns ? ` · ${athlete.pronouns}/${athlete.pronouns === 'she' ? 'her' : athlete.pronouns === 'he' ? 'him' : 'them'}` : ''}
          </div>
          <div className="profile-events">
            <span className="label">PRIMARY EVENTS</span>
            <div>{athlete.events.join(' · ')}</div>
          </div>
        </div>
        <div className="profile-action">
          <button className="btn btn-primary" onClick={() => onNewSession(athlete)}>
            + New Session
          </button>
        </div>
      </div>

      <div className="profile-grid">
        <section className="profile-section">
          <div className="section-header">
            <h2>Meet Times</h2>
            <div className="pool-toggle">
              <button
                className={poolFilter === 'SCY' ? 'active' : ''}
                onClick={() => setPoolFilter('SCY')}>SCY</button>
              <button
                className={poolFilter === 'LCM' ? 'active' : ''}
                onClick={() => setPoolFilter('LCM')}>LCM</button>
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
        </section>

        <section className="profile-section">
          <div className="section-header">
            <h2>Session History</h2>
            <span className="muted">
              {filteredSessions.length} session{filteredSessions.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="type-filter">
            {[
              { key: 'all', label: 'All' },
              { key: 'training', label: 'Training' },
              { key: 'meetprep', label: 'Meet Prep' },
              { key: 'technique', label: 'Technique' },
            ].map(f => (
              <button
                key={f.key}
                className={`type-filter-btn ${typeFilter === f.key ? 'active' : ''}`}
                onClick={() => setTypeFilter(f.key)}
              >
                {f.label}
                {typeCounts[f.key] > 0 && (
                  <span className="type-count">{typeCounts[f.key]}</span>
                )}
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
                if (noteType === 'technique') {
                  subtitle = stroke || 'Technique'
                } else if (noteType === 'meetprep') {
                  subtitle = 'Meet Prep'
                } else {
                  subtitle = stroke ? `${category} · ${stroke}` : category
                }

                return (
                  <div key={s.id} className="session-row">
                    <div className="session-type-accent" style={{ background: accentColor }} />
                    <div className="session-info">
                      <div className="session-date">{s.date}</div>
                      <div className="session-cat">{subtitle}</div>
                    </div>
                    <div className="session-type-badge" style={{ color: accentColor }}>
                      {NOTE_TYPE_LABELS[noteType] || 'Training'}
                    </div>
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
