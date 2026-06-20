-- Vkhal09 DB changes — run in Khal Bala's Supabase SQL Editor
-- 1. Add avatar_emoji column to kb_users
ALTER TABLE kb_users ADD COLUMN IF NOT EXISTS avatar_emoji TEXT;

-- 2. Create kb_players table for Top Scorer searchable dropdown
CREATE TABLE IF NOT EXISTS kb_players (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  team TEXT NOT NULL
);
