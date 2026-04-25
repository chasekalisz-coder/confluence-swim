# STATE.md — Current Project State

**Last updated:** 2026-04-24 (Session 7)
**Updated by:** Claude

---

## STACK

- **Frontend:** Vite + React
- **Backend:** Vercel serverless functions (`/api/*.js`)
- **Database:** Neon Postgres ⚠️ **NOT Supabase** (migrated in earlier session; do not reference Supabase)
- **Blob storage:** Vercel Blob (photo uploads)
- **AI:** Anthropic API (Claude) — all session note generation
- **Deployment:** Vercel — auto-deploys on every git push
- **Image handling:** Server-side HEIC conversion for iPhone uploads

**Environment variables (Vercel):**
- `ANTHROPIC_API_KEY`
- `DATABASE_URL`

---

## REPO

- **GitHub:** github.com/chasekalisz-coder/confluence-swim
- **Active branch:** `v2-redesign` (all current work)
- **Production branch:** `main` (OLD design — not yet merged to production)
- **Last commit on v2-redesign:** `a7f1a5f` (name trimming + fullName helper, end of Session 7)

**URLs:**
- **Production (old design):** https://confluence-swim.vercel.app
- **v2 preview (current work):** https://confluence-swim-git-v2-redesign-chasekalisz-5104s-projects.vercel.app

---

## ATHLETES

**Seed fixture (`src/data/athletes.js`):** 9 athletes
**Live DB (Neon):** 11 athletes (Chase added 2 via admin UI: Pace Heard, Mason Liao)

| ID | Name | Age | Status |
|---|---|---|---|
| ath_jon | Jon Pomper | 12 | Full progression doc (33 events, 275 entries) |
| ath_lana | Lana Pomper | 9 | Full progression doc (22 events) |
| ath_ben | Ben Pomper | 12 | Full progression doc (23 events) |
| ath_kaden | Kaden Sun | 10 | Full progression doc (20 events) |
| ath_farris | Farris | 9 | Profile-only (2 SCY events) |
| ath_hannah | Hannah Montgomery | 12 | Full progression doc (12 events) |
| ath_grace | Grace Montgomery | 12 | Full progression doc (13 events) |
| ath_marley | Marley Taylor | 14 | Full progression doc (24 events) |
| ath_liam | Liam Aikey | 10 | Progression doc (6 events) — fixture stale |
| ath_pace | Pace Heard | — | Full progression doc (17 events) — NOT in fixture, DB only |
| ath_mason | Mason Liao | — | Progression doc (6 events) — NOT in fixture, DB only |

**Known fixture vs live-DB drift** (fixture is just initial seed, DB wins):
- Liam Aikey: fixture times stale (50 Free 45.73→42.60, 50 Breast 53.63→51.63, 50 Fly 1:26.41→1:00.02); events list 3→6
- Farris: fixture meetTimes empty; live DB has real times
- Pace Heard: not in fixture at all; lives in DB only
- Mason Liao: not in fixture at all; lives in DB only

Chase confirmed (Session 6): **the live site is accurate.** Fixture corrections are cosmetic.

**Known profile-best discrepancies to fix during Step 11 bulk-load:**
- Jon 50 Breast LCM: fixture 44.33 → real 42.00
- Marley 100 Back SCY: fixture 1:07.37 → real 1:06.87 (Aug 1 2025)

---

## FEATURES DEPLOYED

### Standalone HTML pages (`/public`)
- `test-ai.html` — Training session notes (Urbanchek zones, 4-section format, SVG charts)
- `technique.html` — Technique session notes
- `meetprep.html` — Meet prep notes
- `workout.html` — Workout builder
- `sprint.html` — Sprint Lab (Coach McEvoy persona, walled off from aerobic)
- `pace.html` — Race pace calculator (top 50 all-time split percentages)
- `resources.html` — Article/resource library

### React components (`/src/components`)
- `AthleteGrid.jsx` — home, athlete cards
- `AthleteProfile.jsx` — admin edit view (with MeetResultsEditor at bottom — Step 8 CRUD)
- `FamilyProfile.jsx` — athlete performance profile (public-facing view)
- `FamilyNotes.jsx` — session note list
- `SessionViewer.jsx` — single session detail (printable)

### API endpoints (`/api`)
- Note generation: training, technique, meet prep, workout, sprint
- Session save + list + delete
- Athlete load + update + delete
- DB access layer (`db.js`) with round-trip verification
- HEIC conversion (`convert-heic.js`)

### Visualizations
- 14 chart types — all SVG (never Canvas)
- Progression chart (per event, 3-year)
- Heat bloom specialty radial
- Championship standards accordion
- Two-layer session card color system (type stripe + sub-type text)

---

## SESSION NOTE COLOR SYSTEM (LOCKED)

### Top-level note types (left-stripe color)
| Type | Color | Hex |
|---|---|---|
| Training | Purple | #BF5AF2 |
| Meet Prep | Gold | #D4A853 |
| Technique | Orange | #FF9F0A |
| Workout | Teal | #64D2FF |
| Sprint Lab | Pink | #FF6482 |

### Training sub-types (text label color; stripe stays purple)
| Sub-type | Color | Hex |
|---|---|---|
| Aerobic | Blue | #0A84FF |
| Threshold | Teal | #64D2FF |
| Quality | Yellow | #FFD60A |
| Sprint (sub-type) | Orange | #FF9F0A |
| Power | Pink | #FF6482 |
| Active Rest | Green | #30D158 |
| Recovery | Sage | #5EEAD4 |

**Sprint Lab ≠ Sprint sub-type.** Different `noteType`, different AI, different filter tab, different HTML page.

---

## ADMIN PORTAL 12-STEP PLAN — STATUS

### ✅ Complete (Session 5)
- Step 2: Two-button athlete cards (View + Edit)
- Step 2.5: Dark theme + Confluence logo + footer master logo
- Step 3: Gender dropdown + Championship toggle + Add Athlete
- Step 3.5: Canonical 35-event list (`src/lib/canonicalEvents.js`)
- Step 4: Collapsible sections on edit page
- Step 5: Remove `?v2=` URL flag
- Step 6: Progression persists through save (not stripped in db.js)
- Step 7: Meet Results read-only UI
- Step 8: Full CRUD on Meet Results (Chase verified end-to-end)
- Session card color system (two-layer)
- Session history filters (Workout own tab, SCY/LCM pill)
- Admin session history (same treatment)
- Sprint Lab chip restore

### ⏳ Remaining
- **Step 9:** Covered by Step 8. Skip.
- **Step 10:** Informal end-to-end verify across athletes
- **Step 11:** Bulk-load progression data into Neon via Meet Results CRUD (source: `docs/progression/*.md`). **This is next.**
- **Step 12:** Merge `v2-redesign` → `main`. Production cutover.

---

## PERSISTENT CONTEXT SYSTEM

**Added Session 6.** This is how context survives between chats.

Files at repo root:
- `CLAUDE.md` — rules, never change
- `STATE.md` — this file
- `PROGRESS.md` — session log
- `TODO.md` — open tasks

Files in `docs/`:
- `docs/INDEX.md` — registry of all reference docs
- `docs/progression/` — 11 athlete progression master docs
- `docs/plans/` — implementation plans for upcoming work
- `docs/reference/` — methodology, style guides
- `docs/archive/` — superseded docs

**None of these affect Vercel build.** They are documentation only.

**Startup trigger Chase pastes every new chat:**
```
Confluence Swim session. Before anything else:
1. Clone repo: git clone https://chasekalisz-coder:<PAT>@github.com/chasekalisz-coder/confluence-swim.git /tmp/push-attempt/repo
2. Read CLAUDE.md, STATE.md, PROGRESS.md (top 3), TODO.md
3. Respond with: current branch, last commit hash, top 3 TODOs
4. Only then ask what I need
```

---

## CREDENTIALS

- **GitHub PAT:** Stored in Chase's Claude user memory (not in this repo per security policy). Claude retrieves it from memory at session start.
- **Supabase (DEPRECATED):** ignore any references to Supabase credentials; Neon is current
- **Anthropic API / Neon / Vercel Blob:** all in Vercel env vars, managed by Chase

---

**End of STATE. Now read PROGRESS.md.**
