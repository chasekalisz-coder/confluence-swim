// FamilyNav.jsx — top nav used across family-facing pages.
// Logo is served from /public/assets/ — reference by URL at runtime,
// NOT via `import` (Vite/Rollup can't resolve absolute paths at build time).
const SWIM_LOGO = '/assets/confluence-swim-white.png'

export default function FamilyNav({ active = 'Profile', athleteInitials = '', onNavigate, onLogoClick }) {
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
      <div className="avatar">{athleteInitials || 'JP'}</div>
    </nav>
  )
}
