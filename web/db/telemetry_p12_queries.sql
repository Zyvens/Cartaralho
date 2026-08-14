-- P12 — Queries operacionais de telemetria/economia. Somente leitura.
-- 1) Duração real por configuração e classe estimada.
SELECT points_to_win,participants_at_start,class_key,COUNT(*) matches,ROUND(AVG(duration_seconds)/60.0,1) avg_minutes,ROUND(percentile_cont(.5) WITHIN GROUP(ORDER BY duration_seconds)/60.0,1) median_minutes,ROUND(percentile_cont(.9) WITHIN GROUP(ORDER BY duration_seconds)/60.0,1) p90_minutes FROM match_telemetry WHERE finished_at IS NOT NULL AND duration_seconds>0 GROUP BY points_to_win,participants_at_start,class_key ORDER BY points_to_win,participants_at_start;
-- 2) Rejoin, disconnect e abandono.
SELECT COUNT(*) matches,SUM(disconnect_count) disconnects,SUM(rejoin_count) rejoins,SUM(abandon_count) abandons,ROUND(AVG(disconnect_count)::numeric,2) disconnects_per_match FROM match_telemetry WHERE started_at>=now()-interval '30 days';
-- 3) Moedas geradas/gastas por dia.
SELECT date_trunc('day',created_at) day,SUM(amount) FILTER(WHERE amount>0) generated,-SUM(amount) FILTER(WHERE amount<0) spent,SUM(amount) net FROM dirty_coin_ledger GROUP BY 1 ORDER BY 1 DESC;
-- 4) Moedas de recompensa por hora real de jogo.
WITH per_match AS(SELECT mt.room_code,mt.duration_seconds,COALESCE(SUM(l.amount) FILTER(WHERE l.amount>0),0) generated FROM match_telemetry mt LEFT JOIN dirty_coin_ledger l ON l.reference_type='match' AND l.reference_id=mt.room_code WHERE mt.finished_at IS NOT NULL AND mt.duration_seconds>0 AND mt.valid_for_rewards=true GROUP BY mt.room_code,mt.duration_seconds) SELECT COUNT(*) matches,ROUND(SUM(generated)*3600.0/NULLIF(SUM(duration_seconds),0),2) coins_per_hour FROM per_match;
-- 5) Distribuição atual de saldo.
SELECT COUNT(*) wallets,ROUND(percentile_cont(.25) WITHIN GROUP(ORDER BY balance),0) p25,ROUND(percentile_cont(.50) WITHIN GROUP(ORDER BY balance),0) median,ROUND(percentile_cont(.75) WITHIN GROUP(ORDER BY balance),0) p75,ROUND(percentile_cont(.90) WITHIN GROUP(ORDER BY balance),0) p90,MAX(balance) max_balance FROM dirty_coin_wallets;
-- 6) Tempo até primeira compra.
WITH first_purchase AS(SELECT user_id,MIN(created_at) first_at FROM market_purchases GROUP BY user_id) SELECT COUNT(*) buyers,ROUND(AVG(EXTRACT(EPOCH FROM(fp.first_at-u.created_at))/3600.0),1) avg_hours_to_first_purchase,ROUND(percentile_cont(.5) WITHIN GROUP(ORDER BY EXTRACT(EPOCH FROM(fp.first_at-u.created_at))/3600.0),1) median_hours FROM first_purchase fp JOIN users u ON u.id=fp.user_id;
-- 7) Gastos por categoria.
SELECT mc.category,COUNT(*) purchases,SUM(mp.price_paid) spent FROM market_purchases mp JOIN market_catalog mc ON mc.product_key=mp.product_key GROUP BY mc.category ORDER BY spent DESC;
-- 8) Novas Cartas Canônicas por hora de jogo.
WITH created AS(SELECT mt.room_code,mt.duration_seconds,COUNT(cc.id) cards FROM match_telemetry mt LEFT JOIN canonical_cards cc ON cc.origin_match_id=mt.room_code WHERE mt.finished_at IS NOT NULL AND mt.duration_seconds>0 GROUP BY mt.room_code,mt.duration_seconds) SELECT COUNT(*) matches,SUM(cards) cards,ROUND(SUM(cards)*3600.0/NULLIF(SUM(duration_seconds),0),2) cards_per_hour FROM created;
-- 9) Espólio: quota oferecida, usada e abandonada.
SELECT status,COUNT(*) entitlements,SUM(quota) offered,SUM(COALESCE(jsonb_array_length(claimed_card_ids),0)) claimed,SUM(quota-COALESCE(jsonb_array_length(claimed_card_ids),0)) unused FROM match_loot_entitlements GROUP BY status ORDER BY status;
-- 10) Buffs por partida/fase/resultado.
SELECT buff_key,phase,status,COUNT(*) uses,COUNT(DISTINCT room_code) matches,ROUND(COUNT(*)::numeric/NULLIF(COUNT(DISTINCT room_code),0),2) uses_per_match FROM buff_activations GROUP BY buff_key,phase,status ORDER BY uses DESC,buff_key;
-- 11) Rejeições de Buff P12.
SELECT source_key buff_key,phase,status,COUNT(*) rejections FROM operational_events WHERE event_type='buff_rejected' GROUP BY source_key,phase,status ORDER BY rejections DESC;
-- 12) Fechamento do ledger.
SELECT w.user_id,w.balance,COALESCE(SUM(l.amount),0) ledger_balance,w.balance-COALESCE(SUM(l.amount),0) delta FROM dirty_coin_wallets w LEFT JOIN dirty_coin_ledger l ON l.user_id=w.user_id GROUP BY w.user_id,w.balance HAVING w.balance<>COALESCE(SUM(l.amount),0) ORDER BY ABS(w.balance-COALESCE(SUM(l.amount),0)) DESC;
