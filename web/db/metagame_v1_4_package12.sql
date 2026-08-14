-- Cartaralho v1.4 — Pacote 12: Hardening, Telemetria e Balanceamento.
-- Expand-only. Não cria mecânicas; adiciona concorrência otimista, telemetria e índices operacionais.
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS revision BIGINT NOT NULL DEFAULT 0;
CREATE OR REPLACE FUNCTION cartaralho_bump_room_revision() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.revision := OLD.revision + 1; RETURN NEW; END $$;
DROP TRIGGER IF EXISTS trg_rooms_revision ON rooms;
CREATE TRIGGER trg_rooms_revision BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION cartaralho_bump_room_revision();
CREATE TABLE IF NOT EXISTS match_telemetry(room_code TEXT PRIMARY KEY,started_at TIMESTAMPTZ NOT NULL DEFAULT now(),finished_at TIMESTAMPTZ,duration_seconds INTEGER CHECK(duration_seconds IS NULL OR duration_seconds>=0),points_to_win INTEGER,participants_at_start INTEGER,max_players_configured INTEGER,hand_size_at_start INTEGER,class_key TEXT,class_label TEXT,effort_at_start NUMERIC,engine_version TEXT,total_rounds INTEGER,effective_players NUMERIC,valid_for_rewards BOOLEAN,finish_reason TEXT,disconnect_count INTEGER NOT NULL DEFAULT 0,rejoin_count INTEGER NOT NULL DEFAULT 0,abandon_count INTEGER NOT NULL DEFAULT 0,metadata JSONB NOT NULL DEFAULT '{}'::jsonb);
CREATE TABLE IF NOT EXISTS operational_events(id BIGSERIAL PRIMARY KEY,event_type TEXT NOT NULL,room_code TEXT,source_key TEXT,phase TEXT,status TEXT,metadata JSONB NOT NULL DEFAULT '{}'::jsonb,idempotency_key TEXT UNIQUE,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS idx_match_telemetry_finished ON match_telemetry(finished_at DESC) WHERE finished_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_match_telemetry_config ON match_telemetry(points_to_win,participants_at_start,finished_at DESC);
CREATE INDEX IF NOT EXISTS idx_operational_events_type_created ON operational_events(event_type,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_operational_events_room_created ON operational_events(room_code,created_at DESC) WHERE room_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dirty_coin_ledger_created_type ON dirty_coin_ledger(created_at DESC,transaction_type);
CREATE INDEX IF NOT EXISTS idx_market_purchases_created_product ON market_purchases(created_at DESC,product_key);
CREATE INDEX IF NOT EXISTS idx_buff_activations_room_created ON buff_activations(room_code,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_loot_entitlements_created_status ON match_loot_entitlements(created_at DESC,status);
