import { fullName } from '../data/athletes.js'

export default function TechniqueFormPlaceholder({ athlete, onBack }) {
  return (
    <div className="page">
      <button className="back-link" onClick={onBack}>← Back</button>
      <div className="placeholder-card">
        <div className="placeholder-label" style={{ color: '#2dd4bf' }}>PHASE 4 · TECHNIQUE</div>
        <h1>Technique Form</h1>
        <p className="muted">
          This screen will handle stroke correction work for {fullName(athlete)}. Topic multi-select,
          fault library with ~300 specific faults across 8 strokes, observation fields.
          Coming in Phase 4.
        </p>
        <ul className="placeholder-list">
          <li>Topics: Freestyle, Backstroke, Breaststroke, Butterfly, Starts, Turns, Underwaters, IM</li>
          <li>Per topic: category picker (Body Position, Catch, Pull, Recovery, Kick, Breathing, Timing)</li>
          <li>Fault checkboxes from the technique library (~300 entries)</li>
          <li>Selected faults shown as gold chips</li>
          <li>"What improved" and "What needs work" text fields per topic</li>
          <li>Generate Note → AI writes technique note (WHAT WE WORKED ON / WHAT IMPROVED / WHAT'S NEXT / NEXT SESSION)</li>
        </ul>
      </div>
    </div>
  )
}
