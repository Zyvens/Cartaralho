-- Cartaralho P18 — Entitlements exclusivos da conta VitorIvens.
-- Idempotente; não cria itens vendáveis no Mercado.
ALTER TABLE special_entitlements DROP CONSTRAINT IF EXISTS special_entitlements_entitlement_type_check;
ALTER TABLE special_entitlements ADD CONSTRAINT special_entitlements_entitlement_type_check CHECK(entitlement_type IN('title','frame'));

INSERT INTO special_entitlements(user_id,entitlement_key,entitlement_type,source_type,metadata)
SELECT id,'o-criador','title','admin',jsonb_build_object('displayName','O Criador','rarity','celestial','exclusive',true)
FROM users WHERE lower(username)=lower('VitorIvens')
ON CONFLICT(user_id,entitlement_key) DO UPDATE SET metadata=EXCLUDED.metadata;

INSERT INTO special_entitlements(user_id,entitlement_key,entitlement_type,source_type,metadata)
SELECT id,'genese-celestial','frame','admin',jsonb_build_object('displayName','Gênese','rarity','celestial','exclusive',true)
FROM users WHERE lower(username)=lower('VitorIvens')
ON CONFLICT(user_id,entitlement_key) DO UPDATE SET metadata=EXCLUDED.metadata;

UPDATE users SET equipped_title_key='o-criador',equipped_frame_key='genese-celestial'
WHERE lower(username)=lower('VitorIvens');
