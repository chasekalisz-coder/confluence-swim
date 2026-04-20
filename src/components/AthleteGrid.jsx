
import { useState } from 'react'
import { fullName, initials, primaryEvents } from '../data/athletes.js'
import { addAthlete } from '../lib/db.js'

export default function AthleteGrid({ athletes, onSelect, connectionStatus, onAthleteAdded }) {
  const [adding, setAdding] = useState(false)
  const [newFirst, setNewFirst] = useState('')
  const [newLast, setNewLast] = useState('')
  const [newDob, setNewDob] = useState('')
  const [saving, setSaving] = useState(false)

  const dot = {
    'ok': { color: '#10b981', text: `${athletes.length} athletes loaded` },
    'no-table': { color: '#f59e0b', text: 'Database tables not created yet' },
    'missing-keys': { color: '#ef4444', text: 'Database keys not configured' },
    'error': { color: '#ef4444', text: 'Database connection error' },
    'loading': { color: '#9ca3af', text: 'Loading athletes...' }
  }[connectionStatus] || { color: '#9ca3af', text: '...' }

  const handleAdd = async () => {
    if (!newFirst.trim()) return
    setSaving(true)
    const id = 'ath_' + newFirst.toLowerCase().replace(/[^a-z]/g, '') + '_' + Date.now().toString(36)
    const athlete = {
      id,
      first: newFirst.trim(),
      last: newLast.trim(),
      age: null,
      dob: newDob.trim() || null,
      events: [],
      meetTimes: [],
      goalTimes: [],
    }
    try {
      await addAthlete(athlete)
      if (onAthleteAdded) onAthleteAdded(athlete)
      setAdding(false)
      setNewFirst('')
      setNewLast('')
      setNewDob('')
    } catch (err) { alert('Failed to add: ' + err.message) }
    setSaving(false)
  }

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

      {adding ? (
        <div style={{maxWidth:400,marginTop:16,padding:20,background:'#fff',border:'1px solid var(--border)',borderRadius:8}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
            <input className="edit-input" placeholder="First name" value={newFirst} onChange={e => setNewFirst(e.target.value)} style={{marginBottom:0}} />
            <input className="edit-input" placeholder="Last name" value={newLast} onChange={e => setNewLast(e.target.value)} style={{marginBottom:0}} />
          </div>
          <input className="edit-input" placeholder="Birthday (e.g., June 4)" value={newDob} onChange={e => setNewDob(e.target.value)} />
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-outline" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAdd} disabled={saving || !newFirst.trim()}>{saving ? 'Adding...' : 'Add Athlete'}</button>
          </div>
        </div>
      ) : (
        <button className="add-athlete-btn" onClick={() => setAdding(true)}>+ Add New Athlete</button>
      )}
    </div>
  )
}
