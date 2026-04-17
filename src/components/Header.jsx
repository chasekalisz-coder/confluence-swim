import { fullName, initials } from '../data/athletes.js'

export default function Header({ view, athlete, onHome }) {
  const crumb = view === 'home'
    ? 'Athletes'
    : view === 'athlete'
    ? `Athletes · ${fullName(athlete)}`
    : view === 'new-session'
    ? `Athletes · ${fullName(athlete)} · New Session`
    : view === 'training-form'
    ? `Athletes · ${fullName(athlete)} · Training`
    : view === 'technique-form'
    ? `Athletes · ${fullName(athlete)} · Technique`
    : view === 'meetprep-form'
    ? `Athletes · ${fullName(athlete)} · Meet Prep`
    : 'Athletes'

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="brand" onClick={onHome} role="button" tabIndex={0}>
          <div className="brand-mark">CS</div>
          <div>
            <div className="brand-name">Confluence Swim</div>
            <div className="brand-sub">Private Aquatics · Dallas TX</div>
          </div>
        </div>
        <div className="crumb">{crumb}</div>
      </div>
    </header>
  )
}
