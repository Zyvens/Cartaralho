-- Cartaralho P16 — Reciclagem de Cartas de Jogador.
-- Aditivo/idempotente. A reciclagem remove apenas ownership do usuário; a carta canônica e sua autoria permanecem.
ALTER TABLE dirty_coin_ledger DROP CONSTRAINT IF EXISTS dirty_coin_ledger_transaction_type_check;
ALTER TABLE dirty_coin_ledger ADD CONSTRAINT dirty_coin_ledger_transaction_type_check CHECK(transaction_type IN('starter_grant','match_placement','match_survival','match_consolation','match_saqueador','mission_reward','legacy_royalty','clean_card_purchase','marketplace_purchase','card_recycling','adjustment'));

CREATE TABLE IF NOT EXISTS card_recycling_batches(
 id BIGSERIAL PRIMARY KEY,
 user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 recycling_id TEXT NOT NULL,
 card_count INT NOT NULL CHECK(card_count>=10 AND card_count%10=0),
 reward INT NOT NULL CHECK(reward>0),
 card_ids JSONB NOT NULL DEFAULT '[]',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(user_id,recycling_id)
);
CREATE INDEX IF NOT EXISTS idx_card_recycling_user_created ON card_recycling_batches(user_id,created_at DESC,id DESC);
