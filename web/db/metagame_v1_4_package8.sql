-- Cartaralho v1.4 — Pacote 8: Buff Engine + Buffs Simples.
-- Aditivo/idempotente. Inventário comprado sobrevive ao desligamento da feature.

ALTER TABLE market_catalog DROP CONSTRAINT IF EXISTS market_catalog_category_check;
ALTER TABLE market_catalog ADD CONSTRAINT market_catalog_category_check CHECK(category IN('clean_cards','card_pack','buff'));
ALTER TABLE market_catalog DROP CONSTRAINT IF EXISTS market_catalog_product_kind_check;
ALTER TABLE market_catalog ADD CONSTRAINT market_catalog_product_kind_check CHECK(product_kind IN('clean_white','clean_black','clean_mixed','pack_random','pack_best_world','buff_item'));

CREATE TABLE IF NOT EXISTS buff_inventory(
 user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 buff_key TEXT NOT NULL REFERENCES market_catalog(product_key),
 quantity INT NOT NULL DEFAULT 0 CHECK(quantity>=0),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,buff_key)
);
CREATE INDEX IF NOT EXISTS idx_buff_inventory_user ON buff_inventory(user_id,quantity DESC,buff_key);

CREATE TABLE IF NOT EXISTS buff_inventory_ledger(
 id BIGSERIAL PRIMARY KEY,
 user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 buff_key TEXT NOT NULL REFERENCES market_catalog(product_key),
 delta INT NOT NULL CHECK(delta<>0),
 transaction_type TEXT NOT NULL CHECK(transaction_type IN('purchase','activation','adjustment')),
 idempotency_key TEXT NOT NULL UNIQUE,
 reference_type TEXT,
 reference_id TEXT,
 metadata JSONB NOT NULL DEFAULT '{}',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_buff_ledger_user_created ON buff_inventory_ledger(user_id,created_at DESC,id DESC);

CREATE TABLE IF NOT EXISTS buff_activations(
 id BIGSERIAL PRIMARY KEY,
 activation_id TEXT NOT NULL,
 room_code TEXT NOT NULL,
 round_number INT NOT NULL CHECK(round_number>0),
 user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 buff_key TEXT NOT NULL REFERENCES market_catalog(product_key),
 target_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
 phase TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'applied' CHECK(status IN('applied','resolved')),
 effect JSONB NOT NULL DEFAULT '{}',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 resolved_at TIMESTAMPTZ,
 UNIQUE(user_id,activation_id),
 UNIQUE(room_code,round_number,user_id)
);
CREATE INDEX IF NOT EXISTS idx_buff_activations_room_round ON buff_activations(room_code,round_number,created_at);

INSERT INTO market_catalog(product_key,name,description,category,product_kind,price,config,catalog_version,enabled,sort_order) VALUES
 ('buff_dedo_no_olho','Dedo no Olho','Veja privadamente uma carta aleatória da mão de um adversário.','buff','buff_item',250,'{"buffKey":"buff_dedo_no_olho"}'::jsonb,'buff-v1',true,200),
 ('buff_foi_sem_querer','Foi sem querer querendo','Recolha sua própria resposta antes da revelação e envie outra uma única vez.','buff','buff_item',300,'{"buffKey":"buff_foi_sem_querer"}'::jsonb,'buff-v1',true,210),
 ('buff_amigo_de_merda','Amigo de Merda','Antes da submissão do alvo, embaralhe a ordem da mão dele.','buff','buff_item',350,'{"buffKey":"buff_amigo_de_merda"}'::jsonb,'buff-v1',true,220),
 ('buff_xo_ve_aqui','Xô vê aqui','Troque uma carta da sua mão por uma carta aleatória da mão de um adversário.','buff','buff_item',450,'{"buffKey":"buff_xo_ve_aqui"}'::jsonb,'buff-v1',true,230),
 ('buff_mao_de_vaca','Mão de Vaca','Compre duas cartas extras, escolha duas para devolver e termine com a mão normal.','buff','buff_item',500,'{"buffKey":"buff_mao_de_vaca"}'::jsonb,'buff-v1',true,240),
 ('buff_testemunha_protegida','Testemunha Protegida','Proteja sua submissão de apagar, trocar ou manipular nesta rodada.','buff','buff_item',500,'{"buffKey":"buff_testemunha_protegida"}'::jsonb,'buff-v1',true,250),
 ('buff_toque_de_midas','Toque de Midas','Devolva sua mão ao pool da partida e compre outra do mesmo tamanho.','buff','buff_item',600,'{"buffKey":"buff_toque_de_midas"}'::jsonb,'buff-v1',true,260)
ON CONFLICT(product_key) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,category=EXCLUDED.category,product_kind=EXCLUDED.product_kind,price=EXCLUDED.price,config=EXCLUDED.config,catalog_version=EXCLUDED.catalog_version,enabled=EXCLUDED.enabled,sort_order=EXCLUDED.sort_order,updated_at=now();
