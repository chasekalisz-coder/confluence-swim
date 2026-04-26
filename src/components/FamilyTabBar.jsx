// ============================================================
// FamilyTabBar.jsx
// ============================================================
// Mobile-only bottom tab bar for the family-facing side of the app.
// Five tabs: Profile, Sessions, Meets, Analysis, Resources.
//
// Hidden on desktop via CSS media query (the existing top nav handles
// desktop navigation). On mobile, this stays fixed at the bottom of
// the viewport at all times.
//
// Active tab uses the Confluence gold accent (#D4A853) for both icon
// stroke and label. Inactive tabs are slate gray.
// ============================================================

export default function FamilyTabBar({ active = 'profile', onNavigate }) {
  const tabs = [
    { id: 'profile',   label: 'Profile',   icon: ProfileIcon },
    { id: 'notes',     label: 'Sessions',  icon: SessionsIcon },
    { id: 'meets',     label: 'Meets',     icon: MeetsIcon },
    { id: 'analysis',  label: 'Analysis',  icon: AnalysisIcon },
    { id: 'resources', label: 'Resources', icon: ResourcesIcon },
  ]

  const handle = (id) => () => {
    if (onNavigate) onNavigate(id)
  }

  return (
    <nav className="ftb" aria-label="Family navigation">
      {tabs.map(t => {
        const Icon = t.icon
        const isActive = active === t.id
        return (
          <button
            key={t.id}
            type="button"
            className={`ftb-tab ${isActive ? 'ftb-tab-active' : ''}`}
            onClick={handle(t.id)}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon />
            <span className="ftb-label">{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

// ===== Icons =====
// All 18×18, currentColor stroke so the active gold flows naturally.

function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
    </svg>
  )
}

function SessionsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="14" y2="17" />
    </svg>
  )
}

function MeetsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="13" r="7" />
      <polyline points="12 9 12 13 14.5 14.5" />
      <path d="M9 2h6" />
      <path d="M12 2v3" />
    </svg>
  )
}

function AnalysisIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="20" x2="4" y2="10" />
      <line x1="10" y1="20" x2="10" y2="4" />
      <line x1="16" y1="20" x2="16" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  )
}

function ResourcesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
      <line x1="4" y1="17" x2="4" y2="21" />
    </svg>
  )
}
