# STATE.md — Current Branch State

Last updated: 2026-04-26 (Session 13)

## Active branch: v2-redesign
## Production branch: main
## Live URL: confluence-swim.vercel.app

## Last commit on main
Family-side clear flow: confirms DB delete BEFORE clearing UI, with retry. Submit button at zero picks now functions as 'Clear my request' if a saved request exists. Eliminates the silent-fail case that caused Jon's row to stick around in admin even after the family tapped 'Clear and start fresh'.

## Workflow
All fixes go to v2-redesign first, then immediately pushed to main.
Do NOT leave fixes only on v2-redesign — always merge to main after every commit.
Push command: git push [PAT] HEAD:main

## Current state of key systems
- Athlete data: DB only, single source of truth, fixture is seed-only
- Sessions: enforced schema (schemaVersion:2), hr normalized to null with warning
- AI context: athlete-locked, pool-type-locked, last 8 training sessions
- Race Pace Calculator: single source — `/pace.html`. Both Athlete Performance Profile (AthleteGrid) AND Family Analysis tab now route to it. The old inline React `RacePaceCalculator.jsx` component still exists in the codebase but is no longer rendered (Session 13).
- Meet Analyzer: shows a clean "Coming Soon" placeholder. Disabled-input preview removed. Tool itself not yet built.
- Browser back button: pushState on tab nav, popstate + hashchange listeners
- Admin tab hash-aware: /#tools and /#settings deep-link to those tabs
- DATA_SCHEMA.md: committed to repo root — READ IT before touching any data code
- elite-splits.js: src/data/elite-splits.js — shared data source

## Mobile design pass (Session 13)
Mobile sweep complete on Profile, Session Notes, and Analysis tabs.
Phase 2 mobile sweep on the Athlete Performance Profile is now complete top-to-bottom:
- Chasing Next, Times & Goals (fixed-px grid), Championship Standards (4 visible tiers, Event/Time stacked, gap-over-time), Age-Up Preview, Progression chart (taller mobile viewBox, brighter axis), Event Power Rankings (top 10 + show more), Last Race / Meet Analyzer card (stacked), Upcoming Meets (top 3 + show more, both mobile and desktop).
Session Notes: 4-card stats strip → 2x2 grid on mobile; workouts now excluded from Total/This Month/Most Common/Last Session counts everywhere.
Analysis: tool cards stack on mobile (was leaking display:flex from main.css global rule).

## Athletes on DB (all confirmed loaded)
ath_jon, ath_lana, ath_ben, ath_kaden, ath_grace, ath_hannah,
ath_marley, ath_liam, ath_farris, ath_mason, ath_pace

## Phases of current work

### Phase 1 — Tool page redesigns to match v2 site (COMPLETE — Session 12)
All 6 standalone tool pages now on v2 dark theme with .step numbered-section pattern, distinct color identity, mobile bottom nav (cs-tabbar), and default 75-min duration where applicable.
- Sprint Lab (sprint.html) — DONE — purple
- Workout Builder (workout.html) — DONE — teal
- Race Pace Calculator (pace.html) — DONE — cyan + white AVG line, chart math fix, mobile layout fix
- Technique (technique.html) — DONE — sage (replaced unauthorized amber from S11), 2x2 setup, full-width pool toggle, equal photo/video blocks, default duration 75
- Meet Prep (meetprep.html) — DONE — pink (matches React tool icon), 2x2 setup, mobile date input fix, label shortening for mobile fit
- Training Note (test-ai.html) — DONE — deep olive #2E3A12, 2x3 setup grid (athlete/date, category/stroke, session#/duration), strengthened wash, modal correction panel restyled
- React Race Pace component (RacePaceCalculator.jsx) — math fix only, no design pass; deferred

Mobile bottom nav: all 6 tool pages now have a mobile-only Athletes/Tools/Settings bar (cs-tabbar) matching the React app's .agp-tabbar visually. Tools tab pre-active. AthleteGrid.jsx reads URL hash on mount + hashchange so deep links land on the right tab.

### Phase 2 — Desktop optimization across whole site (NOT STARTED)
Site was built mobile-first. Pass through all pages for desktop layout.
Likely candidates: admin home grid spacing on wide screens, family profile tab layouts, charts wanting more horizontal real estate.

### Phase 3 — Polish + finish remaining tasks (NOT STARTED)
TODO.md is the source of truth for what's left. P1 candidates: Scheduling request flow (Resources page block — May 2026 slots), Meet Analyzer direction decision, SwimCloud rankings integration, Upcoming meets admin entry, Session count fix (workout outputs filter), Program type field (Gold Development tier dropdown).

### Phase 4 — Auth + invites + Squarespace integration (NOT STARTED)
- Clerk auth with three tiers (Chase admin, provider sub-admins, families)
- Family invite flow
- Feature gating by program type (lower tiers see basic profile; GD tier sees full features)
- Possible Squarespace integration: add confluence-swim.vercel.app as tab/subdomain on main Confluence Sport site

## What NOT to do
- Never merge fixture data with DB data (two-path system is dead)
- Never reference Supabase (removed during prototyping)
- Never push to v2-redesign only — always merge to main immediately after
- Never start a new tool redesign or any work item without explicit approval from Chase first — Claude did this with Technique in Session 11 and the bottom-nav refactor in Session 12; both caused real friction.
- Never claim something is done or not done without checking the actual code / DB / file content. PROGRESS.md from Session 9 had drift between claimed commits and what actually shipped — verify against `git log --oneline -- <file>` before stating status.
- Never let STATE.md or PROGRESS.md fall behind during a session. CLAUDE.md is explicit: every meaningful commit, decision, or state change should be reflected in those files and pushed. Chase had to call this out in Session 12 after 13 commits with no updates.
