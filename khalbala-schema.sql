-- ============================================================
-- KHAL BALA · خال بالا
-- Supabase Schema — run this in your NEW Supabase project
-- ============================================================

-- Users table (same family, fresh start)
CREATE TABLE kb_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL UNIQUE,
  pin TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knockout matches (populated manually or via admin)
CREATE TABLE kb_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_a TEXT NOT NULL,
  team_b TEXT NOT NULL,
  kickoff_utc TIMESTAMPTZ NOT NULL,
  stage TEXT NOT NULL, -- LAST_16, QUARTER_FINALS, SEMI_FINALS, FINAL
  status TEXT NOT NULL DEFAULT 'TIMED', -- TIMED, IN_PLAY, FINISHED
  score_a INT,
  score_b INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Score predictions (one per user per match)
CREATE TABLE kb_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES kb_users(id),
  match_id UUID NOT NULL REFERENCES kb_matches(id),
  score_a INT NOT NULL,
  score_b INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- Bonus predictions (champion + top scorer)
CREATE TABLE kb_bonus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES kb_users(id) UNIQUE,
  champion TEXT,
  top_scorer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- App metadata (bonus_locked, actual_champion, actual_top_scorer)
CREATE TABLE kb_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Seed metadata
INSERT INTO kb_meta (key, value) VALUES
  ('bonus_locked', 'false'),
  ('actual_champion', ''),
  ('actual_top_scorer', '');

-- ============================================================
-- ADD YOUR FAMILY MEMBERS (replace names and PINs)
-- Use the same names as the main app for consistency
-- ============================================================

-- INSERT INTO kb_users (display_name, pin) VALUES
--   ('Kiarash', '1234'),
--   ('Ali', '5678'),
--   ('Sara', '9012');
-- ... add everyone here
