# Family Login Credentials — Internal Reference

**Purpose:** quick-reference for setting up and resetting Clerk accounts for each family.
**Use:** Chase's eyes only. These are the temp passwords given on first invite — families should change theirs after first login.

**Updated:** 2026-04-27 (Session 14 — initial setup)

---

## Multi-athlete families

| Family | Athletes | Login email | Temp password | Clerk metadata |
|---|---|---|---|---|
| Pomper | Jon, Lana, Ben | (real parent email) | `Pomper2026!` | `{ "role": "family", "linkedAthletes": ["ath_jon", "ath_lana", "ath_ben"] }` |
| Montgomery | Grace, Hannah | (real parent email) | `Monty2026!` | `{ "role": "family", "linkedAthletes": ["ath_grace", "ath_hannah"] }` |

## Single-athlete families

| Family | Athlete | Login email | Temp password | Clerk metadata |
|---|---|---|---|---|
| Sun | Kaden | (real parent email) | `Sun2026!` | `{ "role": "family", "linkedAthletes": ["ath_kaden"] }` |
| Taylor | Marley | (real parent email) | `Taylor2026!` | `{ "role": "family", "linkedAthletes": ["ath_marley"] }` |
| Aikey | Liam | (real parent email) | `Aikey2026!` | `{ "role": "family", "linkedAthletes": ["ath_liam"] }` |
| Abu Shahin | Farris | (real parent email) | `Farris2026!` | `{ "role": "family", "linkedAthletes": ["ath_farris"] }` |
| Liao | Mason | (real parent email) | `Liao2026!` | `{ "role": "family", "linkedAthletes": ["ath_mason"] }` |
| Heard | Pace | (real parent email) | `Pace2026!` | `{ "role": "family", "linkedAthletes": ["ath_pace"] }` |
| Kunovac | Jelena | (real parent email) | `Jelena2026!` | `{ "role": "family", "linkedAthletes": ["ath_jelena"] }` |

---

## Test accounts (Session 14 — testing the family flow)

These use Gmail aliases on Chase's `chasekalisz@gmail.com` inbox. All verification mail lands in that inbox. Delete from Clerk after testing is done.

| Test family | Aliased email | Temp password | Notes |
|---|---|---|---|
| Pomper test | `chasekalisz+pompertest@gmail.com` | `Pomper2026!` | Tests 3-athlete switcher flow |
| Montgomery test | `chasekalisz+montytest@gmail.com` | `Monty2026!` | Tests 2-athlete switcher flow |

---

## Notes

- Athlete IDs come from `src/data/athletes.js` and the live DB. Verified correct as of 2026-04-26.
- Temp password format: `{LastName}2026!` — meets Clerk's 8-char minimum, has uppercase, number, and special char.
- For families like Abu Shahin where the last name is two words, the password uses just the swimmer's last word (`Farris2026!`) for simplicity — subject to change if Chase wants different.
- Jelena Kunovac is a sprint-only athlete (Sprint Lab user) — her account follows the same family-role pattern even though she's an adult, since the access-control model is identical.
- When a family is invited for real:
  1. Replace the placeholder `(real parent email)` above with the actual email used
  2. Update the password if it was changed during onboarding
  3. Note any custom metadata changes (e.g., extra athlete added later)

---

**Do NOT commit real parent emails to this file unless Chase explicitly approves.** Family contact info belongs in the DB, not version control.
