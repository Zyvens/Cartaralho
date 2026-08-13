-- Cartaralho v1.4 — Pacote 3 (3/4): compra avulsa de Carta Limpa por 200 Moedas Sujas.
CREATE OR REPLACE FUNCTION purchase_clean_card(p_user_id BIGINT,p_card_type TEXT,p_purchase_id TEXT) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE k TEXT;d BIGINT;w INT;b INT;r BOOLEAN:=false;
BEGIN
 IF p_card_type NOT IN('white','black') THEN RETURN jsonb_build_object('status','invalid_type');END IF;
 PERFORM grant_starter_clean_cards(p_user_id);
 k:='purchase:clean:'||p_user_id||':'||btrim(COALESCE(p_purchase_id,''));
 IF length(btrim(COALESCE(p_purchase_id,'')))<8 THEN RETURN jsonb_build_object('status','invalid_idempotency_key');END IF;
 IF EXISTS(SELECT 1 FROM clean_card_ledger WHERE idempotency_key=k) THEN r:=true;
 ELSE
  BEGIN
   UPDATE dirty_coin_wallets SET balance=balance-200,updated_at=now() WHERE user_id=p_user_id AND balance>=200 RETURNING balance INTO d;
   IF NOT FOUND THEN RETURN jsonb_build_object('status','insufficient_dirty_coins','price',200);END IF;
   INSERT INTO dirty_coin_ledger(user_id,amount,transaction_type,idempotency_key,reference_type,reference_id) VALUES(p_user_id,-200,'clean_card_purchase',k,'clean_card',p_card_type);
   INSERT INTO clean_card_ledger(user_id,card_type,amount,transaction_type,idempotency_key,reference_type,reference_id) VALUES(p_user_id,p_card_type,1,'purchase',k,'purchase',p_purchase_id);
   IF p_card_type='white' THEN UPDATE clean_card_wallets SET white_balance=white_balance+1,updated_at=now() WHERE user_id=p_user_id;
   ELSE UPDATE clean_card_wallets SET black_balance=black_balance+1,updated_at=now() WHERE user_id=p_user_id;END IF;
  EXCEPTION WHEN unique_violation THEN r:=true;
  END;
 END IF;
 SELECT balance INTO d FROM dirty_coin_wallets WHERE user_id=p_user_id;
 SELECT white_balance,black_balance INTO w,b FROM clean_card_wallets WHERE user_id=p_user_id;
 RETURN jsonb_build_object('status','ok','replayed',r,'dirtyBalance',d,'whiteBalance',w,'blackBalance',b,'price',200);
END;$$;
