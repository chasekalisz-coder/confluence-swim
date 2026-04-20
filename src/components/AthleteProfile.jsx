import { useEffect, useState } from 'react'
import { fullName, initials } from '../data/athletes.js'
import { loadAthleteSessions, deleteSession } from '../lib/db.js'

const CATEGORY_DISPLAY = {
  aerobic: 'Aerobic',
  threshold: 'Threshold',
  active_rest: 'Active Rest',
  recovery: 'Recovery',
  quality: 'Quality',
  power: 'Power',
  meet_prep: 'Meet Prep',
  technique: 'Technique',
}

const STROKE_DISPLAY = {
  mixed: '',
  free: 'Freestyle',
  back: 'Backstroke',
  breast: 'Breaststroke',
  fly: 'Butterfly',
  im: 'IM',
  freestyle: 'Freestyle',
  backstroke: 'Backstroke',
  breaststroke: 'Breaststroke',
  butterfly: 'Butterfly',
  kick: 'Kick',
  turns: 'Turns',
  starts: 'Starts',
  underwaters: 'Underwaters',
}

function labelCategory(cat) {
  return CATEGORY_DISPLAY[cat] || cat
}
function labelStroke(stroke) {
  return STROKE_DISPLAY[stroke] || ''
}

function getNoteType(session) {
  if (session.data?.noteType) return session.data.noteType
  if (session.category === 'technique') return 'technique'
  if (session.category === 'meet_prep') return 'meetprep'
  if (session.category === 'workout') return 'workout'
  return 'training'
}

const NOTE_TYPE_COLORS = {
  training: '#0B1E38',
  meetprep: '#B8921A',
  technique: '#2dd4bf',
  workout: '#8b5cf6',
}

const NOTE_TYPE_LABELS = {
  training: 'Training',
  meetprep: 'Meet Prep',
  technique: 'Technique',
  workout: 'Workout',
}

export default function AthleteProfile({ athlete, onBack, onNewSession, onViewSession }) {
  const [sessions, setSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [poolFilter, setPoolFilter] = useState('SCY')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    let active = true
    setLoadingSessions(true)
    loadAthleteSessions(athlete.id).then(s => {
      if (active) {
        setSessions(s)
        setLoadingSessions(false)
      }
    })
    return () => { active = false }
  }, [athlete.id])

  const handleDelete = async (sessionId, e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this session? This cannot be undone.')) return
    try {
      await deleteSession(sessionId)
      setSessions(prev => prev.filter(s => s.id !== sessionId))
    } catch (err) {
      alert('Delete failed: ' + err.message)
    }
  }

  const filteredTimes = athlete.meetTimes.filter(t => t.event.endsWith(poolFilter))
