

import { useEffect, useState } from 'react'
import { SignedIn, SignedOut, SignIn, UserButton, useUser } from '@clerk/clerk-react'
import { loadAthletes } from './lib/db.js'
import Header from './components/Header.jsx'
import AthleteGrid from './components/AthleteGrid.jsx'
import AthleteProfile from './components/AthleteProfile.jsx'
import NewSessionChooser from './components/NewSessionChooser.jsx'
import SessionViewer from './components/SessionViewer.jsx'
import FamilyProfile from './components/FamilyProfile.jsx'
import FamilyNotes from './components/FamilyNotes.jsx'
import FamilyMeets from './components/FamilyMeets.jsx'
import FamilyAnalysis from './components/FamilyAnalysis.jsx'
import FamilyResources from './components/FamilyResources.jsx'
import SlotRequestsAdmin from './components/SlotRequestsAdmin.jsx'
import { canSeeFeature } from './config/featureAccess.js'
import './styles/apple-dark.css'

export default function App() {
  // Auth gate: if not signed in, show only the sign-in card. Nothing else
  // renders, no data loads, no URLs leak. Once signed in the existing app
  // mounts via <AppContent /> below.
  //
  // This session establishes the gate and gets the admin user (Chase) signed
  // in. Family-side per-athlete scoping happens next session — for now, any
  // authenticated user sees the full admin view. That's safe because the
  // only authenticated user right now will be Chase (no families have been
  // invited yet via the Clerk dashboard).
  return (
    <>
      <SignedOut>
        <SignInPage />
      </SignedOut>
      <SignedIn>
        <AppContent />
      </SignedIn>
    </>
  )
}

// Branded sign-in screen. Centers Clerk's <SignIn /> drop-in component on
// the dark page background so it matches the rest of the app aesthetically.
// The Clerk component handles all the actual auth flow (email/password,
// magic link, error states, verification).
//
// Honors a ?redirect_url=... query param so users bounced from a standalone
// tool page (e.g. /test-ai.html) get sent back there after sign-in instead
// of dumping them at "/". The auth-guard.js script on each tool page sets
// this param when it kicks an unauthenticated user to /sign-in.
function SignInPage() {
  var redirectUrl = '/'
  try {
    var params = new URLSearchParams(window.location.search)
    var raw = params.get('redirect_url')
    if (raw) {
      // Only allow same-origin redirects to prevent open-redirect abuse.
      // A leading slash means same-origin path; anything else gets ignored.
      if (raw.indexOf('/') === 0 && raw.indexOf('//') !== 0) {
        redirectUrl = raw
      }
    }
  } catch (e) {
    // Defensive — if URLSearchParams or anything else fails, fall back to root.
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#06080d',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <img
        src="/assets/confluence-swim-white.png"
        alt="Confluence Swim"
        style={{ height: 36, marginBottom: 32, opacity: 0.9 }}
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
      <SignIn
        afterSignInUrl={redirectUrl}
        afterSignUpUrl={redirectUrl}
        appearance={{
          variables: {
            colorPrimary: '#D4A853',
            colorBackground: '#0a0d14',
            colorText: '#f5f5f7',
            colorTextSecondary: 'rgba(255,255,255,0.7)',
            colorInputBackground: 'rgba(255,255,255,0.04)',
            colorInputText: '#f5f5f7',
            colorNeutral: '#f5f5f7',
            colorDanger: '#ef4444',
            borderRadius: '10px',
            fontFamily: 'inherit',
          },
          elements: {
            rootBox: { width: '100%', maxWidth: 420 },
            card: {
              background: '#0a0d14',
              border: '0.5px solid rgba(255,255,255,0.1)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              padding: '32px 28px',
            },
            headerTitle: {
              color: '#f5f5f7',
              fontSize: '22px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
            },
            headerSubtitle: {
              color: 'rgba(255,255,255,0.6)',
              fontSize: '14px',
            },
            formFieldLabel: {
              color: 'rgba(255,255,255,0.85)',
              fontSize: '13px',
              fontWeight: 500,
            },
            formFieldInput: {
              background: 'rgba(255,255,255,0.04)',
              border: '0.5px solid rgba(255,255,255,0.16)',
              color: '#f5f5f7',
              fontSize: '15px',
              padding: '12px 14px',
            },
            formButtonPrimary: {
              background: '#D4A853',
              color: '#0a0d14',
              fontWeight: 600,
              fontSize: '15px',
              padding: '12px 18px',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { background: '#e0b96a' },
              '&:focus': { background: '#e0b96a', boxShadow: 'none' },
            },
            footerActionText: { color: 'rgba(255,255,255,0.6)' },
            footerActionLink: { color: '#D4A853' },
            identityPreviewText: { color: '#f5f5f7' },
            identityPreviewEditButton: { color: '#D4A853' },
            socialButtonsBlockButton: {
              background: 'rgba(255,255,255,0.04)',
              border: '0.5px solid rgba(255,255,255,0.16)',
              color: '#f5f5f7',
            },
            dividerLine: { background: 'rgba(255,255,255,0.1)' },
            dividerText: { color: 'rgba(255,255,255,0.5)' },
            formResendCodeLink: { color: '#D4A853' },
            otpCodeFieldInput: {
              background: 'rgba(255,255,255,0.04)',
              border: '0.5px solid rgba(255,255,255,0.16)',
              color: '#f5f5f7',
            },
          },
        }}
      />
    </div>
  )
}

function AppContent() {
  const { user } = useUser()

  // Role + scope are stored in Clerk's publicMetadata. Admins see everything;
  // family users only see the athlete profile(s) listed in linkedAthletes.
  // Set both via the Clerk dashboard for now (no invite flow yet):
  //   { "role": "admin" }                                          → full access
  //   { "role": "family", "linkedAthletes": ["ath_jon", "ath_ben"] } → scoped
  //
  // Diagnostic logging — print exactly what Clerk returned for the user object
  // so we can debug "Account pending" issues. Once the role flow is rock-solid
  // we can drop these.
  if (typeof window !== 'undefined' && user) {
    console.log('[App] user.id:', user.id)
    console.log('[App] user.publicMetadata:', user.publicMetadata)
    console.log('[App] user.unsafeMetadata:', user.unsafeMetadata)
  }

  // ---- TEMPORARY ADMIN ALLOWLIST ----
  // Clerk's dev-instance metadata editor has been failing to persist values
  // — the dashboard accepts JSON, claims it saved, but reading it via the
  // React SDK returns {}. Until that's resolved (likely needs an upgrade to
  // a production instance, or using the Clerk REST API to set metadata
  // directly), we hardcode the admin emails so Chase can use the app.
  //
  // This fallback is explicit-allowlist only — every email here gets admin.
  // Family users still flow through the metadata path, so we have to fix the
  // metadata bug before inviting families. But Chase being locked out of his
  // own app is the urgent problem to unblock.
  const ADMIN_EMAILS = [
    'chasekalisz@yahoo.com',
    // Add additional admin emails here if needed.
  ]
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || ''
  const isAllowlistAdmin = ADMIN_EMAILS.includes(userEmail)

  // Read role from publicMetadata. Clerk normalizes the property name to
  // publicMetadata in the React SDK. We also accept unsafeMetadata as a fallback
  // because the dashboard's "Public" editor sometimes writes to unsafeMetadata
  // (a known Clerk quirk on dev instances) — a user marked admin in the dashboard
  // shouldn't accidentally land on "Account pending" because of that.
  const pubMeta = user?.publicMetadata || {}
  const unsafeMeta = user?.unsafeMetadata || {}
  const metaRole = pubMeta.role || unsafeMeta.role
  // Allowlist email always wins; otherwise fall back to metadata; otherwise family.
  const role = isAllowlistAdmin ? 'admin' : (metaRole || 'family')
  const isAdmin = role === 'admin'
  const rawLinked = Array.isArray(pubMeta.linkedAthletes)
    ? pubMeta.linkedAthletes
    : Array.isArray(unsafeMeta.linkedAthletes)
      ? unsafeMeta.linkedAthletes
      : []
  const linkedAthletes = rawLinked

  if (typeof window !== 'undefined' && user) {
    console.log('[App] email:', userEmail, '| isAllowlistAdmin:', isAllowlistAdmin)
    console.log('[App] resolved role:', role, '| linkedAthletes:', linkedAthletes)
  }

  const [view, setView] = useState('home')
  const [athletes, setAthletes] = useState([])
  const [selectedAthlete, setSelectedAthlete] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [sessionOrigin, setSessionOrigin] = useState('athlete')
  const [connectionStatus, setConnectionStatus] = useState('loading')

  // Check URL on load — if /athlete/:id, go directly to family profile.
  // This is the family entry point. Families get a URL like
  // Check INITIAL URL on first load — if /athlete/:id, the user came in
  // as a family. We capture this once at mount and never recompute, so
  // admin-driven URL changes (pushState) don't flip the family flag.
  const [urlAthleteId] = useState(() => {
    const match = window.location.pathname.match(/^\/athlete\/([^/]+)/)
    return match ? match[1] : null
  })

  useEffect(() => {
    loadAthletes().then(({ athletes, status, error }) => {
      setAthletes(athletes)
      setConnectionStatus(status)
      if (error) console.warn('Athletes load:', error)

      // Routing decision tree on initial load:
      //
      // ADMIN: honor URL — landed on /athlete/:id sees that profile, otherwise grid.
      //
      // FAMILY: regardless of URL, force them onto one of their linked athletes.
      //   - URL was /athlete/:id AND that id is in their linkedAthletes → use that one
      //   - Otherwise → first linked athlete in their list
      //   - No linked athletes → render the "not configured" screen (handled below)
      if (isAdmin) {
        if (urlAthleteId) {
          const athlete = athletes.find(a => a.id === urlAthleteId)
          if (athlete) {
            setSelectedAthlete(athlete)
            setView('family-profile')
          }
        }
      } else {
        // Family scope. Pick the right athlete to land on.
        let landingId = null
        if (urlAthleteId && linkedAthletes.includes(urlAthleteId)) {
          landingId = urlAthleteId
        } else if (linkedAthletes.length > 0) {
          landingId = linkedAthletes[0]
        }
        if (landingId) {
          const athlete = athletes.find(a => a.id === landingId)
          if (athlete) {
            setSelectedAthlete(athlete)
            setView('family-profile')
            // Normalize URL so a family who typed someone else's URL doesn't
            // see that ID stuck in their address bar after the silent bounce.
            if (window.location.pathname !== `/athlete/${landingId}`) {
              window.history.replaceState({ athleteId: landingId }, '', `/athlete/${landingId}`)
            }
          }
        }
      }
    })
  }, [isAdmin, linkedAthletes.join(',')])

  const goHome = () => {
    setView('home')
    setSelectedAthlete(null)
    setSelectedSession(null)
    // Update URL — admin home is at "/"
    if (window.location.pathname !== '/' || window.location.hash) {
      window.history.pushState({}, '', '/')
    }
  }

  const selectAthlete = (a) => {
    setSelectedAthlete(a)
    setView('athlete')
    // Admin edit page — push history so back button works
    if (a?.id) {
      window.history.pushState({ adminEdit: a.id }, '', `/?edit=${a.id}`)
    }
  }

  // Opens the athlete performance profile (what the athlete sees themselves).
  // Routes to the 'family-profile' view — same component now used by the
  // View Profile button on the athlete cards.
  const viewAthleteProfile = (a) => {
    setSelectedAthlete(a)
    setView('family-profile')
    // Admin viewing an athlete's performance profile — change URL to /athlete/:id
    // so back button takes us back to /
    if (a?.id) {
      window.history.pushState({ athleteId: a.id }, '', `/athlete/${a.id}`)
    }
  }

  const startNewSession = (a) => {
    setSelectedAthlete(a)
    setView('new-session')
  }

  const viewSession = (session, origin = 'athlete') => {
    setSelectedSession(session)
    setSessionOrigin(origin)
    setView('view-session')
  }

  const handleAthleteUpdated = (updated) => {
    setAthletes(prev => prev.map(a => a.id === updated.id ? updated : a))
    setSelectedAthlete(updated)
  }

  const handleAthleteDeleted = (athleteId) => {
    setAthletes(prev => prev.filter(a => a.id !== athleteId))
    goHome()
  }

  const handleAthleteAdded = (newAthlete) => {
    setAthletes(prev => [...prev, newAthlete])
  }

  const pickSessionType = (type) => {
    const athleteId = selectedAthlete?.id
    if (type === 'training') {
      window.location.href = `/test-ai.html?athleteId=${encodeURIComponent(athleteId)}`
      return
    }
    if (type === 'meetprep') {
      window.location.href = `/meetprep.html?athleteId=${encodeURIComponent(athleteId)}`
      return
    }
    if (type === 'technique') {
      window.location.href = `/technique.html?athleteId=${encodeURIComponent(athleteId)}`
      return
    }
    if (type === 'sprint') {
      window.location.href = `/sprint.html?athleteId=${encodeURIComponent(athleteId)}`
      return
    }
    if (type === 'workout') {
      window.location.href = `/workout.html?athleteId=${encodeURIComponent(athleteId)}`
      return
    }
    alert(`${type} sessions coming soon.`)
  }

  // ---- Browser history support ----
  // Listens for back/forward and updates view based on URL.
  // Handles both admin (/, /?edit=xxx) and family (/athlete/xxx#tab) routes.
  useEffect(() => {
    const handleNavigation = () => {
      const path = window.location.pathname
      const hash = window.location.hash.replace('#', '')
      const search = new URLSearchParams(window.location.search)
      const editId = search.get('edit')

      // /athlete/:id — family profile pages
      const athleteMatch = path.match(/^\/athlete\/([^/]+)/)
      if (athleteMatch) {
        const id = athleteMatch[1]
        // Find athlete and select it
        const athlete = athletes.find(a => a.id === id)
        if (athlete) {
          setSelectedAthlete(athlete)
          // Map hash to view
          if (!hash || hash === 'profile') setView('family-profile')
          else if (hash === 'notes') setView('family-notes')
          else if (hash === 'meets') setView('family-meets')
          else if (hash === 'analysis') setView('family-analysis')
          else if (hash === 'resources') setView('family-resources')
        }
        return
      }

      // /?edit=xxx — admin edit page
      if (editId) {
        const athlete = athletes.find(a => a.id === editId)
        if (athlete) {
          setSelectedAthlete(athlete)
          setView('athlete')
        }
        return
      }

      // / — admin home
      setView('home')
      setSelectedAthlete(null)
    }

    window.addEventListener('popstate', handleNavigation)
    window.addEventListener('hashchange', handleNavigation)
    return () => {
      window.removeEventListener('popstate', handleNavigation)
      window.removeEventListener('hashchange', handleNavigation)
    }
  }, [athletes])

  // ---- v2 navigation handler, shared across all v2 pages ----
  // Maps the FamilyNav labels ('profile', 'notes', 'meets', 'analysis',
  // 'resources') to the corresponding view states. Each navigation
  // pushes a history entry so the browser back button works naturally.
  const handleV2Navigate = (nextView) => {
    const validViews = ['profile', 'notes', 'meets', 'analysis', 'resources']
    if (!validViews.includes(nextView)) return

    // Push history entry only if hash differs (don't double-push on same page)
    const currentHash = window.location.hash.replace('#', '')
    if (currentHash !== nextView) {
      window.history.pushState({ view: nextView }, '', '#' + nextView)
    }

    switch (nextView) {
      case 'profile':
        setView('family-profile'); return
      case 'notes':
        setView('family-notes'); return
      case 'meets':
        setView('family-meets'); return
      case 'analysis':
        setView('family-analysis'); return
      case 'resources':
        setView('family-resources'); return
      default:
        return
    }
  }

  // Switch which linked athlete a family user is viewing. Used by the
  // AthleteSwitcher component shown in FamilyNav for multi-athlete families.
  // Updates state, athlete URL, and stays on the current tab so the family
  // can compare the same view across kids.
  const switchAthlete = (athleteId) => {
    if (!athleteId) return
    // Family users can only switch to athletes they're linked to. Admins
    // can switch freely (the switcher is hidden for them anyway).
    if (!isAdmin && !linkedAthletes.includes(athleteId)) return
    const next = athletes.find(a => a.id === athleteId)
    if (!next) return
    setSelectedAthlete(next)
    // Preserve the current tab hash so e.g. switching from Jon's Analysis
    // tab to Ben lands on Ben's Analysis tab, not Ben's Profile.
    const currentHash = window.location.hash
    window.history.pushState({ athleteId }, '', `/athlete/${athleteId}${currentHash}`)
  }

  // Bundle the family-scope props the family pages need, so we can pass them
  // all without repeating boilerplate. linkedAthletesData is the full athlete
  // records (not just ids) so the switcher can show names + avatars. Empty
  // array for admin so the switcher renders nothing for them.
  const linkedAthletesData = isAdmin
    ? []
    : athletes.filter(a => linkedAthletes.includes(a.id))

  const familyScopeProps = {
    linkedAthletes: linkedAthletesData,
    onSwitchAthlete: switchAthlete,
  }

  // ---- "Not configured" screen for family users without linkedAthletes ----
  // Catches: someone signed up but their metadata hasn't been set in the
  // Clerk dashboard yet. Without this, they'd land on a blank screen with
  // no athletes selected and the family branches all crash.
  if (!isAdmin && linkedAthletes.length === 0) {
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
      }}>
        <div style={{ maxWidth: 460 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D4A853', marginBottom: 14 }}>
            Account pending
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 14 }}>
            Almost ready
          </h1>
          <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 24 }}>
            Your account is signed in but hasn't been linked to an athlete yet.
            Chase will finish setting this up — you'll get an email once it's ready.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    )
  }

  // ---- v2 Family Profile view ----
  if (view === 'family-profile') {
    return (
      <FamilyProfile
        athlete={selectedAthlete}
        onBack={(isAdmin || !urlAthleteId) ? goHome : null}
        onNavigate={handleV2Navigate}
        onLogoClick={(isAdmin || !urlAthleteId) ? goHome : undefined}
        {...familyScopeProps}
      />
    )
  }

  // ---- v2 Family Notes view ----
  if (view === 'family-notes') {
    return (
      <FamilyNotes
        athlete={selectedAthlete}
        onBack={() => setView('family-profile')}
        onNavigate={handleV2Navigate}
        onLogoClick={(isAdmin || !urlAthleteId) ? goHome : undefined}
        onViewSession={(session) => viewSession(session, 'family-notes')}
        {...familyScopeProps}
      />
    )
  }

  // ---- v2 Family Meets view ----
  if (view === 'family-meets') {
    return (
      <FamilyMeets
        athlete={selectedAthlete}
        onBack={() => setView('family-profile')}
        onNavigate={handleV2Navigate}
        onLogoClick={(isAdmin || !urlAthleteId) ? goHome : undefined}
        {...familyScopeProps}
      />
    )
  }

  // ---- v2 Family Analysis view ----
  if (view === 'family-analysis') {
    // Tier guard: athletes whose tier doesn't include Performance Analysis
    // (Skills, currently) get bounced back to Profile if they hit this route
    // directly via URL or hashchange. Admins always get through — this
    // shouldn't apply to Chase navigating his own grid.
    if (!isAdmin && selectedAthlete && !canSeeFeature(selectedAthlete, 'performance_analysis_tab')) {
      // Use setTimeout so the state update doesn't fire mid-render.
      setTimeout(() => setView('family-profile'), 0)
      return null
    }
    return (
      <FamilyAnalysis
        athlete={selectedAthlete}
        onBack={() => setView('family-profile')}
        onNavigate={handleV2Navigate}
        onLogoClick={(isAdmin || !urlAthleteId) ? goHome : undefined}
        {...familyScopeProps}
      />
    )
  }

  // ---- v2 Family Resources view ----
  if (view === 'family-resources') {
    return (
      <FamilyResources
        athlete={selectedAthlete}
        onBack={() => setView('family-profile')}
        onNavigate={handleV2Navigate}
        onLogoClick={(isAdmin || !urlAthleteId) ? goHome : undefined}
        {...familyScopeProps}
      />
    )
  }

  // ---- Admin-only views below ----
  // Family users hitting any of the catches below should never happen because
  // the routing decision tree on mount forces them into 'family-profile'.
  // But as a safety net, if state somehow gets us here as a family user,
  // bounce back to their profile rather than rendering admin UI.
  if (!isAdmin) {
    setTimeout(() => {
      setView('family-profile')
      if (linkedAthletes.length > 0 && !selectedAthlete) {
        const a = athletes.find(x => x.id === linkedAthletes[0])
        if (a) setSelectedAthlete(a)
      }
    }, 0)
    return null
  }

  return (
    <div className="app">
      <Header view={view} athlete={selectedAthlete} onHome={goHome} />
      <main className="main">
        {view === 'home' && (
          <AthleteGrid
            athletes={athletes}
            onSelect={selectAthlete}
            onViewProfile={viewAthleteProfile}
            connectionStatus={connectionStatus}
            onAthleteAdded={handleAthleteAdded}
            onViewSlotRequests={() => setView('slot-requests')}
          />
        )}
        {view === 'athlete' && (
          <AthleteProfile
            athlete={selectedAthlete}
            onBack={goHome}
            onNewSession={startNewSession}
            onViewSession={viewSession}
            onAthleteUpdated={handleAthleteUpdated}
            onAthleteDeleted={handleAthleteDeleted}
          />
        )}
        {view === 'new-session' && (
          <NewSessionChooser
            athlete={selectedAthlete}
            onPick={pickSessionType}
            onBack={() => setView('athlete')}
          />
        )}
        {view === 'view-session' && (
          <SessionViewer
            session={selectedSession}
            athlete={selectedAthlete}
            onBack={() => setView(sessionOrigin)}
          />
        )}
        {view === 'slot-requests' && (
          <SlotRequestsAdmin
            athletes={athletes}
            onBack={goHome}
          />
        )}
      </main>
      <footer className="app-footer">
        <img
          src="/assets/confluence-sport-white.png"
          alt="Confluence Sport"
          className="footer-master-logo"
        />
        <div>confluencesport.com · Dallas, TX</div>
        <div className="version">v0.9.0</div>
      </footer>
    </div>
  )
}
