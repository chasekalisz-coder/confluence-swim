# Confluence Swim

AI-powered coaching session notes app for Chase Kalisz's elite youth swim program at SMU.

## Status

**Phase 2.1 — Athlete grid + profile, on Neon Postgres.** Database is Neon. (An earlier prototype briefly used Supabase; that migration is complete and the Supabase layer is gone — see `docs/archive/` for history.) Database password lives only in Vercel env vars, never in the browser.

## Stack

- **React + Vite** — frontend
- **Vercel** — hosting and serverless functions
- **Neon Postgres** — database (athletes, sessions) accessed via serverless function
- **Anthropic API** — AI note generation (added in Phase 3)

## Architecture

Browser → `/api/db` (Vercel serverless function) → Neon Postgres

All database queries happen server-side. The browser never sees the connection string.

## Environment variables (set in Vercel dashboard)

- `DATABASE_URL` — Neon Postgres connection string (`postgresql://...`)
- `ANTHROPIC_API_KEY` — Anthropic API key (used only by /api/generate, never exposed to client)

The app auto-creates its schema on first load (`athletes` and `sessions` tables) and seeds the 9 athletes.

## Phase roadmap

1. ✅ **Phase 1:** Empty deploy, pipeline proof
2. ✅ **Phase 2:** Athlete grid, athlete profile, new-session chooser
3. ✅ **Phase 2.1:** Database layer is Neon Postgres (earlier Supabase prototype removed)
4. **Phase 3:** Training note end-to-end (photo upload, AI generation, SVG charts, print, save)
5. **Phase 4:** Technique note end-to-end (topic picker, fault library, technique AI prompt, save)
6. **MVP ships** — both note types live
7. **Phase 5+:** Meet prep, photo auto-detect, workout builder, dashboard

## Build rules (non-negotiable)

- No manual deployments. Edit source → push GitHub → Vercel auto-deploys.
- SVG charts only. Never Canvas.
- Credentials only in Vercel env vars, never in source.
- One function per file. Nothing can go missing silently.
- Verify in a fresh browser tab before declaring anything done.
