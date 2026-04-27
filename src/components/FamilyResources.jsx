// ============================================================
// FamilyResources.jsx
// ============================================================
// Family-facing Resources page. Static content:
//   - About Confluence Swim block
//   - "The Playbook" grid of resource cards
//   - Contact card with Chase's email
//
// Clicking a card opens the article view inline (no route change,
// no modal — just swap what's rendered in main).
//
// Article body content is PLACEHOLDER — written as real coaching prose
// but reviewed and approved by Chase before production.
// See PLACEHOLDERS.md entries 8-15.
// ============================================================

import { useState, useMemo, useEffect } from 'react'
import FamilyNav from './FamilyNav.jsx'
import FamilyFooter from './FamilyFooter.jsx'
import FamilyTabBar from './FamilyTabBar.jsx'
import maySlots from '../data/may-2026-slots.json'
import { saveSlotRequest, getSlotRequest, deleteSlotRequest } from '../lib/db.js'

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
    body: [
      { type: 'lede', text: 'Every workout is tagged with a zone. The zones tell the body which system to adapt. Different zones build different parts of the engine.' },
      { type: 'h3', text: 'The Urbanchek Color System' },
      { type: 'p', text: 'Developed by Jon Urbanchek at the University of Michigan, the color system ties heart rate directly to the training adaptation happening in the muscle. It\'s the cleanest way to describe what a set is actually asking the body to do.' },
      { type: 'zone-list', items: [
        { label: 'WHITE', rate: '130-150 bpm', desc: 'Easy aerobic. Builds the base — the engine\'s capacity to burn fat and recover between efforts. Most mileage lives here.' },
        { label: 'PINK', rate: '150-165 bpm', desc: 'Aerobic threshold. The point where aerobic metabolism is near maximum but blood lactate is still manageable. This is the zone that raises the ceiling of everything else.' },
        { label: 'RED', rate: '165-180 bpm', desc: 'Lactate tolerance. Training the body to clear lactate efficiently and to swim fast while metabolically compromised — the 200 and 400 pain zone.' },
        { label: 'BLUE', rate: '180+ bpm', desc: 'Max VO2 / lactate production. Short, hard, with full recovery. Builds top-end power for sprints and final 50s.' },
      ]},
      { type: 'h3', text: 'Why zones matter for the family' },
      { type: 'p', text: 'When a session note says "aerobic" or "threshold," you\'re seeing which zone the workout lived in. Multiple weeks of pink-zone work builds a different swimmer than multiple weeks of red-zone work. Both matter. Neither alone is enough.' },
    ],
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
    body: [
      { type: 'lede', text: 'Elite development is not about training hard. It\'s about training the right thing at the right time for the specific swimmer in front of the coach.' },
      { type: 'p', text: 'Every Confluence Swim athlete is treated as a program of one. No shared set, no generic age-group template. Sessions are built around where the swimmer is today — technically, physically, and mentally — and what they need next.' },
      { type: 'h3', text: 'Four pillars' },
      { type: 'p', text: 'Every training block balances technique, aerobic base, race craft, and mental performance. Which pillar gets the most attention shifts by season, by meet cycle, and by the specific swimmer. What doesn\'t shift is that all four get attention.' },
      { type: 'p', text: 'More on the individual pillars coming in future articles.' },
    ],
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
    body: [
      { type: 'lede', text: 'The swimmer has trained. The meet is just execution. What\'s in the bag and how the day is structured either supports that execution or gets in the way.' },
      { type: 'h3', text: 'The bag' },
      { type: 'p', text: 'Two caps. Two pairs of goggles (one primary, one backup already fitted). Race suit and a warmup suit. Parka or robe. Towels (plural). Flip-flops. Water and electrolyte bottle. Snacks that travel — bagels, rice cakes, bananas, peanut butter, honey. Avoid anything new on meet day.' },
      { type: 'h3', text: 'Warmup timing' },
      { type: 'p', text: 'Arrive early enough to swim the published warmup without being rushed. A rushed warmup is worse than a short warmup. Re-warmups between races are short, easy, and just enough to re-engage the nervous system.' },
      { type: 'h3', text: 'Between races' },
      { type: 'p', text: 'Walk. Hydrate. Eat something small if the next race is more than 90 minutes out. Stay warm — a cold swimmer swims a cold race. Keep conversation light; save the analysis for after the meet.' },
    ],
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
    body: [
      { type: 'lede', text: 'The language coaches and swimmers use has years of built-in shorthand. Here\'s the plain English behind the most common terms the family will hear.' },
      { type: 'glossary-list', items: [
        { term: 'PB', def: 'Personal Best. The fastest time the swimmer has ever gone in that event.' },
        { term: 'Split', def: 'The time for a portion of a race. A 200 has four 50-yard splits — those numbers tell the story of how the race was paced.' },
        { term: 'Taper', def: 'The planned reduction in training load before a key meet to allow the body to express peak performance. Usually 1-3 weeks.' },
        { term: 'DPS', def: 'Distance Per Stroke. How far the swimmer travels with each stroke cycle. Increasing DPS without losing stroke rate is a core technique goal.' },
        { term: 'Breakout', def: 'The moment the swimmer surfaces after a wall or start. A good breakout carries speed into the first stroke.' },
        { term: 'Hi-Lo', def: 'A pulse test taken after a hard set — first count (hi) immediately, second count (lo) one minute later. The drop measures cardiac recovery.' },
        { term: 'Seed time', def: 'The time entered for the swimmer to determine heat and lane assignments. Usually the swimmer\'s current PB in that event.' },
        { term: 'Short Course / Long Course', def: 'Short Course = 25 yards (SCY) or 25 meters (SCM). Long Course = 50 meters (LCM). Same events feel different distances because of how many walls there are.' },
      ]},
    ],
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
    body: [
      { type: 'lede', text: 'Fueling for high-volume training looks different than fueling for everyday life. For age-group swimmers specifically, this article will cover what the research supports — not what TikTok says.' },
      { type: 'p', text: 'Full article coming soon.' },
    ],
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
    body: [
      { type: 'lede', text: 'A ranked guide to what\'s in a competitive swimmer\'s bag — from goggles and caps through fins, paddles, snorkels, and tech suits.' },
      { type: 'p', text: 'Full article coming soon.' },
    ],
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
    body: [
      { type: 'lede', text: 'How the USA Swimming standards ladder works, what each tier represents in real terms, and how the national pathway is structured above AAAA.' },
      { type: 'p', text: 'Full article coming soon.' },
    ],
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
    body: [
      { type: 'lede', text: 'The questions families ask most. Straight answers — no hedging.' },
      { type: 'p', text: 'Full article coming soon.' },
    ],
  },
]

export default function FamilyResources({ athlete, onBack, onNavigate, onLogoClick, linkedAthletes, onSwitchAthlete }) {
  const [openId, setOpenId] = useState(null)

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
    setOpenId(r.id)
    // Scroll to top when entering an article
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const closeArticle = () => {
    setOpenId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openArticle = openId ? RESOURCES.find(r => r.id === openId) : null

  return (
    <div className="v2">
      <FamilyNav active="Resources" athleteInitials={initials} onNavigate={onNavigate} onLogoClick={onLogoClick} currentAthleteId={athlete?.id} linkedAthletes={linkedAthletes} onSwitchAthlete={onSwitchAthlete} />
      <main className="v2-main">
        {openArticle ? (
          // ============ ARTICLE VIEW ============
          <ArticleView
            article={openArticle}
            onClose={closeArticle}
          />
        ) : (
          // ============ INDEX VIEW ============
          <>
            {onBack && <button className="back" onClick={onBack}>← Back to Profile</button>}

            <div className="page-title">Resources</div>
            <div className="page-sub">
              Learn the language of {athlete?.first || 'your swimmer'}'s training.
              Understand what the zones mean, what a taper is, what to expect on meet day,
              and the philosophy behind every session.
            </div>

            {/* ===== About block ===== */}
            <div className="about-block">
              <div className="ab-tag">About Confluence Swim</div>
              <div className="ab-title">Elite private lessons in Dallas, built around the athlete.</div>
              <div className="ab-body">
                <p>
                  Every session is one-on-one, built around the athlete, their
                  events, their goals, and what they need that day.
                </p>
              </div>
            </div>

            {/* ===== Scheduling block ===== */}
            <SchedulingBlock athlete={athlete} slotData={maySlots} />

            {/* ===== Playbook grid ===== */}
            {/* All Playbook entries are gated until launch — onClick is a no-op
                and every card shows the "Soon" badge. The articles still exist
                in src/data/resources.js and the article view renders fine when
                navigated to directly; we just don't let users get there from
                the grid. Remove the gate (restore onClick + drop the unconditional
                badge) when content is approved for release. */}
            <h2 className="section-title">The Playbook</h2>
            <div className="resource-grid">
              {RESOURCES.map(r => (
                <div
                  key={r.id}
                  className="resource-card resource-card-locked"
                  aria-disabled="true"
                  title="Coming soon"
                >
                  <span className="rc-status">Soon</span>
                  <div className="rc-icon">{r.icon}</div>
                  <div className="rc-title">{r.title}</div>
                  <div className="rc-desc">{r.desc}</div>
                  <div className="rc-cta">Coming soon</div>
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
              </div>
            </section>
          </>
        )}
      </main>
      <FamilyFooter />
      <FamilyTabBar active="resources" onNavigate={onNavigate} />
    </div>
  )
}

// ============================================================
// SchedulingBlock — Calendar view + slot picker
// ============================================================
// Shows a month view of available slots. Family clicks a slot to
// cycle through:  available → primary (gold) → secondary (silver) → available.
// Submit button at bottom collects all picks and (eventually) sends
// to DB. For now picks are stored in component local state.
// ============================================================
function SchedulingBlock({ athlete, slotData }) {
  // picks: { [slotId]: 'primary' | 'secondary' }
  const [picks, setPicks] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [lastSubmittedAt, setLastSubmittedAt] = useState(null)
  // Mobile-only: which day's slot panel is expanded below the compact calendar.
  // null = no day selected (panel hidden). On mobile the calendar cells show only
  // a date + dot summary; tap a day to surface its full slot rows here.
  const [selectedDayIdx, setSelectedDayIdx] = useState(null)

  const athleteId = athlete?.id

  // Load existing request on mount
  useEffect(() => {
    let active = true
    if (!athleteId) { setLoading(false); return }
    setLoading(true)
    getSlotRequest(athleteId, slotData.month)
      .then(req => {
        if (!active) return
        if (req && req.picks) {
          setPicks(req.picks)
          setNote(req.note || '')
          setLastSubmittedAt(req.submitted_at)
          setSubmitted(true)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('[SchedulingBlock] failed to load existing request:', err)
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [athleteId, slotData.month])

  const setPick = (slotId, intent) => {
    if (submitted) setSubmitted(false) // Edit mode if they touch a slot post-submit
    setPicks(prev => {
      const cur = prev[slotId]
      const next = { ...prev }
      if (cur === intent) {
        // Tapping the same button again = clear
        delete next[slotId]
      } else {
        // Either no pick yet, or swapping from the other intent
        next[slotId] = intent
      }
      return next
    })
  }

  const primaryCount = Object.values(picks).filter(v => v === 'primary').length
  const secondaryCount = Object.values(picks).filter(v => v === 'secondary').length

  // Flatten picks into a chronological list for the running summary.
  // Walks all days/slots, picks out the ones the user has marked, and
  // returns them sorted by date+time so the list reads top-down naturally.
  const pickedList = useMemo(() => {
    const items = []
    for (const day of slotData.days) {
      for (const slot of day.slots) {
        const priority = picks[slot.id]
        if (!priority) continue
        items.push({
          slotId: slot.id,
          date: day.date,        // 'YYYY-MM-DD'
          label: slot.label,     // '8:00am–8:30am'
          priority,              // 'primary' | 'secondary'
        })
      }
    }
    // Sort by date string then by slot id (which encodes time within the day)
    items.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return a.slotId.localeCompare(b.slotId)
    })
    return items
  }, [picks, slotData.days])

  const handleSubmit = async () => {
    if (!athleteId) {
      alert('Cannot submit — no athlete selected.')
      return
    }
    setSaving(true)
    try {
      await saveSlotRequest(athleteId, slotData.month, picks, note.trim() || null)
      setSubmitted(true)
      setLastSubmittedAt(new Date().toISOString())
    } catch (err) {
      console.error('[SchedulingBlock] save failed:', err)
      alert('Save failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    // Tell the user we're working so the link/button can't be tapped twice
    // and so they don't refresh mid-call (which is what makes the bug feel
    // sticky — UI clears, user refreshes, useEffect re-fetches the still-
    // existing row, and the picks come back).
    if (saving) return
    console.log('[SchedulingBlock] handleReset fired', { athleteId, month: slotData.month })

    // If there's no saved request to delete, just clear local state. No DB call.
    if (!athleteId || !lastSubmittedAt) {
      setPicks({})
      setNote('')
      setSubmitted(false)
      setLastSubmittedAt(null)
      setSelectedDayIdx(null)
      return
    }

    setSaving(true)
    try {
      // Try once. If it fails (network blip, cold start, etc.) wait briefly and
      // retry once more before giving up. Two attempts covers nearly all
      // transient failures without making the user wait too long.
      let lastErr = null
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const result = await deleteSlotRequest(athleteId, slotData.month)
          console.log(`[SchedulingBlock] delete result (attempt ${attempt}):`, result)
          lastErr = null
          break
        } catch (err) {
          lastErr = err
          console.warn(`[SchedulingBlock] delete attempt ${attempt} failed:`, err)
          if (attempt === 1) await new Promise(r => setTimeout(r, 600))
        }
      }
      if (lastErr) throw lastErr

      // ONLY clear local state after the DB delete actually succeeded. If we
      // cleared first and the call failed, the user sees an empty calendar
      // but their picks are still saved — which is exactly the bug we hit.
      setPicks({})
      setNote('')
      setSubmitted(false)
      setLastSubmittedAt(null)
      setSelectedDayIdx(null)
    } catch (err) {
      console.error('[SchedulingBlock] delete failed (final):', err)
      alert(
        'Could not clear your request from the server.\n\n' +
        'Error: ' + err.message + '\n\n' +
        'Your picks are still saved on the server. Please check your internet connection and try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  // Group days into weeks for calendar grid
  const monthLabel = useMemo(() => {
    const [y, m] = slotData.month.split('-').map(Number)
    const date = new Date(y, m - 1, 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }, [slotData.month])

  // Build calendar grid: figure out what weekday May 1 is, pad with empty cells
  const calendarCells = useMemo(() => {
    const firstDay = slotData.days[0]
    const firstDate = new Date(firstDay.date + 'T12:00:00')
    const firstWeekday = firstDate.getDay() // 0=Sun
    const cells = []
    // Pad with empty cells for days before May 1
    for (let i = 0; i < firstWeekday; i++) cells.push(null)
    // Add all days
    slotData.days.forEach(d => cells.push(d))
    return cells
  }, [slotData])

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="sched-block">
      <div className="sb-header">
        <div className="sb-tag">Scheduling</div>
        <div className="sb-title">Request your sessions for {monthLabel}</div>
        <div className="sb-sub">
          Mark the slots you'd like as <span className="sb-pill primary">Requests</span>.
          If you have flexibility, mark a few additional times as <span className="sb-pill secondary">Alternatives</span>.
          Every effort goes into giving each family their full set of Requests — Alternatives only come into play if a Request needs to shift.
        </div>
        <div className="sb-legend">
          <span className="sb-legend-item">
            <span className="sb-legend-key primary">R</span>
            <span>Request</span>
          </span>
          <span className="sb-legend-item">
            <span className="sb-legend-key secondary">A</span>
            <span>Alternative</span>
          </span>
        </div>
        <div className="sb-disclaimer">
          Once schedule requests are set, Chase will reach out to review all dates before sessions are confirmed.
        </div>
      </div>

      {loading ? (
        <div className="sb-summary" style={{ padding: '40px 0', textAlign: 'center' }}>Loading your request...</div>
      ) : submitted ? (
        // Submitted state — replaces the entire calendar UI with a confirmation card.
        // This is the default view both right after submit AND on fresh page loads
        // when a saved request already exists, so parents returning days later
        // see "yes, this is saved" instead of an ambiguous calendar with marks.
        <div className="sb-confirm">
          <div className="sb-confirm-header">
            <div className="sb-confirm-check">✓</div>
            <div>
              <div className="sb-confirm-title">Request submitted</div>
              {lastSubmittedAt && (
                <div className="sb-confirm-meta">
                  {new Date(lastSubmittedAt).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                    hour: 'numeric', minute: '2-digit'
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="sb-confirm-body">
            Chase has your requests for {monthLabel}. He'll reach out to review all dates before sessions are confirmed.
          </div>

          {primaryCount > 0 && (
            <div className="sb-confirm-section">
              <div className="sb-confirm-section-title">
                Your requests <span className="sb-confirm-count">{primaryCount}</span>
              </div>
              <div className="sb-confirm-rows">
                {pickedList.filter(p => p.priority === 'primary').map(item => {
                  const dateObj = new Date(item.date + 'T12:00:00')
                  const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                  return (
                    <div key={item.slotId} className="sb-confirm-row">
                      <span className="sb-picked-tag primary">R</span>
                      <span className="sb-picked-time">{item.label}</span>
                      <span className="sb-picked-sep">·</span>
                      <span className="sb-picked-date">{dateStr}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {secondaryCount > 0 && (
            <div className="sb-confirm-section">
              <div className="sb-confirm-section-title">
                Your alternatives <span className="sb-confirm-count">{secondaryCount}</span>
              </div>
              <div className="sb-confirm-rows">
                {pickedList.filter(p => p.priority === 'secondary').map(item => {
                  const dateObj = new Date(item.date + 'T12:00:00')
                  const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                  return (
                    <div key={item.slotId} className="sb-confirm-row">
                      <span className="sb-picked-tag secondary">A</span>
                      <span className="sb-picked-time">{item.label}</span>
                      <span className="sb-picked-sep">·</span>
                      <span className="sb-picked-date">{dateStr}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="sb-confirm-actions">
            <button
              type="button"
              className="sb-btn-submit"
              onClick={() => setSubmitted(false)}
            >
              Add more requests
            </button>
            <div className="sb-confirm-help">
              Tapping reopens the calendar with all your existing picks still in place — add new ones on top, then re-submit.
            </div>
            <button
              type="button"
              className="sb-link sb-confirm-clear"
              onClick={handleReset}
            >
              Clear and start fresh
            </button>
          </div>
        </div>
      ) : (
        <>
      <div className="sb-counts">
        <div><span className="sb-dot primary"></span> {primaryCount} {primaryCount === 1 ? 'Request' : 'Requests'}</div>
        <div><span className="sb-dot secondary"></span> {secondaryCount} {secondaryCount === 1 ? 'Alternative' : 'Alternatives'}</div>
      </div>

      {/* Calendar grid */}
      <div className="sb-cal">
        {/* Weekday header */}
        {weekdayLabels.map(w => (
          <div key={w} className="sb-cal-weekday">{w}</div>
        ))}
        {/* Day cells */}
        {calendarCells.map((day, i) => {
          // Determine day-level tint: gold if any slot is a Request, gray if only Alternatives, neutral if none.
          let dayTint = ''
          let requestCount = 0
          let alternativeCount = 0
          if (day) {
            for (const s of day.slots) {
              const p = picks[s.id]
              if (p === 'primary') requestCount++
              else if (p === 'secondary') alternativeCount++
            }
            if (requestCount > 0) dayTint = 'has-request'
            else if (alternativeCount > 0) dayTint = 'has-alternative'
          }
          const isSelected = day && i === selectedDayIdx
          return (
            <div key={i} className={`sb-cal-cell ${!day ? 'empty' : ''} ${dayTint} ${isSelected ? 'selected' : ''}`}>
              {day && (
                <>
                  {/* Mobile-only summary — tap to expand the day panel below */}
                  <button
                    type="button"
                    className="sb-cal-mobile-summary"
                    onClick={() => setSelectedDayIdx(prev => prev === i ? null : i)}
                    aria-label={`View slots for ${day.date}`}
                  >
                    <span className="sb-cal-date">{parseInt(day.date.split('-')[2])}</span>
                    <span className="sb-cal-dots">
                      {day.slots.map(s => {
                        const p = picks[s.id]
                        return <span key={s.id} className={`sb-cal-dot ${p || ''}`} />
                      })}
                    </span>
                  </button>
                  {/* Desktop view — date + slot rows inline. Hidden on mobile. */}
                  <div className="sb-cal-desktop">
                    <div className="sb-cal-date">{parseInt(day.date.split('-')[2])}</div>
                    <div className="sb-cal-slots">
                      {day.slots.map(s => {
                        const pick = picks[s.id]
                        const startLabel = s.label.replace(/–/g, '–').split('–')[0]
                        return (
                          <div key={s.id} className={`sb-slot-row ${pick || ''}`}>
                            <span className="sb-slot-time" title={s.label}>{startLabel}</span>
                            <button
                              type="button"
                              className={`sb-slot-btn primary ${pick === 'primary' ? 'active' : ''}`}
                              onClick={() => setPick(s.id, 'primary')}
                              aria-label={`Mark ${s.label} as Request`}
                            >R</button>
                            <button
                              type="button"
                              className={`sb-slot-btn secondary ${pick === 'secondary' ? 'active' : ''}`}
                              onClick={() => setPick(s.id, 'secondary')}
                              aria-label={`Mark ${s.label} as Alternative`}
                            >A</button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile-only day panel — shows the full slot rows for the selected day */}
      {selectedDayIdx != null && calendarCells[selectedDayIdx] && (
        <div className="sb-day-panel">
          <div className="sb-day-panel-header">
            <span className="sb-day-panel-date">
              {(() => {
                const d = new Date(calendarCells[selectedDayIdx].date + 'T12:00:00')
                return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
              })()}
            </span>
            <button
              type="button"
              className="sb-day-panel-close"
              onClick={() => setSelectedDayIdx(null)}
              aria-label="Close day panel"
            >×</button>
          </div>
          <div className="sb-day-panel-slots">
            {calendarCells[selectedDayIdx].slots.map(s => {
              const pick = picks[s.id]
              return (
                <div key={s.id} className={`sb-slot-row sb-slot-row-mobile ${pick || ''}`}>
                  <span className="sb-slot-time">{s.label}</span>
                  <button
                    type="button"
                    className={`sb-slot-btn primary ${pick === 'primary' ? 'active' : ''}`}
                    onClick={() => setPick(s.id, 'primary')}
                  >R</button>
                  <button
                    type="button"
                    className={`sb-slot-btn secondary ${pick === 'secondary' ? 'active' : ''}`}
                    onClick={() => setPick(s.id, 'secondary')}
                  >A</button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Running list — every picked slot in chronological order, with quick-clear */}
      {pickedList.length > 0 && (
        <div className="sb-picked-list">
          <div className="sb-picked-header">
            <span className="sb-picked-title">Your picks</span>
            <span className="sb-picked-summary">
              {primaryCount} {primaryCount === 1 ? 'Request' : 'Requests'}
              {secondaryCount > 0 && <> · {secondaryCount} {secondaryCount === 1 ? 'Alternative' : 'Alternatives'}</>}
            </span>
          </div>
          <div className="sb-picked-rows">
            {pickedList.map(item => {
              const dateObj = new Date(item.date + 'T12:00:00')
              const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
              return (
                <div key={item.slotId} className={`sb-picked-row ${item.priority}`}>
                  <span className={`sb-picked-tag ${item.priority}`}>
                    {item.priority === 'primary' ? 'R' : 'A'}
                  </span>
                  <span className="sb-picked-time">{item.label}</span>
                  <span className="sb-picked-sep">·</span>
                  <span className="sb-picked-date">{dateStr}</span>
                  <button
                    type="button"
                    className="sb-picked-clear"
                    onClick={() => setPick(item.slotId, item.priority)}
                    aria-label={`Remove ${item.label} on ${dateStr}`}
                    title="Remove"
                  >×</button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Optional note */}
      {!submitted && !loading && (primaryCount + secondaryCount > 0) && (
        <div className="sb-note-wrap">
          <label className="sb-note-label">Anything Chase should know? (optional)</label>
          <textarea
            className="sb-note"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. We'd prefer two sessions per week, ideally back-to-back days..."
            rows={2}
          />
        </div>
      )}

      {/* Action bar — edit mode only. Submitted state has its own action bar in the confirm card. */}
      <div className="sb-actions">
        <div className="sb-summary">
          {primaryCount + secondaryCount === 0
            ? (lastSubmittedAt
                ? 'You\'ve removed all your picks. Tap below to clear your saved request.'
                : 'No slots picked yet.')
            : `${primaryCount + secondaryCount} slot${primaryCount + secondaryCount === 1 ? '' : 's'} picked`}
        </div>
        <div className="sb-btns">
          {(primaryCount + secondaryCount > 0) && (
            <button className="sb-btn-clear" onClick={handleReset} disabled={saving}>Clear all</button>
          )}
          <button
            className="sb-btn-submit"
            onClick={
              // If they've zeroed out a previously-submitted request, "submit"
              // means "clear my request" — handleReset deletes the DB row and
              // resets local state. Otherwise we're saving picks normally.
              (primaryCount + secondaryCount === 0 && lastSubmittedAt)
                ? handleReset
                : handleSubmit
            }
            // Disabled only if there's nothing to do at all — no picks AND no saved
            // request to clear. The "submit zero with saved request" case is enabled.
            disabled={
              saving ||
              (primaryCount + secondaryCount === 0 && !lastSubmittedAt)
            }
          >
            {saving
              ? 'Submitting...'
              : (primaryCount + secondaryCount === 0 && lastSubmittedAt)
                ? 'Clear my request'
                : (lastSubmittedAt ? 'Update Request' : 'Submit Request')}
          </button>
        </div>
      </div>
        </>
      )}
    </div>
  )
}


// Shared template for every Playbook entry. Pulls blocks from
// article.body which is an array of { type, text | items } nodes.
// ============================================================
function ArticleView({ article, onClose }) {
  return (
    <div className="article-view">
      <button className="back" onClick={onClose}>← Back to Resources</button>
      <div className="article-header">
        <div className="article-tag">The Playbook</div>
        <h1 className="article-title">{article.title}</h1>
      </div>
      <div className="article-body">
        {article.body.map((block, i) => {
          switch (block.type) {
            case 'lede':
              return <p key={i} className="article-lede">{block.text}</p>
            case 'h3':
              return <h3 key={i} className="article-h3">{block.text}</h3>
            case 'p':
              return <p key={i} className="article-p">{block.text}</p>
            case 'zone-list':
              return (
                <div key={i} className="zone-list">
                  {block.items.map((z, j) => (
                    <div key={j} className={`zone-list-item zone-${z.label.toLowerCase()}`}>
                      <div className="zl-label">{z.label}</div>
                      <div className="zl-rate mono">{z.rate}</div>
                      <div className="zl-desc">{z.desc}</div>
                    </div>
                  ))}
                </div>
              )
            case 'glossary-list':
              return (
                <dl key={i} className="glossary-list">
                  {block.items.map((g, j) => (
                    <div key={j} className="glossary-item">
                      <dt>{g.term}</dt>
                      <dd>{g.def}</dd>
                    </div>
                  ))}
                </dl>
              )
            default:
              return null
          }
        })}
      </div>
      <button className="back article-close" onClick={onClose}>← Back to Resources</button>
    </div>
  )
}
