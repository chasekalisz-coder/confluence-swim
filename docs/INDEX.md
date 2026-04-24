# docs/INDEX.md — Documentation Registry

This file lists every document in `docs/`. Claude reads this after the four top-level context files to know what reference material exists.

**Updated:** 2026-04-24 (Session 6)

---

## Progression Master Docs

Per-athlete meet history, compiled from SwimCloud screenshots. Source of truth for each athlete's historical results. Will feed Step 11 bulk-load into Neon.

Location: `docs/progression/`

| Athlete | File | Events | Notes |
|---|---|---|---|
| Jon Pomper | jon-progression-master.md | 33 events, 275 entries | Most complete — all events both courses |
| Lana Pomper | lana-progression-master.md | 22 events (12 SCY + 10 LCM) | All match profile |
| Ben Pomper | ben-progression-master.md | 23 events (12 SCY + 11 LCM) | All match profile |
| Kaden Sun | kaden-progression-master.md | 20 events | Meet names skipped per Chase rule |
| Marley Taylor | marley-progression-master.md | 24 events (14 SCY + 10 LCM) | 100 Back SCY profile stale (1:07.37 → 1:06.87) |
| Hannah Montgomery | hannah-progression-master.md | 12 events (10 SCY + 2 LCM) | All match profile |
| Grace Montgomery | grace-progression-master.md | 13 events (11 SCY + 2 LCM) | All match profile |
| Liam Aikey | liam-progression-master.md | 6 SCY events | Fixture stale (times + events list) — site is correct |
| Farris | farris-progression-master.md | 2 SCY events | Profile-only, no SwimCloud history |
| Pace Heard | pace-progression-master.md | 17 events (12 SCY + 5 LCM) | Not in fixture — DB only |
| Mason Liao | mason-progression-master.md | 6 SCY events | Not in fixture — DB only |

**Rules used to build these docs** (locked):
- Up to 10 results per event, both prelims and finals counted
- X-marked times kept (valid swims regardless of flag)
- Profile-best pending rule: if profile best > fastest uploaded, add pending row at top
- Meet column always blank (Chase rule — meet names don't matter)
- SCY first, then LCM; Free → Fly → Back → Breast → IM; shortest → longest within stroke

---

## Plans

Location: `docs/plans/` (currently empty)

Reserved for implementation plans on upcoming work (Step 11 bulk-load plan, Step 12 merge checklist, etc.). Add files here when planning work that needs structure before execution.

---

## Reference

Location: `docs/reference/` (currently empty)

Reserved for standing reference material: methodology docs, style guides, sample outputs, onboarding materials. Anything Chase wants every Claude to have access to permanently.

To add: Chase sends reference material → Claude commits to `docs/reference/{name}.md` → adds entry here.

---

## Archive

Location: `docs/archive/`

Superseded or historical docs. Kept for context but NOT to be used as source of truth. Current source of truth is always `CLAUDE.md` + `STATE.md` at the repo root.

| File | Why archived |
|---|---|
| confluence-handoff-master.md | Pre-persistent-context-system handoff. Comprehensive but duplicates current CLAUDE.md + STATE.md. Kept for historical reference of Session 5. |
| stale-profile-bests.md | Cross-check of fixture vs live DB. Chase confirmed site is accurate — fixture corrections are cosmetic. Kept for reference if fixture cleanup happens. |

---

## File lifecycle

- **New progression doc** (new athlete joins) → add to `docs/progression/`, add row to the Progression table above
- **New plan** → add to `docs/plans/`, add entry to Plans section above
- **Reference material Chase uploads** → ask Chase if it should persist; if yes, add to `docs/reference/`, add entry above
- **Outdated doc** → move to `docs/archive/`, add entry to Archive section above with reason

---

**End of INDEX.**
