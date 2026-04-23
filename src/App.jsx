

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
import './styles/apple-dark.css'

export default function App() {
  const [view, setView] = useState('home')
  const [athletes, setAthletes] = useState([])
  const [selectedAthlete, setSelectedAthlete] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [sessionOrigin, setSessionOrigin] = useState('athlete')  // where to go 'back' from SessionViewer
  const [connectionStatus, setConnectionStatus] = useState('loading')

  useEffect(() => {
    loadAthletes().then(({ athletes, status, error }) => {
      setAthletes(athletes)
      setConnectionStatus(status)
      if (error) console.warn('Athletes load:', error)
    })
  }, [])

  // Support ?v2=athleteId in the URL to open the v2 family profile directly.
  // Example: /?v2=ath_jon  → shows the new Apple Dark profile for Jon.
  useEffect(() => {
    if (!athletes.length) return
    const params = new URLSearchParams(window.location.search)
    const v2Id = params.get('v2')
    if (v2Id) {
      const match = athletes.find(a => a.id === v2Id)
      if (match) {
        setSelectedAthlete(match)
        setView('family-profile')
      }
    }
  }, [athletes])

  const goHome = () => {
    setView('home')
    setSelectedAthlete(null)
    setSelectedSession(null)
    // Clear ?v2= from the URL so reloads don't re-open the v2 view
    if (window.location.search.includes('v2=')) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }

  const selectAthlete = (a) => {
    setSelectedAthlete(a)
    setView('athlete')
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

  // ---- v2 navigation handler, shared across all v2 pages ----
  // Maps the FamilyNav labels ('profile', 'notes', 'meets', 'analysis',
  // 'resources') to the corresponding view states. Pages not yet built
  // show a placeholder alert.
  const handleV2Navigate = (nextView) => {
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
        alert(`${nextView.charAt(0).toUpperCase() + nextView.slice(1)} page coming soon.`)
        return
      default:
        return
    }
  }

  // ---- v2 Family Profile view ----
  if (view === 'family-profile') {
    return (
      <FamilyProfile
        athlete={selectedAthlete}
        onBack={goHome}
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

  return (
    <div className="app">
      <Header view={view} athlete={selectedAthlete} onHome={goHome} />
      <main className="main">
        {view === 'home' && (
          <AthleteGrid
            athletes={athletes}
            onSelect={selectAthlete}
            connectionStatus={connectionStatus}
            onAthleteAdded={handleAthleteAdded}
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
      </main>
      <footer className="app-footer">
        <div>confluencesport.com · Dallas, TX</div>
        <div className="version">v0.7.0</div>
      </footer>
    </div>
  )
}
