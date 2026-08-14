-- Cartaralho v1.4 — Pacote 6 (2/3): congelamento idempotente do Espólio por partida.
CREATE OR REPLACE FUNCTION settle_match_loot(
  p_match_id TEXT,
  p_valid BOOLEAN,
  p_reward_engine_version TEXT,
  p_effective_players NUMERIC,
  p_effort_index NUMERIC
) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_inserted BOOLEAN := false;
  v_entitlements INT := 0;
  v_candidates INT := 0;
BEGIN
  IF length(btrim(COALESCE(p_match_id,'')))=0 THEN
    RETURN jsonb_build_object('status','invalid_match');
  END IF;

  INSERT INTO match_loot_snapshots(match_id,reward_engine_version,effective_players,effort_index,valid_for_loot,snapshot)
  VALUES(
    p_match_id,
    COALESCE(NULLIF(p_reward_engine_version,''),'dirty-coins-v1'),
    GREATEST(0,COALESCE(p_effective_players,0)),
    GREATEST(0,COALESCE(p_effort_index,0)),
    COALESCE(p_valid,false),
    COALESCE((SELECT snapshot FROM match_reward_settlements WHERE room_code=p_match_id),'{}'::jsonb)
  )
  ON CONFLICT(match_id) DO NOTHING;
  v_inserted := FOUND;

  IF NOT v_inserted THEN
    SELECT COUNT(*)::int INTO v_entitlements FROM match_loot_entitlements WHERE match_id=p_match_id;
    SELECT COUNT(*)::int INTO v_candidates FROM match_loot_candidates WHERE match_id=p_match_id;
    RETURN jsonb_build_object('status','ok','replayed',true,'entitlements',v_entitlements,'candidates',v_candidates);
  END IF;

  IF NOT COALESCE(p_valid,false) THEN
    RETURN jsonb_build_object('status','ok','replayed',false,'validForLoot',false,'entitlements',0,'candidates',0);
  END IF;

  -- Cartas criadas legitimamente durante a partida por um usuário.
  INSERT INTO match_loot_candidates(match_id,canonical_card_id,source_user_id,source_name_snapshot,source_reason,first_round_number)
  SELECT p_match_id,e.canonical_card_id,e.user_id,COALESCE(u.display_name,a.author_name_snapshot,u.username,'Jogador'),'created',NULL
  FROM canonical_card_creation_events e
  LEFT JOIN users u ON u.id=e.user_id
  LEFT JOIN canonical_card_authors a ON a.canonical_card_id=e.canonical_card_id AND a.user_id=e.user_id
  WHERE e.match_id=p_match_id
    AND e.creation_kind IN('original','independent')
    AND e.user_id IS NOT NULL
    AND EXISTS(SELECT 1 FROM canonical_card_authors ca WHERE ca.canonical_card_id=e.canonical_card_id)
  ON CONFLICT DO NOTHING;

  -- Cartas pré-existentes só entram quando efetivamente apareceram em uma rodada válida.
  INSERT INTO match_loot_candidates(match_id,canonical_card_id,source_user_id,source_name_snapshot,source_reason,first_round_number)
  SELECT p_match_id,e.canonical_card_id,e.source_user_id,
         COALESCE(mp.nickname,u.display_name,u.username,'Jogador'),
         CASE e.event_type WHEN 'black_used' THEN 'black_used' ELSE 'white_revealed' END,
         MIN(e.round_number)
  FROM canonical_card_round_events e
  LEFT JOIN match_players mp ON mp.room_code=p_match_id AND mp.user_id=e.source_user_id
  LEFT JOIN users u ON u.id=e.source_user_id
  WHERE e.match_id=p_match_id
    AND e.event_type IN('white_revealed','black_used')
    AND e.source_user_id IS NOT NULL
    AND EXISTS(SELECT 1 FROM canonical_card_authors ca WHERE ca.canonical_card_id=e.canonical_card_id)
  GROUP BY e.canonical_card_id,e.source_user_id,mp.nickname,u.display_name,u.username,e.event_type
  ON CONFLICT DO NOTHING;

  SELECT COUNT(*)::int INTO v_candidates FROM match_loot_candidates WHERE match_id=p_match_id;

  INSERT INTO match_loot_entitlements(match_id,user_id,final_position,base_quota,effort_index,requested_quota,quota,eligible_count,status)
  SELECT p_match_id,mp.user_id,mp.final_position,
         CASE WHEN mp.final_position=1 THEN 10 WHEN mp.final_position=2 THEN 7 WHEN mp.final_position=3 THEN 5 ELSE 3 END,
         GREATEST(0,COALESCE(p_effort_index,0)),
         GREATEST(1,ROUND((CASE WHEN mp.final_position=1 THEN 10 WHEN mp.final_position=2 THEN 7 WHEN mp.final_position=3 THEN 5 ELSE 3 END)*GREATEST(0,COALESCE(p_effort_index,0))))::int,
         0,0,'pending'
  FROM match_players mp
  WHERE mp.room_code=p_match_id AND mp.user_id IS NOT NULL
  ON CONFLICT(match_id,user_id) DO NOTHING;

  -- Um único candidato por Carta Canônica para cada jogador. Uso real tem prioridade sobre mera criação.
  INSERT INTO match_loot_eligibility(match_id,user_id,canonical_card_id,source_user_id,source_name_snapshot,source_reason,first_round_number,snapshot)
  SELECT p_match_id,e.user_id,c.canonical_card_id,c.source_user_id,c.source_name_snapshot,c.source_reason,c.first_round_number,
         jsonb_build_object(
           'reach',COALESCE(s.reach_count,0),
           'adoptions',COALESCE(s.adoption_count,0),
           'presence',COALESCE(s.presence_count,0),
           'wins',COALESCE(s.global_wins,0),
           'legacyLevel',COALESCE(s.legacy_level,'nascente')
         )
  FROM match_loot_entitlements e
  JOIN LATERAL(
    SELECT DISTINCT ON(mc.canonical_card_id)
           mc.canonical_card_id,mc.source_user_id,mc.source_name_snapshot,mc.source_reason,mc.first_round_number
    FROM match_loot_candidates mc
    WHERE mc.match_id=p_match_id
      AND mc.source_user_id<>e.user_id
      AND NOT EXISTS(
        SELECT 1 FROM canonical_card_ownerships o
        WHERE o.user_id=e.user_id AND o.canonical_card_id=mc.canonical_card_id
      )
    ORDER BY mc.canonical_card_id,
             CASE mc.source_reason WHEN 'white_revealed' THEN 0 WHEN 'black_used' THEN 0 ELSE 1 END,
             mc.first_round_number NULLS LAST,
             mc.source_user_id
  ) c ON true
  LEFT JOIN canonical_card_stats s ON s.canonical_card_id=c.canonical_card_id
  WHERE e.match_id=p_match_id
  ON CONFLICT DO NOTHING;

  UPDATE match_loot_entitlements e
  SET eligible_count=x.n,
      quota=LEAST(e.requested_quota,x.n),
      status=CASE WHEN x.n=0 THEN 'empty' ELSE 'pending' END
  FROM(
    SELECT me.match_id,me.user_id,COUNT(l.canonical_card_id)::int n
    FROM match_loot_entitlements me
    LEFT JOIN match_loot_eligibility l ON l.match_id=me.match_id AND l.user_id=me.user_id
    WHERE me.match_id=p_match_id
    GROUP BY me.match_id,me.user_id
  )x
  WHERE e.match_id=x.match_id AND e.user_id=x.user_id;

  SELECT COUNT(*)::int INTO v_entitlements FROM match_loot_entitlements WHERE match_id=p_match_id;
  RETURN jsonb_build_object('status','ok','replayed',false,'validForLoot',true,'entitlements',v_entitlements,'candidates',v_candidates);
END;$$;
