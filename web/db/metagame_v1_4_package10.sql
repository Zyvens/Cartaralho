-- Cartaralho v1.4 — Pacote 10: Achievements, Badges, Títulos e Missões.
-- Expand-only. Rollback funcional por ACHIEVEMENTS_V2_ENABLED=false.

ALTER TABLE dirty_coin_ledger DROP CONSTRAINT IF EXISTS dirty_coin_ledger_transaction_type_check;
ALTER TABLE dirty_coin_ledger ADD CONSTRAINT dirty_coin_ledger_transaction_type_check CHECK(transaction_type IN('starter_grant','match_placement','match_survival','match_consolation','match_saqueador','mission_reward','legacy_royalty','clean_card_purchase','marketplace_purchase','adjustment'));

ALTER TABLE buff_inventory_ledger DROP CONSTRAINT IF EXISTS buff_inventory_ledger_transaction_type_check;
ALTER TABLE buff_inventory_ledger ADD CONSTRAINT buff_inventory_ledger_transaction_type_check CHECK(transaction_type IN('purchase','activation','mission_reward','adjustment'));

ALTER TABLE user_missions ADD COLUMN IF NOT EXISTS coin_reward INT NOT NULL DEFAULT 0 CHECK(coin_reward>=0);
ALTER TABLE user_missions ADD COLUMN IF NOT EXISTS buff_reward_key TEXT REFERENCES market_catalog(product_key);
ALTER TABLE user_missions ADD COLUMN IF NOT EXISTS reward_metadata JSONB NOT NULL DEFAULT '{}';
ALTER TABLE user_missions ADD COLUMN IF NOT EXISTS rewarded_at TIMESTAMPTZ;

ALTER TABLE canonical_card_legacy_milestones ADD COLUMN IF NOT EXISTS xp_reward INT NOT NULL DEFAULT 0 CHECK(xp_reward>=0);
ALTER TABLE canonical_card_legacy_milestones ADD COLUMN IF NOT EXISTS coin_reward INT NOT NULL DEFAULT 0 CHECK(coin_reward>=0);
ALTER TABLE canonical_card_legacy_milestones ADD COLUMN IF NOT EXISTS rewarded_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS achievement_events(
 id BIGSERIAL PRIMARY KEY,
 event_id TEXT NOT NULL UNIQUE,
 event_key TEXT NOT NULL,
 user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 match_id TEXT,
 round_number INT,
 related_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
 canonical_card_id BIGINT REFERENCES canonical_cards(id) ON DELETE SET NULL,
 source_key TEXT,
 metadata JSONB NOT NULL DEFAULT '{}',
 occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_achievement_events_user_key ON achievement_events(user_id,event_key,occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_achievement_events_user_match ON achievement_events(user_id,match_id) WHERE match_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_achievement_events_card ON achievement_events(canonical_card_id,event_key) WHERE canonical_card_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS achievement_progress(
 user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 achievement_key TEXT NOT NULL,
 progress INT NOT NULL DEFAULT 0 CHECK(progress>=0),
 target INT NOT NULL CHECK(target>0),
 unlocked BOOLEAN NOT NULL DEFAULT false,
 unlocked_at TIMESTAMPTZ,
 last_event_at TIMESTAMPTZ,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,achievement_key)
);

CREATE TABLE IF NOT EXISTS achievement_reward_grants(
 user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 achievement_key TEXT NOT NULL,
 reward_key TEXT NOT NULL,
 metadata JSONB NOT NULL DEFAULT '{}',
 granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,achievement_key,reward_key)
);
