// ============================================================
// FamilyResources.jsx
// ============================================================
// Family-facing Resources page. Static content:
//   - About Confluence Swim block
//   - "The Playbook" grid of resource cards (training zones, glossary,
//     meet day checklist, coaching philosophy, nutrition, equipment,
//     USA Swimming standards, FAQ)
//   - Contact card with Chase's email
//
// None of the resource cards open real content yet — they alert
// "coming soon" on click. Cards with status "Soon" show a badge.
// ============================================================

import { useMemo, useEffect } from 'react'
import FamilyNav from './FamilyNav.jsx'
import FamilyFooter from './FamilyFooter.jsx'

const RESOURCES = [
  {
    id: 'zones',
    title: 'Training Zones Explained',
    desc: 'The Urbanchek Color System — White, Pink, Red — and what each zone does for the body. How heart rate translates to adaptation.',
    status: 'ready',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    id: 'philosophy',
    title: 'Coaching Philosophy',
    desc: 'How elite youth swimmers are developed — the balance of technique, aerobic base, race craft, and mental performance.',
    status: 'soon',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
  },
  {
    id: 'meetday',
    title: 'Meet Day Checklist',
    desc: 'What to pack, what to eat, warmup timing, between-race routines. Everything the family needs to handle meet day like pros.',
    status: 'ready',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    id: 'glossary',
    title: 'Glossary',
    desc: 'Taper, Hi-Lo, breakout, DPS, splits, PB — every term translated into plain English so the family can follow along.',
    status: 'ready',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    id: 'nutrition',
    title: 'Nutrition & Hydration',
    desc: 'Fueling for training, race-day nutrition, hydration strategy. What the research actually says for age-group swimmers.',
    status: 'soon',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M2 12h20" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  {
    id: 'equipment',
    title: 'Equipment Recommendations',
    desc: 'Goggles, suits, fins, paddles — what works, and what to buy for different ages and event profiles.',
    status: 'soon',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    ),
  },
  {
    id: 'standards',
    title: 'USA Swimming Standards',
    desc: 'What B, BB, A, AA, AAA, AAAA, Sectionals, and above actually mean. How age group cuts work, and what the national pathway looks like.',
    status: 'soon',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.08-2.37C7.68 19.53 10 19 13 19a9 9 0 009-9V3h-6a9 9 0 00-9 9" />
      </svg>
    ),
  },
  {
    id: 'faq',
    title: 'FAQ',
    desc: 'The questions families ask most. How many sessions per week, how long until we see results, how taper works — the straight answers.',
    status: 'soon',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8M12 8v8" />
      </svg>
    ),
  },
]

export default function FamilyResources({ athlete, onBack, onNavigate }) {
  useEffect(() => {
    document.body.classList.add('v2-active')
    return () => { document.body.classList.remove('v2-active') }
  }, [])

  const initials = useMemo(() => {
    if (!athlete) return ''
    const f = (athlete.first || '').charAt(0).toUpperCase()
    const l = (athlete.last || '').charAt(0).toUpperCase()
    return f + l || '??'
  }, [athlete])

  const openResource = (r) => {
    alert(`"${r.title}" — article content coming soon.`)
  }

  return (
    <div className="v2">
      <FamilyNav active="Resources" athleteInitials={initials} onNavigate={onNavigate} />
      <main className="v2-main">
        {onBack && <button className="back" onClick={onBack}>← Back to Profile</button>}

        <div className="page-title">Resources</div>
        <div className="page-sub">
          Learn the language of {athlete?.first || 'your swimmer'}'s training.
          Understand what the zones mean, what a taper is, what to expect on meet day,
          and the coaching philosophy behind every session.
        </div>

        {/* ===== About block ===== */}
        <div className="about-block">
          <div className="ab-tag">About Confluence Swim</div>
          <div className="ab-title">Elite private coaching in Dallas, built around the athlete.</div>
          <div className="ab-body">
            <p>
              Every session is one-on-one. Every workout is built for the swimmer in front of
              the coach. No generic programs, no age-group templates — just high-level coaching
              applied to the specific needs of each athlete, their events, and their goals.
            </p>
            <p>
              Training is grounded in the Urbanchek color zone system, modern race craft,
              and technique work developed at the highest levels of the sport.
            </p>
          </div>
        </div>

        {/* ===== Playbook grid ===== */}
        <h2 className="section-title">The Playbook</h2>
        <div className="resource-grid">
          {RESOURCES.map(r => (
            <div
              key={r.id}
              className="resource-card"
              onClick={() => openResource(r)}
            >
              {r.status === 'soon' && <span className="rc-status">Soon</span>}
              <div className="rc-icon">{r.icon}</div>
              <div className="rc-title">{r.title}</div>
              <div className="rc-desc">{r.desc}</div>
              <div className="rc-cta">Read →</div>
            </div>
          ))}
        </div>

        {/* ===== Contact ===== */}
        <section>
          <h2 className="section-title">Questions?</h2>
          <div className="contact-card">
            <div>
              <div className="cc-title">Reach out directly</div>
              <div className="cc-sub">
                Scheduling, clarifications, anything — the fastest way is email.
              </div>
            </div>
            <a
              href="mailto:chase@confluencesport.com"
              className="cc-email"
            >
              chase@confluencesport.com
            </a>
          </div>
        </section>
      </main>
      <FamilyFooter />
    </div>
  )
}
