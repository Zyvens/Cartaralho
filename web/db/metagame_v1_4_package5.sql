-- Cartaralho v1.4 — Pacote 5 (1/2): catálogo e histórico do Mercado Paralelo.
ALTER TABLE dirty_coin_ledger DROP CONSTRAINT IF EXISTS dirty_coin_ledger_transaction_type_check;
ALTER TABLE dirty_coin_ledger ADD CONSTRAINT dirty_coin_ledger_transaction_type_check CHECK(transaction_type IN('starter_grant','match_placement','match_survival','match_consolation','mission_reward','clean_card_purchase','marketplace_purchase','adjustment'));

CREATE TABLE IF NOT EXISTS market_catalog(
 product_key TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 description TEXT NOT NULL DEFAULT '',
 category TEXT NOT NULL CHECK(category IN('clean_cards','card_pack')),
 product_kind TEXT NOT NULL CHECK(product_kind IN('clean_white','clean_black','clean_mixed','pack_random','pack_best_world')),
 price INT NOT NULL CHECK(price>0),
 config JSONB NOT NULL DEFAULT '{}',
 catalog_version TEXT NOT NULL DEFAULT 'market-v1',
 enabled BOOLEAN NOT NULL DEFAULT true,
 sort_order INT NOT NULL DEFAULT 0,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_purchases(
 id BIGSERIAL PRIMARY KEY,
 user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 purchase_id TEXT NOT NULL,
 product_key TEXT NOT NULL REFERENCES market_catalog(product_key),
 product_name TEXT NOT NULL,
 price_paid INT NOT NULL CHECK(price_paid>=0),
 catalog_version TEXT NOT NULL,
 product_config JSONB NOT NULL DEFAULT '{}',
 item_count INT NOT NULL DEFAULT 0 CHECK(item_count>=0),
 grants JSONB NOT NULL DEFAULT '[]',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(user_id,purchase_id)
);
CREATE INDEX IF NOT EXISTS idx_market_purchases_user_created ON market_purchases(user_id,created_at DESC);

CREATE TABLE IF NOT EXISTS market_purchase_card_grants(
 purchase_pk BIGINT NOT NULL REFERENCES market_purchases(id) ON DELETE CASCADE,
 canonical_card_id BIGINT NOT NULL REFERENCES canonical_cards(id) ON DELETE CASCADE,
 acquisition_source TEXT NOT NULL CHECK(acquisition_source IN('pack_random','pack_best_world')),
 ordinal INT NOT NULL CHECK(ordinal>0),
 granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(purchase_pk,canonical_card_id),
 UNIQUE(purchase_pk,ordinal)
);
CREATE INDEX IF NOT EXISTS idx_market_card_grants_card ON market_purchase_card_grants(canonical_card_id);

INSERT INTO market_catalog(product_key,name,description,category,product_kind,price,config,catalog_version,sort_order) VALUES
 ('white_10','Branqueamento de Capital','10 Cartas Limpas Brancas.','clean_cards','clean_white',1800,'{"white":10,"black":0}'::jsonb,'market-v1',10),
 ('white_25','Branco em Atacado','25 Cartas Limpas Brancas.','clean_cards','clean_white',4000,'{"white":25,"black":0}'::jsonb,'market-v1',20),
 ('white_50','Carga Branca','50 Cartas Limpas Brancas.','clean_cards','clean_white',7000,'{"white":50,"black":0}'::jsonb,'market-v1',30),
 ('black_10','Caixa Preta','10 Cartas Limpas Pretas.','clean_cards','clean_black',1800,'{"white":0,"black":10}'::jsonb,'market-v1',40),
 ('black_25','Dinheiro Preto','25 Cartas Limpas Pretas.','clean_cards','clean_black',4000,'{"white":0,"black":25}'::jsonb,'market-v1',50),
 ('black_50','Carga Pesada','50 Cartas Limpas Pretas.','clean_cards','clean_black',7000,'{"white":0,"black":50}'::jsonb,'market-v1',60),
 ('mixed_10','Faça Você Mesmo','10 brancas + 10 pretas.','clean_cards','clean_mixed',3200,'{"white":10,"black":10}'::jsonb,'market-v1',70),
 ('mixed_25','Caixa de Ideias Questionáveis','25 brancas + 25 pretas.','clean_cards','clean_mixed',7000,'{"white":25,"black":25}'::jsonb,'market-v1',80),
 ('mixed_50','Atacado da Criatividade','50 brancas + 50 pretas.','clean_cards','clean_mixed',12000,'{"white":50,"black":50}'::jsonb,'market-v1',90),
 ('pack_random_10','Pack Sem Criatividade','Até 10 Cartas de Jogador prontas e aleatórias.','card_pack','pack_random',5000,'{"quantity":10,"source":"pack_random"}'::jsonb,'market-v1',100),
 ('pack_best_world_3','Melhores Cartas do Mundo','3 Cartas Canônicas distintas de alto desempenho global.','card_pack','pack_best_world',15000,'{"quantity":3,"source":"pack_best_world","rankVersion":"best-world-v1"}'::jsonb,'market-v1',110)
ON CONFLICT(product_key) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,category=EXCLUDED.category,product_kind=EXCLUDED.product_kind,price=EXCLUDED.price,config=EXCLUDED.config,catalog_version=EXCLUDED.catalog_version,sort_order=EXCLUDED.sort_order,updated_at=now();
