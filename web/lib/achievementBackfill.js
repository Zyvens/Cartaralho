'use strict';
const{sql}=require('./db');
const uid=v=>Number(v)||0;

async function sync(userId){
 const id=uid(userId);if(!id)return;
 await sql`INSERT INTO achievement_events(event_id,event_key,user_id,source_key,metadata,occurred_at)
 SELECT 'p19:market:'||mp.id,'marketplace_purchase',mp.user_id,mp.product_key,jsonb_build_object('pricePaid',mp.price_paid,'productName',mp.product_name),mp.created_at
 FROM market_purchases mp WHERE mp.user_id=${id}
 ON CONFLICT(event_id) DO NOTHING`;
 await sql`INSERT INTO achievement_events(event_id,event_key,user_id,source_key,metadata,occurred_at)
 SELECT 'p19:recycle:'||b.id||':'||g.n,'card_recycling',b.user_id,'recycling',jsonb_build_object('batchId',b.id,'ordinal',g.n,'batchSize',b.card_count,'batchReward',b.reward),b.created_at
 FROM card_recycling_batches b CROSS JOIN LATERAL generate_series(1,b.card_count) g(n)
 WHERE b.user_id=${id}
 ON CONFLICT(event_id) DO NOTHING`;
 await sql`INSERT INTO achievement_events(event_id,event_key,user_id,match_id,round_number,source_key,metadata,occurred_at)
 SELECT 'p19:double-gap:'||mr.room_code||':'||mr.round_number||':'||${id},'double_gap_win',${id},mr.room_code,mr.round_number,'black_card',jsonb_build_object('gapCount',regexp_count(mr.black_card,'_+')),now()
 FROM match_rounds mr
 WHERE COALESCE(mr.scoring_user_id,mr.winner_user_id)=${id} AND regexp_count(COALESCE(mr.black_card,''),'_+')=2
 ON CONFLICT(event_id) DO NOTHING`;
}
module.exports={sync};
