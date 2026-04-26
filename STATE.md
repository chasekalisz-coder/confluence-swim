# STATE.md — Current Branch State

Last updated: 2026-04-26 (Session 11)

## Active branch: v2-redesign
## Production branch: main
## Live URL: confluence-swim.vercel.app

## Last commit on main
Race Pace polish — body radial wash, white AVG line, headline reworded to "Your race pace."

## Workflow
All fixes go to v2-redesign first, then immediately pushed to main.
Do NOT leave fixes only on v2-redesign — always merge to main after every commit.
Push command: git push [PAT] HEAD:main

## Current state of key systems
- Athlete data: DB only, single source of truth, fixture is seed-only
- Sessions: enforced schema (schemaVersion:2), hr normalized to null with warning
- AI context: athlete-locked, pool-type-locked, last 8 training sessions
- Race Pace Calculator: standalone /pace.html (Tools tab) + React component (RacePaceCalculator.jsx) inside Analysis tab — both have updated math (range-based bar scaling, avg line at true average), pace.html has full v2 design pass
- Browser back button: pushState on tab nav, popstate + hashchange listeners
- DATA_SCHEMA.md: committed to repo root — READ IT before touching any data code
- elite-splits.js: src/data/elite-splits.js — shared data source

## Athletes on DB (all confirmed loaded)
ath_jon, ath_lana, ath_ben, ath_kaden, ath_grace, ath_hannah, 
ath_marley, ath_liam, ath_farris, ath_mason, ath_pace

## Phases of current work
Session 11 is in Phase 1. After Phase 1, the agreed plan is Phase 2, 3, 4 in order.

### Phase 1 — Tool page redesigns to match v2 site (IN PROGRESS)
Each tool page in /public/ gets v2 dark theme + its own color identity.
- Sprint Lab (sprint.html) — DONE — purple
- Workout Builder (workout.html) — DONE — teal
- Race Pace Calculator (pace.html) — DONE — cyan + white AVG line, chart math fix, mobile layout fix
- Technique (technique.html) — NOT DONE — Claude pushed an amber redesign without Chase's approval (commit 13a4e0f). Chase has not signed off. Treat as not done; revert pending Chase's call.
- Meet Prep (meetprep.html) — NOT STARTED
- Test AI / Training (test-ai.html) — NOT STARTED
- React Race Pace component (RacePaceCalculator.jsx) — math fix only, no design pass; decide later

### Phase 2 — Desktop optimization across whole site (NOT STARTED)
Site was built mobile-first. Pass through all pages for desktop layout.
Likely candidates: admin home grid spacing on wide screens, family profile tab layouts, tool pages currently capped at max-width 760px, charts wanting more horizontal real estate.

### Phase 3 — Polish + finish remaining tasks (NOT STARTED)
TODO.md is the source of truth for what's left. Items from yesterday and earlier sessions are tracked there in P1/P2/P3 priority. **Note: TODO.md may be stale on Step 11 (Mason+Pace bulk import) and Step 12 (v2-redesign → main merge) — Chase has stated both are done. Do not re-do those without confirming with Chase.**

### Phase 4 — Auth + invites + Squarespace integration (NOT STARTED)
- Clerk auth with three tiers (Chase admin, provider sub-admins, families)
- Family invite flow
- Feature gating by program type (lower tiers see basic profile; GD tier sees full features)
- Possible Squarespace integration: add confluence-swim.vercel.app as tab/subdomain on main Confluence Sport site

## What NOT to do
- Never merge fixture data with DB data (two-path system is dead)
- Never reference Supabase (removed during prototyping)
- Never push to v2-redesign only — always merge to main immediately after
- Never start a new tool redesign or any work item without explicit approval from Chase first — Claude did this with Technique in Session 11 and it caused real friction
- Never claim something is done or not done without checking the actual code / DB / file content. PROGRESS.md from Session 9 had drift between claimed commits and what actually shipped — verify against `git log --oneline -- <file>` before stating status.
