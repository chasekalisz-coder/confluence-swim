-- Confluence Swim - Supabase schema setup
-- Run this ONCE in the Supabase SQL Editor to create the tables the app needs.
-- Copy this whole file, paste into Supabase → SQL Editor → Run.

-- ============================
-- athletes table
-- ============================
CREATE TABLE IF NOT EXISTS athletes (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================
-- sessions table
-- ============================
CREATE TABLE IF NOT EXISTS sessions (
  id text PRIMARY KEY,
  athlete_id text NOT NULL REFERENCES athletes(id),
  date text,
  category text,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_athlete_id_idx ON sessions(athlete_id);
CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON sessions(created_at DESC);

-- ============================
-- Row Level Security
-- ============================
-- This app uses a publishable (anon) key in the browser. We enable RLS
-- and allow the anon role full access since this is a private coaching app
-- for a single coach with no login layer. If Chase ever adds multi-user auth,
-- these policies should be tightened.

ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_athletes" ON athletes;
CREATE POLICY "anon_all_athletes" ON athletes
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all_sessions" ON sessions;
CREATE POLICY "anon_all_sessions" ON sessions
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- Done. The app will seed the 9 athletes on first load.
