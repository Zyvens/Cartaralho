-- Cartaralho v1.4 — Pacote 9: Round Engine v2 + Buffs Avançados.
-- Expand-only. O rollback é feito pela feature flag ADVANCED_ROUND_ENGINE.

ALTER TABLE dirty_coin_ledger DROP CONSTRAINT IF EXISTS dirty_coin_ledger_transaction_type_check;
ALTER TABLE dirty_coin_ledger ADD CONSTRAINT dirty_coin_ledger_transaction_type_check CHECK(transaction_type IN('starter_grant','match_placement','match_survival','match_consolation','match_saqueador','mission_reward','clean_card_purchase','marketplace_purchase','adjustment'));

ALTER TABLE buff_activations DROP CONSTRAINT IF EXISTS buff_activations_status_check;
ALTER TABLE buff_activations ADD CONSTRAINT buff_activations_status_check CHECK(status IN('applied','resolved','cancelled'));
ALTER TABLE buff_activations ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE buff_activations ADD COLUMN IF NOT EXISTS cancelled_by_activation_id TEXT;

CREATE TABLE IF NOT EXISTS buff_global_locks(
 room_code TEXT NOT NULL,
 round_number INT NOT NULL CHECK(round_number>0),
 lock_key TEXT NOT NULL,
 activation_id TEXT NOT NULL,
 user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(room_code,round_number,lock_key)
);

CREATE TABLE IF NOT EXISTS round_engine_events(
 id BIGSERIAL PRIMARY KEY,
 room_code TEXT NOT NULL,
 round_number INT NOT NULL CHECK(round_number>0),
 event_id TEXT NOT NULL UNIQUE,
 event_type TEXT NOT NULL,
 actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
 target_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
 submission_id TEXT,
 payload JSONB NOT NULL DEFAULT '{}',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_round_engine_events_match ON round_engine_events(room_code,round_number,id);

ALTER TABLE match_rounds ADD COLUMN IF NOT EXISTS engine_version TEXT NOT NULL DEFAULT 'legacy-v1';
ALTER TABLE match_rounds ADD COLUMN IF NOT EXISTS event_log JSONB NOT NULL DEFAULT '[]';
ALTER TABLE match_rounds ADD COLUMN IF NOT EXISTS rotation_direction INT NOT NULL DEFAULT 1 CHECK(rotation_direction IN(-1,1));
ALTER TABLE match_rounds ADD COLUMN IF NOT EXISTS winner_submission_id TEXT;
ALTER TABLE match_rounds ADD COLUMN IF NOT EXISTS scoring_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE match_reward_participation ADD COLUMN IF NOT EXISTS placement_paid INT NOT NULL DEFAULT 0 CHECK(placement_paid>=0);
ALTER TABLE match_reward_participation ADD COLUMN IF NOT EXISTS saqueador_share INT NOT NULL DEFAULT 0 CHECK(saqueador_share>=0);
ALTER TABLE match_reward_participation ADD COLUMN IF NOT EXISTS settled_total INT NOT NULL DEFAULT 0 CHECK(settled_total>=0);

CREATE TABLE IF NOT EXISTS saqueador_settlements(
 room_code TEXT PRIMARY KEY,
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN('open','frozen','settled')),
 placement_pot INT NOT NULL DEFAULT 0 CHECK(placement_pot>=0),
 participant_count INT NOT NULL DEFAULT 0 CHECK(participant_count>=0),
 shares JSONB NOT NULL DEFAULT '[]',
 closes_at TIMESTAMPTZ NOT NULL,
 opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 frozen_at TIMESTAMPTZ,
 settled_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS saqueador_participants(
 room_code TEXT NOT NULL REFERENCES saqueador_settlements(room_code) ON DELETE CASCADE,
 user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 activation_id TEXT NOT NULL,
 joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(room_code,user_id),
 UNIQUE(user_id,activation_id)
);

CREATE TABLE IF NOT EXISTS saqueador_shares(
 room_code TEXT NOT NULL REFERENCES saqueador_settlements(room_code) ON DELETE CASCADE,
 user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 amount INT NOT NULL CHECK(amount>=0),
 ordinal INT NOT NULL CHECK(ordinal>0),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(room_code,user_id),
 UNIQUE(room_code,ordinal)
);

INSERT INTO market_catalog(product_key,name,description,category,product_kind,price,config,catalog_version,enabled,sort_order) VALUES
 ('buff_vou_fingir','Vou fingir que ninguém viu','Mestre: revele somente para você a autoria das respostas desta rodada.','buff','buff_item',400,'{"buffKey":"buff_vou_fingir"}'::jsonb,'buff-v1',true,270),
 ('buff_meu_jogo','Meu jogo, minhas regras','Envie duas respostas independentes na mesma rodada.','buff','buff_item',450,'{"buffKey":"buff_meu_jogo"}'::jsonb,'buff-v1',true,280),
 ('buff_surrupiada','Surrupiada','Retire uma resposta recém-enviada de um adversário e force substituição.','buff','buff_item',600,'{"buffKey":"buff_surrupiada"}'::jsonb,'buff-v1',true,290),
 ('buff_censura_previa','Censura Prévia','Mestre: descarte a Carta Preta atual e sorteie outra antes das respostas.','buff','buff_item',650,'{"buffKey":"buff_censura_previa"}'::jsonb,'buff-v1',true,300),
 ('buff_quem_nunca','Quem nunca?','Solicite uma troca da Carta Preta antes das submissões.','buff','buff_item',700,'{"buffKey":"buff_quem_nunca"}'::jsonb,'buff-v1',true,310),
 ('buff_silencio_geral','Silêncio Geral','Mestre: desabilite reações pelo restante da partida.','buff','buff_item',750,'{"buffKey":"buff_silencio_geral"}'::jsonb,'buff-v1',true,320),
 ('buff_quero_tudo','Quero tudo que é seu','Troque as mãos atuais de dois jogadores sem transferir propriedade.','buff','buff_item',850,'{"buffKey":"buff_quero_tudo"}'::jsonb,'buff-v1',true,330),
 ('buff_intervencao_federal','Intervenção Federal','Cancele o buff que acabou de ser efetivado dentro da janela do engine.','buff','buff_item',900,'{"buffKey":"buff_intervencao_federal"}'::jsonb,'buff-v1',true,340),
 ('buff_apagao','Apagão','Bloqueie novas ativações de Buff na rodada seguinte.','buff','buff_item',950,'{"buffKey":"buff_apagao"}'::jsonb,'buff-v1',true,350),
 ('buff_poder_subiu','O poder subiu à cabeça','Mestre: continue na próxima rodada e inverta a direção dos Mestres.','buff','buff_item',1000,'{"buffKey":"buff_poder_subiu"}'::jsonb,'buff-v1',true,360),
 ('buff_caos_total','CAOS TOTAL','Oculte no servidor o conteúdo das mãos dos seus adversários nesta rodada.','buff','buff_item',1100,'{"buffKey":"buff_caos_total"}'::jsonb,'buff-v1',true,370),
 ('buff_se_fode_ai','Se fode aí','Substitua cartas especiais nas mãos adversárias por cartas normais do pool.','buff','buff_item',1200,'{"buffKey":"buff_se_fode_ai"}'::jsonb,'buff-v1',true,380),
 ('buff_que_poder','Que Poder, Filho da Puta','Mestre: tome o ponto e a resposta vencedora apenas para sua mão temporária da partida.','buff','buff_item',1400,'{"buffKey":"buff_que_poder"}'::jsonb,'buff-v1',true,390),
 ('buff_saqueador','Saqueador','Entre no assalto coletivo ao pote de premiação de colocação.','buff','buff_item',2500,'{"buffKey":"buff_saqueador"}'::jsonb,'buff-v1',true,400)
ON CONFLICT(product_key) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,category=EXCLUDED.category,product_kind=EXCLUDED.product_kind,price=EXCLUDED.price,config=EXCLUDED.config,catalog_version=EXCLUDED.catalog_version,enabled=EXCLUDED.enabled,sort_order=EXCLUDED.sort_order,updated_at=now();
