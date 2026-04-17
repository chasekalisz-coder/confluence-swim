import { useEffect, useState } from 'react'
import { fullName, initials } from '../data/athletes.js'
import { loadAthleteSessions } from '../lib/supabase.js'

export default function AthleteProfile({ athlete, onBack, onNewSession }) {
  const [sessions, setSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [poolFilter, setPoolFilter] = useState('SCY')

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
            <span className="muted">{sessions.length} session{sessions.length === 1 ? '' : 's'}</span>
          </div>
          {loadingSessions ? (
            <p className="muted">Loading...</p>
          ) : sessions.length === 0 ? (
            <div className="empty-history">
              <p className="muted">No sessions recorded yet.</p>
              <p className="muted small">Click + New Session above to generate the first one.</p>
            </div>
          ) : (
            <div className="session-list">
              {sessions.map(s => (
                <div key={s.id} className="session-row">
                  <div>
                    <div className="session-date">{s.date}</div>
                    <div className="session-cat">{s.category}</div>
                  </div>
                  <div className="session-arrow">→</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
