-- Professional UI/social revision — additive and idempotent.

CREATE TABLE IF NOT EXISTS friendships (
  id BIGSERIAL PRIMARY KEY,
  user_a BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN('pending','accepted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK(user_a < user_b),
  UNIQUE(user_a,user_b)
);
CREATE INDEX IF NOT EXISTS idx_friendships_a_status ON friendships(user_a,status);
CREATE INDEX IF NOT EXISTS idx_friendships_b_status ON friendships(user_b,status);
CREATE INDEX IF NOT EXISTS idx_friendships_requested_by ON friendships(requested_by,status);

-- O deck que já existia antes desta revisão é o deck oficial/base do jogo.
-- Cartas criadas por jogadores vivem em user_cards/card_origins, então não são afetadas.
UPDATE deck_cards SET is_native=true WHERE is_hidden=false AND is_native=false;

-- Metajogo v1.4 — Pacote 2: Economia e Match Reward Engine.
-- Aditivo/idempotente. Não cria loja, Cartas Limpas, buffs ou cosméticos.
CREATE TABLE IF NOT EXISTS dirty_coin_wallets (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance BIGINT NOT NULL DEFAULT 0 CHECK(balance >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS dirty_coin_ledger (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  transaction_type TEXT NOT NULL CHECK(transaction_type IN('starter_grant','match_placement','match_survival','match_consolation','mission_reward','adjustment')),
  idempotency_key TEXT NOT NULL UNIQUE,
  reference_type TEXT,
  reference_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dirty_coin_ledger_user_created ON dirty_coin_ledger(user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS match_reward_settlements (
  room_code TEXT PRIMARY KEY,
  engine_version TEXT NOT NULL,
  points_to_win INT NOT NULL,
  effective_players NUMERIC(6,3) NOT NULL,
  effort_index NUMERIC(12,6) NOT NULL,
  money_multiplier NUMERIC(12,6) NOT NULL,
  survival_bonus INT NOT NULL DEFAULT 0,
  total_rounds INT NOT NULL DEFAULT 0,
  valid_for_rewards BOOLEAN NOT NULL DEFAULT true,
  settled_at TIMESTAMPTZ,
  snapshot JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS match_reward_participation (
  room_code TEXT NOT NULL REFERENCES match_reward_settlements(room_code) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  eligible_rounds INT NOT NULL DEFAULT 0,
  participated_rounds INT NOT NULL DEFAULT 0,
  participation_ratio NUMERIC(8,5) NOT NULL DEFAULT 0,
  survival_eligible BOOLEAN NOT NULL DEFAULT false,
  final_position INT,
  placement_reward INT NOT NULL DEFAULT 0,
  survival_reward INT NOT NULL DEFAULT 0,
  consolation_reward INT NOT NULL DEFAULT 0,
  total_reward INT NOT NULL DEFAULT 0,
  PRIMARY KEY(room_code,user_id)
);

-- Contas existentes também recebem o grant inicial exatamente uma vez.
INSERT INTO dirty_coin_wallets(user_id,balance) SELECT id,0 FROM users ON CONFLICT(user_id) DO NOTHING;
INSERT INTO dirty_coin_ledger(user_id,amount,transaction_type,idempotency_key,reference_type,reference_id,metadata)
SELECT id,5000,'starter_grant','starter:coins:'||id,'user',id::text,jsonb_build_object('grant_version','v1') FROM users
ON CONFLICT(idempotency_key) DO NOTHING;
UPDATE dirty_coin_wallets w SET balance=x.total,updated_at=now()
FROM (SELECT user_id,COALESCE(SUM(amount),0)::bigint total FROM dirty_coin_ledger GROUP BY user_id) x
WHERE w.user_id=x.user_id;
