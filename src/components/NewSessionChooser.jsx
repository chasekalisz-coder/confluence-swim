


import { fullName } from '../data/athletes.js'

const OPTIONS = [
  {
    id: 'training',
    title: 'Training Session',
    desc: 'Photo upload of a handwritten session sheet. AI generates the full note with performance charts, zones, and Hi-Lo recovery block.',
    color: '#0B1E38',
    ready: true,
    soonLabel: null,
  },
  {
    id: 'meetprep',
    title: 'Meet Prep',
    desc: 'Pre-competition session. Event-by-event race strategy, execution cues, and warmup-to-race connections. Personalized per athlete.',
    color: '#B8921A',
    ready: true,
    soonLabel: null,
  },
  {
    id: 'technique',
    title: 'Technique Session',
    desc: 'Stroke correction work. Pick focus area, select observed faults, describe what improved and what still needs work.',
    color: '#2dd4bf',
    ready: true,
    soonLabel: null,
  },
  {
    id: 'sprint',
    title: 'Sprint Lab',
    desc: 'Sprint/power session analysis. Upload workout photo, get McEvoy-method science breakdown, goal tracking, and next-session recommendations.',
    color: '#7c3aed',
    ready: true,
    soonLabel: null,
  },
]

export default function NewSessionChooser({ athlete, onPick, onBack }) {
  return (
    <div className="page">
      <button className="back-link" onClick={onBack}>← Back to {fullName(athlete)}</button>

      <div className="page-heading">
        <h1>New Session</h1>
        <div className="muted">for {fullName(athlete)}</div>
      </div>

      <div className="chooser-grid">
        {OPTIONS.map(o => (
          <button
            key={o.id}
            className={`chooser-card ${!o.ready ? 'soon' : ''}`}
            onClick={() => o.ready && onPick(o.id)}
            disabled={!o.ready}
          >
            <div className="chooser-accent" style={{ background: o.color }} />
            <div className="chooser-body">
              <div className="chooser-title-row">
                <h3>{o.title}</h3>
                {o.soonLabel && <span className="badge-soon">{o.soonLabel}</span>}
              </div>
              <p>{o.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
