


import { useState } from 'react'
import { fullName, initials, primaryEvents, makeBlankAthlete } from '../data/athletes.js'
import { addAthlete } from '../lib/db.js'
import { buildCanonicalTimesList } from '../lib/canonicalEvents.js'

export default function AthleteGrid({ athletes, onSelect, onViewProfile, connectionStatus, onAthleteAdded, onViewSlotRequests }) {
  const [adding, setAdding] = useState(false)
  const [newFirst, setNewFirst] = useState('')
  const [newLast, setNewLast] = useState('')
  const [newAge, setNewAge] = useState('')
  const [newDob, setNewDob] = useState('')
  const [newGender, setNewGender] = useState('')
  const [search, setSearch] = useState('')
  const [mobileTab, setMobileTab] = useState('athletes') // 'athletes' | 'tools' | 'settings'

  // Filter athletes by search
  const filteredAthletes = athletes.filter(a => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return fullName(a).toLowerCase().includes(q) ||
           (primaryEvents(a) || '').toLowerCase().includes(q)
  })
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)

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
    // Clean ID from first name. We keep IDs predictable (ath_<first>)
    // so import scripts and progression docs can match by ID directly.
    // If that ID is already taken, fall back to a numeric suffix
    // (ath_mason_2, ath_mason_3, ...) — never a random string.
    const baseId    = 'ath_' + newFirst.toLowerCase().replace(/[^a-z]/g, '')
    const takenIds  = new Set((athletes || []).map(a => a.id))
    let id = baseId
    let n = 2
    while (takenIds.has(id)) {
      id = baseId + '_' + n
      n += 1
    }
    const athlete = makeBlankAthlete({
      id,
      first: newFirst.trim(),
      last: newLast.trim(),
      age: newAge ? parseInt(newAge) : null,
      dob: newDob.trim() || null,
      gender: newGender || null,
      // Pre-populate with the 35 canonical events so every athlete's
      // edit form starts with the same uniform rows. Times blank until
      // you enter them.
      meetTimes: buildCanonicalTimesList([]),
      goalTimes: buildCanonicalTimesList([]),
    })
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

  const handleImportProgression = async () => {
    const ok = window.confirm(
      'Import progression data for all 11 athletes from the master docs?\n\n' +
      'This MERGES new entries — anything already on each athlete is preserved.\n' +
      'Running it twice is safe (duplicates are skipped).'
    )
    if (!ok) return
    setImporting(true)
    setImportResult(null)
    try {
      const r = await fetch('/api/import-progression', { method: 'POST' })
      const data = await r.json()
      if (!r.ok || !data.ok) throw new Error(data.error || 'Import failed')
      setImportResult(data.summary || [])
    } catch (err) {
      alert('Import failed: ' + err.message)
    }
    setImporting(false)
  }

  return (
    <div className="page agp">
      <div className="page-heading agp-heading">
        <h1>Athletes</h1>
        <div className="status-pill">
          <span className="dot" style={{ background: dot.color }} />
          {dot.text}
        </div>
      </div>

      {/* Mobile-only search bar */}
      <div className="agp-search-wrap">
        <input
          type="text"
          className="agp-search"
          placeholder="Search athletes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {athletes.length === 0 && connectionStatus !== 'loading' && (
        <div className="empty-state">
          <p>No athletes yet.</p>
        </div>
      )}

      {/* === ATHLETES TAB (mobile) / always shown (desktop) === */}
      <div className={`agp-tab-content ${mobileTab === 'athletes' ? 'agp-active' : ''}`}>
        <div className="athlete-grid">
          {filteredAthletes.map(a => (
            <div key={a.id} className="athlete-card">
              <button className="athlete-card-row-tap" onClick={() => onViewProfile(a)} aria-label={`View ${fullName(a)}`}>
                <div className="athlete-card-top">
                  <div className="athlete-avatar">{initials(a)}</div>
                  <div className="athlete-body">
                    <div className="athlete-name">{fullName(a)}</div>
                    <div className="athlete-meta">
                      Age {a.age}{a.dob ? ` · ${a.dob}` : ''}
                    </div>
                    <div className="athlete-events">{primaryEvents(a)}</div>
                  </div>
                  <span className="athlete-card-chev" aria-hidden="true">→</span>
                </div>
              </button>
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

        {/* No-results state when searching */}
        {search.trim() && filteredAthletes.length === 0 && (
          <div className="agp-no-results">
            No athletes match "{search}"
          </div>
        )}
      </div>
      {/* === END ATHLETES TAB === */}

      {/* === TOOLS TAB === */}
      <div className={`agp-tab-content agp-tools-tab ${mobileTab === 'tools' ? 'agp-active' : ''}`}>
        <div className="agp-tools-row">
          <button className="tool-card" onClick={() => window.location.href = '/workout.html'}>
            <div className="tool-icon" style={{background:'rgba(212,168,83,0.1)', borderColor:'rgba(212,168,83,0.2)', color:'#d4a853'}}>⚡</div>
            <div className="tool-text">
              <div className="tool-title">Build Workout</div>
              <div className="tool-sub">AI-powered workout builder</div>
            </div>
            <span className="tool-chev">→</span>
          </button>
          <button className="tool-card" onClick={() => window.location.href = '/pace.html'}>
            <div className="tool-icon" style={{background:'rgba(0,186,230,0.1)', borderColor:'rgba(0,186,230,0.2)', color:'#00bae6'}}>◎</div>
            <div className="tool-text">
              <div className="tool-title">Race Pace Calculator</div>
              <div className="tool-sub">Elite-modeled target splits</div>
            </div>
            <span className="tool-chev">→</span>
          </button>
          <button className="tool-card" onClick={onViewSlotRequests}>
            <div className="tool-icon" style={{background:'rgba(110,231,183,0.1)', borderColor:'rgba(110,231,183,0.2)', color:'#6ee7b7'}}>📅</div>
            <div className="tool-text">
              <div className="tool-title">Slot Requests</div>
              <div className="tool-sub">Family scheduling requests</div>
            </div>
            <span className="tool-chev">→</span>
          </button>
        </div>

      {adding ? (
        <div className="agp-add-form" style={{maxWidth:400,marginTop:16,padding:20,background:'var(--elevated)',border:'1px solid var(--border)',borderRadius:8}}>
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
      {/* === END TOOLS TAB === */}

      {/* === SETTINGS TAB (bulk import lives here) === */}
      <div className={`agp-tab-content agp-settings-tab ${mobileTab === 'settings' ? 'agp-active' : ''}`}>

      {(() => {
        // The bulk-import callout is a one-time setup tool. Once every
        // athlete has progression data, hide it. Showing a result panel
        // (right after a click) keeps the box visible so Chase can read
        // what landed.
        const everyoneHasProgression =
          (athletes || []).length > 0 &&
          (athletes || []).every(a => Array.isArray(a.progression) && a.progression.length > 0)
        const shouldShow = importResult || !everyoneHasProgression
        if (!shouldShow) return null
        return (
          <div style={{marginTop:24, padding:20, background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.25)', borderRadius:10}}>
            <div style={{fontSize:13, fontWeight:600, color:'#f1f5f9', marginBottom:6}}>
              Bulk import progression history
            </div>
            <div style={{fontSize:12, color:'#94a3b8', marginBottom:12, lineHeight:1.5}}>
              One-time setup: loads every historical swim from the master progression
              docs into the database. Safe to run more than once — duplicates skip
              automatically. This box hides itself once every athlete has progression
              data loaded.
            </div>
            <button
              className="btn btn-primary"
              onClick={handleImportProgression}
              disabled={importing}
              style={{background:'#7C3AED', borderColor:'#7C3AED'}}
            >
              {importing ? 'Importing…' : 'Import progression data'}
            </button>
            <button
              className="btn btn-outline"
              onClick={async () => {
                const r = await fetch('/api/fix-athlete-ids', { method: 'POST' })
                const d = await r.json()
                alert(JSON.stringify(d.results, null, 2))
                window.location.reload()
              }}
              style={{marginLeft:8, fontSize:12}}
            >
              Fix athlete IDs (one-time)
            </button>

            {importResult && (
              <div style={{marginTop:14, padding:12, background:'rgba(15,23,42,0.6)', border:'1px solid rgba(148,163,184,0.15)', borderRadius:8, fontSize:12, color:'#cbd5e1'}}>
                <div style={{fontWeight:600, color:'#10b981', marginBottom:8}}>Import complete.</div>
                {importResult.map((row, i) => (
                  <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom:i < importResult.length - 1 ? '1px solid rgba(148,163,184,0.08)' : 'none'}}>
                    <span>{row.name || row.athleteId}</span>
                    <span style={{color: row.status === 'ok' ? '#94a3b8' : '#f59e0b'}}>
                      {row.status === 'ok'
                        ? `+${row.addedNew} new · ${row.duplicatesSkipped} skipped · ${row.finalTotal} total`
                        : `skipped (${row.reason})`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })()}

      </div>
      {/* === END SETTINGS TAB === */}

      {/* === MOBILE-ONLY: Floating Action Button (Add Athlete) === */}
      {!adding && (
        <button
          className="agp-fab"
          onClick={() => setAdding(true)}
          aria-label="Add athlete"
        >
          +
        </button>
      )}

      {/* === MOBILE-ONLY: Bottom Tab Bar === */}
      <nav className="agp-tabbar">
        <button
          className={`agp-tab ${mobileTab === 'athletes' ? 'agp-tab-active' : ''}`}
          onClick={() => setMobileTab('athletes')}
        >
          <span className="agp-tab-icon">👥</span>
          <span className="agp-tab-label">Athletes</span>
        </button>
        <button
          className={`agp-tab ${mobileTab === 'tools' ? 'agp-tab-active' : ''}`}
          onClick={() => setMobileTab('tools')}
        >
          <span className="agp-tab-icon">⚡</span>
          <span className="agp-tab-label">Tools</span>
        </button>
        <button
          className={`agp-tab ${mobileTab === 'settings' ? 'agp-tab-active' : ''}`}
          onClick={() => setMobileTab('settings')}
        >
          <span className="agp-tab-icon">⚙</span>
          <span className="agp-tab-label">Settings</span>
        </button>
      </nav>

    </div>
  )
}
