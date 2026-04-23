// FamilyFooter.jsx — master brand footer with sport logo.
// Logo is served from /public/assets/ — reference by URL at runtime,
// NOT via `import` (Vite/Rollup can't resolve absolute paths at build time).
const SPORT_LOGO = '/assets/confluence-sport-white.png'

export default function FamilyFooter() {
  return (
    <footer className="site-footer">
      <img src={SPORT_LOGO} alt="Confluence Sport" className="master-logo" />
      <div className="master-line">CONFLUENCE SPORT LLC · DALLAS, TX</div>
    </footer>
  )
}
