-- Cartaralho — schema for the online (Vercel + Neon Postgres) deployment.
-- Run this once against your Neon database before the first deploy.

CREATE TABLE IF NOT EXISTS rooms (
  code                    TEXT PRIMARY KEY,
  creator_id              TEXT NOT NULL,
  state                   TEXT NOT NULL,
  max_players             INT NOT NULL DEFAULT 8,
  black_cards_per_player  INT NOT NULL DEFAULT 3,
  white_cards_per_player  INT NOT NULL DEFAULT 10,
  points_to_win           INT NOT NULL DEFAULT 5,
  hand_size               INT NOT NULL DEFAULT 5,
  use_standard_deck       BOOLEAN NOT NULL DEFAULT true,
  black_deck              JSONB NOT NULL DEFAULT '[]',
  white_deck              JSONB NOT NULL DEFAULT '[]',
  player_order            JSONB NOT NULL DEFAULT '[]',
  current_round           JSONB,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS players (
  id           TEXT NOT NULL,              -- client-generated session id, stable across requests
  room_code    TEXT NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
  nickname     TEXT NOT NULL,
  score        INT NOT NULL DEFAULT 0,
  hand         JSONB NOT NULL DEFAULT '[]',
  cards_ready  BOOLEAN NOT NULL DEFAULT false,
  black_cards  JSONB NOT NULL DEFAULT '[]',
  white_cards  JSONB NOT NULL DEFAULT '[]',
  connected    BOOLEAN NOT NULL DEFAULT true,
  last_active  TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, room_code)
);

CREATE INDEX IF NOT EXISTS idx_players_room_code ON players(room_code);

CREATE TABLE IF NOT EXISTS deck_cards (
  id         SERIAL PRIMARY KEY,
  type       TEXT NOT NULL CHECK (type IN ('blackCards', 'whiteCards')),
  text       TEXT NOT NULL,
  count      INT NOT NULL DEFAULT 1,
  is_native  BOOLEAN NOT NULL DEFAULT false,
  is_hidden  BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (type, text)
);

CREATE TABLE IF NOT EXISTS match_history (
  id               SERIAL PRIMARY KEY,
  room_code        TEXT NOT NULL,
  ranking          JSONB NOT NULL,
  winner_nickname  TEXT,
  finished_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
