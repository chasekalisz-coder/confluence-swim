# TODO.md — Open Tasks

**Status key:** `[ ]` not started · `[~]` in progress · `[x]` done (move to PROGRESS.md)
**Priority:** `P0` urgent · `P1` next up · `P2` planned · `P3` nice-to-have

Newest tasks added at the top of each section. When completed, move the item to PROGRESS.md (under the current session's "What happened") and delete from here.

---

## P0 — URGENT / BLOCKING

None currently.

---

## P1 — NEXT UP

- [ ] **Site organization review — possible Analysis tab consolidation**
  Bigger conversation needed before changing anything. Current layout:
  Profile / Session Notes / Analysis / Meets / Resources. Some data on
  Profile (Times & Goals, Championship Standards, Event Power Rankings,
  Age-Up Preview, Progression chart) might belong on Analysis instead,
  letting Profile be a cleaner overview. No commits until Chase decides
  the new structure.

- [ ] **Feature tier system — Gold Development I/II/III access matrix**
  Decide who gets what. Top program = full access to everything. Lower
  tiers = a curated subset that still feels premium and creates a clear
  reason to upgrade.

  Open questions:
  - What features do all tiers get baseline?
  - What's gated to Gold Development I (top tier)?
  - How is gating expressed visually — locked sections with "upgrade
    to see" messaging, or just hidden?
  - Does Clerk metadata carry the tier (`{ "role": "family", "tier": "gd1", ... }`)?
  - How does an athlete's tier change in the system when their program changes?

  Connects to existing P2 task "Program type field (Gold Development
  tier dropdown)" — this is the bigger product decision behind that
  field.

- [ ] **Squarespace integration — central tab on main Confluence Sport site**
  Make the app discoverable from the main Squarespace site so families
  always know where to find it. Options: external link tab, subdomain
  (e.g. app.confluencesport.com), or embed. Needs a broader conversation
  with Chase about what each site's role is — main site for marketing/
  recruiting, app site for current families. Existing P2 task "Link site
  to main Squarespace site" is the placeholder for this.

- [ ] **Domain rename — drop vercel.app, pick a premium custom domain**
  `confluence-swim.vercel.app` doesn't feel premium and doesn't match
  Chase's coaching system. Options:
  - app.confluencesport.com (subdomain on existing site, no new domain)
  - confluenceswim.com (new domain, separate brand)
  - my.confluencesport.com (subdomain, suggests a private members area)
  - Other ideas TBD with Chase

  Needs Vercel custom domain config + DNS setup once chosen. Cheap
  ($10-15/yr if new domain), trivial to set up.

- [ ] **End-to-end profile audit — verify each athlete is ready for invite**
  Before sending real invites, walk every athlete profile and check:
  - All meet times current (cross-reference SwimCloud)
  - Events list correct
  - Goal times set where applicable
  - Championship standards displaying right tier
  - Upcoming meets populated
  - DOB/age/gender accurate
  - Program tier assigned (once tier system is built)
  - No placeholder copy or test data leaking through
  Athletes to audit: Jon, Lana, Ben, Grace, Hannah, Kaden, Marley, Liam,
  Farris, Mason, Pace, Jelena.

- [ ] **Auth — add SMS as a sign-in option alongside email**
  Right now sign-in is email + password only. Some parents (especially
  grandparents managing accounts) would prefer SMS code login. Clerk
  supports both at once: parent types either email or phone number,
  Clerk auto-detects which one and routes accordingly.

  Setup: Clerk dashboard → User & Authentication → Email, Phone,
  Username → enable Phone number alongside Email. Then enable SMS
  verification code under Authentication strategies.

  Decision when revisiting: keep email as the required identifier
  during invite (universal), make phone optional in onboarding so
  parents who want SMS can add it themselves. Hybrid setup gives
  flexibility without adding friction to the invite flow.

  Note: SMS costs money via Clerk's Twilio passthrough (pennies per
  message). At ~11 families it's negligible but worth knowing.

- [ ] **Race Pace Calculator companion — tempo, underwater kick, avg velocity, stroke count tool**
  Same A-finals dataset, different cuts of the data. Where Race Pace
  Calculator answers "what splits should I swim?", this tool answers
  "what does each length physically look like?" — stroke count per
  length, average tempo (turnover), underwater kick distance off each
  wall, average velocity. Scope and shape of the tool TBD. Could be a
  tab inside the existing pace.html, could be its own tool. Needs
  Chase to outline what data is available per event before build.

- [~] **Auth — finish making it production-ready**

  **Done (Session 13 cont'd):**
  - Clerk installed end-to-end. Main app + 6 standalone tool HTMLs all gated.
  - Admin login working for chasekalisz@yahoo.com.
  - Family scope routing wired (App.jsx routing tree, scoped athlete switcher).
  - Tool role gates working (5 admin-only, pace.html family-allowed).
  - "Account pending" screen for unconfigured family users.
  - URL guard: family typing another family's URL silently bounces.

  **Blocked / outstanding:**
  - **Clerk metadata persistence is broken on the dev instance.** Saving `{ "role": "admin" }` in the dashboard editor either doesn't persist, partially persists, or persists after multiple attempts. This MUST be resolved before inviting families. Options:
    1. Spin up a fresh Clerk app (sometimes dev instances get into a bad state — clean slate often clears it). Personal workspace → Create application → swap keys in Vercel.
    2. Upgrade to a Clerk production instance (separate API keys, separate user pool, different tier of metadata reliability).
    3. Build an in-app admin tool that calls Clerk's REST API directly to set `publicMetadata` for a user. Bypasses the dashboard editor entirely. Form: email + role + linkedAthletes → POST to Clerk. Probably the cleanest long-term.
  - **Pull the email allowlist hardcode** — `ADMIN_EMAILS = ['chasekalisz@yahoo.com']` lives in two places (`src/App.jsx` and `public/auth-guard.js`). Once metadata persistence is verified, delete those constants and the related `isAllowlistAdmin` branches. Keep the metadata path only.
  - **Pull the diagnostic console.log statements** — added in commit c255c6c (App.jsx) and commit 797a350 (auth-guard.js). Useful for tonight's debug, no value in production.
  - **Add Vercel env vars to Preview + Development.** Currently only set for Production. Branch deploys / preview deploys would fail at startup.
  - **Verify the Clerk user email is correct.** Was originally `chasekalisz@yahoo.com.com` (typo, double `.com`). Eventually appeared as `chasekalisz@yahoo.com` — confirm on the user record in Clerk dashboard.
  - **Family invite flow.** Once metadata works, build a small admin UI for inviting families: enter email + select linkedAthletes → Clerk sends invite + sets metadata atomically. Right now it'd be manual through the Clerk dashboard, which we've established is unreliable.

- [~] **Scheduling request flow — Resources page block**

  **Built (Session 13):**
  - Family-side: SchedulingBlock on Resources page renders the May 2026 calendar in compact dot-summary cells (date + colored dots for picked slots). Tap any day → drawer panel below with full slot rows.
  - Each slot has dual `[R]` (Request, gold) and `[A]` (Alternative, gray) buttons. Tap to set, tap same to clear, tap other to swap.
  - Day cells tint based on highest-priority pick (gold = has Request, gray = only Alternatives).
  - Running 'Your picks' list below calendar in chronological order with per-row clear button.
  - Persistent confirmation card replaces calendar after submit. Stays as the default view on every page load while a saved request exists. 'Add more requests' button reopens the calendar with existing picks pre-loaded.
  - Submit button at zero picks acts as 'Clear my request' when a saved request exists. handleReset confirms DB delete BEFORE clearing UI, with one retry on transient failure, and surfaces real failures via alert.
  - Copy: 'Mark the slots you'd like as Requests. If you have flexibility, mark a few additional times as Alternatives. Every effort goes into giving each family their full set of Requests — Alternatives only come into play if a Request needs to shift.'
  - Disclaimer: 'Once schedule requests are set, Chase will reach out to review all dates before sessions are confirmed.'
  - DB schema: `slot_requests` table (athlete_id, month, picks jsonb, note, submitted_at). One row per athlete per month, upsert-on-write. `deleteSlotRequest` endpoint added for the clear flow.

  **Coach-side admin (Session 13):**
  - SlotRequestsAdmin component with three views: Resolver (default, actionable), Combined (calendar overlay), Per Family (one at a time).
  - **Resolver:** every requested slot in a sortable list. Conflicts first (red bar, 2+ Requests on same slot), easy wins next (gold, single Request), Alts-only at bottom (gray). Each row shows family chips with Assign button. Right rail Family Progress scorecard with X/Y assigned-of-requested fractions and progress bars.
  - Auto-poll every 20 seconds + manual Refresh button + 'Updated Xs ago' indicator so coach sees family submissions land in near-realtime.
  - Diagnostic panel at the top: collapsible 'raw data' view listing every DB row with a Force delete button per athlete (red, with confirm). Emergency cleanup tool — useful while testing; pull when stable.
  - Print-friendly via `window.print()` for paper copy into Acuity.

  **Still to build (P1):**
  - Persist Resolver assignments to DB (new `slot_assignments` table). Currently in-memory only — refresh wipes them. Hold until Chase has used the resolver in one real scheduling cycle and confirms the workflow.
  - Family-side post-confirmation update: when coach confirms the schedule, surface the assigned slots back to the family on the confirmation card ('Confirmed: 8am Mon May 4', etc).
  - By-day Acuity export view: chronological list of all assignments across all families for entry into Acuity.
  - Per-family final schedule export: 'Smith family, here's your May schedule, please confirm.'
  - Admin UI terminology: still uses 'primary/backup' internally and in some admin labels. Migrate to 'Request/Alternative' for consistency with family side.

- [ ] **Meet Analyzer / Last Race section — decide direction (TOMORROW)**
  Currently a placeholder section on Athlete Performance Profile. Original
  vision was a race-by-race meet recap with splits, narrative, time drops,
  goal comparison. Stalled because:
  - Splits data not automatically imported
  - Coach narrative requires manual write-up per meet/athlete
  - Without splits, "analysis" is duplicate of Times & Goals data

  **Options to consider tomorrow:**
  1. Remove entirely
  2. Keep placeholder — revisit AFTER SwimCloud integration is done
     (SwimCloud has splits + meet-level data we could pull)
  3. Simplify to "Recent Meets" card — last 3 meets with date, location,
     events count, PR count. No deep analysis, just recap.

  Decision deferred — likely tied to SwimCloud rankings work since both
  benefit from same data pipeline.

- [ ] **SwimCloud rankings integration — Training section replacement (TOMORROW)**
  Replaces placeholder Training section on Athlete Performance Profile with
  per-event SwimCloud rankings (LSC, state, national).

  Approach: **Option C — Hybrid scraper with AI fallback.**
  - Daily Vercel Cron fetches each athlete's SwimCloud profile URL
  - Primary: Cheerio scraper parses HTML and extracts rankings to JSON
  - Fallback: if Cheerio returns empty/null, send page content to Claude
    (cheap text extraction, not vision) to extract same JSON
  - Cache result in new Neon table `athlete_rankings`
  - Display on athlete profile in new Rankings section

  **Steps:**
  1. New Neon table `athlete_rankings` (athlete_id, event, course, time,
     lsc_rank, state_rank, national_rank, fetched_at)
  2. Add `swimcloudUrl` field to athlete admin edit form
  3. Build Cheerio scraper for SwimCloud profile page
  4. Build Claude fallback extraction (HTML body → JSON via Anthropic API)
  5. Vercel Cron at 4am daily, loops all athletes with swimcloudUrl set
  6. Display section on profile (where Training currently is) showing
     rankings table per event
  7. Manual "Refresh now" button in admin

  **Risks accepted:**
  - SwimCloud ToS — low risk at 12 athletes, "ask forgiveness" territory
  - HTML changes — fallback handles it, manual selector fixes occasional
  - Vercel IP blocks possible — may need proxy if it happens

  **What I need from Chase to start:**
  - Jon's SwimCloud profile URL (e.g. swimcloud.com/swimmer/12345)
  - Confirmation of where on profile it goes (replacing Training section)

  Estimated build time: 2-3 hours focused.

- [ ] **Upcoming meets — admin entry field**
  Meets tab shows placeholder upcoming meets. Need a field in the admin
  athlete edit form where Chase can enter planned/upcoming meets for each
  athlete. Fields: meet name, date, location, events entered.
  Shows on family-facing Meets tab under Upcoming section.

- [ ] **Session Notes tab — session count fix**
  The session counter (sessions this month / total sessions) is currently
  counting ALL saved sessions including workouts generated by the workout
  builder. It should only count coaching sessions Chase runs with the
  athlete — not internally generated workout docs. Need to filter by
  noteType or add a flag to distinguish coached sessions from tool outputs.


- [ ] **Session counting — admin feature**
  Three numbers to track per athlete:
  1. Sessions in CURRENT program block (e.g. 4 of 10 in GD I)
  2. Total sessions all-time with Chase
  3. One master counter across all athletes (Chase's curiosity number)
  Admin can manually set/adjust these. Eventually AI-generated notes
  increment the count automatically (marked P2 — most historical
  sessions weren't done in the app).
  Show on admin athlete card. Families see their own session count
  on their profile (decide later how much detail to show them).

- [ ] **Scheduling / session request portal (URGENT — May slots)**
  Families submit session requests with: first choice slots + secondary
  slots that also work. Admin sees all requests in one view and can
  optimize fulfillment across all families (goal: max requests filled,
  not first-come-first-served).
  Phase 1: calendar/weekly view for families to submit requests.
  Phase 2: admin overview of all requests side by side.
  Phase 3: optimization logic (algorithm to suggest best schedule given
  all first + secondary requests — needs Chase to describe constraints).
  This replaces the Squarespace slot system that was getting monopolized
  by high-volume families.

- [ ] **Feature gating by program type**
  Once Clerk auth + program type field are in:
  Lower program tiers see basic profile (times, meets, basic notes).
  GD tier sees full feature set (progression chart, analysis, aerobic
  development, training notes, race pace calculator, meet analyzer).
  Seeing the locked features with an upsell prompt pushes families
  toward GD. Needs Clerk first.

- [ ] **Soften red zone color on performance profile**
  Current red is too harsh — athletes with beginner times see a screen
  full of red which reads as failure. Not a participation trophy fix —
  same data, more positive framing. Ideas: use amber/orange instead of
  red, or show improvement arrows rather than gap colors, or reframe
  the label from a deficit to a target ("4.2s to BB" not red).

---

## P2 — PLANNED

- [ ] **Progression chart visual improvements**
  Chart works and data is correct but needs visual polish.
  Mark for dedicated improvement pass — do not touch before families
  are sent the link.

- [ ] **Bloom chart modifications**
  Bloom works but needs adjustments (Chase to specify exact changes).
  Mark for dedicated pass after launch.

- [ ] **Resources tab — content**
  Articles currently show placeholder text. Low priority — Chase may
  send family links before this is finished. Leave as coming soon for now.


- [ ] **Race Pace Calculator — average line position fix**
  The horizontal average line through the split bars is not accurately placed.
  Visual bug only — the split times and percentages are correct.
  Low priority, fix post-launch.


- [ ] **Quality session tracking (fast 50s, max effort sets)**
  Similar to color paces but for quality/sprint work. Jon has a lot of
  fast 50 data and max-effort 100s Fly. Track pace and context (suited,
  practice, time of season) for these efforts. Basic build first, mark
  for improvement. If it looks massive, save for later.

- [ ] **AI-generated notes auto-increment session count**
  When a training note is saved, automatically increment the athlete's
  current-program session count and all-time count. Needs the session
  counting feature to be built first. Most historical sessions weren't
  done in-app so manual backfill will be needed — Chase to figure out
  those numbers and input manually. Mark as later priority.


- [ ] **Chase coach profile with live USA Swimming times (no API key)**
  Public results on usaswimming.org are scrapeable. Build a server-side
  proxy that fetches and caches times in Neon on a schedule. Show Chase
  a live-updating profile card parents can see. No official API needed.

- [ ] **Clerk auth — identity + role-based access**
  Three tiers: (1) Chase admin = full access, (2) Provider sub-admin =
  full access to their athletes only, (3) Family = their kid only.
  This is the main security unlock. Everything else (sub-admin, family
  gating) builds on top of Clerk roles.

- [ ] **Sub-admin for other providers**
  Once Clerk is in: provider coaches get their own login, see only their
  athletes, can do everything Chase can do for those athletes. Chase
  sees all providers and all athletes. Families see only their kid.

- [ ] **IMX score / custom Confluence metric**
  USA Swimming IMX = points across 6 events (50/100/200 Free, 100 Back,
  100 Breast, 100 Fly). Build our own version that weights events
  differently and incorporates training load data. Show it on athlete
  profiles as a season-over-season trend.

- [ ] **Sport vertical expansion plan (track + field, etc.)**
  Most of stack transfers: athlete profiles, session notes, progression
  chart, AI coaching notes. What needs swapping: event list, zone/pace
  system, cut standards. Estimated 2-3 weeks to port to a new sport.
  Not urgent — document the architecture decisions that make this easy.

- [ ] **Link site to main Squarespace site**
  Add confluence-swim.vercel.app as a tab or subdomain on the main
  Confluence Sport website. Squarespace supports custom code embeds
  and external link tabs. Simple config change, no code needed.


- [ ] **Aerobic development chart (pace vs HR count)**
  Scatter plot: x=HR count, y=pace, zone color bands (White/Pink/Red), opacity=season phase.
  Each dot = one rep from a saved training session. Down+left = adaptation.
  Distance filter (50/100/200/300/400). Hover tooltip shows session/distance/zone/pace/HR.
  Lives on athlete Analysis tab. Only meaningful once Jon has 10+ color sessions saved.
  Mockup built in Session 7 — needs wiring to real session data from Neon.

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

## FUTURE — Historical Note Reformat

Chase has handwritten session notes from before the app existed. Goal is to
feed them through the AI to reformat into standard Confluence note structure
so they appear uniformly in the athlete's profile timeline alongside new notes.

Requirements when building:
- Needs an input method (paste text or photo upload of old note)
- AI runs in "reformat" mode — not generating from scratch, reformatting existing
- Must save with flag: source: "historical_reformat" on the session record
- This flag ensures aerobic chart and other data charts EXCLUDE these sessions
  (old notes won't have HR counts, rep times etc in the right format)
- The note itself shows in Session Notes tab like any other note
- Date should reflect the ORIGINAL session date, not today
- This is a future build — do not start until Chase explicitly asks for it
