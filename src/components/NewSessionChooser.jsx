
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
    desc: 'Pre-competition session. Warmup, race components, short efforts, strategy discussion, how they looked. Personalized per athlete by age, level, and events.',
    color: '#B8921A',
    ready: false,
    soonLabel: 'Coming soon',
  },
  {
    id: 'technique',
    title: 'Technique Session',
    desc: 'Stroke correction work. Pick focus area, describe what improved and what still needs work.',
    color: '#2dd4bf',
    ready: false,
    soonLabel: 'Coming soon',
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
