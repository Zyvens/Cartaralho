-- Cartaralho v1.4 — Pacote 7: configuração de sala e snapshot econômico.
-- Aditivo e idempotente. Mantém salas/dados legados compatíveis.

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS afk_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS player_cards_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS buffs_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS reward_config_snapshot JSONB;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS reward_config_started_at TIMESTAMPTZ;

COMMENT ON COLUMN rooms.afk_enabled IS 'Se false, não desconecta/remove jogadores por inatividade automática.';
COMMENT ON COLUMN rooms.player_cards_enabled IS 'Permite levar Cartas de Jogador já possuídas para a mesa.';
COMMENT ON COLUMN rooms.buffs_enabled IS 'Flag de sala reservada ao Pacote 8; P07 apenas persiste, sem efeitos.';
COMMENT ON COLUMN rooms.reward_config_snapshot IS 'Configuração econômica imutável congelada no início da partida.';
