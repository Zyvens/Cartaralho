-- Cartaralho metagame v1.4 — Pacote 3
-- Cartas Limpas e Criação Paga
-- Aditivo/idempotente. Não implementa packs, Mercado Paralelo, Espólio ou tiers.

ALTER TABLE dirty_coin_ledger DROP CONSTRAINT IF EXISTS dirty_coin_ledger_transaction_type_check;
ALTER TABLE dirty_coin_ledger ADD CONSTRAINT dirty_coin_ledger_transaction_type_check CHECK(transaction_type IN(
  'starter_grant','match_placement','match_survival','match_consolation','mission_reward','clean_card_purchase','adjustment'
));

CREATE TABLE IF NOT EXISTS clean_card_wallets (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  white_balance INT NOT NULL DEFAULT 0 CHECK(white_balance >= 0),
  black_balance INT NOT NULL DEFAULT 0 CHECK(black_balance >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clean_card_ledger (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL CHECK(card_type IN('white','black')),
  amount INT NOT NULL,
  transaction_type TEXT NOT NULL CHECK(transaction_type IN('starter_grant','purchase','creation_consume','adjustment')),
  idempotency_key TEXT NOT NULL UNIQUE,
  reference_type TEXT,
  reference_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_clean_card_ledger_user_created ON clean_card_ledger(user_id,created_at DESC);

CREATE OR REPLACE FUNCTION grant_starter_clean_cards(p_user_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_white INT;
  v_black INT;
BEGIN
  INSERT INTO clean_card_wallets(user_id) VALUES(p_user_id)
  ON CONFLICT(user_id) DO NOTHING;

  INSERT INTO clean_card_ledger(user_id,card_type,amount,transaction_type,idempotency_key,reference_type,reference_id,metadata)
  VALUES(p_user_id,'white',20,'starter_grant','starter:clean:white:'||p_user_id,'user',p_user_id::text,jsonb_build_object('grantVersion','v1'))
  ON CONFLICT(idempotency_key) DO NOTHING;
  IF FOUND THEN
    UPDATE clean_card_wallets SET white_balance=white_balance+20,updated_at=now() WHERE user_id=p_user_id;
  END IF;

  INSERT INTO clean_card_ledger(user_id,card_type,amount,transaction_type,idempotency_key,reference_type,reference_id,metadata)
  VALUES(p_user_id,'black',20,'starter_grant','starter:clean:black:'||p_user_id,'user',p_user_id::text,jsonb_build_object('grantVersion','v1'))
  ON CONFLICT(idempotency_key) DO NOTHING;
  IF FOUND THEN
    UPDATE clean_card_wallets SET black_balance=black_balance+20,updated_at=now() WHERE user_id=p_user_id;
  END IF;

  SELECT white_balance,black_balance INTO v_white,v_black FROM clean_card_wallets WHERE user_id=p_user_id;
  RETURN jsonb_build_object('status','ok','whiteBalance',v_white,'blackBalance',v_black);
END;
$$;

CREATE OR REPLACE FUNCTION purchase_clean_card(p_user_id BIGINT,p_card_type TEXT,p_purchase_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_key TEXT;
  v_dirty BIGINT;
  v_white INT;
  v_black INT;
BEGIN
  IF p_card_type NOT IN('white','black') THEN
    RETURN jsonb_build_object('status','invalid_type');
  END IF;
  IF length(btrim(COALESCE(p_purchase_id,''))) < 8 THEN
    RETURN jsonb_build_object('status','invalid_idempotency_key');
  END IF;

  PERFORM grant_starter_clean_cards(p_user_id);
  v_key := 'purchase:clean:'||p_user_id||':'||btrim(p_purchase_id);

  IF EXISTS(SELECT 1 FROM clean_card_ledger WHERE idempotency_key=v_key) THEN
    SELECT balance INTO v_dirty FROM dirty_coin_wallets WHERE user_id=p_user_id;
    SELECT white_balance,black_balance INTO v_white,v_black FROM clean_card_wallets WHERE user_id=p_user_id;
    RETURN jsonb_build_object('status','ok','replayed',true,'price',200,'dirtyBalance',COALESCE(v_dirty,0),'whiteBalance',v_white,'blackBalance',v_black);
  END IF;

  INSERT INTO dirty_coin_wallets(user_id,balance) VALUES(p_user_id,0) ON CONFLICT(user_id) DO NOTHING;
  PERFORM 1 FROM dirty_coin_wallets WHERE user_id=p_user_id FOR UPDATE;
  SELECT balance INTO v_dirty FROM dirty_coin_wallets WHERE user_id=p_user_id;
  IF COALESCE(v_dirty,0) < 200 THEN
    SELECT white_balance,black_balance INTO v_white,v_black FROM clean_card_wallets WHERE user_id=p_user_id;
    RETURN jsonb_build_object('status','insufficient_dirty_coins','price',200,'dirtyBalance',COALESCE(v_dirty,0),'whiteBalance',v_white,'blackBalance',v_black);
  END IF;

  INSERT INTO dirty_coin_ledger(user_id,amount,transaction_type,idempotency_key,reference_type,reference_id,metadata)
  VALUES(p_user_id,-200,'clean_card_purchase',v_key,'clean_card',p_card_type,jsonb_build_object('cardType',p_card_type,'unitPrice',200));
  UPDATE dirty_coin_wallets SET balance=balance-200,updated_at=now() WHERE user_id=p_user_id;

  INSERT INTO clean_card_ledger(user_id,card_type,amount,transaction_type,idempotency_key,reference_type,reference_id,metadata)
  VALUES(p_user_id,p_card_type,1,'purchase',v_key,'purchase',btrim(p_purchase_id),jsonb_build_object('dirtyCoinCost',200));
  IF p_card_type='white' THEN
    UPDATE clean_card_wallets SET white_balance=white_balance+1,updated_at=now() WHERE user_id=p_user_id;
  ELSE
    UPDATE clean_card_wallets SET black_balance=black_balance+1,updated_at=now() WHERE user_id=p_user_id;
  END IF;

  SELECT balance INTO v_dirty FROM dirty_coin_wallets WHERE user_id=p_user_id;
  SELECT white_balance,black_balance INTO v_white,v_black FROM clean_card_wallets WHERE user_id=p_user_id;
  RETURN jsonb_build_object('status','ok','replayed',false,'price',200,'dirtyBalance',v_dirty,'whiteBalance',v_white,'blackBalance',v_black);
END;
$$;

CREATE OR REPLACE FUNCTION create_paid_player_card(
  p_user_id BIGINT,
  p_card_type TEXT,
  p_normalized_text TEXT,
  p_display_text TEXT,
  p_match_id TEXT,
  p_creator_name TEXT,
  p_creation_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_key TEXT;
  v_card_id BIGINT;
  v_origin_match TEXT;
  v_origin_uncertain BOOLEAN;
  v_kind TEXT;
  v_legacy_id BIGINT;
  v_white INT;
  v_black INT;
  v_legacy_type TEXT;
  v_text_key TEXT;
BEGIN
  IF p_card_type NOT IN('white','black') THEN RETURN jsonb_build_object('status','invalid_type'); END IF;
  IF length(btrim(COALESCE(p_creation_id,''))) < 8 THEN RETURN jsonb_build_object('status','invalid_idempotency_key'); END IF;
  IF length(btrim(COALESCE(p_normalized_text,'')))=0 OR length(btrim(COALESCE(p_display_text,'')))=0 THEN RETURN jsonb_build_object('status','invalid_text'); END IF;

  PERFORM grant_starter_clean_cards(p_user_id);
  PERFORM 1 FROM clean_card_wallets WHERE user_id=p_user_id FOR UPDATE;
  v_key := 'creation:'||p_user_id||':'||btrim(p_creation_id)||':consume-clean-card';

  SELECT NULLIF(reference_id,'')::BIGINT INTO v_card_id FROM clean_card_ledger WHERE idempotency_key=v_key LIMIT 1;
  IF v_card_id IS NOT NULL THEN
    SELECT white_balance,black_balance INTO v_white,v_black FROM clean_card_wallets WHERE user_id=p_user_id;
    RETURN jsonb_build_object('status','created','replayed',true,'canonicalCardId',v_card_id,'whiteBalance',v_white,'blackBalance',v_black);
  END IF;

  SELECT cc.id INTO v_card_id
  FROM canonical_cards cc
  WHERE cc.card_type=p_card_type AND cc.normalized_text=p_normalized_text
  LIMIT 1;
  IF v_card_id IS NOT NULL AND EXISTS(
    SELECT 1 FROM canonical_card_ownerships WHERE user_id=p_user_id AND canonical_card_id=v_card_id
  ) THEN
    SELECT white_balance,black_balance INTO v_white,v_black FROM clean_card_wallets WHERE user_id=p_user_id;
    RETURN jsonb_build_object('status','duplicate_owned','canonicalCardId',v_card_id,'whiteBalance',v_white,'blackBalance',v_black);
  END IF;

  SELECT white_balance,black_balance INTO v_white,v_black FROM clean_card_wallets WHERE user_id=p_user_id;
  IF (p_card_type='white' AND v_white<1) OR (p_card_type='black' AND v_black<1) THEN
    RETURN jsonb_build_object('status','insufficient_clean_cards','whiteBalance',v_white,'blackBalance',v_black);
  END IF;

  INSERT INTO canonical_cards(card_type,normalized_text,display_text,origin_match_id,origin_uncertain)
  VALUES(p_card_type,p_normalized_text,p_display_text,btrim(p_match_id),false)
  ON CONFLICT(card_type,normalized_text) DO UPDATE SET normalized_text=canonical_cards.normalized_text
  RETURNING id,origin_match_id,origin_uncertain INTO v_card_id,v_origin_match,v_origin_uncertain;

  IF EXISTS(SELECT 1 FROM canonical_card_ownerships WHERE user_id=p_user_id AND canonical_card_id=v_card_id) THEN
    SELECT white_balance,black_balance INTO v_white,v_black FROM clean_card_wallets WHERE user_id=p_user_id;
    RETURN jsonb_build_object('status','duplicate_owned','canonicalCardId',v_card_id,'whiteBalance',v_white,'blackBalance',v_black);
  END IF;

  v_kind := CASE WHEN NOT COALESCE(v_origin_uncertain,true) AND COALESCE(v_origin_match,'')=COALESCE(btrim(p_match_id),'') THEN 'original' ELSE 'independent' END;
  v_legacy_type := CASE p_card_type WHEN 'white' THEN 'whiteCards' ELSE 'blackCards' END;

  INSERT INTO user_cards(user_id,type,text,owned,is_player_card)
  VALUES(p_user_id,v_legacy_type,p_display_text,true,true)
  ON CONFLICT(user_id,type,text) DO UPDATE SET owned=true,is_player_card=true,updated_at=now()
  RETURNING id INTO v_legacy_id;

  INSERT INTO canonical_card_ownerships(user_id,canonical_card_id,legacy_user_card_id,acquisition_source,source_match_id)
  VALUES(p_user_id,v_card_id,v_legacy_id,CASE v_kind WHEN 'original' THEN 'created_original' ELSE 'created_independent' END,btrim(p_match_id))
  ON CONFLICT(user_id,canonical_card_id) DO NOTHING;

  INSERT INTO canonical_card_creation_events(canonical_card_id,user_id,match_id,creation_kind)
  VALUES(v_card_id,p_user_id,btrim(p_match_id),v_kind)
  ON CONFLICT DO NOTHING;

  IF v_kind='original' THEN
    INSERT INTO canonical_card_authors(canonical_card_id,user_id,author_name_snapshot)
    VALUES(v_card_id,p_user_id,NULLIF(btrim(COALESCE(p_creator_name,'')),''))
    ON CONFLICT(canonical_card_id,user_id) DO NOTHING;
    v_text_key := lower(regexp_replace(btrim(p_display_text),'[[:space:]]+',' ','g'));
    INSERT INTO card_origins(type,text_key,text,creator_user_id,creator_name_snapshot,first_room_code)
    VALUES(v_legacy_type,v_text_key,p_display_text,p_user_id,NULLIF(btrim(COALESCE(p_creator_name,'')),''),btrim(p_match_id))
    ON CONFLICT(type,text_key) DO NOTHING;
  END IF;

  INSERT INTO clean_card_ledger(user_id,card_type,amount,transaction_type,idempotency_key,reference_type,reference_id,metadata)
  VALUES(p_user_id,p_card_type,-1,'creation_consume',v_key,'canonical_card',v_card_id::text,jsonb_build_object('matchId',btrim(p_match_id),'creationKind',v_kind));

  IF p_card_type='white' THEN
    UPDATE clean_card_wallets SET white_balance=white_balance-1,updated_at=now() WHERE user_id=p_user_id;
  ELSE
    UPDATE clean_card_wallets SET black_balance=black_balance-1,updated_at=now() WHERE user_id=p_user_id;
  END IF;

  SELECT white_balance,black_balance INTO v_white,v_black FROM clean_card_wallets WHERE user_id=p_user_id;
  RETURN jsonb_build_object('status','created','replayed',false,'creationKind',v_kind,'canonicalCardId',v_card_id,'whiteBalance',v_white,'blackBalance',v_black);
END;
$$;

-- Grant de transição para contas existentes. Idempotente por user_id + chave do ledger.
SELECT grant_starter_clean_cards(id) FROM users;
