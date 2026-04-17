import { fullName } from '../data/athletes.js'

const OPTIONS = [
  {
    id: 'training',
    title: 'Training Session',
    desc: 'Photo upload of a handwritten session sheet. AI generates the full note with performance charts, zones, and Hi-Lo recovery block.',
    color: '#0B1E38',
    ready: true
  },
  {
    id: 'technique',
    title: 'Technique Session',
    desc: 'Stroke correction work. Pick topics, select observed faults from the library, describe what improved and what still needs work.',
    color: '#2dd4bf',
    ready: true
  },
  {
    id: 'meetprep',
    title: 'Meet Prep',
    desc: 'Pre-competition session. Warmup, race components, short efforts, strategy discussion, how they looked.',
    color: '#B8921A',
    ready: false
  }
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
                {!o.ready && <span className="badge-soon">Coming Phase 5</span>}
              </div>
              <p>{o.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
