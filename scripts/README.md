# scripts/

One-off scripts for Confluence Swim. Not part of the deployed app.

## progression bulk-load (Step 11)

Three scripts. Run in order.

### 1. Parse the markdown docs

```
node scripts/parse-progression.mjs
```

Reads every `docs/progression/*-progression-master.md` file and writes
one JSON file per athlete to `scripts/parsed/`. Pure transform — does
not touch the network.

Inspect the JSON in `scripts/parsed/` before pushing anything.

### 2. Push one athlete to Neon (canary)

```
# Dry run — read-only, prints what would change
node scripts/push-progression.mjs --athlete=ath_farris --dry

# Real run — writes to live DB. Requires CONFIRM=yes.
CONFIRM=yes node scripts/push-progression.mjs --athlete=ath_farris
```

Defaults to MERGE: existing progression entries are preserved,
parsed entries are appended, duplicates (same event + time + date +
meet) are deduped.

Pass `--replace` to wipe and overwrite instead. Don't pass `--replace`
unless you mean it.

### 3. Push all athletes (after canary verified)

```
CONFIRM=yes node scripts/push-all-progression.mjs
```

Runs `push-progression.mjs` for all 11 athletes in smallest-first
order (Farris → Jon). Stops on first failure so a parser bug doesn't
silently corrupt 10 athletes.

## Why scripts run from Chase's machine, not Claude's

Claude's `bash_tool` has an allowlist that excludes `vercel.app`, so
Claude can't hit the live API directly. Claude writes the scripts and
verifies them syntactically; Chase runs them against the live API.

To verify Claude's work: in a new chat, ask Claude to query
`recentChanges` (see CLAUDE.md startup protocol) — every successful
push writes a row Claude can see.
