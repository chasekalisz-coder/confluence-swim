# DATA_SCHEMA.md — Confluence Swim
## The contract. Read this before touching any data.

This document defines every data type in the system:
- Where it lives
- What creates it
- What reads from it
- Exact field names and shapes

**Rule: define the schema here BEFORE writing any code that stores or reads data.**
If a field isn't in this document, it doesn't exist officially.
If you're a new Claude session — read this entire file before doing anything.

---

## Database — Neon Postgres

Three tables. Everything lives here. No other source of truth.

---

### Table: `athletes`

One row per athlete.

**Created by:** Admin edit form → `updateAthlete()` → `/api/db {action: updateAthlete}`
**Read by:** `loadAthletes()` in `src/lib/db.js` → entire React app

**Row shape:**
```
id        text PRIMARY KEY    — e.g. "ath_jon", "ath_mason"
data      jsonb               — full athlete object (see below)
created_at  timestamptz
updated_at  timestamptz
```

**`data` object shape:**
```js
{
  id:                   string,   // same as row id — "ath_jon"
  first:                string,   // "Jon"
  last:                 string,   // "Pomper"
  age:                  number,   // 12
  dob:                  string,   // "June 13"
  gender:               "M" | "F" | null,
  pronouns:             string,   // "he" | "she" | ""
  showChampionshipCuts: boolean,  // default true
  events:               string[], // ["100 Fly", "200 IM", "200 Fly"]
  meetTimes:            MeetTime[],
  goalTimes:            MeetTime[],
  progression:          ProgressionEntry[],
  upcomingMeets:        any[],    // future feature
  pastMeets:            any[],    // future feature
  mockSessions:         any[],    // legacy — empty for all athletes
}
```

**MeetTime shape:**
```js
{ event: "50 Free SCY", time: "26.22" }
// event ALWAYS includes course suffix: "SCY" or "LCM"
// time is a string in M:SS.ss or SS.ss format
// empty time is "" (empty string) not null
```

**ProgressionEntry shape:**
```js
{
  event:  string,  // "100 Fly SCY"
  time:   string,  // "1:03.45"
  date:   string,  // "2024-01-15" (YYYY-MM-DD) or "Jan 2024"
  meet:   string,  // "TAGs Championships 2024"
}
```

**IMPORTANT — load path:**
ALL athletes load from DB only via `loadAthletes()`.
The fixture file `src/data/athletes.js` is ONLY used as a one-time seed
if the DB is completely empty. It is NEVER merged with live data.
Do not re-introduce fixture merging under any circumstances.

---

### Table: `sessions`

One row per saved coaching note.

**Created by:**
- `test-ai.html` (training notes) → `/api/generate-training-note` → `/api/save-session`
- `public/meetprep.html` → `/api/generate-meetprep-note` → `/api/save-session`
- `public/sprint.html` → `/api/generate-sprint-note` → `/api/save-session`
- `public/technique.html` → `/api/generate-technique-note` → `/api/save-session`
- `public/workout.html` → `/api/generate-workout-doc` → `/api/save-session`

**Read by:**
- `FamilyNotes.jsx` — Session Notes tab (family-facing)
- `SessionViewer.jsx` — individual note view
- `buildAthleteContext()` in `api/lib/athlete-context.js` — AI context for next note
- `FamilyAnalysis.jsx` — Aerobic Development chart (aerobic + threshold sessions only)

**Row shape:**
```
id          text PRIMARY KEY    — "sess_" + timestamp + random
athlete_id  text NOT NULL       — references athletes.id
date        text                — "2026-04-18" (YYYY-MM-DD)
category    text                — see valid values below
data        jsonb               — full session object (see below)
created_at  timestamptz
```

**Valid category values:**
`aerobic` | `threshold` | `active_rest` | `recovery` | `quality` | `power`
| `meet_prep` | `workout` | `technique` | `sprint`

**`data` object shape (schemaVersion: 2):**
```js
{
  schemaVersion:    2,           // increment when shape changes
  noteType:         "training" | "meet_prep" | "technique" | "workout" | "sprint",
  poolType:         "SCY" | "LCM",  // REQUIRED — hard validated on save
  stroke:           string | null,
  sessionNumber:    number | null,
  durationMinutes:  number | null,
  coachIntent:      string | null,
  coachObservation: string | null,
  mainSet:          MainSet | null,
  hiLo:             HiLo | null,
  note:             NoteObject,   // the actual coaching note text
  charts:           string[],     // chart type names to render
  warnings:         string[],     // schema warnings + AI warnings
  summary:          string,       // one-line summary for AI context (max 140 chars)
  rawModelOutput:   string | null,
  correctedData:    any | null,
  wasRegenerated:   boolean,
  model:            string | null,
  videoReferences:  any[],
}
```

**MainSet shape:**
```js
{
  name:     string,        // "6x200 (100 Fly / 100 ez) — Descend 1-3, Hold 4-6"
  zone:     string | null, // "white" | "pink" | "red" | "blue" | "purple"
  interval: string | null, // "2:30"
  reps:     Rep[],
}
```

**Rep shape — ENFORCED on save (schemaVersion 2):**
```js
{
  rep:      number,        // 1, 2, 3...
  distance: string | null, // "200" — string because AI returns it that way
  time:     string | null, // "1:23.8" — string in M:SS.s or SS.s format
  hr:       number | null, // 10-second pulse count e.g. 25 — REQUIRED for aerobic/threshold
  zone:     string | null, // inherits from mainSet.zone if not on individual rep
  splits:   any[],         // internal splits array, often empty
}
```

**HiLo shape:**
```js
{
  hi:   number,  // high pulse count
  lo:   number,  // low pulse count (taken after recovery)
  drop: number,  // hi - lo
}
```

**Schema enforcement:**
`api/save-session.js` normalizes every rep to the canonical shape on write.
Missing `hr` → null + warning added to `warnings[]`.
Missing `time` → null + warning added.
`zone` defaults to `mainSet.zone` if not on the rep.
Saves are NEVER blocked for missing rep data — the note is more important.
But warnings are always returned in the response so the prompt can be improved.

---

### Table: `change_log`

Audit trail. Every athlete update writes a row here.

**Not read by any feature** — admin diagnostic only.

```
id          bigserial PRIMARY KEY
entity_type text      — "athlete" | "session"
entity_id   text      — the athlete or session id
action      text      — "edit" | "delete" | "import"
summary     text
created_at  timestamptz
```

---

## Static data files

### `src/data/elite-splits.js`

Elite split percentage data. Source: 50+ NCAA and World Championship finals.

**Exports:** `ELITE_SPLITS`, `RACE_INSIGHTS`, `DANGER_SPLITS`

**Used by:**
- `public/pace.html` — Race Pace Calculator (currently imports inline copy)
- AI training prompt — pacing context for coaching notes (to be wired)
- Meet Analyzer — when built

**Shape:**
```js
ELITE_SPLITS[course][gender][event] = {
  _25s:  number[],  // percentages for 50s events (2 values)
  _50s:  number[],  // per-50 percentages
  _100s: number[],  // per-100 percentages
  _200s: number[],  // per-200 percentages
  _500s: number[],  // per-500 percentages (distance events)
}
// All percentages in an array sum to 100.
// course: "scy" | "lcm" | "scm"
// gender: "men" | "women"
```

### `src/data/athletes.js`

**Seed only.** Contains hardcoded athlete data used ONLY to populate the DB
on first load if it is empty. Never used as a merge source for live data.

**Exports:** `ATHLETES`, `normalizeAthlete`, `makeBlankAthlete`, `fullName`, `initials`

`normalizeAthlete(record)` — takes any athlete-shaped object, fills missing
fields with safe defaults. Used on every athlete loaded from DB.

`makeBlankAthlete(opts)` — creates a blank athlete with all required fields.
Used when adding a new athlete through the admin portal.

### `src/lib/standards.js`

USA Swimming 2024-2028 Motivational Time Standards.
Coverage: 10U, 11-12, 13-14, 15-16, 17-18 age groups × 2 genders × SCY/LCM.
Levels: B, BB, A, AA, AAA, AAAA.

**Used by:** `FamilyProfile.jsx` (cuts table, bloom chart, age-up preview,
event power rankings), `pickNextCut()`, `eventStandards()`.

### `src/lib/championship-standards.js`

Championship qualifying standards — Futures, Sectionals, Jr Nats, Nationals.

**Used by:** `FamilyProfile.jsx` (championship cuts table).

### `src/lib/canonicalEvents.js`

The 35 canonical event names every athlete's meetTimes/goalTimes array
must contain. Used by the admin edit form to ensure consistent event key format.

**Critical:** Event keys ALWAYS include course suffix: `"50 Free SCY"` not `"50 Free"`.
The performance profile does all lookups with `"${event} ${course}"` format.

---

## AI context pipeline

### `api/lib/athlete-context.js` — `buildAthleteContext(athleteId, poolType)`

Builds the context object passed to the AI before generating any note.

**Reads from:**
- `athletes` table: meetTimes (filtered by poolType), goalTimes (filtered by poolType),
  age, events, pronouns
- `sessions` table: last 30 sessions for this athlete, filtered to matching poolType
  and noteType === 'training'. Sliced to 8 for AI context.

**Does NOT read:**
- Any other athlete's data (hard WHERE clause: `WHERE athlete_id = ${athleteId}`)
- The opposite pool type (hard filter)
- Technique sessions (filtered out by noteType)
- Full note text of previous sessions (summaries only)
- Progression history (gap — future improvement: add this)

**Returns:**
```js
{
  id, firstName, lastName, age, pronouns,
  events,       // primary events array
  bestTimes,    // filtered by poolType
  goalTimes,    // filtered by poolType
  recentSessions, // last 8 training sessions, summaries only
}
```

### AI isolation walls (non-negotiable, enforced at DB query level):

1. **Athlete isolation:** `WHERE athlete_id = ${athleteId}` on every session query.
   Cannot be bypassed through the UI. One API call = one athlete only.

2. **Pool type isolation:** poolType is required on every note generation.
   The UI enforces selection before the API call is made.
   SCY and LCM data are completely separate — never mixed in context.

3. **Training/technique separation:** Technique sessions are excluded from
   training note context. Separate pipelines, separate prompts.

4. **No invented data:** The prompt explicitly prohibits fabricating times,
   HR counts, or any numeric value not present in the photo.

5. **No cross-athlete comparison:** The prompt explicitly prohibits comparing
   the athlete to any named individual. Elite pacing patterns are allowed
   as curriculum (not comparison).

---

## Chart routing — which session type feeds which chart

| Chart | Session filter | Data fields used |
|---|---|---|
| Aerobic development (pace vs HR) | category: aerobic OR threshold | mainSet.reps[].hr, .time, .distance, mainSet.zone |
| Color paces (avg per zone) | category: aerobic OR threshold | mainSet.reps[].time, mainSet.zone |
| Quality/sprint tracking | category: quality OR power | mainSet.reps[].time, .distance |
| Session Notes feed | all categories | data.note, data.summary, date, category |
| Progression chart | athlete.progression[] | event, time, date, meet |

**The routing rule:** session `category` is the label that determines which
chart reads from which sessions. This is intentional and must be preserved.
Never save a session without a category.

---

## What doesn't exist yet (future features — define schema here before building)

- **Meet results entry:** A UI to manually add official meet results to
  `athlete.progression[]`. Will NOT auto-populate from session notes.
  Practice reps and meet results are different data types.

- **Scheduling:** A `schedule_requests` table.
  Shape: `{ id, athlete_id, month, firstChoice: string[], alternates: string[], created_at }`

- **Program type:** A `programType` field on the athlete record.
  Values: "Gold Development I" | "Gold Development II" | etc.
  Add to `athletes.data` object. Update `makeBlankAthlete()` when added.

- **Session counting:** `sessionCount` (current program) and `totalSessions`
  (all-time) fields on athlete record. Manual admin entry initially.

- **Historical note reformat:** A "reformat" mode in the training note tool
  that takes unstructured old notes as input and outputs the standard note schema.
  Must save with `source: "historical_reformat"` flag so charts exclude them.

---

## Rules for adding new features

1. Define the data shape in this file first.
2. Add the DB table or field.
3. Update `makeBlankAthlete()` if adding an athlete field.
4. Build the input form.
5. Build the display.
6. Update the chart routing table above if the feature feeds a chart.

No exceptions. If a field isn't defined here, it doesn't have an official home.
