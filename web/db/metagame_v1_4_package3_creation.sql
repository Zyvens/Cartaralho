-- Cartaralho v1.4 — Pacote 3 (4/4): criação transacional de Carta Suja.
CREATE OR REPLACE FUNCTION create_paid_player_card(p_user_id BIGINT,p_card_type TEXT,p_normalized_text TEXT,p_display_text TEXT,p_match_id TEXT,p_creator_name TEXT,p_creation_id TEXT) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE k TEXT;cid BIGINT;oid BIGINT;lid BIGINT;om TEXT;ou BOOLEAN;kind TEXT;lt TEXT;tk TEXT;w INT;b INT;
BEGIN
 IF p_card_type NOT IN('white','black') OR length(btrim(COALESCE(p_normalized_text,'')))=0 THEN RETURN jsonb_build_object('status','invalid_text');END IF;
 IF length(btrim(COALESCE(p_creation_id,'')))<8 THEN RETURN jsonb_build_object('status','invalid_idempotency_key');END IF;
 PERFORM grant_starter_clean_cards(p_user_id);
 PERFORM 1 FROM clean_card_wallets WHERE user_id=p_user_id FOR UPDATE;
 k:='creation:'||p_user_id||':'||btrim(p_creation_id)||':consume-clean-card';
 SELECT NULLIF(reference_id,'')::BIGINT INTO cid FROM clean_card_ledger WHERE idempotency_key=k LIMIT 1;
 IF cid IS NOT NULL THEN SELECT white_balance,black_balance INTO w,b FROM clean_card_wallets WHERE user_id=p_user_id;RETURN jsonb_build_object('status','created','replayed',true,'canonicalCardId',cid,'whiteBalance',w,'blackBalance',b);END IF;
 SELECT c.id INTO cid FROM canonical_cards c WHERE c.card_type=p_card_type AND c.normalized_text=p_normalized_text LIMIT 1;
 IF cid IS NOT NULL AND EXISTS(SELECT 1 FROM canonical_card_ownerships WHERE user_id=p_user_id AND canonical_card_id=cid) THEN RETURN jsonb_build_object('status','duplicate_owned','canonicalCardId',cid);END IF;
 SELECT white_balance,black_balance INTO w,b FROM clean_card_wallets WHERE user_id=p_user_id;
 IF (p_card_type='white' AND w<1) OR (p_card_type='black' AND b<1) THEN RETURN jsonb_build_object('status','insufficient_clean_cards','whiteBalance',w,'blackBalance',b);END IF;
 INSERT INTO canonical_cards(card_type,normalized_text,display_text,origin_match_id,origin_uncertain) VALUES(p_card_type,p_normalized_text,p_display_text,btrim(p_match_id),false)
 ON CONFLICT(card_type,normalized_text) DO UPDATE SET normalized_text=canonical_cards.normalized_text RETURNING id,origin_match_id,origin_uncertain INTO cid,om,ou;
 IF EXISTS(SELECT 1 FROM canonical_card_ownerships WHERE user_id=p_user_id AND canonical_card_id=cid) THEN RETURN jsonb_build_object('status','duplicate_owned','canonicalCardId',cid);END IF;
 kind:=CASE WHEN NOT COALESCE(ou,true) AND COALESCE(om,'')=COALESCE(btrim(p_match_id),'') THEN 'original' ELSE 'independent' END;
 lt:=CASE p_card_type WHEN 'white' THEN 'whiteCards' ELSE 'blackCards' END;
 BEGIN
  INSERT INTO clean_card_ledger(user_id,card_type,amount,transaction_type,idempotency_key,reference_type,reference_id,metadata) VALUES(p_user_id,p_card_type,-1,'creation_consume',k,'canonical_card',cid::text,jsonb_build_object('matchId',p_match_id,'creationKind',kind));
  INSERT INTO canonical_card_ownerships(user_id,canonical_card_id,acquisition_source,source_match_id) VALUES(p_user_id,cid,CASE kind WHEN 'original' THEN 'created_original' ELSE 'created_independent' END,btrim(p_match_id)) ON CONFLICT(user_id,canonical_card_id) DO NOTHING RETURNING id INTO oid;
  IF oid IS NULL THEN RAISE EXCEPTION USING ERRCODE='23505';END IF;
  IF p_card_type='white' THEN UPDATE clean_card_wallets SET white_balance=white_balance-1,updated_at=now() WHERE user_id=p_user_id;
  ELSE UPDATE clean_card_wallets SET black_balance=black_balance-1,updated_at=now() WHERE user_id=p_user_id;END IF;
  INSERT INTO user_cards(user_id,type,text,owned,is_player_card) VALUES(p_user_id,lt,p_display_text,true,true) ON CONFLICT(user_id,type,text) DO UPDATE SET owned=true,is_player_card=true,updated_at=now() RETURNING id INTO lid;
  UPDATE canonical_card_ownerships SET legacy_user_card_id=COALESCE(legacy_user_card_id,lid),updated_at=now() WHERE id=oid;
  INSERT INTO canonical_card_creation_events(canonical_card_id,user_id,match_id,creation_kind) VALUES(cid,p_user_id,btrim(p_match_id),kind) ON CONFLICT DO NOTHING;
  IF kind='original' THEN
   INSERT INTO canonical_card_authors(canonical_card_id,user_id,author_name_snapshot) VALUES(cid,p_user_id,NULLIF(btrim(COALESCE(p_creator_name,'')),'')) ON CONFLICT DO NOTHING;
   tk:=lower(regexp_replace(btrim(p_display_text),'[[:space:]]+',' ','g'));
   INSERT INTO card_origins(type,text_key,text,creator_user_id,creator_name_snapshot,first_room_code) VALUES(lt,tk,p_display_text,p_user_id,NULLIF(btrim(COALESCE(p_creator_name,'')),''),btrim(p_match_id)) ON CONFLICT(type,text_key) DO NOTHING;
  END IF;
 EXCEPTION WHEN unique_violation THEN
  IF EXISTS(SELECT 1 FROM clean_card_ledger WHERE idempotency_key=k) THEN SELECT white_balance,black_balance INTO w,b FROM clean_card_wallets WHERE user_id=p_user_id;RETURN jsonb_build_object('status','created','replayed',true,'canonicalCardId',cid,'whiteBalance',w,'blackBalance',b);END IF;
  RETURN jsonb_build_object('status','duplicate_owned','canonicalCardId',cid);
 END;
 SELECT white_balance,black_balance INTO w,b FROM clean_card_wallets WHERE user_id=p_user_id;
 RETURN jsonb_build_object('status','created','replayed',false,'creationKind',kind,'canonicalCardId',cid,'whiteBalance',w,'blackBalance',b);
END;$$;
