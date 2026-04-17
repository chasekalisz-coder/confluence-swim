import { fullName, initials, primaryEvents } from '../data/athletes.js'

export default function AthleteGrid({ athletes, onSelect, connectionStatus }) {
  const dot = {
    'ok': { color: '#10b981', text: `${athletes.length} athletes loaded` },
    'no-table': { color: '#f59e0b', text: 'Database tables not created yet' },
    'missing-keys': { color: '#ef4444', text: 'Database keys not configured' },
    'error': { color: '#ef4444', text: 'Database connection error' },
    'loading': { color: '#9ca3af', text: 'Loading athletes...' }
  }[connectionStatus] || { color: '#9ca3af', text: '...' }

  return (
    <div className="page">
      <div className="page-heading">
        <h1>Athletes</h1>
        <div className="status-pill">
          <span className="dot" style={{ background: dot.color }} />
          {dot.text}
        </div>
      </div>

      {athletes.length === 0 && connectionStatus !== 'loading' && (
        <div className="empty-state">
          <p>No athletes yet.</p>
          {connectionStatus === 'no-table' && (
            <p className="muted">The Supabase database needs its tables created. See the setup guide in the README.</p>
          )}
        </div>
      )}

      <div className="athlete-grid">
        {athletes.map(a => (
          <button key={a.id} className="athlete-card" onClick={() => onSelect(a)}>
            <div className="athlete-avatar">{initials(a)}</div>
            <div className="athlete-body">
              <div className="athlete-name">{fullName(a)}</div>
              <div className="athlete-meta">Age {a.age}{a.dob ? ` · ${a.dob}` : ''}</div>
              <div className="athlete-events">{primaryEvents(a)}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
