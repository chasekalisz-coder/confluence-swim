import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase.js'

export default function App() {
  const [supabaseStatus, setSupabaseStatus] = useState('checking')
  const [deployTime] = useState(new Date().toLocaleString())

  useEffect(() => {
    async function checkSupabase() {
      if (!supabase) {
        setSupabaseStatus('missing-keys')
        return
      }
      try {
        const { error } = await supabase.from('athletes').select('id').limit(1)
        if (error && error.code === '42P01') {
          setSupabaseStatus('connected-no-tables')
        } else if (error) {
          setSupabaseStatus('error')
        } else {
          setSupabaseStatus('connected')
        }
      } catch (e) {
        setSupabaseStatus('error')
      }
    }
    checkSupabase()
  }, [])

  const statusDisplay = {
    'checking': { dot: '#9ca3af', text: 'Checking connection...' },
    'connected': { dot: '#10b981', text: 'Supabase connected, athletes table found' },
    'connected-no-tables': { dot: '#f59e0b', text: 'Supabase connected, tables not yet created' },
    'missing-keys': { dot: '#ef4444', text: 'Supabase keys not configured' },
    'error': { dot: '#ef4444', text: 'Supabase connection error' }
  }[supabaseStatus]

  return (
    <div className="phase1-container">
      <div className="phase1-card">
        <div className="phase1-brand">
          <div className="phase1-brand-mark">CS</div>
          <div>
            <div className="phase1-brand-name">Confluence Swim</div>
            <div className="phase1-brand-sub">Phase 1 · Pipeline proof</div>
          </div>
        </div>

        <h1 className="phase1-headline">The pipeline works.</h1>
        <p className="phase1-lede">
          If you are reading this, the code on GitHub has been built by Vercel
          and deployed to a live URL. The foundation the last build never had
          is now in place.
        </p>

        <div className="phase1-status-row">
          <span className="phase1-dot" style={{ background: statusDisplay.dot }}></span>
          <span>{statusDisplay.text}</span>
        </div>

        <div className="phase1-meta">
          <div>App version: 0.1.0</div>
          <div>Page loaded: {deployTime}</div>
        </div>

        <div className="phase1-next">
          <div className="phase1-next-label">Next</div>
          <div>
            Phase 2 begins once Chase confirms this page is live.
            Shared infrastructure, athlete grid, and the new-session chooser
            come next.
          </div>
        </div>
      </div>
    </div>
  )
}
