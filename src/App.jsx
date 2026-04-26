

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
  }

  const selectAthlete = (a) => {
    setSelectedAthlete(a)
    setView('athlete')
  }

  // Opens the athlete performance profile (what the athlete sees themselves).
  // Routes to the 'family-profile' view — same component now used by the
  // View Profile button on the athlete cards.
  const viewAthleteProfile = (a) => {
    setSelectedAthlete(a)
    setView('family-profile')
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

  // ---- Browser history support for family-side navigation ----
  // The popstate listener is registered once an athlete is loaded.
  // Applying hash before the athlete loads would render FamilyProfile
  // with null data and crash the page.
  useEffect(() => {
    if (!urlAthleteId) return
    if (!selectedAthlete) return  // Wait for athlete to load

    const applyHashToView = () => {
      const h = window.location.hash.replace('#', '')
      if (!h || h === 'profile') {
        setView('family-profile')
      } else if (h === 'notes') {
        setView('family-notes')
      } else if (h === 'meets') {
        setView('family-meets')
      } else if (h === 'analysis') {
        setView('family-analysis')
      } else if (h === 'resources') {
        setView('family-resources')
      }
    }

    // Apply on mount (handles direct URL like /athlete/jon#meets)
    applyHashToView()

    // Listen for browser back/forward AND hash changes
    window.addEventListener('popstate', applyHashToView)
    window.addEventListener('hashchange', applyHashToView)
    return () => {
      window.removeEventListener('popstate', applyHashToView)
      window.removeEventListener('hashchange', applyHashToView)
    }
  }, [urlAthleteId, selectedAthlete])

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
