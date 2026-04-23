// FamilyNav.jsx — top nav used across family-facing pages.
import swimLogo from '/assets/confluence-swim-white.png'

export default function FamilyNav({ active = 'Profile', athleteInitials = '', onNavigate }) {
  const links = [
    { label: 'Profile', view: 'profile' },
    { label: 'Session Notes', view: 'notes' },
    { label: 'Meets', view: 'meets' },
    { label: 'Analysis', view: 'analysis' },
    { label: 'Resources', view: 'resources' },
  ]

  const handle = (view) => (e) => {
    e.preventDefault()
    if (onNavigate) onNavigate(view)
  }

  return (
    <nav className="topnav">
      <div className="brand">
        <img src={swimLogo} alt="Confluence Swim" />
      </div>
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
      <div className="avatar">{athleteInitials || 'JP'}</div>
    </nav>
  )
}
