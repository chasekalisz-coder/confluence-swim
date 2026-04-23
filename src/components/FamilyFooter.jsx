// FamilyFooter.jsx — master brand footer with sport logo.
import sportLogo from '/assets/confluence-sport-white.png'

export default function FamilyFooter() {
  return (
    <footer className="site-footer">
      <img src={sportLogo} alt="Confluence Sport" className="master-logo" />
      <div className="master-line">CONFLUENCE SPORT LLC · DALLAS, TX</div>
    </footer>
  )
}
