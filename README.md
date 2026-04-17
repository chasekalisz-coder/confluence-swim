# Confluence Swim

AI-powered coaching session notes app for Chase Kalisz's elite youth swim program at SMU.

## Status

**Phase 1 — Pipeline proof.** Minimal "Hello Confluence Swim" page that proves GitHub → Vercel auto-deploy works end-to-end and Supabase is reachable. No real features yet.

## Stack

- **React + Vite** — frontend
- **Vercel** — hosting and serverless functions
- **Supabase** — database (athletes, sessions)
- **Anthropic API** — AI note generation (added in Phase 3)

## Environment variables (set in Vercel dashboard)

- `VITE_SUPABASE_URL` — Supabase Project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase publishable key
- `ANTHROPIC_API_KEY` — Anthropic API key (used only by /api/generate, never exposed to client)

## Phase roadmap

1. **Phase 1 (current):** Empty deploy, Supabase connection check
2. **Phase 2:** Athlete grid, athlete profile, new-session chooser, note preview shell
3. **Phase 3:** Training note end-to-end (photo upload, AI generation, SVG charts, print, save)
4. **Phase 4:** Technique note end-to-end (topic picker, fault library, technique AI prompt, save)
5. **MVP ships** — both note types live
6. **Phase 5+:** Meet prep, photo auto-detect, workout builder, dashboard

## Build rules (non-negotiable)

- No manual deployments. Edit source → push GitHub → Vercel auto-deploys.
- SVG charts only. Never Canvas.
- API keys only in Vercel env vars, never in source.
- One function per file. Nothing can go missing silently.
- Verify in a fresh browser tab before declaring anything done.
