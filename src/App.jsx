

import { useEffect, useState } from 'react'
import { loadAthletes } from './lib/db.js'
import Header from './components/Header.jsx'
import AthleteGrid from './components/AthleteGrid.jsx'
import AthleteProfile from './components/AthleteProfile.jsx'
import NewSessionChooser from './components/NewSessionChooser.jsx'
import SessionViewer from './components/SessionViewer.jsx'

export default function App() {
  const [view, setView] = useState('home')
  const [athletes, setAthletes] = useState([])
  const [selectedAthlete, setSelectedAthlete] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('loading')

  useEffect(() => {
    loadAthletes().then(({ athletes, status, error }) => {
      setAthletes(athletes)
      setConnectionStatus(status)
      if (error) console.warn('Athletes load:', error)
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

  const startNewSession = (a) => {
    setSelectedAthlete(a)
    setView('new-session')
  }

  const viewSession = (session) => {
    setSelectedSession(session)
    setView('view-session')
  }

  const pickSessionType = (type) => {
    const athleteId = selectedAthlete?.id
    if (type === 'training' && athleteId) {
      window.location.href = `/test-ai.html?athleteId=${encodeURIComponent(athleteId)}`
      return
    }
    if (type === 'meetprep' && athleteId) {
      window.location.href = `/meetprep.html?athleteId=${encodeURIComponent(athleteId)}`
      return
    }
    if (type === 'technique' && athleteId) {
      window.location.href = `/technique.html?athleteId=${encodeURIComponent(athleteId)}`
      return
    }
    alert(`${type} sessions coming soon.`)
  }

  return (
    <div className="app">
      <Header
        view={view}
        athlete={selectedAthlete}
        onHome={goHome}
      />

      <main className="main">
        {view === 'home' && (
          <AthleteGrid
            athletes={athletes}
            onSelect={selectAthlete}
            connectionStatus={connectionStatus}
          />
        )}

        {view === 'athlete' && selectedAthlete && (
          <AthleteProfile
            athlete={selectedAthlete}
            onBack={goHome}
            onNewSession={startNewSession}
            onViewSession={viewSession}
          />
        )}

        {view === 'new-session' && selectedAthlete && (
          <NewSessionChooser
            athlete={selectedAthlete}
            onPick={pickSessionType}
            onBack={() => setView('athlete')}
          />
        )}

        {view === 'view-session' && selectedAthlete && selectedSession && (
          <SessionViewer
            session={selectedSession}
            athlete={selectedAthlete}
            onBack={() => setView('athlete')}
          />
        )}
      </main>

      <footer className="app-footer">
        <div>confluencesport.com · Dallas, TX</div>
        <div className="version">v0.4.0 · Phase 4</div>
      </footer>
    </div>
  )
}

