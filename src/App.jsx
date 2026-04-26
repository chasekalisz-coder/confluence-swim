

import { useEffect, useState } from 'react'
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
import './styles/apple-dark.css'

export default function App() {
  const [view, setView] = useState('home')
  const [athletes, setAthletes] = useState([])
  const [selectedAthlete, setSelectedAthlete] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [sessionOrigin, setSessionOrigin] = useState('athlete')
  const [connectionStatus, setConnectionStatus] = useState('loading')

  // Check URL on load — if /athlete/:id, go directly to family profile.
  // This is the family entry point. Families get a URL like
  // confluence-swim.vercel.app/athlete/ath_jon and land directly on
  // their kid's profile, never touching the admin grid.
  const urlAthleteId = (() => {
    const match = window.location.pathname.match(/^\/athlete\/([^/]+)/)
    return match ? match[1] : null
  })()

  useEffect(() => {
    loadAthletes().then(({ athletes, status, error }) => {
      setAthletes(athletes)
      setConnectionStatus(status)
      if (error) console.warn('Athletes load:', error)
      // If URL has an athlete ID, auto-navigate to their family profile
      if (urlAthleteId) {
        const athlete = athletes.find(a => a.id === urlAthleteId)
        if (athlete) {
          setSelectedAthlete(athlete)
          setView('family-profile')
        }
      }
    })
  }, [])

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

  // ---- v2 Family Profile view ----
  if (view === 'family-profile') {
    return (
      <FamilyProfile
        athlete={selectedAthlete}
        onBack={urlAthleteId ? null : goHome}
        onNavigate={handleV2Navigate}
        onLogoClick={!urlAthleteId ? goHome : undefined}
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
        onLogoClick={!urlAthleteId ? goHome : undefined}
        onViewSession={(session) => viewSession(session, 'family-notes')}
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
        onLogoClick={!urlAthleteId ? goHome : undefined}
      />
    )
  }

  // ---- v2 Family Analysis view ----
  if (view === 'family-analysis') {
    return (
      <FamilyAnalysis
        athlete={selectedAthlete}
        onBack={() => setView('family-profile')}
        onNavigate={handleV2Navigate}
        onLogoClick={!urlAthleteId ? goHome : undefined}
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
        onLogoClick={!urlAthleteId ? goHome : undefined}
      />
    )
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
