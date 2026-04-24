# CONFLUENCE SWIM — COMPLETE PROJECT HANDOFF
**Generated:** April 24, 2026, end of Session 5
**For:** Next Claude picking up this work in a fresh chat
**Self-sufficient:** You do NOT have access to prior chat transcripts. Everything you need is in THIS document + the files it references.

---

# TABLE OF CONTENTS

1. Who Chase Is — Read First
2. Project Overview
3. The 9 Athletes
4. Repo, Branches, URLs
5. Credentials
6. File Structure Guide
7. Pages & Features Already Built
8. Color System (LOCKED)
9. Training Methodology Reference
10. Admin Portal 12-Step Plan — State
11. Session 5 Commit Log
12. Progression Data Collection Task
13. Open TODOs After Session 5
14. Rules That Got Broken & How To Avoid
15. Working Style & Tone
16. Critical Code Patterns
17. Opening Message For New Chat

---

# 1. WHO CHASE IS

Chase Kalisz — **Olympic gold medalist** swimmer (200m IM, Tokyo 2020), elite private youth swim coach running **Confluence Sport LLC** out of **Robson & Lindley Aquatics Center at SMU, Dallas, TX**.

He is building a coaching app used by himself + a small roster of private athletes + their families. This is not a public product.

**How to work with him:**
- **Do not explain swimming to him.** He won Olympic gold in it.
- **Do not second-guess his coaching methodology.** If he says a rule is a rule, it's a rule.
- **Do not ask for info that's in the codebase.** Grep `src/data/athletes.js` for profile times before asking him.
- **Be concise.** No preambles, no "great question!" filler, no over-apologizing.
- **Match his energy.** He speaks plainly, often with profanity when frustrated. Don't be stiff.
- **Read files before claiming what's in them.** Don't act on memory.
- **If you catch yourself drafting a table/time/date in your response text before it's in the target file — STOP.** That's how the last Claude fabricated data 5+ times.

---

# 2. PROJECT OVERVIEW

**Product:** Confluence Swim — AI-powered coaching app. Chase uploads handwritten session sheets or enters data, AI generates coaching notes, performance charts, meet prep documents. Saved per-athlete, printable, family-shareable.

**Stack:**
- Frontend: **Vite + React**
- Backend: **Vercel serverless functions** in `/api/*.js`
- Database: **Neon Postgres** (migrated off Supabase earlier — Supabase is dead, don't reference it)
- Blob storage: **Vercel Blob** (for photo uploads)
- AI: **Anthropic API** (Claude) — all note generation
- Deployment: **Vercel** — auto-deploys on every git push
- Image handling: **HEIC server-side conversion** for iPhone photos

**Env vars** (Vercel dashboard, per-project):
- `ANTHROPIC_API_KEY`
- `DATABASE_URL`

That's it — just those two.

---

# 3. THE 9 ATHLETES

Current fixture in `src/data/athletes.js` has **9 athletes**. Earlier conversation mentioned Jelena (sprint athlete), Mason, and Chase himself — those are NOT in the current fixture.

| ID | Name | Age | DOB | Gender | Progression Status |
|---|---|---|---|---|---|
| `ath_jon` | Jon Pomper | 12 | June 4 | M | DONE (275 entries, 33 events + 2 never-swum) |
| `ath_lana` | Lana Pomper | 9 | March 25 | F | NOT STARTED |
| `ath_ben` | Ben Pomper | 12 | March | M | NOT STARTED |
| `ath_kaden` | Kaden Sun | 10 | April 4 | M | DONE (20 events, 15 pending dated) |
| `ath_farris` | Farris | 9 | null | — | NOT STARTED (may have no meet history) |
| `ath_hannah` | Hannah Montgomery | 12 | null | F | NOT STARTED |
| `ath_grace` | Grace Montgomery | 12 | null | F | NOT STARTED |
| `ath_marley` | Marley Taylor | 14 | June | F | SCY done (14 events), LCM not started |
| `ath_liam` | Liam Aikey | 10 | April 8 | M | NOT STARTED |

All 9 have profile best times and goal times in the fixture.

---

# 4. REPO, BRANCHES, URLS

**Repo:** `github.com/chasekalisz-coder/confluence-swim`

**Branches:**
- `main` — production, OLD design (v1), what the public URL currently serves
- `v2-redesign` — all Session 5 work. NOT YET MERGED to main. Step 12 is that merge.

**URLs:**
- Main live (old design): `confluence-swim.vercel.app`
- v2 preview (all new work): `confluence-swim-git-v2-redesign-chasekalisz-5104s-projects.vercel.app`

**Deploy workflow:**
- Clone repo to `/tmp/push-attempt/repo`
- Make changes
- Commit with descriptive message
- Push using stored PAT
- Vercel auto-deploys

---

# 5. CREDENTIALS

**GitHub PAT:**
```
<PAT_REDACTED_SEE_CLAUDE_MD>
```

Push workflow:
```bash
cd /tmp/push-attempt/repo
git add -A
git commit -m "..."
git push https://chasekalisz-coder:<PAT_REDACTED_SEE_CLAUDE_MD>@github.com/chasekalisz-coder/confluence-swim.git v2-redesign
```

**Neon Postgres + Vercel Blob + Anthropic API** — all keys in Vercel env vars. Chase manages these.

---

# 6. FILE STRUCTURE

```
confluence-swim/
├── public/                       # Standalone HTML pages (non-React)
│   ├── test-ai.html              # Training session note form
│   ├── technique.html            # Technique session form
│   ├── meetprep.html             # Meet prep form
│   ├── workout.html              # Workout builder
│   ├── sprint.html               # Sprint Lab (Coach McEvoy)
│   ├── pace.html                 # Race pace calculator
│   └── resources.html            # Article library
│
├── src/
│   ├── App.jsx                   # Root router
│   ├── main.jsx                  # Entry point
│   ├── components/
│   │   ├── AthleteGrid.jsx       # Home screen — athlete cards
│   │   ├── AthleteProfile.jsx    # Admin edit view (MeetResultsEditor at bottom)
│   │   ├── FamilyProfile.jsx     # Athlete performance profile
│   │   ├── FamilyNotes.jsx       # Session note list on profile
│   │   └── SessionViewer.jsx     # Single session detail (printable)
│   ├── lib/
│   │   ├── db.js                 # DB access layer
│   │   ├── canonicalEvents.js    # 35-event canonical list
│   │   ├── standards.js          # USA Swimming Motivational Standards
│   │   └── championship-standards.js
│   ├── data/
│   │   └── athletes.js           # Athlete fixture
│   └── styles/
│       ├── apple-dark.css        # v2 tokens (scoped under .v2)
│       └── main.css              # Global + admin edit styles
│
└── api/
    ├── db.js                     # Unified DB endpoint
    ├── save-session.js           # Session save (used by HTML pages)
    ├── athlete-sessions.js       # Session list
    ├── generate-*-note.js        # AI endpoints per note type
    ├── convert-heic.js
    └── lib/
        ├── athlete-context.js
        └── *-prompt.js           # AI prompts per note type
```

---

# 7. PAGES & FEATURES ALREADY BUILT

**Training session notes** (`test-ai.html`):
- Form: athlete, category (aerobic/threshold/quality/active_rest/sprint/power/recovery), stroke focus, pool type (REQUIRED hard gate), session #, duration, photo upload
- AI → 4-section coaching note: `[WHAT WE DID TODAY]` / `[WHAT IT MEANS]` / `[WHAT WE'RE BUILDING TOWARD]` / `[NEXT SESSION]`
- SVG charts: bar chart, HR line, rep detail cards, Hi-Lo block

**Technique** (`technique.html`): stroke correction notes based on coach observations

**Meet Prep** (`meetprep.html`): one section per focus event with race strategy

**Workout Builder** (`workout.html`): on-demand workouts, saved as "Workout" note type

**Sprint Lab** (`sprint.html`): **Coach McEvoy AI persona**, walled off from aerobic training. Separate prompt, separate methodology, separate filter tab.

**Race Pace Calculator** (`pace.html`): top-50 all-time split percentages for every event, SCY/SCM/LCM × Men/Women

**Athlete Performance Profile** (`FamilyProfile.jsx`):
- Name + age + primary events
- Meet times table (SCY/LCM toggle)
- Goal times
- Progression chart (SVG, per event, 3-year)
- Heat bloom specialty radial viz
- Championship standards accordion
- Session history (`FamilyNotes.jsx`)

**Admin Edit View** (`AthleteProfile.jsx`):
- Collapsible sections: Basics (always open), Meet Times, Goal Times, Meet Results
- Gender dropdown, Championship toggle, events multi-select
- 35 canonical event rows always render
- **Meet Results: full CRUD** (Session 5's biggest ship)
- Session history view

---

# 8. COLOR SYSTEM (LOCKED)

**Top-level note TYPES** — colored left-stripe on session cards:

| Type | Color | Hex |
|---|---|---|
| Training | Purple | `#BF5AF2` |
| Meet Prep | Gold | `#D4A853` |
| Technique | Orange | `#FF9F0A` |
| Workout | Teal | `#64D2FF` |
| Sprint Lab | Pink | `#FF6482` |

**Training sub-types** — colored TEXT LABEL (stripe stays purple):

| Sub-type | Color | Hex |
|---|---|---|
| Aerobic | Blue | `#0A84FF` |
| Threshold | Teal | `#64D2FF` |
| Quality | Yellow | `#FFD60A` |
| Sprint (sub-type) | Orange | `#FF9F0A` |
| Power | Pink | `#FF6482` |
| Active Rest | Green | `#30D158` |
| Recovery | Sage | `#5EEAD4` |

**Sprint Lab vs sprint-as-sub-type:**
- Sprint Lab: standalone note type, pink stripe + "SPRINT LAB" label, Coach McEvoy, own HTML page + prompt
- Sprint (training sub-type): training session with sprint focus, purple stripe + "SPRINT" orange label, regular training prompt
- Do NOT overlap. Different `noteType`, different AI, different filter tab.

---

# 9. TRAINING METHODOLOGY REFERENCE

**Urbanchek Color Zone System** (Chase's methodology):

| Zone | 10-sec pulse | BPM | Effort |
|---|---|---|---|
| White | 23–25 | 138–150 | Comfortable aerobic base |
| Pink | 26–27 | 156–162 | Firm aerobic |
| Red | 28–29 | 168–174 | Aerobic threshold |
| Higher | 30+ | 180+ | Anaerobic / quality |

**Hi-Lo Pulse Test** (immediately post-hardest-set):
- Hi: highest count immediately post-set
- Lo: count after 1 min rest
- Drop ≥10 = strong cardiac recovery
- Drop <10 = building toward target

---

# 10. ADMIN PORTAL 12-STEP PLAN

**Complete (Steps 1–8):**
- ✅ Step 1: Branch setup (scrapped — working on v2-redesign directly)
- ✅ Step 2: Two-button athlete cards (View Profile + Edit Profile)
- ✅ Step 2.5: Dark theme + Confluence logo + footer master logo
- ✅ Step 3: Gender dropdown + Championship toggle
- ✅ Step 3.5: Canonical 35-event list
- ✅ Step 4: Collapsible sections on edit page
- ✅ Session card color system (two-layer: stripe + text)
- ✅ Workout/Sprint Lab in own tabs, excluded from 'All'
- ✅ SCY/LCM toggle no longer filters session list
- ✅ Step 5: Removed `?v2=` URL flag
- ✅ Step 6: Stop stripping progression on save; verify round-trip covers progression
- ✅ Step 7: Meet Results read-only UI
- ✅ **Step 8: Full CRUD on Meet Results — Chase verified end-to-end**

**Remaining:**
- ⏳ Step 9: Covered by Step 8. Skip.
- ⏳ Step 10: End-to-end verify across athletes. Informal.
- ⏳ **Step 11: Bulk-load progression data into DB.** Source: `/mnt/user-data/outputs/*-progression-master.md`. Next big one.
- ⏳ Step 12: Merge v2-redesign → main.

**Known fixture issues to fix during Step 11:**
- Jon's 50 Breast LCM: fixture 44.33 → real 42.00
- Marley's 100 Back SCY: fixture 1:07.37 → real 1:06.87

---

# 11. SESSION 5 COMMIT LOG (on v2-redesign)

```
28a4f45  Step 8: Add / Edit / Delete on Meet Results
182b5c9  Step 7 follow-up: pipe progression through editData
276887a  Step 7: Meet Results read-only UI
beacfbc  Step 6: Stop stripping progression on save
1d2026b  Step 5: Remove ?v2= URL flag
de4f14a  Restore Sprint Lab chip on admin profile
bdbd7e0  Admin session history: two-layer colors + pool tag
063c994  Session history: Workout in own tab + SCY/LCM tag
885fca6  Two-layer color system for session notes
e00badd  Step 4 follow-up: Remove Session Notes stub
99b4191  Step 4: Collapsible sections on edit page
675848d  Step 3.5: Canonical event list
91f26d8  Step 3: Gender dropdown + championship toggle
76e68cd  Step 2.5b: Real logo in header + footer
e8aa7f1  Step 2.5: Flip admin to dark theme
7b96dcb  Step 2 fix: Card CSS rewrite
8084d03  Step 2 polish
57b7558  Step 2: Two-button athlete cards
```

Earlier sessions (1–4) covered: React build, Supabase→Neon migration, all HTML pages, AI prompt system, chart system, race pace calculator, heat bloom viz, Championship standards, goal times system.

---

# 12. PROGRESSION DATA COLLECTION TASK

**Goal:** Build master docs of meet history per athlete. These feed Step 11 bulk-load.

**Source:** Chase copies per-event meet history from **SwimCloud / Swimmetry**. Screenshot shows one event with columns: Time, Age, Date, Standard. Event name at top (e.g., "50 FR", "100 BK", "200 BR").

**Output:** `/mnt/user-data/outputs/{firstname}-progression-master.md`

## PROCESS RULES (LOCKED)

**Per-event workflow:**
1. Chase sends ONE event screenshot
2. Identify event from screenshot header
3. Look up profile best in `src/data/athletes.js` — **DO NOT ASK, grep**
4. Compare profile best to fastest uploaded time
5. Apply pending rule (below)
6. Write event to master doc in correct position
7. Report concisely

**Data rules:**
- **Time + date only.** Ignore age and meet/standard columns. Meet names skipped per Chase.
- **Keep ALL X-marked times.** SwimCloud's X flag doesn't matter.
- **Max 10 results per event.** If more, drop slowest.

**Profile-best pending rule:**
- If profile best FASTER than anything uploaded → add `pending` row at top, drop slowest of 10 (if at 10). If <10, append, drop nothing.
- If profile best MATCHES fastest uploaded → no pending row.
- If profile best SLOWER than fastest uploaded → no pending, flag "stale profile".

**Pending-only events** (profile has best, SwimCloud zero results): single row with profile best labeled `pending`.

**Never-swum events:** only if Chase explicitly says so. Mark section "NEVER SWUM", no data rows.

## ORDERING

- **SCY section first, then LCM**
- Stroke order: **Freestyle → Butterfly → Backstroke → Breaststroke → IM**
- Distance order: **shortest → longest** within stroke
- Within event: fastest first (pending at top)

**Distance lists per stroke:**
- Free SCY: 50, 100, 200, 500, 1000, 1650
- Free LCM: 50, 100, 200, 400, 800, 1500
- Fly/Back/Breast: 50, 100, 200 (both courses)
- IM SCY: 100, 200, 400
- IM LCM: 200, 400 (no 100)

## ROW FORMAT (EXACT)

Data row: `| TIME | YYYY-MM-DD | |` (meet column always blank)

```
| 1:05.46 | 2025-03-01 | |
| 28.02 | pending | pending |
```

## EVENT HEADER ABBREVIATIONS

| Screenshot | Write as |
|---|---|
| 50 FR | 50 Freestyle SCY/LCM |
| 100/200/500/1000/1650 FR | 100/200/etc Freestyle |
| 50/100/200 FL | 50/100/200 Butterfly |
| 50/100/200 BK | 50/100/200 Backstroke |
| 50/100/200 BR | 50/100/200 Breaststroke |
| 100/200/400 IM | 100/200/400 Individual Medley |

## MASTER DOC TEMPLATE

```markdown
# {First Last} — Meet Progression Master Document

**Athlete:** {First Last} (ath_{id})
**Age:** {age} (DOB {dob})
**Source:** SwimCloud paste, per-event, provided by Chase Kalisz on {date}
**Ordering:** SCY first then LCM; within course Freestyle → Butterfly → Backstroke →
Breaststroke → IM; within stroke shortest → longest.

## Rules applied
Up to 10 results per event, both prelims and finals counted. All legitimate
swims count — "X" markers in the SwimCloud source are kept (they're valid
recorded times regardless of the X flag).

Rule: if the athlete's profile-listed best time is faster than anything in
the 10 uploaded results, that best time is added to the list (labeled
`pending` for date and meet) and the slowest of 10 is dropped. If the list
has fewer than 10, the profile best is simply appended and nothing is removed.

---

## SHORT COURSE YARDS (SCY)

---

## LONG COURSE METERS (LCM)

---
```

## COMPLETED DOCS

- `jon-progression-master.md` — DONE
- `kaden-progression-master.md` — DONE (meet names skipped)
- `marley-progression-master.md` — **SCY DONE, LCM EMPTY**

## MARLEY LCM — NEXT UP

Profile bests for her 10 pending LCM events:

| Event | Profile Best |
|---|---|
| 50 Free LCM | 29.81 |
| 100 Free LCM | 1:05.24 |
| 200 Free LCM | 2:35.01 |
| 50 Fly LCM | 31.37 |
| 100 Fly LCM | 1:18.44 |
| 50 Back LCM | 38.77 |
| 100 Back LCM | 1:27.63 |
| 50 Breast LCM | 37.88 |
| 100 Breast LCM | 1:24.22 |
| 200 IM LCM | 2:49.60 |

Add to existing `marley-progression-master.md` under `## LONG COURSE METERS (LCM)`.

---

# 13. OPEN TODOS AFTER SESSION 5

**Immediate (progression):**
1. Marley LCM — 10 events pending screenshots
2. Lana, Ben, Farris, Hannah, Grace, Liam — all events each
3. Farris may have no meet history; verify before creating doc

**App development:**
- Step 11: Bulk-load progression data into DB
- Step 12: Merge v2-redesign → main
- Fix Jon's 50 Breast LCM: 44.33 → 42.00
- Fix Marley's 100 Back SCY: 1:07.37 → 1:06.87

**Running todo:** `/mnt/user-data/outputs/confluence-todo.md`

---

# 14. RULES THAT GOT BROKEN & HOW TO AVOID

Previous Claude fabricated data 5+ times during Marley's collection. Caused Chase to re-upload screenshots, burned his image quota.

**What happened:**
1. Drafted speculative data in response text while "thinking"
2. Draft data leaked into `str_replace` calls
3. When I caught "fabrications," deleted them — alongside real data Chase had sent
4. Forced Chase to re-upload repeatedly

**HARD RULES to prevent it:**

1. **NEVER type a time, date, or event table into your response text before it's in the target file.** The master doc is the ONLY place tables live.

2. **Every tool call editing a master doc must reference ONLY data from the screenshot in the CURRENT message.** Not inferred. Not remembered. Not from training data.

3. **Do NOT pre-add event sections or placeholders for events Chase hasn't uploaded yet.** Let the doc stay short.

4. **If unsure whether data is from current message or memory → ASK first.**

5. **Before editing a file, `view` it fresh.** Don't rely on memory.

6. **After editing a file, verify with grep/view.** If the edit didn't land, check what went wrong before re-running.

7. **Profile bests come from `src/data/athletes.js`, not from asking Chase.** Always grep.

---

# 15. WORKING STYLE & TONE

**How Chase works:**
- Multiple browser tabs open, navigates fast
- Sends one event at a time for progression
- Expects concise acks between pastes
- Curses when frustrated — feedback, not abuse. Fix and move on, don't collapse.
- Doesn't repeat instructions nicely
- Trusts the process once set but reacts immediately when rules break

**Response style:**
- No preambles ("Great!", "Sure!", "Let me help with that")
- No over-apologizing — one sincere ack, then forward
- No meta-discussion unless asked
- Short replies: "Added. N swims, profile best X matches, no pending. Next?"
- Ask in one line when needed, not a paragraph

**Frustration signals:**
- "fuck" / "jesus" / "stop" → you're wrong, STOP and re-check
- "follow instructions" → go back and re-read rules
- "did you even look" → literally run view/grep
- Re-upload anger → STOP fabricating, check the actual file

---

# 16. CRITICAL CODE PATTERNS

## Athlete fixture structure

```javascript
{
  id: "ath_jon", first: "Jon", last: "Pomper", age: 12, dob: "June 4",
  gender: "M", pronouns: "he",
  showChampionshipCuts: true,
  events: ["100 Fly", "200 IM", "200 Fly", "200 Back", "200 Breast", "100 Back"],
  meetTimes: [
    { event: "50 Free SCY", time: "26.22" },
    // ...
  ],
  goalTimes: [
    { event: "50 Free SCY", time: "25.00" },
    // ...
  ]
}
```

**Event name format — LOCKED:** `"{distance} {short-stroke} {course}"`
- Short strokes: `Free`, `Fly`, `Back`, `Breast`, `IM`
- NOT `Butterfly`, `Backstroke` — those are UI display only
- 677+ lines of code key off these short names. **Do not rename.**

## getNoteType (FamilyNotes + AthleteProfile)

```javascript
function getNoteType(session) {
  if (session.data?.noteType) return session.data.noteType
  if (session.category === 'technique') return 'technique'
  if (session.category === 'meet_prep') return 'meetprep'
  if (session.category === 'workout') return 'workout'
  if (session.category === 'sprint') return 'sprint'
  return 'training'
}
```

## Filter chips (both profile views)

```javascript
[
  {key:'all', label:'All'},           // excludes workout AND sprint
  {key:'training', label:'Training'},
  {key:'meetprep', label:'Meet Prep'},
  {key:'technique', label:'Technique'},
  {key:'workout', label:'Workout'},
  {key:'sprint', label:'Sprint Lab'},
]
```

## DB access (src/lib/db.js)

```javascript
await loadAthletes()                    // merges fixture + DB
await loadAthleteSessions(athleteId)
await updateAthlete(athleteId, data)    // strips fixture-only fields, verifies round-trip
```

**Strip list in updateAthlete():** `mockSessions`, `upcomingMeets`, `pastMeets` (progression was removed in Step 6).

**Merge layer:** DB wins for user-editable (meetTimes, goalTimes, progression). Fixture falls back only when DB empty.

**Verify round-trip (Step 6):** reads back, compares counts. Throws on mismatch.

## Meet Results CRUD (AthleteProfile.jsx)

- `MeetResultsEditor` component — list + per-row Edit/Delete + "Add" button
- `MeetResultForm` component — shared add/edit form
- Event dropdown uses `CANONICAL_EVENTS` + `displayEventName()`
- Within event: fastest first (BEST tag), then newest date
- Changes → `onChange(next)` → parent's `editData.progression` → Save button → DB

---

# 17. OPENING MESSAGE FOR NEW CHAT

Paste this into your fresh chat:

> I'm Chase Kalisz. I'm continuing work on the Confluence Swim app. The previous chat hit a wall and I need to start fresh.
>
> Before responding to anything else, you MUST:
> 1. Read `/mnt/user-data/outputs/confluence-handoff-master.md` in full — this is your complete context
> 2. Run `ls /mnt/user-data/outputs/` to see all progression master docs
> 3. Read `/mnt/user-data/outputs/marley-progression-master.md` — in-progress doc
> 4. Confirm you've read all of it and tell me:
>    - Which workstream we're picking up
>    - The 3 most important rules from the handoff about fabricating data
>
> Do NOT write code, edit files, or respond substantively until steps 1-4 are done.

---

**END OF HANDOFF.**
