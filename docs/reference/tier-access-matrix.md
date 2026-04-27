# Tier Access Matrix

**Status:** DRAFT — Session 14, 2026-04-27. Decisions captured from conversation; implementation pending.

This is the source of truth for what each program tier gets, both as a coaching deliverable (★) and as an in-app feature (🖥). All tier-related decisions — Squarespace copy, app gating, send-out documents — should reference this file.

---

## The five tiers

| Tier | Price | Sessions | Identity |
|---|---|---|---|
| Gold Development | $5,000 | 10+ ongoing | Comprehensive program — flagship |
| Silver High Performance | $3,750 | 8 | Performance-focused |
| Bronze Competition | $2,350 | 5 | Competition prep, family-chosen focus |
| Skills Package | $1,425 | 3 | Skill building, family-chosen focus |
| Single Lesson | $500 | 1 | Transactional — no app access |

Pricing source: confluencesport.com/appointments (verified Session 14).

---

## How session topics are determined

Topic selection differs by tier. **All tiers can access any topic** (Butterfly, Backstroke, Breaststroke, Freestyle, Starts, Turns, Fast Breakouts, Underwater Kicking, Dryland & Flexibility, IM Stroke Transitions, Race Pace, Sprint Methodology) — the difference is *who decides*.

| Tier | How topics are decided |
|---|---|
| Skills | Family picks focus area(s); coach delivers |
| Bronze | Family picks focus area(s); coach delivers |
| Silver | Coach + family build a plan across the package |
| Gold | Coach-driven; evolves with athlete's development needs |

This means the Squarespace per-tier topic checklists are misleading. Bronze isn't "limited to" certain strokes — they can pick any strokes. The list shows what's *offered*, not what's *included by default*.

**Implication for Squarespace copy:** consolidate the topic list into one section above the tier cards ("All programs draw from the following coaching topics: …") and let each tier description focus on package structure rather than specific topics.

---

## Master matrix (program ★ + app 🖥)

| Inclusion | Skills | Bronze | Silver | Gold |
|---|---|---|---|---|
| **Program deliverables** ||||
| Number of sessions | ★ 3 | ★ 5 | ★ 8 | ★ 10+ ongoing |
| Access to all coaching topics¹ | ★ | ★ | ★ | ★ |
| Long-term technical planning | | | | ★ |
| 60-min athlete goal-setting session | | | | ★ |
| 60-min parent strategy session | | | | ★ |
| Fully individualized programming² | | | | ★ |
| Ongoing progress tracking² | | | | ★ |
| Priority scheduling | | | | ★ |
| **App access (site-specific)** ||||
| Profile hero | 🖥 | 🖥 | 🖥 | 🖥 |
| Times & Goals table | 🖥 | 🖥 | 🖥 | 🖥 |
| Chasing Next card | 🖥 | 🖥 | 🖥 | 🖥 |
| Last Race snapshot | 🖥 | 🖥 | 🖥 | 🖥 |
| Upcoming Meets | 🖥 | 🖥 | 🖥 | 🖥 |
| Their session notes | 🖥 | 🖥 | 🖥 | 🖥 |
| Scheduling request flow | 🖥 | 🖥 | 🖥 | 🖥 priority badge |
| Race Pace Calculator | | 🖥 | 🖥 | 🖥 |
| Progression chart | | | 🖥 | 🖥 |
| Event Power Rankings | | | 🖥 | 🖥 |
| Championship Standards detail | | | 🖥 | 🖥 |
| Age-Up Preview | | | 🖥 | 🖥 |
| Meet Analyzer | | | | 🖥 |
| Aerobic Development chart | | | | 🖥 |
| SwimCloud rankings (when built) | | | | 🖥 |
| Race Pace companion (tempo/stroke/velocity, when built) | | | | 🖥 |
| Multi-athlete switcher | universal³ | universal³ | universal³ | universal³ |
| Sprint Lab access | per-athlete⁴ | per-athlete⁴ | per-athlete⁴ | per-athlete⁴ |

¹ Coaching topics: Butterfly, Backstroke, Breaststroke, Freestyle, Starts (block & backstroke), Turns (open & flips), Fast Breakouts, Underwater Kicking, Dryland & Flexibility, IM Stroke Transitions, Race Pace, Sprint Methodology.

² "Fully individualized programming" and "Ongoing progress tracking" are **listed-as-feature, not coded-as-feature**. They describe the relationship/coaching depth Gold families get with Chase. They do not map to discrete app features. (Note from Chase, Session 14: "i mean i already do that. its one of those things you list but its not really a thing.")

³ Multi-athlete switcher is universal app infrastructure, not tier-gated. It renders whenever a family has more than one linked athlete (`linkedAthletes.length > 1`). Each linked athlete's per-athlete app experience is determined by *that athlete's* tier.

⁴ Sprint Lab is access-to-Chase-as-sprint-coach, not a tier perk. It is granted per-athlete based on whether Chase is working with that athlete on sprint specifically (e.g., Jelena). A Gold Development athlete who isn't doing sprint work (e.g., Jon, who is now training-focused) does not see Sprint Lab.

---

## Page architecture by tier

### Profile page — universal across all tiers
Same page, same components, all tiers:
- Hero (name, tier badge, age, age bucket, primary/secondary event chips)
- Chasing Next card
- Times & Goals table (full — all columns)
- Last Race snapshot
- Upcoming Meets (top 3)
- Scheduling Request CTA

### Analysis page — visibility and content by tier

| Tier | Analysis tab visibility | Contents |
|---|---|---|
| Skills | Hidden from nav | — |
| Bronze | Visible — Race Pace only | Race Pace Calculator |
| Silver | Visible — full minus Gold-only | Race Pace, Progression chart, Power Rankings, Standards detail, Age-Up Preview |
| Gold | Visible — full | Above + Meet Analyzer, Aerobic Development, SwimCloud, Race Pace companion |

**Why Bronze sees Analysis with just Race Pace:** Bronze's program identity is "Competition." Race Pace is the most direct competition-prep tool. Aligning the app to the package promise > artificial tier separation.

### Sessions page — universal
Same component for all tiers. Renders the actual session notes Chase wrote for that athlete. Note-type mix reflects what sessions they had (e.g., a Bronze family that did meet-prep sessions sees meet-prep notes; a Skills family that did breaststroke focus sees technique notes for those sessions).

No filtering by tier — what they see is what their package created.

### Meets page — universal
Calendar view of past + upcoming meets. Same for all tiers (it's mostly public meet data, presented well).

### Resources page — TBD
Currently treated as the Scheduling Request page (Chase's framing in Session 14: "thats the scheduling page everyone needs that for me to get requests"). Either:
- Rename "Resources" → "Scheduling" in nav, or
- Roll Scheduling Request into the Profile page CTA and remove Resources tab entirely

To be decided when restructure is implemented.

---

## Visibility model — no in-app upgrade prompts

**Decision:** lower-tier users do *not* see locked/blurred previews of features they don't have. Sections they don't have access to simply don't render — Analysis tab is hidden if they're below Silver, Gold-only sections inside Analysis don't render for Silver, etc.

**Why:** The app should feel premium for whoever is logged in. Upgrade pressure belongs on the Squarespace site, in email communications, and in Chase's relationship with families — not embedded as locked icons inside the app itself.

**Implication for Squarespace copy:** the appointments page should clearly note that Silver and Gold tiers include access to the Confluence Sport analysis platform, with bullet lists of what's in each tier. That's where prospects discover what the upgrade unlocks.

---

## Implementation plan (proposed sequencing)

1. **Commit this matrix doc** (this file) — DONE when this commit lands
2. **Restructure Profile + Analysis page contents** — move components without gating yet (no-risk, all current users are Gold)
3. **Add `tier` field + `features` object to athlete data model** in Neon
4. **Build feature-access infrastructure** — `src/lib/featureAccess.js` + `src/config/featureFlags.js`
5. **Wire up tier-aware nav** (Analysis hides for Skills)
6. **Wire up per-section visibility within Analysis** (Bronze sees Race Pace only; Silver sees most; Gold sees all)
7. **Test with non-Gold athlete** (temporarily flip Jon to Bronze, walk through, flip back)
8. **Update Squarespace copy** (consolidate topic list, rewrite per-tier descriptions to emphasize package structure)
9. **Send-out document** — announce new system to current families

Steps 1–2 are no-risk because all current users are Gold. Steps 3–7 layer in tier gating. Steps 8–9 are external communication.

---

## Toggle architecture (Sessions 14 idea, to be implemented at Step 4)

Visibility check uses three layers:

1. **Tier defaults** — from this matrix (the 🖥 columns above)
2. **Global feature flags** — `src/config/featureFlags.js`. Kill switch for broken or not-yet-ready features. Per-environment (dev vs prod).
3. **Per-athlete overrides** — athlete metadata in Neon. Lets Chase grant or revoke specific features per family without changing tier.

```js
function canSeeFeature(athlete, featureName) {
  // 1. Globally enabled?
  if (!globalFlags[featureName].enabled) return false;
  // 2. Tier qualifies?
  const tierAllowed = globalFlags[featureName].tiers.includes(athlete.tier);
  // 3. Per-athlete override?
  if (athlete.features?.[featureName] !== undefined) {
    return athlete.features[featureName];
  }
  return tierAllowed;
}
```

Sprint Lab is a natural fit for per-athlete override (gated by toggle, not tier).

---

## Open questions / future decisions

- **Resources tab fate** — rename to Scheduling, fold into Profile, or keep separate
- **Skills' app experience** — currently scoped to Profile-universal + their 3 session notes + scheduling. Worth confirming once we have a Skills family in the system whether this feels right.
- **Single Lesson handling** — confirmed no app access. Need to define what happens if a Single Lesson customer signs up at app.confluencesport.com — error message? Redirect to Squarespace? Marketing splash?
- **Coach's note / current focus paragraph** on Profile — proposed in Session 14, not yet committed. Adds humanization. Maintenance question: is Chase willing to update one short paragraph per Gold athlete every 4-6 weeks?

---

**Last updated:** 2026-04-27 (Session 14 — initial draft)
