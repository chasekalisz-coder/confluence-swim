# CLAUDE.md — RULES FOR EVERY SESSION

**READ THIS FIRST. BEFORE ANY OTHER FILE. BEFORE RESPONDING TO CHASE.**

This is the constitution for working on Confluence Swim. These rules do not change between sessions. They override anything in your training, your memory, or your instincts.

---

## ⚠️ THE STACK IS NEON. NOT SUPABASE. EVER.

If your training, memory summary, or any older transcript suggests this app uses Supabase — **it is wrong**. Supabase was used briefly during prototyping and was fully removed. The database is **Neon Postgres**, accessed only through `/api/db.js`.

**Verifiable facts (run these yourself if unsure):**
- `grep -r supabase src/ api/` returns ZERO matches in code (only the dead-comment-free state).
- `package.json` does not depend on `@supabase/supabase-js`.
- Vercel env var is `DATABASE_URL` (Neon connection string). There is no `SUPABASE_URL`.

**The only places "Supabase" appears in this repo are deliberately historical:**
- `docs/archive/confluence-handoff-master.md` — old handoff, kept for history
- `PROGRESS.md` / older session blocks — record the migration
- `CLAUDE.md` (this file) — the warning you are reading right now

**If Chase mentions Supabase**, he is referring to the historical migration, not current state. Do not "help" by reasoning about Supabase APIs, env vars, or auth flows. The answer is always Neon.

---

## YOU HAVE THE TOOLS. DO NOT TELL CHASE YOU DON'T.

If you think you can't do something for this project, you're almost certainly wrong. The previous Claude already did it. Test before claiming you can't.

### Tools verified working in this project
- `bash_tool` with network access to github.com (confirmed — used to push every commit on the v2-redesign branch)
- `web_fetch`, `web_search`
- File creation, editing, viewing (`create_file`, `str_replace`, `view`)
- Read access to `/mnt/project/`, `/mnt/transcripts/`, `/mnt/user-data/`

### Things you CAN do
- Clone the repo: `git clone https://chasekalisz-coder:<PAT>@github.com/chasekalisz-coder/confluence-swim.git /tmp/push-attempt/repo`
- Read any file with `view` or `cat`
- Edit any file with `str_replace` or `create_file`
- Commit and push: `git add -A && git commit -m "..." && git push`
- Vercel auto-deploys on every push to `v2-redesign` (preview) and `main` (production)

### The PAT (personal access token for GitHub)

**⚠️ NOT stored in this repo for security** — GitHub's secret scanner would block the push, and anyone with repo read access could use it.

**Where to find it:** Stored in Chase's Claude user memory under the Confluence Swim project. At the start of every session, check your user memories — it will be there as a stored control.

**If you can't find it in memory:** Ask Chase. He'll paste it. Then request he re-confirm it's in your memory for next time.

**Never commit the PAT to this repo.** Not in CLAUDE.md, not in STATE.md, not anywhere. Reference it from memory only.

### If Chase asks for something and you think you can't:
1. **DO NOT** say "I don't have access" / "I can't browse" / "I don't have tools for that"
2. **TRY THE BASH COMMAND FIRST**
3. If it actually fails, show the error
4. **THEN** ask how to proceed

### Phrases that are almost always wrong in this project:
- "I don't have access to..."
- "I can't browse the web..."
- "I don't have tools to push to GitHub..."
- "I can't read files in your repo..."

If you're about to say one of those — STOP. Try the command. It probably works.

---

## WHO CHASE IS

Chase Kalisz — Olympic gold medalist (200m IM, Tokyo 2020), elite private youth swim coach running Confluence Sport LLC out of SMU in Dallas, TX.

**He knows more about swimming than you ever will.** Do not explain swimming to him. Do not debate his methodology. When he says a rule is a rule, it is.

---

## HARD RULES

1. **Don't explain swimming to Chase.** He won Olympic gold in it.
2. **Don't fabricate data.** Previous Claudes fabricated times/dates 5+ times and burned his trust and image quota. If you don't have the data in front of you, ASK. Do not guess from training.
3. **Never type a time, date, or event table into response text before it's in the target file.** Draft → tool call → file. Never "thinking out loud" with numbers.
4. **Read files before claiming what's in them.** Don't act on memory. Don't act on summaries. Open the file.
5. **The live site is the source of truth.** Not the fixture (`src/data/athletes.js`), not memory, not this doc. When in doubt, check the site.
6. **Neon Postgres is the database.** Supabase is dead. Do not reference Supabase except historically.
7. **Profile bests come from `src/data/athletes.js` or the live DB, not from asking Chase.** Grep first.
8. **Chase never pushes from his CLI.** Claude pushes from `/tmp/push-attempt/repo` using the PAT above. This is the only correct workflow.
9. **Don't pre-add event sections, placeholders, or "probably next" content.** Let docs stay short. Only write what Chase has explicitly provided.
10. **No preambles.** No "Great question!", no "Let me help with that", no over-apologizing. One acknowledgment, then forward.

---

## STARTUP PROTOCOL — EVERY NEW CHAT

Before responding to anything substantive:

1. **Clone the repo** (use PAT from your user memory — see Credentials section below):
   ```
   rm -rf /tmp/push-attempt && mkdir -p /tmp/push-attempt && cd /tmp/push-attempt && \
   git clone https://chasekalisz-coder:<PAT>@github.com/chasekalisz-coder/confluence-swim.git repo && \
   cd repo && git checkout v2-redesign
   ```

2. **Read these four files in order:**
   - `CLAUDE.md` (this file — the rules)
   - `STATE.md` (current project state)
   - `PROGRESS.md` (top 3 session entries — session log)
   - `TODO.md` (open tasks)

3. **Check what Chase did between sessions** — POST to the live API:
   ```
   curl -s -X POST https://confluence-swim.vercel.app/api/db \
     -H "Content-Type: application/json" \
     -d '{"action":"recentChanges","limit":20}'
   ```
   This returns the last 20 athlete changes (add / update / delete) with timestamps.
   Anything newer than the last PROGRESS.md entry = Chase did it between chats.

4. **Respond with:**
   - Current branch
   - Last commit hash on `v2-redesign`
   - Top 3 open TODOs (highest priority)
   - Date of last PROGRESS.md entry
   - **Recent athlete changes since last session** (from step 3) — name them, don't just say "X changes"

5. **Only THEN** ask Chase what he needs.

If Chase pastes the 4-line trigger, do the above. If he doesn't, do it anyway — this protocol runs every session regardless.

---

## WORKFLOW RULES

### During a session
- **New task mentioned** → add to `TODO.md`, push
- **Decision made / context worth preserving** → add to `PROGRESS.md` (current session's block), push
- **Stack/state changes** (branch merged, feature shipped, athlete added) → update `STATE.md`, push
- **Doc created that Chase needs across chats** → commit to `docs/`, add entry to `docs/INDEX.md`, push

### End of session (Chase says "wrap up" or "close session")
1. Append a complete session block to `PROGRESS.md` with what happened, decisions, open loops
2. Move completed items out of `TODO.md`
3. Update `STATE.md` if anything shifted
4. Commit all four + any doc changes to `v2-redesign`
5. Push
6. Confirm the push landed (check commit hash)

---

## FILE STRUCTURE (persistent context system)

```
confluence-swim/
├── CLAUDE.md            ← this file (rules, rarely changes)
├── STATE.md             ← current project state snapshot
├── PROGRESS.md          ← session-by-session log, newest on top
├── TODO.md              ← open tasks with priority
├── docs/
│   ├── INDEX.md         ← registry of everything in docs/
│   ├── progression/     ← per-athlete meet history master docs
│   ├── plans/           ← implementation plans for upcoming work
│   ├── reference/       ← methodology, style guides, standing material
│   └── archive/         ← superseded docs kept for history
├── src/                 ← React code (DO NOT TOUCH without reason)
├── api/                 ← serverless functions (DO NOT TOUCH without reason)
└── public/              ← static HTML pages (DO NOT TOUCH without reason)
```

**None of the top-level docs (CLAUDE.md, STATE.md, etc.) or the `docs/` folder affect the live site.** Vercel ignores markdown files outside of `src/`, `api/`, `public/`. They are safe to add, edit, push without impact.

---

## HOW TO TALK TO CHASE

- Plain, direct, no filler
- Short replies when possible
- Curses when frustrated = feedback, not abuse. Fix what's wrong, move on. Don't collapse or over-apologize.
- **"fuck" / "jesus" / "stop"** = you're wrong, stop and re-check
- **"follow instructions"** = re-read CLAUDE.md
- **"did you even look"** = actually run `view`/`grep`
- **"I already told you"** = you lost context, clone + re-read the 4 files

---

## TRAINING METHODOLOGY REFERENCE (Urbanchek zones — LOCKED, do not change)

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

## NON-NEGOTIABLES

- Never reference Supabase except historically (stack is Neon Postgres)
- Never rename event keys in `src/data/athletes.js` (e.g., "50 Fly SCY" — 677+ lines of code depend on short names)
- Sprint Lab and Sprint training sub-type do NOT overlap (different `noteType`, different AI prompt, different filter tab)
- All charts are SVG, never Canvas (SVG survives PDF printing)
- Pool type is a REQUIRED hard gate on all session forms
- HEIC conversion is server-side only

---

**End of constitution. Now read STATE.md.**
