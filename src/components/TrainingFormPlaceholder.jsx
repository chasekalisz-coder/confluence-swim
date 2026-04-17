import { fullName } from '../data/athletes.js'

export default function TrainingFormPlaceholder({ athlete, onBack }) {
  return (
    <div className="page">
      <button className="back-link" onClick={onBack}>← Back</button>
      <div className="placeholder-card">
        <div className="placeholder-label">PHASE 3 · NEXT UP</div>
        <h1>Training Form</h1>
        <p className="muted">
          This screen will handle photo upload of a handwritten session sheet for {fullName(athlete)},
          category selection, and AI note generation. Coming in the next phase.
        </p>
        <ul className="placeholder-list">
          <li>Photo upload (JPG/PNG, HEIC auto-converted to JPEG)</li>
          <li>Photo resized to 1600px max, 0.85 JPEG quality</li>
          <li>Category: Aerobic / Threshold / Active Rest / Quality / Power / Technical</li>
          <li>Generate Note → AI reads photo, writes 4-section note</li>
          <li>Second AI call extracts sets data as JSON for charts</li>
          <li>Transition to note preview with SVG charts + Hi-Lo block</li>
        </ul>
      </div>
    </div>
  )
}
