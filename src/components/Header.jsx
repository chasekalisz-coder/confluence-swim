import { UserButton } from '@clerk/clerk-react'
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
          <img
            src="/assets/confluence-swim-white.png"
            alt="Confluence Swim"
            className="brand-logo"
          />
        </div>
        <div className="crumb">{crumb}</div>
        {/* Clerk UserButton — drop-in user menu with avatar, account settings,
            and Sign out. Sits at the far right of the admin header. */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
}
