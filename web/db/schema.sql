-- Cartaralho — schema for the online (Vercel + Neon Postgres) deployment.
-- Safe to run repeatedly: all structural operations are idempotent.

CREATE TABLE IF NOT EXISTS rooms (
  code TEXT PRIMARY KEY, creator_id TEXT NOT NULL, state TEXT NOT NULL,
  max_players INT NOT NULL DEFAULT 8, black_cards_per_player INT NOT NULL DEFAULT 0,
  white_cards_per_player INT NOT NULL DEFAULT 0, points_to_win INT NOT NULL DEFAULT 5,
  hand_size INT NOT NULL DEFAULT 5, use_standard_deck BOOLEAN NOT NULL DEFAULT true,
  card_creation_enabled BOOLEAN NOT NULL DEFAULT true, black_deck JSONB NOT NULL DEFAULT '[]',
  white_deck JSONB NOT NULL DEFAULT '[]', player_order JSONB NOT NULL DEFAULT '[]', current_round JSONB,
  insufficient_since TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS card_creation_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS insufficient_since TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY, username TEXT NOT NULL, display_name TEXT NOT NULL, password_hash TEXT NOT NULL,
  email TEXT, avatar_data TEXT, bio TEXT, recovery_hash TEXT,
  equipped_title_key TEXT, equipped_frame_key TEXT, xp INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), last_login_at TIMESTAMPTZ
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_data TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_title_key TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_frame_key TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INT NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users ((lower(username)));
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users ((lower(email))) WHERE email IS NOT NULL;

CREATE TABLE IF NOT EXISTS auth_sessions (
  token_hash TEXT PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);

CREATE TABLE IF NOT EXISTS players (
  id TEXT NOT NULL, room_code TEXT NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL, visual_id TEXT, nickname TEXT NOT NULL, avatar_data TEXT,
  title_key TEXT, frame_key TEXT,
  score INT NOT NULL DEFAULT 0, hand JSONB NOT NULL DEFAULT '[]', cards_ready BOOLEAN NOT NULL DEFAULT false,
  black_cards JSONB NOT NULL DEFAULT '[]', white_cards JSONB NOT NULL DEFAULT '[]', connected BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true, last_active TIMESTAMPTZ NOT NULL DEFAULT now(), joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(id,room_code)
);
ALTER TABLE players ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE players ADD COLUMN IF NOT EXISTS visual_id TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS avatar_data TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE players ADD COLUMN IF NOT EXISTS title_key TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS frame_key TEXT;
CREATE INDEX IF NOT EXISTS idx_players_room_code ON players(room_code);
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_room_user ON players(room_code,user_id) WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS deck_cards (
 id SERIAL PRIMARY KEY, type TEXT NOT NULL CHECK(type IN('blackCards','whiteCards')), text TEXT NOT NULL,
 count INT NOT NULL DEFAULT 1, is_native BOOLEAN NOT NULL DEFAULT false, is_hidden BOOLEAN NOT NULL DEFAULT false, UNIQUE(type,text)
);

CREATE TABLE IF NOT EXISTS user_cards (
 id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 type TEXT NOT NULL CHECK(type IN('blackCards','whiteCards')), text TEXT NOT NULL, owned BOOLEAN NOT NULL DEFAULT true,
 is_player_card BOOLEAN NOT NULL DEFAULT false, is_favorite BOOLEAN NOT NULL DEFAULT false,
 times_used INT NOT NULL DEFAULT 0, matches_used INT NOT NULL DEFAULT 0,
 times_seen INT NOT NULL DEFAULT 0, times_won INT NOT NULL DEFAULT 0, duplicate_creation_count INT NOT NULL DEFAULT 0,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(user_id,type,text)
);
ALTER TABLE user_cards ADD COLUMN IF NOT EXISTS owned BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE user_cards ADD COLUMN IF NOT EXISTS is_player_card BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE user_cards ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_user_cards_user ON user_cards(user_id);

CREATE TABLE IF NOT EXISTS seasons (
 id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE, season_key TEXT,
 starts_at TIMESTAMPTZ NOT NULL DEFAULT now(), ends_at TIMESTAMPTZ,
 is_active BOOLEAN NOT NULL DEFAULT true, finalized_at TIMESTAMPTZ
);
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS season_key TEXT;
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS idx_seasons_key ON seasons(season_key) WHERE season_key IS NOT NULL;
INSERT INTO seasons(name,is_active) SELECT 'Temporada 1',true WHERE NOT EXISTS (SELECT 1 FROM seasons);

CREATE TABLE IF NOT EXISTS match_history (
 id SERIAL PRIMARY KEY, room_code TEXT NOT NULL, ranking JSONB NOT NULL, winner_nickname TEXT,
 season_id BIGINT REFERENCES seasons(id) ON DELETE SET NULL, finished_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE match_history ADD COLUMN IF NOT EXISTS season_id BIGINT REFERENCES seasons(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS match_players (
 id BIGSERIAL PRIMARY KEY, room_code TEXT NOT NULL, user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
 nickname TEXT NOT NULL, avatar_data TEXT, final_score INT NOT NULL DEFAULT 0, rounds_won INT NOT NULL DEFAULT 0,
 won_match BOOLEAN NOT NULL DEFAULT false, season_id BIGINT REFERENCES seasons(id) ON DELETE SET NULL,
 final_position INT, total_players INT,
 finished_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(room_code,user_id)
);
ALTER TABLE match_players ADD COLUMN IF NOT EXISTS avatar_data TEXT;
ALTER TABLE match_players ADD COLUMN IF NOT EXISTS season_id BIGINT REFERENCES seasons(id) ON DELETE SET NULL;
ALTER TABLE match_players ADD COLUMN IF NOT EXISTS final_position INT;
ALTER TABLE match_players ADD COLUMN IF NOT EXISTS total_players INT;
CREATE INDEX IF NOT EXISTS idx_match_players_user ON match_players(user_id);
CREATE INDEX IF NOT EXISTS idx_match_players_finished ON match_players(finished_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_players_season ON match_players(season_id);

CREATE TABLE IF NOT EXISTS card_match_usage (
 room_code TEXT NOT NULL, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 type TEXT NOT NULL CHECK(type IN('blackCards','whiteCards')), text TEXT NOT NULL,
 used_count INT NOT NULL DEFAULT 0, seen_count INT NOT NULL DEFAULT 0, won_count INT NOT NULL DEFAULT 0,
 PRIMARY KEY(room_code,user_id,type,text)
);

CREATE TABLE IF NOT EXISTS season_hall_of_fame (
  season_id BIGINT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position INT NOT NULL, points INT NOT NULL DEFAULT 0, wins INT NOT NULL DEFAULT 0,
  matches INT NOT NULL DEFAULT 0, awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(season_id,position), UNIQUE(season_id,user_id)
);

CREATE TABLE IF NOT EXISTS user_unlocks (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unlock_type TEXT NOT NULL CHECK(unlock_type IN('title','frame','badge')),
  unlock_key TEXT NOT NULL, unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id,unlock_type,unlock_key)
);

CREATE TABLE IF NOT EXISTS match_rounds (
  room_code TEXT NOT NULL, round_number INT NOT NULL, black_card TEXT NOT NULL,
  master_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL, master_nickname TEXT,
  submissions JSONB NOT NULL DEFAULT '[]', winner_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  winner_nickname TEXT, winner_card TEXT, scores JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY(room_code,round_number)
);
CREATE INDEX IF NOT EXISTS idx_match_rounds_winner ON match_rounds(winner_user_id);
CREATE INDEX IF NOT EXISTS idx_match_rounds_master ON match_rounds(master_user_id);

CREATE TABLE IF NOT EXISTS round_votes (
  room_code TEXT NOT NULL, round_number INT NOT NULL,
  chooser_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  winner_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY(room_code,round_number)
);
CREATE INDEX IF NOT EXISTS idx_round_votes_pair ON round_votes(chooser_user_id,winner_user_id);

CREATE TABLE IF NOT EXISTS card_origins (
  id BIGSERIAL PRIMARY KEY, type TEXT NOT NULL CHECK(type IN('blackCards','whiteCards')),
  text_key TEXT NOT NULL, text TEXT NOT NULL, creator_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  creator_name_snapshot TEXT, first_room_code TEXT, first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recreated_count INT NOT NULL DEFAULT 0, UNIQUE(type,text_key)
);
CREATE INDEX IF NOT EXISTS idx_card_origins_creator ON card_origins(creator_user_id);

CREATE TABLE IF NOT EXISTS card_room_presence (
  room_code TEXT NOT NULL, type TEXT NOT NULL CHECK(type IN('blackCards','whiteCards')),
  text_key TEXT NOT NULL, text TEXT NOT NULL, first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(room_code,type,text_key)
);
CREATE INDEX IF NOT EXISTS idx_card_room_presence_card ON card_room_presence(type,text_key);

CREATE TABLE IF NOT EXISTS user_reactions (
  id BIGSERIAL PRIMARY KEY, room_code TEXT NOT NULL,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_reactions_user_date ON user_reactions(user_id,created_at DESC);

CREATE TABLE IF NOT EXISTS user_missions (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_key TEXT NOT NULL, period_type TEXT NOT NULL CHECK(period_type IN('daily','weekly')),
  period_key TEXT NOT NULL, progress INT NOT NULL DEFAULT 0, target INT NOT NULL,
  xp_reward INT NOT NULL DEFAULT 0, completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id,mission_key,period_key)
);
CREATE INDEX IF NOT EXISTS idx_user_missions_period ON user_missions(user_id,period_type,period_key);

CREATE TABLE IF NOT EXISTS friend_groups (
  id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, invite_code TEXT NOT NULL UNIQUE,
  owner_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS friend_group_members (
  group_id BIGINT NOT NULL REFERENCES friend_groups(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(group_id,user_id)
);
CREATE INDEX IF NOT EXISTS idx_friend_group_members_user ON friend_group_members(user_id);
