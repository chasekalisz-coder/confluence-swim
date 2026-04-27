# STATE.md — Current Branch State

Last updated: 2026-04-27 (Session 14 — auth cleanup + family flow tested + custom domain + tier matrix doc + Step 2 Profile/Analysis restructure)

## Active branch: v2-redesign
## Production branch: main
## Live URL: app.confluencesport.com (primary), confluence-swim.vercel.app (legacy/backup, still active)

## Last commit on main
`3a26e75 Step 4 of tier matrix: feature-access plumbing` — Two new files, no UI wiring, zero behavior change. `src/lib/tiers.js` exports `getTier(athlete)` (derives `gold/silver/bronze/skills/single` from `programType` first-word-lowercased — same logic the badge already uses, just centralized) and `compareTiers(a, b)` for "minimum tier" gates. `src/config/featureAccess.js` encodes the matrix doc as a `FEATURES` map (feature_name → array of allowed tiers) and exports `canSeeFeature(athlete, featureName)` and `isLockedForTier(athlete, featureName)` as the gate. Defaults: unset/unknown `programType` → `gold`; undeclared feature → universal access (default-allow). Step 5+ wires these into the FamilyAnalysis sections to render Chase's demo data when locked.

Earlier commits worth knowing about:
- `94ef7b8` — STATE backfill for Chase progression import
- `6420c2f` — Add Chase Kalisz progression data to bulk import system (251 entries, 28 events)
- `a00767d` — STATE backfill for admin-logo bugfix
- `edb8f3c` — Fix: admin clicking logo from athlete profile bounces to admin home
- `5c99e4a` — STATE backfill for subtitle rewrite
- `992f2b6` — Performance Analysis page subtitle rewrite + subjectPronoun helper
- `1a0ecb7` — STATE backfill for the rename
- `27fba07` — rename Analysis → Performance Analysis (desktop full label, mobile stacked over two lines)
- `6250e9e` — STATE backfill for Step 2
- `489c037` — Step 2 of tier matrix: Profile + Analysis page restructure

Earlier Session 14 commits worth knowing about:
- `5f8eb02` — CLAUDE.md update protocol section (acceptable vs unacceptable commit patterns; matched-PROGRESS-entry trigger after every push)
- `0a08cd7` — backfill of STATE.md + PROGRESS.md for Session 14 (caught up after Chase flagged the drift)
- `a08ebdb` — tier access matrix doc committed (`docs/reference/tier-access-matrix.md`); source of truth for what each program tier (Skills/Bronze/Silver/Gold) gets at both program and app level
- `a209b7c` — custom domain `app.confluencesport.com` is now live as primary; legacy `confluence-swim.vercel.app` still works as backup
- `bbb7cc1` — fixed React #310 hooks-order bug in FamilyProfile.jsx (early return was before useMemo hooks); Lana Pomper profile now renders cleanly
- `8064d6e` — Clerk sign-in page fully themed to v2 dark design (gold primary, dark inputs, white text)
- `0024d45` / `6da63d1` — Race Pace Calculator description rewritten to explain the methodology in family-friendly terms ("Optimize your race using the pacing of the world's best swimmers")
- `6be4b9a` — removed all "Coach" references from family-facing copy (FamilyMeets, FamilyProfile)
- `34b46c7` / `3a1f8fb` — AthleteSwitcher mobile size + pointerdown fix + "Switch athlete" hint label
- `ddece47` — committed `docs/reference/family-login-credentials.md` with family password convention and Clerk metadata JSON

## Workflow
All fixes go to v2-redesign first, then immediately pushed to main.
Do NOT leave fixes only on v2-redesign — always merge to main after every commit.
Push command: git push [PAT] HEAD:main

## Auth state (current as of Session 14)
- Provider: Clerk (`@clerk/clerk-react` v5.61.6) — dev-tier instance, "Development mode" banner shows on sign-in (auto-removes on production tier upgrade)
- Publishable key: `pk_test_c2hhcnAtaG9uZXliZWUtNTcuY2xlcmsuYWNjb3VudHMuZGV2JA` (Vercel env var `VITE_CLERK_PUBLISHABLE_KEY`, Production only)
- Secret key: Vercel env var `CLERK_SECRET_KEY`, Production only
- Frontend API host: `sharp-honeybee-57.clerk.accounts.dev`
- Admin user: chasekalisz@yahoo.com (Clerk user_id `user_3CvEkA6og3HK6rBy1WtW5ygVnIS`)
- Admin metadata: `{ "role": "admin" }` in publicMetadata, confirmed persisted as of Session 14
- Test family: chasekalisz+pompertest@gmail.com / Pomper2026! with `{"role":"family","linkedAthletes":["ath_jon","ath_lana","ath_ben"]}` — verified working end-to-end
- Sign-in page is themed (commit 8064d6e) — gold primary, dark inputs, white text, branded headline
- Auth gate locations: same as Session 13 cont'd (main.jsx ClerkProvider, App.jsx SignedOut/SignedIn, AppContent role check, public/auth-guard.js for tool pages)
- pace.html has `<html data-allow-family="true">` opt-in for family Analysis-tab access
- Email allowlists in App.jsx and public/auth-guard.js are still present as belt-and-suspenders fallback (no longer strictly needed since Clerk metadata works, but cheap to leave)
- Vercel env vars: Production only — Preview/Development not set (would need to be added before any branch deploys)

## Tier system (Session 14 — designed; restructure done, gating not yet built)
The five program tiers (Gold Development, Silver High Performance, Bronze Competition, Skills Package, Single Lesson) and what each gets in the app are documented in `docs/reference/tier-access-matrix.md`. That doc is the source of truth.

Implementation status: **Step 2 done.** Profile/Analysis page contents restructured per the matrix's page architecture; FamilyProfile.jsx slimmed (sub-components exported), FamilyAnalysis.jsx filled out (Times & Goals mirror + Progression + Power Rankings + Championship Standards + Age-Up + Range moved over). No `tier` field on athletes yet. No feature-access logic. No tier-aware nav. All current users (Chase as admin, Pomper test family) are effectively Gold and see everything — same as before.

Profile/Analysis page restructure (Step 2 of the matrix doc's implementation plan) is done. Step 3 (add `tier` field + `features` object to athlete data model in Neon) is the next concrete code task.

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

### Phase 4 — Auth + invites + Squarespace integration (IN PROGRESS — Session 14)
- Clerk auth: live across React app + 6 tool pages ✓
- Custom domain: app.confluencesport.com is primary ✓
- Squarespace nav link: "Athlete Portal" added to confluencesport.com main nav ✓
- Family invite flow: NOT BUILT (still happens via Clerk dashboard — eventual REST API admin form is a TODO)
- Tier matrix designed and committed to `docs/reference/tier-access-matrix.md` ✓
- Tier feature gating: NOT BUILT (Phase 5)

### Phase 5 — Tier system implementation (IN PROGRESS — Steps 2 + 4 done; data + plumbing complete)
Per `docs/reference/tier-access-matrix.md`:
1. Restructure Profile + Analysis page contents (no gating yet — Profile slims down, Analysis fills out) — **DONE Session 14**. Profile = Hero/Chasing Next/Times & Goals/Last Race/Upcoming Meets/Training Metrics (Coming Soon)/Scheduling. Analysis = Hero/Times & Goals (mirror)/Tools/Progression/Power Rankings/Championship Standards/Age-Up Preview/Range/Aerobic Development/Recent Analyses. 7 sub-components in FamilyProfile.jsx now exported and shared with FamilyAnalysis.jsx (TimesTable, ChampionshipTable, AgeUpPreview, ProgressionChart, PowerRankingsList, SpecialtyBloom, ColorLegend).
2. Add `tier` field + `features` object to athlete data model in Neon — **NOT NEEDED in initial implementation**. Decision Session 14: derive tier from existing `programType` field (e.g. "Gold Development" → "gold") via `getTier()` helper. If a separate field becomes necessary later (typo safety, decoupling display from logic), the helper is the single point of change.
3. Build feature-access infrastructure — **DONE Session 14**. `src/lib/tiers.js` (`getTier`, `compareTiers`, `TIERS` constant) and `src/config/featureAccess.js` (`FEATURES` matrix, `canSeeFeature`, `isLockedForTier`). The matrix doc translated into runtime-checkable rules. Nothing wired to UI yet — pure plumbing. Default-allow for undeclared features. Default-to-gold for unset programType.
4. Demo data scaffolding — Chase Kalisz athlete record (`ath_chase`) populated with 251 historical meet results across 28 events. **DONE Session 14**. Loaded via the existing bulk-import system. Chase's data is what non-Gold tiers see in locked sections.
5. Wire up tier-aware nav (Performance Analysis hides for Skills) — NEXT
6. Wire up per-section visibility within Performance Analysis (each gated section shows Chase's data + locked-section footer when user's tier doesn't have access)
7. Test with non-Gold athlete (temporarily flip Jon to Bronze, walk through, flip back)
8. Update Squarespace appointments page copy
9. Send-out doc announcing new system to families

## What NOT to do
- Never merge fixture data with DB data (two-path system is dead)
- Never reference Supabase (removed during prototyping)
- Never push to v2-redesign only — always merge to main immediately after
- Never start a new tool redesign or any work item without explicit approval from Chase first — Claude did this with Technique in Session 11 and the bottom-nav refactor in Session 12; both caused real friction.
- Never claim something is done or not done without checking the actual code / DB / file content. PROGRESS.md from Session 9 had drift between claimed commits and what actually shipped — verify against `git log --oneline -- <file>` before stating status.
- Never let STATE.md or PROGRESS.md fall behind during a session. CLAUDE.md is explicit: every meaningful commit, decision, or state change should be reflected in those files and pushed. Chase had to call this out in Session 12 after 13 commits with no updates.
