-- Cartaralho v1.4 — Pacote 6 (1/3): snapshots, candidatos, direitos e claims de Espólio.
-- Aditivo e idempotente. Não remove estruturas legadas.

CREATE TABLE IF NOT EXISTS match_loot_snapshots(
  match_id TEXT PRIMARY KEY,
  reward_engine_version TEXT NOT NULL,
  effective_players NUMERIC NOT NULL CHECK(effective_players>=0),
  effort_index NUMERIC NOT NULL CHECK(effort_index>=0),
  valid_for_loot BOOLEAN NOT NULL DEFAULT false,
  snapshot JSONB NOT NULL DEFAULT '{}',
  finalized_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS match_loot_candidates(
  id BIGSERIAL PRIMARY KEY,
  match_id TEXT NOT NULL REFERENCES match_loot_snapshots(match_id) ON DELETE CASCADE,
  canonical_card_id BIGINT NOT NULL REFERENCES canonical_cards(id) ON DELETE CASCADE,
  source_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  source_name_snapshot TEXT,
  source_reason TEXT NOT NULL CHECK(source_reason IN('created','white_revealed','black_used')),
  first_round_number INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(match_id,canonical_card_id,source_user_id,source_reason)
);
CREATE INDEX IF NOT EXISTS idx_match_loot_candidates_match_card ON match_loot_candidates(match_id,canonical_card_id);

CREATE TABLE IF NOT EXISTS match_loot_entitlements(
  match_id TEXT NOT NULL REFERENCES match_loot_snapshots(match_id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  final_position INT NOT NULL CHECK(final_position>0),
  base_quota INT NOT NULL CHECK(base_quota>=0),
  effort_index NUMERIC NOT NULL CHECK(effort_index>=0),
  requested_quota INT NOT NULL CHECK(requested_quota>=0),
  quota INT NOT NULL CHECK(quota>=0),
  eligible_count INT NOT NULL CHECK(eligible_count>=0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN('pending','claimed','empty')),
  claim_id TEXT,
  claimed_card_ids JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  claimed_at TIMESTAMPTZ,
  PRIMARY KEY(match_id,user_id)
);
CREATE INDEX IF NOT EXISTS idx_match_loot_entitlements_user_status ON match_loot_entitlements(user_id,status,created_at DESC);

CREATE TABLE IF NOT EXISTS match_loot_eligibility(
  match_id TEXT NOT NULL,
  user_id BIGINT NOT NULL,
  canonical_card_id BIGINT NOT NULL REFERENCES canonical_cards(id) ON DELETE CASCADE,
  source_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  source_name_snapshot TEXT,
  source_reason TEXT NOT NULL CHECK(source_reason IN('created','white_revealed','black_used')),
  first_round_number INT,
  snapshot JSONB NOT NULL DEFAULT '{}',
  PRIMARY KEY(match_id,user_id,canonical_card_id),
  FOREIGN KEY(match_id,user_id) REFERENCES match_loot_entitlements(match_id,user_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_match_loot_eligibility_user_match ON match_loot_eligibility(user_id,match_id);

CREATE TABLE IF NOT EXISTS match_loot_claims(
  match_id TEXT NOT NULL,
  user_id BIGINT NOT NULL,
  canonical_card_id BIGINT NOT NULL REFERENCES canonical_cards(id) ON DELETE CASCADE,
  claim_id TEXT NOT NULL,
  source_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(match_id,user_id,canonical_card_id),
  FOREIGN KEY(match_id,user_id) REFERENCES match_loot_entitlements(match_id,user_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_match_loot_claims_card ON match_loot_claims(canonical_card_id);
