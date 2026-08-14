-- Cartaralho v1.4 — Pacote 11: Cosméticos, Prestígio e Celestial.
-- Expand-only. Rollback funcional por COSMETICS_FEATURE_ENABLED=false; ownership/entitlements permanecem.

ALTER TABLE market_catalog DROP CONSTRAINT IF EXISTS market_catalog_category_check;
ALTER TABLE market_catalog ADD CONSTRAINT market_catalog_category_check CHECK(category IN('clean_cards','card_pack','buff','cosmetic'));
ALTER TABLE market_catalog DROP CONSTRAINT IF EXISTS market_catalog_product_kind_check;
ALTER TABLE market_catalog ADD CONSTRAINT market_catalog_product_kind_check CHECK(product_kind IN('clean_white','clean_black','clean_mixed','pack_random','pack_best_world','buff_item','cosmetic_frame','cosmetic_title'));

CREATE TABLE IF NOT EXISTS cosmetic_ownerships(
 user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 cosmetic_key TEXT NOT NULL REFERENCES market_catalog(product_key),
 cosmetic_type TEXT NOT NULL CHECK(cosmetic_type IN('frame','title')),
 acquisition_source TEXT NOT NULL CHECK(acquisition_source IN('purchase','admin_grant')),
 purchase_pk BIGINT REFERENCES market_purchases(id) ON DELETE SET NULL,
 acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,cosmetic_key)
);
CREATE INDEX IF NOT EXISTS idx_cosmetic_ownerships_user_type ON cosmetic_ownerships(user_id,cosmetic_type,acquired_at DESC);

CREATE TABLE IF NOT EXISTS prestige_snapshots(
 snapshot_key TEXT PRIMARY KEY,
 snapshot_type TEXT NOT NULL CHECK(snapshot_type IN('beta_participants')),
 frozen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS beta_participant_snapshot(
 snapshot_key TEXT NOT NULL REFERENCES prestige_snapshots(snapshot_key) ON DELETE RESTRICT,
 user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 source_match_id TEXT NOT NULL,
 captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(snapshot_key,user_id)
);

CREATE TABLE IF NOT EXISTS special_entitlements(
 user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 entitlement_key TEXT NOT NULL,
 entitlement_type TEXT NOT NULL CHECK(entitlement_type IN('title')),
 source_type TEXT NOT NULL CHECK(source_type IN('admin','beta_snapshot')),
 snapshot_key TEXT REFERENCES prestige_snapshots(snapshot_key) ON DELETE RESTRICT,
 metadata JSONB NOT NULL DEFAULT '{}',
 granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,entitlement_key)
);
CREATE INDEX IF NOT EXISTS idx_special_entitlements_user ON special_entitlements(user_id,entitlement_type,granted_at DESC);

-- Congela o conjunto real de participantes Beta somente na PRIMEIRA aplicação.
WITH freeze AS (
 INSERT INTO prestige_snapshots(snapshot_key,snapshot_type,metadata)
 VALUES('beta-v1-2026-08-14','beta_participants',jsonb_build_object('rule','participou de ao menos uma partida com valid_for_rewards=true','version','p11-v1'))
 ON CONFLICT(snapshot_key) DO NOTHING
 RETURNING snapshot_key
)
INSERT INTO beta_participant_snapshot(snapshot_key,user_id,source_match_id)
SELECT 'beta-v1-2026-08-14',x.user_id,x.room_code
FROM (
 SELECT DISTINCT ON(mp.user_id) mp.user_id,mp.room_code,mp.finished_at
 FROM match_players mp
 JOIN match_reward_settlements mrs ON mrs.room_code=mp.room_code AND mrs.valid_for_rewards=true
 WHERE mp.user_id IS NOT NULL
 ORDER BY mp.user_id,mp.finished_at,mp.room_code
) x
WHERE EXISTS(SELECT 1 FROM freeze)
ON CONFLICT(snapshot_key,user_id) DO NOTHING;

INSERT INTO special_entitlements(user_id,entitlement_key,entitlement_type,source_type,snapshot_key,metadata)
SELECT b.user_id,'betinha','title','beta_snapshot',b.snapshot_key,jsonb_build_object('sourceMatchId',b.source_match_id,'version','p11-v1')
FROM beta_participant_snapshot b
WHERE b.snapshot_key='beta-v1-2026-08-14'
ON CONFLICT(user_id,entitlement_key) DO NOTHING;

-- O Criador NÃO é semeado automaticamente. Deve existir somente por grant administrativo explícito por user_id.

INSERT INTO market_catalog(product_key,name,description,category,product_kind,price,config,catalog_version,enabled,sort_order) VALUES
 ('cosmetic_frame_fita_isolante','Fita Isolante Premium','Uma moldura artesanalmente suspeita para quem exige acabamento premium.','cosmetic','cosmetic_frame',25000,'{"cosmeticType":"frame","equipKey":"cosmetic-fita-isolante","rarity":"rare","icon":"🖤"}'::jsonb,'prestige-v1',true,400),
 ('cosmetic_frame_ouro_de_pobre','Ouro de Pobre','Brilha o suficiente para parecer caro de longe.','cosmetic','cosmetic_frame',40000,'{"cosmeticType":"frame","equipKey":"cosmetic-ouro-de-pobre","rarity":"superrare","icon":"✨"}'::jsonb,'prestige-v1',true,410),
 ('cosmetic_frame_neon_duvidoso','Neon de Procedência Duvidosa','Um contorno neon que provavelmente não passou por certificação nenhuma.','cosmetic','cosmetic_frame',55000,'{"cosmeticType":"frame","equipKey":"cosmetic-neon-duvidoso","rarity":"superrare","icon":"💡"}'::jsonb,'prestige-v1',true,420),
 ('cosmetic_frame_glitch_radioativo','Glitch Radioativo','Distorção digital controlada. Ou quase.','cosmetic','cosmetic_frame',75000,'{"cosmeticType":"frame","equipKey":"cosmetic-glitch-radioativo","rarity":"epic","icon":"☢️"}'::jsonb,'prestige-v1',true,430),
 ('cosmetic_frame_buraco_negro','Buraco Negro Fiscal','Uma moldura que absorve luz, bom senso e declarações.','cosmetic','cosmetic_frame',100000,'{"cosmeticType":"frame","equipKey":"cosmetic-buraco-negro","rarity":"legendary","icon":"⚫"}'::jsonb,'prestige-v1',true,440),
 ('cosmetic_frame_agiota','Moldura Agiota','Prestígio com juros compostos e cobrança visual imediata.','cosmetic','cosmetic_frame',150000,'{"cosmeticType":"frame","equipKey":"cosmetic-agiota","rarity":"legendary","icon":"💸"}'::jsonb,'prestige-v1',true,450),
 ('cosmetic_frame_lavagem_completa','Lavagem Completa','O ápice da higienização estética de patrimônio inexplicável.','cosmetic','cosmetic_frame',250000,'{"cosmeticType":"frame","equipKey":"cosmetic-lavagem-completa","rarity":"celestial","icon":"💎"}'::jsonb,'prestige-v1',true,460),
 ('cosmetic_title_cliente_preferencial','Cliente Preferencial','Você já gastou o suficiente para receber atendimento suspeitamente cordial.','cosmetic','cosmetic_title',20000,'{"cosmeticType":"title","equipKey":"cliente-preferencial","rarity":"rare","icon":"🛎️"}'::jsonb,'prestige-v1',true,500),
 ('cosmetic_title_lavador_moedinhas','Lavador de Moedinhas','Pequenas quantias, grandes princípios questionáveis.','cosmetic','cosmetic_title',30000,'{"cosmeticType":"title","equipKey":"lavador-de-moedinhas","rarity":"superrare","icon":"🫧"}'::jsonb,'prestige-v1',true,510),
 ('cosmetic_title_patrocinador_caos','Patrocinador do Caos','A confusão acontece. Você paga a conta.','cosmetic','cosmetic_title',45000,'{"cosmeticType":"title","equipKey":"patrocinador-do-caos","rarity":"epic","icon":"🎟️"}'::jsonb,'prestige-v1',true,520),
 ('cosmetic_title_dinheiro_talento','Dinheiro Não Compra Talento','Mas compra um título bem caro para compensar.','cosmetic','cosmetic_title',65000,'{"cosmeticType":"title","equipKey":"dinheiro-nao-compra-talento","rarity":"epic","icon":"🪙"}'::jsonb,'prestige-v1',true,530),
 ('cosmetic_title_herdeiro','Herdeiro do Cartaralho','Nasceu em berço de procedência duvidosa.','cosmetic','cosmetic_title',100000,'{"cosmeticType":"title","equipKey":"herdeiro-do-cartaralho","rarity":"legendary","icon":"👑"}'::jsonb,'prestige-v1',true,540),
 ('cosmetic_title_patrimonio','Patrimônio Inexplicável','O extrato não explica. O brilho também não.','cosmetic','cosmetic_title',200000,'{"cosmeticType":"title","equipKey":"patrimonio-inexplicavel","rarity":"celestial","icon":"🌌"}'::jsonb,'prestige-v1',true,550)
ON CONFLICT(product_key) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,category=EXCLUDED.category,product_kind=EXCLUDED.product_kind,price=EXCLUDED.price,config=EXCLUDED.config,catalog_version=EXCLUDED.catalog_version,enabled=EXCLUDED.enabled,sort_order=EXCLUDED.sort_order,updated_at=now();
