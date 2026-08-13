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
