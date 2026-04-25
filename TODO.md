# TODO.md — Open Tasks

**Status key:** `[ ]` not started · `[~]` in progress · `[x]` done (move to PROGRESS.md)
**Priority:** `P0` urgent · `P1` next up · `P2` planned · `P3` nice-to-have

Newest tasks added at the top of each section. When completed, move the item to PROGRESS.md (under the current session's "What happened") and delete from here.

---

## P0 — URGENT / BLOCKING

None currently.

---

## P1 — NEXT UP

- [~] **Step 11: Bulk-load progression data into Neon** — 9 of 11 done
  Imported via the button on the admin Athletes page. Worked clean for
  Ben (205), Farris (2), Grace (78), Hannah (73), Jon (282 new / 304
  total), Kaden (94), Lana (125), Liam (19), Marley (132).
  **Mason and Pace skipped** the first run because their IDs had random
  suffixes (`ath_mason_l8x7q3`) from the old Add Athlete code. Fixed:
  import now matches by first name as a fallback, and new athletes get
  clean IDs going forward. Click the import button one more time after
  the latest deploy and Mason + Pace should land.

- [ ] **Step 12: Merge `v2-redesign` → `main`**
  Blocked on Step 11 completion (Mason + Pace re-import)
  Production cutover — flips confluence-swim.vercel.app to the new design + admin portal
  Checklist before merge: verify all Session 5 commits work in preview, spot-check Farris (no data) + Lana (next athlete to get sessions), confirm Step 8 CRUD works on every athlete profile

- [ ] **Chase: replace or delete stale project-attached handoff**
  File: `/mnt/project/CONFLUENCE_HANDOFF__1_.md`
  Current content: old handoff (says Supabase, says 9 athletes, etc.) — feeds bad context to new Claudes
  Recommended replacement: one line pointing to `CLAUDE.md` in the repo
  Exact text to use:
  ```
  See CLAUDE.md at the root of github.com/chasekalisz-coder/confluence-swim.
  That is the source of truth. Clone the repo and read the four context files (CLAUDE.md, STATE.md, PROGRESS.md, TODO.md) before doing anything.
  ```

---

## P2 — PLANNED

- [ ] **Training section: wire up AI to real athlete data**
  Currently not functioning — the AI training notes feature was built
  (test-ai.html + training-prompt.js + athlete-context.js) but never
  connected to live athlete data from Neon. Section exists in the UI
  but produces nothing useful.
  Needs: pull last 30 sessions from DB for the selected athlete, pass
  into training-prompt.js context, wire Anthropic API call to return
  a real coaching note per athlete.


- [x] **Fix fixture drift on Liam Aikey**
  - 50 Free SCY: 45.73 → 42.60
  - 50 Breast SCY: 53.63 → 51.63
  - 50 Fly SCY: 1:26.41 → 1:00.02
  - Events list: 3 events → 6 events
  Note: Chase confirms live site is accurate — this is cosmetic fixture cleanup, not functional
  Do during Step 11 bulk-load or a dedicated pass

- [x] **Fix fixture drift on Farris**
  Fixture has `meetTimes: []` — real data has 50 Free 1:55.96, 50 Fly 1:11.83
  Events list also doesn't match
  Same note as Liam: cosmetic only, site is accurate

- [x] **Add Pace Heard + Mason Liao to fixture**
  Currently DB-only. Adding to fixture makes the seed complete if DB ever needs reset
  Pace: 17 events (see `docs/progression/pace-progression-master.md`)
  Mason: 6 events (see `docs/progression/mason-progression-master.md`)

- [ ] **Update fixture profile bests during Step 11**
  - Jon 50 Breast LCM: 44.33 → 42.00
  - Marley 100 Back SCY: 1:07.37 → 1:06.87

---

## P3 — NICE-TO-HAVE

- [ ] **Add Jelena Kunovac (sprint athlete) + Chase himself to the athlete system**
  Jelena is mentioned in older docs but not in current fixture or DB
  Chase as athlete — open question whether he wants a profile
  Not urgent; only if coaching program expands

- [ ] **Progression doc for any new athletes added to program**
  Template at `docs/plans/progression-doc-template.md` (to be created)

- [ ] **Consolidate `docs/archive/`**
  Currently just the old handoff
  If PROGRESS.md gets long, archive older session blocks here

---

## NOTES ON WORKFLOW

- **When Chase mentions a new task or idea,** Claude should add it here immediately and push. No need to ask.
- **When a task is completed,** Claude moves it to PROGRESS.md (current session block) — do not just mark `[x]` and leave it
- **Priorities can shift** — Chase may re-rank at any time. Re-ordering within a priority is fine.
- **"P0" means blocking actual work.** Don't mark things P0 just because they're important — P0 is for "stop everything and do this."

---

**End of TODO.**
