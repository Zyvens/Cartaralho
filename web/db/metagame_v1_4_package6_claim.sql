-- Cartaralho v1.4 — Pacote 6 (3/3): claim atômico/idempotente.
CREATE OR REPLACE FUNCTION claim_match_loot(
  p_user_id BIGINT,
  p_match_id TEXT,
  p_claim_id TEXT,
  p_card_ids JSONB
) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_ent match_loot_entitlements%ROWTYPE;
  v_selected_count INT := 0;
  v_invalid_count INT := 0;
  v_card_text TEXT;
  v_card_id BIGINT;
  v_source_user_id BIGINT;
  v_display_text TEXT;
  v_card_type TEXT;
  v_legacy_id BIGINT;
  v_ownership_id BIGINT;
  v_granted JSONB := '[]'::jsonb;
  v_skipped JSONB := '[]'::jsonb;
BEGIN
  IF p_user_id IS NULL OR length(btrim(COALESCE(p_match_id,'')))=0 THEN
    RETURN jsonb_build_object('status','invalid_request');
  END IF;
  IF length(btrim(COALESCE(p_claim_id,'')))<8 THEN
    RETURN jsonb_build_object('status','invalid_idempotency_key');
  END IF;
  IF p_card_ids IS NULL OR jsonb_typeof(p_card_ids)<>'array' THEN
    RETURN jsonb_build_object('status','invalid_selection');
  END IF;

  SELECT * INTO v_ent
  FROM match_loot_entitlements
  WHERE match_id=p_match_id AND user_id=p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN RETURN jsonb_build_object('status','not_found'); END IF;
  IF v_ent.status='empty' THEN RETURN jsonb_build_object('status','empty','quota',0); END IF;
  IF v_ent.status='claimed' THEN
    IF v_ent.claim_id=p_claim_id THEN
      RETURN jsonb_build_object('status','ok','replayed',true,'quota',v_ent.quota,'granted',v_ent.claimed_card_ids);
    END IF;
    RETURN jsonb_build_object('status','already_claimed','quota',v_ent.quota,'granted',v_ent.claimed_card_ids);
  END IF;

  SELECT COUNT(DISTINCT value)::int,
         COUNT(*) FILTER(WHERE value !~ '^[0-9]+$')::int
  INTO v_selected_count,v_invalid_count
  FROM jsonb_array_elements_text(p_card_ids);

  IF v_invalid_count>0 THEN RETURN jsonb_build_object('status','invalid_selection'); END IF;
  IF v_selected_count>v_ent.quota THEN
    RETURN jsonb_build_object('status','quota_exceeded','quota',v_ent.quota,'selected',v_selected_count);
  END IF;

  SELECT COUNT(*)::int INTO v_invalid_count
  FROM(
    SELECT DISTINCT value::bigint card_id FROM jsonb_array_elements_text(p_card_ids)
  )s
  WHERE NOT EXISTS(
    SELECT 1 FROM match_loot_eligibility e
    WHERE e.match_id=p_match_id AND e.user_id=p_user_id AND e.canonical_card_id=s.card_id
  );
  IF v_invalid_count>0 THEN RETURN jsonb_build_object('status','ineligible_card'); END IF;

  FOR v_card_text IN SELECT DISTINCT value FROM jsonb_array_elements_text(p_card_ids)
  LOOP
    v_card_id:=v_card_text::bigint;

    IF EXISTS(SELECT 1 FROM canonical_card_ownerships WHERE user_id=p_user_id AND canonical_card_id=v_card_id) THEN
      v_skipped:=v_skipped||jsonb_build_array(v_card_id);
      CONTINUE;
    END IF;

    SELECT e.source_user_id,cc.display_text,cc.card_type
    INTO v_source_user_id,v_display_text,v_card_type
    FROM match_loot_eligibility e
    JOIN canonical_cards cc ON cc.id=e.canonical_card_id
    WHERE e.match_id=p_match_id AND e.user_id=p_user_id AND e.canonical_card_id=v_card_id;

    INSERT INTO user_cards(user_id,type,text,owned,is_player_card)
    VALUES(p_user_id,CASE WHEN v_card_type='white' THEN 'whiteCards' ELSE 'blackCards' END,v_display_text,true,true)
    ON CONFLICT(user_id,type,text) DO UPDATE SET owned=true,is_player_card=true,updated_at=now()
    RETURNING id INTO v_legacy_id;

    v_ownership_id:=NULL;
    INSERT INTO canonical_card_ownerships(user_id,canonical_card_id,legacy_user_card_id,acquisition_source,source_user_id,source_match_id)
    VALUES(p_user_id,v_card_id,v_legacy_id,'match_loot',v_source_user_id,p_match_id)
    ON CONFLICT(user_id,canonical_card_id) DO NOTHING
    RETURNING id INTO v_ownership_id;

    IF v_ownership_id IS NULL THEN
      v_skipped:=v_skipped||jsonb_build_array(v_card_id);
      CONTINUE;
    END IF;

    INSERT INTO match_loot_claims(match_id,user_id,canonical_card_id,claim_id,source_user_id)
    VALUES(p_match_id,p_user_id,v_card_id,p_claim_id,v_source_user_id)
    ON CONFLICT DO NOTHING;
    v_granted:=v_granted||jsonb_build_array(v_card_id);
  END LOOP;

  UPDATE match_loot_entitlements
  SET status='claimed',claim_id=p_claim_id,claimed_card_ids=v_granted,claimed_at=now()
  WHERE match_id=p_match_id AND user_id=p_user_id;

  RETURN jsonb_build_object('status','ok','replayed',false,'quota',v_ent.quota,'granted',v_granted,'skippedAlreadyOwned',v_skipped);
END;$$;
