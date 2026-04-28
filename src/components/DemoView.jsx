// ============================================================
// DemoView.jsx
// ============================================================
// Public, no-auth demo route for sharing a single athlete profile.
// Routes handled here:
//   /demo/chase  →  Chase Kalisz's Profile + Performance Analysis
//
// This component is rendered OUTSIDE the Clerk <SignedIn> / <SignedOut>
// gate in App.jsx — it must never call any auth hook (useUser,
// useAuth, etc.) and must never read Clerk state. It loads athlete
// data directly from the public /api/db endpoint via loadAthletes().
//
// Read-only by design:
//   • No edit buttons, no admin chrome
//   • No athlete switcher (linkedAthletes is empty)
//   • No back-to-home button (onBack is null)
//   • No nav-out to standalone tool pages (Race Pace etc.) since
//     those are auth-gated; the relevant tool cards inside
//     FamilyProfile/FamilyAnalysis still render but their click
//     handlers no-op via a safe onNavigate that ignores tool routes
//
// If Chase wants more demo athletes later, add them to the slug map
// at the top of this file. The match logic stays the same.
// ============================================================

import { useEffect, useState } from 'react'
import { loadAthletes } from '../lib/db.js'
import FamilyProfile from './FamilyProfile.jsx'
import FamilyAnalysis from './FamilyAnalysis.jsx'

// Slug → athlete-id mapping. Add new demo athletes here.
const DEMO_SLUGS = {
  chase: 'ath_chase',
}

export default function DemoView({ slug }) {
  const [athlete, setAthlete] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | not_found | error
  const [view, setView] = useState('profile')     // profile | analysis

  // Resolve the slug to an athlete id once on mount.
  const athleteId = DEMO_SLUGS[slug] || null

  useEffect(() => {
    let cancelled = false

    if (!athleteId) {
      setStatus('not_found')
      return
    }

    ;(async () => {
      try {
        const { athletes } = await loadAthletes()
        if (cancelled) return
        const found = (athletes || []).find(a => a.id === athleteId)
        if (!found) {
          setStatus('not_found')
          return
        }
        setAthlete(found)
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        console.error('DemoView load failed:', err)
        setStatus('error')
      }
    })()

    return () => { cancelled = true }
  }, [athleteId])

  // Read the initial view from URL hash so /demo/chase#analysis lands
  // directly on the analysis tab. Also respond to hashchange.
  useEffect(() => {
    function applyHash() {
      const raw = (window.location.hash || '').replace('#', '').toLowerCase()
      if (raw === 'analysis' || raw === 'performance-analysis') {
        setView('analysis')
      } else {
        setView('profile')
      }
    }
    applyHash()
    window.addEventListener('hashchange', applyHash)
    return () => window.removeEventListener('hashchange', applyHash)
  }, [])

  // Loading / error / not-found splash. Same dark background palette
  // as the rest of the app so it doesn't flash white between states.
  if (status !== 'ready') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#06080d',
        color: '#f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        textAlign: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      }}>
        <img
          src="/assets/confluence-swim-white.png"
          alt="Confluence Swim"
          style={{ height: 32, marginBottom: 28, opacity: 0.85 }}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
        {status === 'loading' && (
          <div style={{ fontSize: 13, color: '#94a3b8', letterSpacing: '0.04em' }}>
            Loading demo profile…
          </div>
        )}
        {status === 'not_found' && (
          <div style={{ maxWidth: 420 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D4A853', marginBottom: 14 }}>
              Demo not found
            </div>
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>
              No demo profile exists at this URL.
            </p>
          </div>
        )}
        {status === 'error' && (
          <div style={{ maxWidth: 420 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D4A853', marginBottom: 14 }}>
              Could not load
            </div>
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>
              The demo profile failed to load. Refresh to try again.
            </p>
          </div>
        )}
      </div>
    )
  }

  // ----- handleNavigate -----
  // FamilyProfile / FamilyAnalysis call onNavigate('analysis'),
  // ('profile'), ('notes'), ('meets'), ('resources') for the in-app
  // tab navigation, AND ('test-ai'), ('technique'), ('meetprep'),
  // ('sprint'), ('workout'), ('pace') for the standalone tool pages.
  //
  // For the demo: switch between profile and analysis only. Any other
  // destination silently no-ops — Sessions/Meets/Resources tabs aren't
  // part of the demo scope, and the standalone tool HTML pages are
  // auth-gated so we'd just bounce a public visitor to a sign-in wall.
  // Pace.html is the one tool that allows family-tier access; keep it
  // open if Chase later wants to point demo viewers at it.
  function handleNavigate(target) {
    if (target === 'analysis' || target === 'family-analysis') {
      setView('analysis')
      window.history.replaceState({}, '', '/demo/' + slug + '#analysis')
      return
    }
    if (target === 'profile' || target === 'family-profile') {
      setView('profile')
      window.history.replaceState({}, '', '/demo/' + slug)
      return
    }
    if (target === 'pace' || target === 'race-pace') {
      // Pace.html allows family-tier access — safe to send demo viewers.
      window.location.href = '/pace.html?athleteId=' + encodeURIComponent(athlete.id)
      return
    }
    // Everything else (notes, meets, resources, admin tools) — silently
    // ignore. The demo is profile + analysis only.
  }

  // Demo banner pinned to the top of the page so anyone clicking the
  // shared link knows what they're looking at and how to learn more.
  // Pure CSS, no library, no dependency — keeps the demo route as
  // self-contained as possible.
  const banner = (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(6, 8, 13, 0.92)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderBottom: '0.5px solid rgba(212, 168, 83, 0.3)',
      padding: '10px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      flexWrap: 'wrap',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: 12,
      color: '#cbd5e1',
      textAlign: 'center',
    }}>
      <span style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#D4A853',
      }}>
        Demo Profile
      </span>
      <span style={{ opacity: 0.5 }}>·</span>
      <span>
        This is a sample athlete profile. Learn more at{' '}
        <a
          href="https://confluencesport.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#D4A853', textDecoration: 'none', fontWeight: 600 }}
        >
          confluencesport.com
        </a>
      </span>
    </div>
  )

  // The actual page render — wrap whichever view is active.
  // Note: linkedAthletes=[] disables the multi-athlete switcher.
  // onBack=null hides the back arrow (no admin home to go back to here).
  // onLogoClick=undefined → logo is non-interactive in the demo.
  const sharedProps = {
    athlete,
    onBack: null,
    onNavigate: handleNavigate,
    onLogoClick: undefined,
    linkedAthletes: [],
    onSwitchAthlete: () => {},
  }

  return (
    <>
      {banner}
      {view === 'profile' && <FamilyProfile {...sharedProps} />}
      {view === 'analysis' && <FamilyAnalysis {...sharedProps} />}
    </>
  )
}
