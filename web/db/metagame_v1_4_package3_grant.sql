-- Cartaralho v1.4 — Pacote 3 (2/4): grant inicial e de transição.
CREATE OR REPLACE FUNCTION grant_starter_clean_cards(p_user_id BIGINT) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE v_white INT;v_black INT;
BEGIN
 INSERT INTO clean_card_wallets(user_id) VALUES(p_user_id) ON CONFLICT(user_id) DO NOTHING;
 INSERT INTO clean_card_ledger(user_id,card_type,amount,transaction_type,idempotency_key,reference_type,reference_id,metadata)
 VALUES(p_user_id,'white',20,'starter_grant','starter:clean:white:'||p_user_id,'user',p_user_id::text,jsonb_build_object('grantVersion','v1')) ON CONFLICT(idempotency_key) DO NOTHING;
 IF FOUND THEN UPDATE clean_card_wallets SET white_balance=white_balance+20,updated_at=now() WHERE user_id=p_user_id;END IF;
 INSERT INTO clean_card_ledger(user_id,card_type,amount,transaction_type,idempotency_key,reference_type,reference_id,metadata)
 VALUES(p_user_id,'black',20,'starter_grant','starter:clean:black:'||p_user_id,'user',p_user_id::text,jsonb_build_object('grantVersion','v1')) ON CONFLICT(idempotency_key) DO NOTHING;
 IF FOUND THEN UPDATE clean_card_wallets SET black_balance=black_balance+20,updated_at=now() WHERE user_id=p_user_id;END IF;
 SELECT white_balance,black_balance INTO v_white,v_black FROM clean_card_wallets WHERE user_id=p_user_id;
 RETURN jsonb_build_object('status','ok','whiteBalance',v_white,'blackBalance',v_black);
END;$$;
SELECT grant_starter_clean_cards(id) FROM users;
