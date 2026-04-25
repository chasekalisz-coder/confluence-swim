# STATE.md — Current Branch State

Last updated: 2026-04-25 (Session 9)

## Active branch: v2-redesign
## Production branch: main
## Live URL: confluence-swim.vercel.app

## Last commit on main
Race Pace Calculator JS crash fix (try/catch + scaleH safety clamp)

## Workflow
All fixes go to v2-redesign first, then immediately pushed to main.
Do NOT leave fixes only on v2-redesign — always merge to main after every commit.
Push command: git push [PAT] HEAD:main

## Current state of key systems
- Athlete data: DB only, single source of truth, fixture is seed-only
- Sessions: enforced schema (schemaVersion:2), hr normalized to null with warning
- AI context: athlete-locked, pool-type-locked, last 8 training sessions
- Race Pace Calculator: fullscreen iframe overlay in Analysis tab, pace.html
- Browser back button: pushState on tab nav, popstate listener
- DATA_SCHEMA.md: committed to repo root — READ IT before touching any data code
- elite-splits.js: src/data/elite-splits.js — shared data source

## Athletes on DB (all confirmed loaded)
ath_jon, ath_lana, ath_ben, ath_kaden, ath_grace, ath_hannah, 
ath_marley, ath_liam, ath_farris, ath_mason, ath_pace

## What NOT to do
- Never merge fixture data with DB data (two-path system is dead)
- Never reference Supabase (removed during prototyping)
- Never push to v2-redesign only — always merge to main immediately after
