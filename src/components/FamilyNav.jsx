// FamilyNav.jsx — top nav used across family-facing pages.
// Logo is served from /public/assets/ — reference by URL at runtime,
// NOT via `import` (Vite/Rollup can't resolve absolute paths at build time).
import { useState, useEffect, useRef } from 'react'
import { UserButton } from '@clerk/clerk-react'
const SWIM_LOGO = '/assets/confluence-swim-white.png'

export default function FamilyNav({
  active = 'Profile',
  athleteInitials = '',
  currentAthleteId = null,
  linkedAthletes = [],   // [{ id, first, last, age, ... }] — full athlete records for switcher
  onSwitchAthlete = null,
  onNavigate,
  onLogoClick,
}) {
  const links = [
    { label: 'Profile', view: 'profile' },
    { label: 'Session Notes', view: 'notes' },
    { label: 'Analysis', view: 'analysis' },
    { label: 'Meets', view: 'meets' },
    { label: 'Resources', view: 'resources' },
  ]

  const handle = (view) => (e) => {
    e.preventDefault()
    if (onNavigate) onNavigate(view)
  }

  const handleLogo = () => {
    if (onLogoClick) {
      onLogoClick()
    } else if (onNavigate) {
      onNavigate('profile')
    }
  }

  // Show the athlete switcher only for multi-athlete families. Single-athlete
  // families and admins don't need it (admins see the AthleteGrid for switching;
  // single-athlete families have nothing to switch to).
  const showSwitcher = linkedAthletes.length > 1 && onSwitchAthlete

  return (
    <nav className="topnav">
      <button
        type="button"
        className="brand brand-button"
        onClick={handleLogo}
        aria-label="Home"
      >
        <img src={SWIM_LOGO} alt="Confluence Swim" />
      </button>
      <div className="links">
        {links.map(l => (
          <a
            key={l.view}
            href="#"
            onClick={handle(l.view)}
            className={active === l.label ? 'active' : ''}
          >
            {l.label}
          </a>
        ))}
      </div>
      {showSwitcher && (
        <AthleteSwitcher
          currentAthleteId={currentAthleteId}
          athletes={linkedAthletes}
          onSwitch={onSwitchAthlete}
        />
      )}
      <UserButton afterSignOutUrl="/" />
    </nav>
  )
}

// Compact dropdown showing the family's linked athletes with avatars + names.
// Sits in the top-right of the family nav, immediately left of the user-button
// avatar. Visible only when the family has 2+ linked athletes.
function AthleteSwitcher({ currentAthleteId, athletes, onSwitch }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click. Use pointerdown instead of mousedown so this
  // works on iOS Safari (which doesn't reliably fire mousedown for touch
  // and ordering of synthesized mouse events with React's onClick can swallow
  // the menu-item tap before its handler runs).
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    window.addEventListener('pointerdown', handler)
    return () => window.removeEventListener('pointerdown', handler)
  }, [open])

  const current = athletes.find(a => a.id === currentAthleteId) || athletes[0]
  if (!current) return null
  const familyLast = current.last || ''
  const initials = (a) => ((a.first || '?')[0] + (a.last || '')[0]).toUpperCase()

  return (
    <div className="athlete-switcher" ref={ref}>
      <button
        type="button"
        className="as-trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Switch athlete"
      >
        <span className="as-avatar">{initials(current)}</span>
        <span className="as-name">{current.first} {current.last}</span>
        <svg className="as-caret" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2 4l3 3 3-3" />
        </svg>
      </button>
      <span className="as-hint" aria-hidden="true">Switch athlete</span>
      {open && (
        <div className="as-menu" role="listbox">
          {familyLast && (
            <div className="as-menu-header">{familyLast} family</div>
          )}
          {athletes.map(a => {
            const isCurrent = a.id === currentAthleteId
            return (
              <button
                key={a.id}
                type="button"
                role="option"
                aria-selected={isCurrent}
                className={`as-item ${isCurrent ? 'as-item-current' : ''}`}
                onClick={() => {
                  setOpen(false)
                  if (!isCurrent) onSwitch(a.id)
                }}
              >
                <span className="as-avatar">{initials(a)}</span>
                <span className="as-item-text">
                  <span className="as-item-name">{a.first} {a.last}</span>
                  <span className="as-item-meta">
                    {a.age ? `Age ${a.age}` : ''}
                    {isCurrent ? (a.age ? ' · Currently viewing' : 'Currently viewing') : ''}
                  </span>
                </span>
                {isCurrent && <span className="as-check">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
