import { useEffect, useState } from 'react'
import { loadAthletes } from './lib/supabase.js'
import Header from './components/Header.jsx'
import AthleteGrid from './components/AthleteGrid.jsx'
import AthleteProfile from './components/AthleteProfile.jsx'
import NewSessionChooser from './components/NewSessionChooser.jsx'
import TrainingFormPlaceholder from './components/TrainingFormPlaceholder.jsx'
import TechniqueFormPlaceholder from './components/TechniqueFormPlaceholder.jsx'

export default function App() {
  const [view, setView] = useState('home')
  const [athletes, setAthletes] = useState([])
  const [selectedAthlete, setSelectedAthlete] = useState(null)
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
  }

  const selectAthlete = (a) => {
    setSelectedAthlete(a)
    setView('athlete')
  }

  const startNewSession = (a) => {
    setSelectedAthlete(a)
    setView('new-session')
  }

  const pickSessionType = (type) => {
    if (type === 'training') setView('training-form')
    else if (type === 'technique') setView('technique-form')
    else if (type === 'meetprep') setView('meetprep-form')
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
          />
        )}

        {view === 'new-session' && selectedAthlete && (
          <NewSessionChooser
            athlete={selectedAthlete}
            onPick={pickSessionType}
            onBack={() => setView('athlete')}
          />
        )}

        {view === 'training-form' && selectedAthlete && (
          <TrainingFormPlaceholder
            athlete={selectedAthlete}
            onBack={() => setView('new-session')}
          />
        )}

        {view === 'technique-form' && selectedAthlete && (
          <TechniqueFormPlaceholder
            athlete={selectedAthlete}
            onBack={() => setView('new-session')}
          />
        )}
      </main>

      <footer className="app-footer">
        <div>confluencesport.com · Dallas, TX</div>
        <div className="version">v0.2.0 · Phase 2</div>
      </footer>
    </div>
  )
}
