


import { useState } from 'react'
import { fullName, initials, primaryEvents } from '../data/athletes.js'
import { addAthlete } from '../lib/db.js'
import { buildCanonicalTimesList } from '../lib/canonicalEvents.js'

export default function AthleteGrid({ athletes, onSelect, onViewProfile, connectionStatus, onAthleteAdded }) {
  const [adding, setAdding] = useState(false)
  const [newFirst, setNewFirst] = useState('')
  const [newLast, setNewLast] = useState('')
  const [newAge, setNewAge] = useState('')
  const [newDob, setNewDob] = useState('')
  const [newGender, setNewGender] = useState('')
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
      age: newAge ? parseInt(newAge) : null,
      dob: newDob.trim() || null,
      gender: newGender || null,
      showChampionshipCuts: true,
      events: [],
      // Pre-populate with the 35 canonical events so every athlete's
      // edit form starts with the same uniform rows. Times blank until
      // you enter them.
      meetTimes: buildCanonicalTimesList([]),
      goalTimes: buildCanonicalTimesList([]),
    }
    try {
      await addAthlete(athlete)
      if (onAthleteAdded) onAthleteAdded(athlete)
      setAdding(false)
      setNewFirst('')
      setNewLast('')
      setNewAge('')
      setNewDob('')
      setNewGender('')
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
          <div key={a.id} className="athlete-card">
            <div className="athlete-card-top">
              <div className="athlete-avatar">{initials(a)}</div>
              <div className="athlete-body">
                <div className="athlete-name">{fullName(a)}</div>
                <div className="athlete-meta">
                  Age {a.age}{a.dob ? ` · ${a.dob}` : ''}
                </div>
                <div className="athlete-events">{primaryEvents(a)}</div>
              </div>
            </div>
            <div className="athlete-card-actions">
              <button className="btn btn-outline" onClick={() => onViewProfile(a)}>
                View Profile
              </button>
              <button className="btn btn-primary" onClick={() => onSelect(a)}>
                Edit Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{display:'flex', gap:12, marginBottom:8, marginTop:8}}>
        <button className="tool-card" onClick={() => window.location.href = '/workout.html'} style={{flex:1, padding:'18px 20px', background:'linear-gradient(135deg, rgba(20,28,50,0.9), rgba(15,22,40,0.95))', border:'1px solid rgba(148,163,184,0.1)', borderRadius:12, cursor:'pointer', display:'flex', alignItems:'center', gap:14, transition:'all 0.25s', position:'relative', overflow:'hidden', textAlign:'left'}}>
          <div style={{width:42, height:42, borderRadius:10, background:'rgba(212,168,83,0.1)', border:'1px solid rgba(212,168,83,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, color:'#d4a853'}}>⚡</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14, fontWeight:600, color:'#f1f5f9', marginBottom:2}}>Build Workout</div>
            <div style={{fontSize:11, color:'#64748b'}}>AI-powered workout builder</div>
          </div>
          <span style={{color:'#334155', fontSize:18}}>→</span>
        </button>
        <button className="tool-card" onClick={() => window.location.href = '/pace.html'} style={{flex:1, padding:'18px 20px', background:'linear-gradient(135deg, rgba(20,28,50,0.9), rgba(15,22,40,0.95))', border:'1px solid rgba(148,163,184,0.1)', borderRadius:12, cursor:'pointer', display:'flex', alignItems:'center', gap:14, transition:'all 0.25s', position:'relative', overflow:'hidden', textAlign:'left'}}>
          <div style={{width:42, height:42, borderRadius:10, background:'rgba(0,186,230,0.1)', border:'1px solid rgba(0,186,230,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, color:'#00bae6'}}>◎</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14, fontWeight:600, color:'#f1f5f9', marginBottom:2}}>Race Pace Calculator</div>
            <div style={{fontSize:11, color:'#64748b'}}>Elite-modeled target splits</div>
          </div>
          <span style={{color:'#334155', fontSize:18}}>→</span>
        </button>
      </div>

      {adding ? (
        <div style={{maxWidth:400,marginTop:16,padding:20,background:'var(--elevated)',border:'1px solid var(--border)',borderRadius:8}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
            <input className="edit-input" placeholder="First name" value={newFirst} onChange={e => setNewFirst(e.target.value)} style={{marginBottom:0}} />
            <input className="edit-input" placeholder="Last name" value={newLast} onChange={e => setNewLast(e.target.value)} style={{marginBottom:0}} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'80px 1fr',gap:8,marginBottom:8}}>
            <input className="edit-input" type="number" placeholder="Age" value={newAge} onChange={e => setNewAge(e.target.value)} style={{marginBottom:0}} />
            <input className="edit-input" placeholder="Birthday (e.g., June 4)" value={newDob} onChange={e => setNewDob(e.target.value)} style={{marginBottom:0}} />
          </div>
          <div style={{marginBottom:12}}>
            <select
              className="edit-input"
              value={newGender}
              onChange={e => setNewGender(e.target.value)}
              style={{marginBottom:0}}
            >
              <option value="">— Gender —</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
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
