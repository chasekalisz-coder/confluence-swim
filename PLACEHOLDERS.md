# PLACEHOLDERS — Data To Replace Before Production

Every piece of filler data in the codebase must be tracked here so nothing gets
forgotten. When real data comes in, find the entry below, replace the values in
the listed file, and delete the entry from this file. When this file is empty,
all placeholder data has been cleared.

---

## 🔴 HIGH PRIORITY — Affects Displayed Numbers

### 1. USA Swimming Motivational Time Standards — STARTER VALUES ONLY
- **File:** `src/lib/standards.js`
- **What it is:** Starter dataset covering 11-12 and 13-14 boys & girls SCY.
- **Why it's a placeholder:** Values were drafted against the rough shape of the
  real standards, not the official USA Swimming numbers.
- **What to do:** Replace every age group / course / event with the real
  USA Swimming standards (current age-group time standards document).
- **Needed:** All age groups (8-under, 9-10, 11-12, 13-14, 15-16, 17-18),
  both courses (SCY + LCM), both genders.
- **Affects:** Profile page → Chasing Next, Times & Goals, Age-Up Preview,
  Event Power Rankings, Specialty Radar. Analysis page → Latest Insight.

### 2. Championship Standards (Futures / Sectionals / Jr Nats / Nationals)
- **File:** `src/lib/championship-standards.js`
- **What it is:** Four tiers of national-level domestic standards.
- **Why it's a placeholder:** Values were synthesized from general knowledge of
  relative difficulty, not the real published cuts.
- **What to do:** Replace with actual cuts from:
  - Speedo Sectionals Southern Zone standards
  - USA Swimming Futures qualification standards
  - USA Swimming Junior Nationals standards
  - USA Swimming National Championships / US Open standards
- **Needed:** All 4 tiers × M/F × SCY/LCM × all events.
- **Affects:** Profile page → Championship Standards table (only visible when
  `athlete.showChampionshipCuts === true`).

### 3. TX TAGs Standards
- **File:** `src/lib/championship-standards.js` (constant `TX_TAGS`)
- **What it is:** Texas Age Group State Championship cuts by age group.
- **Why it's a placeholder:** Values are rough ballparks of age-group TX TAGs cuts.
- **What to do:** Replace with actual TX TAGs cuts for the current
  meet cycle.
- **Needed:** All age buckets (11-12, 13-14, 15-16, 17-18) × M/F × SCY/LCM
  × all events.
- **Affects:** Profile page → TX TAGs column in main Times & Goals table.

---

## 🟡 MEDIUM PRIORITY — Affects Display But Not Numbers

_(Nothing here yet. Will populate when Commit 3 adds mock meet data,
placeholder session notes for empty category tabs, progression chart
back-dated times, and Resources article drafts.)_

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

## How to use this file
- Every PR that adds placeholder data MUST add an entry here.
- Every PR that replaces placeholder data with real data MUST delete the entry.
- Target state: this file eventually contains only the "How to use" section.
