# STALE PROFILE BESTS — Fixture Corrections Needed

**Purpose:** Running list of athletes + events where the SwimCloud-verified fastest time is faster than the profile best currently in `src/data/athletes.js`. These need to be updated in the fixture during Step 11 bulk-load (or as a standalone fixture correction pass).

**Format:** `{athlete}` — `{event}`: fixture has `{old}`, real best is `{new}` (date)

---

## Previously known (from handoff)

Resolved — fixture already updated (verified on profiles 2026-04-24).
- ~~Jon Pomper — 50 Breast LCM: 44.33 → 42.00~~ ✓ correct on profile
- ~~Marley Taylor — 100 Back SCY: 1:07.37 → 1:06.87~~ ✓ correct on profile

---

## Discovered 2026-04-24 (Lana Pomper session)

Resolved — fixture has been updated to current SCY bests (verified on Lana's profile 2026-04-24 4:56 PM).


## Discovered 2026-04-24 (Ben Pomper session)

No stale entries — Ben's profile bests all matched. Pending entries (50 Breast SCY 44.80 and 50 Breast LCM 51.41) need dates from Chase but profile bests are correct.

## Discovered 2026-04-24 (Liam Aikey session)

- **Liam Aikey** — 50 Free SCY: fixture 45.73 → real 42.60 (2025-10-24)
- **Liam Aikey** — 50 Breast SCY: fixture 53.63 → real 51.63 (2026-01-16)
- **Liam Aikey** — 50 Fly SCY: fixture 1:26.41 → real 1:00.02 (2025-10-24)
- **Liam Aikey** — events list needs expansion: fixture has 3 events, profile shows 6 (add 100 Free, 50 Back, 100 Breast)

## Discovered 2026-04-24 (Farris session)

- **Farris** — meetTimes empty in fixture; profile has 100 Free 1:55.96 and 50 Fly 1:11.83 (add to fixture)
- **Farris** — events list mismatch: fixture has 50 Free/50 Fly/50 Back/50 Breast/100 IM, profile only shows 100 Free + 50 Fly

## Discovered 2026-04-24 (Mason Liao session)

- **Mason Liao** — not in fixture. Add as `ath_mason`, age 9. Events: 50 Free, 100 Free, 50 Fly, 50 Back, 50 Breast, 100 IM. Profile bests: 50 Free 41.53, 100 Free 1:57.38, 50 Fly 55.90, 50 Back 42.49, 50 Breast 50.93, 100 IM 1:59.11.
