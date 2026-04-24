# PLACEHOLDERS — Data To Replace Before Production

Every piece of filler data in the codebase must be tracked here so nothing gets
forgotten. When real data comes in, find the entry below, replace the values in
the listed file, and delete the entry from this file. When this file is empty,
all placeholder data has been cleared.

---

## 🟡 MEDIUM PRIORITY — Affects Display But Not Numbers

### 1. Jon's Mock Upcoming Meets
- **File:** `src/data/athletes.js` → `ath_jon.upcomingMeets`
- **What it is:** 3 fake upcoming meets (North Texas Sectionals May 2026,
  Speedo Summer Invitational June 2026, TAGs Long Course July 2026) with
  event entries and seed times.
- **Why it's a placeholder:** So the Meets page has content during
  walkthrough. No real athlete meet schedule has been entered yet.
- **What to do:** Replace with real schedule. Delete the entire
  `upcomingMeets` array if Jon has none scheduled.

### 2. Jon's Mock Past Meets
- **File:** `src/data/athletes.js` → `ath_jon.pastMeets`
- **What it is:** 4 fake past meets from Oct 2025 through March 2026
  with fabricated results (times, deltas, standards, places, PB flags).
- **Why it's a placeholder:** So the Past tab on the Meets page has
  content during walkthrough.
- **What to do:** Replace with real meet history. Delete the
  `pastMeets` array if pulling from a different source.

### 3. Jon's Mock Progression Data
- **File:** `src/data/athletes.js` → `ath_jon.progression`
- **What it is:** 21 fake meet-result tuples (3 events × 7 dates each)
  showing fabricated steady improvement over 16 months.
- **Why it's a placeholder:** So the Progression chart on Profile page
  has drawable data during walkthrough.
- **What to do:** Replace with real meet-by-meet times derived from
  actual past meet results. Ideally this is auto-computed from
  `pastMeets` once real past meets are in — the mock array is a
  stopgap until that pipeline is built.

### 4. Jon's Mock Session Notes
- **File:** `src/data/athletes.js` → `ath_jon.mockSessions`
- **What it is:** 8 fake sessions covering every category
  (aerobic, threshold, quality, sprint, power, active_rest, technique,
  meetprep) so every filter chip on Session Notes has content.
- **Why it's a placeholder:** So the Session Notes page isn't all empty
  states during walkthrough. Real DB sessions always take precedence;
  mocks only appear alongside real sessions.
- **What to do:** Delete the `mockSessions` array once real session data
  from Neon is reliably flowing in.

### 5. Resources Article Bodies
- **File:** `src/components/FamilyResources.jsx` → `RESOURCES[*].body`
- **What it is:** Placeholder article prose for Training Zones, Coaching
  Philosophy, Meet Day Checklist, Glossary (mostly complete), plus
  short "coming soon" stubs for Nutrition, Equipment, USA Swimming
  Standards, and FAQ.
- **Why it's a placeholder:** First draft written in coaching voice as
  a starting point for Chase to rewrite or approve. Not Chase's own
  words until he signs off.
- **What to do:** Chase reviews each article body and either edits,
  rewrites, or approves. Then the placeholder flag comes off.

### 6. Meet Analyzer Tool Preview
- **File:** `src/components/FamilyAnalysis.jsx` → `MeetAnalyzerTool`
- **What it is:** Static input form showing the shape of the eventual
  tool. All inputs disabled. Banner reads "Coming Soon."
- **Why it's a placeholder:** Engine + comparison math not built yet.
  Form shape is locked so families can see what's coming.
- **What to do:** Wire up event data flow, comparison against elite
  template, and visualization. Remove the banner.

### 7. Race Pace Calculator Tool Preview
- **File:** `src/components/FamilyAnalysis.jsx` → `RacePaceTool`
- **What it is:** Static input form with event / course / goal time
  fields. Inputs disabled. Banner reads "Coming Soon."
- **Why it's a placeholder:** Pace engine with elite-template splits
  not built yet.
- **What to do:** Build the calculation engine. Pre-populate goal
  time from athlete profile. Output the split plan.

---

## 🟢 LOW PRIORITY — Internal Flags

### Jon's Championship Standards toggle
- **File:** `src/data/athletes.js` → `ath_jon`
- **What it is:** `showChampionshipCuts: true` manually set so the section
  renders for walkthrough testing.
- **Why it's a placeholder:** The actual toggle should be set by admin edit UI
  once that's built. For now it's hardcoded.
- **What to do:** When admin edit UI ships, verify the toggle behavior works
  through the UI and remove this note.

---

## RESOLVED (archived for audit trail)

The following placeholder entries were resolved by commits in the 6a–6e series
that landed real 2026 standards data from official USA Swimming + TSA PDFs:

- ✅ **USA Swimming Motivational Time Standards** — all 5 age groups × 2 genders
  × 2 courses × 6 tiers now populated in `src/lib/standards.js` from the
  official 2024-2028 PDF. (commit 6b)
- ✅ **Championship Standards (Futures / Sectionals / Jr Nats / Nationals)** —
  all 4 senior-tier cuts now populated in `src/lib/championship-standards.js`
  from the 2026 USA Swimming PDFs. (commit 6c)
- ✅ **TX TAGS Standards** — real 2026 TAGS qualifying times for 10U / 11-12 /
  13-14 now in `TX_TAGS`. 15-16 and 17-18 entries removed (TAGS is a 14 & Under
  meet). (commit 6d)

---

## How to use this file
- Every PR that adds placeholder data MUST add an entry here.
- Every PR that replaces placeholder data with real data MUST delete the entry.
- Target state: this file eventually contains only the "How to use" section.
