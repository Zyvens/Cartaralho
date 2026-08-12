-- Cartaralho — metajogo/social/progressão (idempotente)
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_title_key TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_frame_key TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INT NOT NULL DEFAULT 0;

ALTER TABLE players ADD COLUMN IF NOT EXISTS title_key TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS frame_key TEXT;

ALTER TABLE seasons ADD COLUMN IF NOT EXISTS season_key TEXT;
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS idx_seasons_key ON seasons(season_key) WHERE season_key IS NOT NULL;

ALTER TABLE match_players ADD COLUMN IF NOT EXISTS final_position INT;
ALTER TABLE match_players ADD COLUMN IF NOT EXISTS total_players INT;

CREATE TABLE IF NOT EXISTS season_hall_of_fame (
  season_id BIGINT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position INT NOT NULL,
  points INT NOT NULL DEFAULT 0,
  wins INT NOT NULL DEFAULT 0,
  matches INT NOT NULL DEFAULT 0,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(season_id, position),
  UNIQUE(season_id, user_id)
);

CREATE TABLE IF NOT EXISTS user_unlocks (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unlock_type TEXT NOT NULL CHECK(unlock_type IN('title','frame','badge')),
  unlock_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, unlock_type, unlock_key)
);

CREATE TABLE IF NOT EXISTS match_rounds (
  room_code TEXT NOT NULL,
  round_number INT NOT NULL,
  black_card TEXT NOT NULL,
  master_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  master_nickname TEXT,
  submissions JSONB NOT NULL DEFAULT '[]',
  winner_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  winner_nickname TEXT,
  winner_card TEXT,
  scores JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(room_code, round_number)
);
CREATE INDEX IF NOT EXISTS idx_match_rounds_winner ON match_rounds(winner_user_id);
CREATE INDEX IF NOT EXISTS idx_match_rounds_master ON match_rounds(master_user_id);

CREATE TABLE IF NOT EXISTS round_votes (
  room_code TEXT NOT NULL,
  round_number INT NOT NULL,
  chooser_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  winner_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(room_code, round_number)
);
CREATE INDEX IF NOT EXISTS idx_round_votes_pair ON round_votes(chooser_user_id, winner_user_id);

CREATE TABLE IF NOT EXISTS card_origins (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN('blackCards','whiteCards')),
  text_key TEXT NOT NULL,
  text TEXT NOT NULL,
  creator_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  creator_name_snapshot TEXT,
  first_room_code TEXT,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recreated_count INT NOT NULL DEFAULT 0,
  UNIQUE(type, text_key)
);
CREATE INDEX IF NOT EXISTS idx_card_origins_creator ON card_origins(creator_user_id);

CREATE TABLE IF NOT EXISTS card_room_presence (
  room_code TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN('blackCards','whiteCards')),
  text_key TEXT NOT NULL,
  text TEXT NOT NULL,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(room_code, type, text_key)
);
CREATE INDEX IF NOT EXISTS idx_card_room_presence_card ON card_room_presence(type, text_key);

CREATE TABLE IF NOT EXISTS user_reactions (
  id BIGSERIAL PRIMARY KEY,
  room_code TEXT NOT NULL,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_reactions_user_date ON user_reactions(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS user_missions (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_key TEXT NOT NULL,
  period_type TEXT NOT NULL CHECK(period_type IN('daily','weekly')),
  period_key TEXT NOT NULL,
  progress INT NOT NULL DEFAULT 0,
  target INT NOT NULL,
  xp_reward INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, mission_key, period_key)
);
CREATE INDEX IF NOT EXISTS idx_user_missions_period ON user_missions(user_id, period_type, period_key);

CREATE TABLE IF NOT EXISTS friend_groups (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  owner_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS friend_group_members (
  group_id BIGINT NOT NULL REFERENCES friend_groups(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(group_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_friend_group_members_user ON friend_group_members(user_id);
