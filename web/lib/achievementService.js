'use strict';
const crypto=require('crypto');
const{sql}=require('./db');
const defs=require('./achievementDefinitions');
const enabled=()=>process.env.ACHIEVEMENTS_V2_ENABLED!=='false';
const n=x=>Number(x)||0;

async function syncCanonicalEvents(userId){
 if(!enabled())return;
 const id=n(userId);if(!id)return;
 await sql`INSERT INTO achievement_events(event_id,event_key,user_id,match_id,round_number,related_user_id,source_key,metadata,occurred_at)
 SELECT 'p10:buff:'||ba.activation_id,'buff_resolved',ba.user_id,ba.room_code,ba.round_number,ba.target_user_id,ba.buff_key,ba.effect,ba.created_at
 FROM buff_activations ba JOIN match_reward_settlements mrs ON mrs.room_code=ba.room_code AND mrs.valid_for_rewards=true
 WHERE ba.user_id=${id} AND ba.status='resolved' ON CONFLICT(event_id) DO NOTHING`;
 await sql`INSERT INTO achievement_events(event_id,event_key,user_id,match_id,round_number,related_user_id,source_key,metadata,occurred_at)
 SELECT 'p10:intervention:'||ba.activation_id,'buff_intervention_success',ba.user_id,ba.room_code,ba.round_number,ba.target_user_id,ba.buff_key,ba.effect,ba.created_at
 FROM buff_activations ba JOIN match_reward_settlements mrs ON mrs.room_code=ba.room_code AND mrs.valid_for_rewards=true
 WHERE ba.user_id=${id} AND ba.status='resolved' AND ba.buff_key='buff_intervencao_federal' AND COALESCE(ba.effect->>'cancelledActivationId','')<>'' ON CONFLICT(event_id) DO NOTHING`;
 await sql`INSERT INTO achievement_events(event_id,event_key,user_id,match_id,round_number,related_user_id,source_key,metadata,occurred_at)
 SELECT 'p10:chaos:'||ba.activation_id,'buff_caos_total',ba.user_id,ba.room_code,ba.round_number,ba.target_user_id,ba.buff_key,ba.effect,ba.created_at
 FROM buff_activations ba JOIN match_reward_settlements mrs ON mrs.room_code=ba.room_code AND mrs.valid_for_rewards=true
 WHERE ba.user_id=${id} AND ba.status='resolved' AND ba.buff_key='buff_caos_total' ON CONFLICT(event_id) DO NOTHING`;
 await sql`INSERT INTO achievement_events(event_id,event_key,user_id,match_id,related_user_id,canonical_card_id,source_key,metadata,occurred_at)
 SELECT 'p10:loot:'||c.match_id||':'||c.user_id||':'||c.canonical_card_id,'loot_claim',c.user_id,c.match_id,c.source_user_id,c.canonical_card_id,'match_loot',jsonb_build_object('claimId',c.claim_id),c.claimed_at
 FROM match_loot_claims c JOIN match_reward_settlements mrs ON mrs.room_code=c.match_id AND mrs.valid_for_rewards=true
 WHERE c.user_id=${id} ON CONFLICT(event_id) DO NOTHING`;
 await sql`INSERT INTO achievement_events(event_id,event_key,user_id,match_id,canonical_card_id,source_key,metadata,occurred_at)
 SELECT 'p10:creation:'||ce.id,'original_creation',ce.user_id,ce.match_id,ce.canonical_card_id,ce.creation_kind,'{}'::jsonb,ce.created_at
 FROM canonical_card_creation_events ce LEFT JOIN match_reward_settlements mrs ON mrs.room_code=ce.match_id
 WHERE ce.user_id=${id} AND ce.creation_kind='original' AND (ce.match_id IS NULL OR mrs.valid_for_rewards=true) ON CONFLICT(event_id) DO NOTHING`;
 await sql`INSERT INTO achievement_events(event_id,event_key,user_id,match_id,round_number,canonical_card_id,source_key,metadata,occurred_at)
 SELECT 'p10:original-reveal:'||e.id||':'||a.user_id,'original_revealed',a.user_id,e.match_id,e.round_number,e.canonical_card_id,'white_revealed','{}'::jsonb,e.created_at
 FROM canonical_card_round_events e JOIN canonical_card_authors a ON a.canonical_card_id=e.canonical_card_id AND a.user_id=e.source_user_id JOIN match_reward_settlements mrs ON mrs.room_code=e.match_id AND mrs.valid_for_rewards=true
 WHERE a.user_id=${id} AND e.event_type='white_revealed' ON CONFLICT(event_id) DO NOTHING`;
 await sql`INSERT INTO achievement_events(event_id,event_key,user_id,match_id,round_number,canonical_card_id,source_key,metadata,occurred_at)
 SELECT 'p10:original-win:'||e.id||':'||a.user_id,'original_win',a.user_id,e.match_id,e.round_number,e.canonical_card_id,'white_win','{}'::jsonb,e.created_at
 FROM canonical_card_round_events e JOIN canonical_card_authors a ON a.canonical_card_id=e.canonical_card_id AND a.user_id=e.source_user_id JOIN match_reward_settlements mrs ON mrs.room_code=e.match_id AND mrs.valid_for_rewards=true
 WHERE a.user_id=${id} AND e.event_type='white_win' ON CONFLICT(event_id) DO NOTHING`;
 await sql`INSERT INTO achievement_events(event_id,event_key,user_id,match_id,round_number,canonical_card_id,source_key,metadata,occurred_at)
 SELECT 'p10:personal-win:'||p.user_id||':'||p.canonical_card_id||':'||p.match_id||':'||p.round_number,'personal_card_win',p.user_id,p.match_id,p.round_number,p.canonical_card_id,p.metric,'{}'::jsonb,p.created_at
 FROM card_personal_progress_events p JOIN match_reward_settlements mrs ON mrs.room_code=p.match_id AND mrs.valid_for_rewards=true
 WHERE p.user_id=${id} AND p.metric='white_personal_win' ON CONFLICT(event_id) DO NOTHING`;
 await sql`INSERT INTO achievement_events(event_id,event_key,user_id,match_id,related_user_id,canonical_card_id,source_key,metadata,occurred_at)
 SELECT 'p10:auth-adopt:'||o.id||':'||a.user_id,'authored_adoption',a.user_id,o.source_match_id,o.user_id,o.canonical_card_id,o.acquisition_source,'{}'::jsonb,o.acquired_at
 FROM canonical_card_ownerships o JOIN canonical_card_authors a ON a.canonical_card_id=o.canonical_card_id JOIN match_reward_settlements mrs ON mrs.room_code=o.source_match_id AND mrs.valid_for_rewards=true
 WHERE a.user_id=${id} AND o.user_id<>a.user_id AND o.acquisition_source='match_loot' ON CONFLICT(event_id) DO NOTHING`;
 await sql`INSERT INTO achievement_events(event_id,event_key,user_id,match_id,canonical_card_id,source_key,metadata,occurred_at)
 SELECT 'p10:auth-presence:'||p.canonical_card_id||':'||p.match_id||':'||a.user_id,'authored_presence',a.user_id,p.match_id,p.canonical_card_id,'canonical_presence','{}'::jsonb,p.first_seen_at
 FROM canonical_card_match_presence p JOIN canonical_card_authors a ON a.canonical_card_id=p.canonical_card_id JOIN match_reward_settlements mrs ON mrs.room_code=p.match_id AND mrs.valid_for_rewards=true
 WHERE a.user_id=${id} ON CONFLICT(event_id) DO NOTHING`;
 await sql`INSERT INTO achievement_events(event_id,event_key,user_id,match_id,source_key,metadata,occurred_at)
 SELECT 'p10:raid:'||s.room_code||':'||s.user_id,'saqueador_share',s.user_id,s.room_code,'buff_saqueador',jsonb_build_object('amount',s.amount,'ordinal',s.ordinal),s.created_at
 FROM saqueador_shares s JOIN match_reward_settlements mrs ON mrs.room_code=s.room_code AND mrs.valid_for_rewards=true
 WHERE s.user_id=${id} AND s.amount>0 ON CONFLICT(event_id) DO NOTHING`;
}

function milestoneEventKey(key){if(key==='reach:10')return'legacy_reach_10';if(key==='reach:25')return'legacy_reach_25';if(key==='reach:100')return'legacy_reach_100';if(key==='reach:250')return'legacy_reach_250';if(key==='reach:1000')return'legacy_reach_1000';if(key==='adoption:first')return'legacy_adoption_first';if(key==='legacy_level:viral')return'legacy_level_viral';if(key==='legacy_level:classico')return'legacy_level_classico';if(key==='legacy_level:folclore')return'legacy_level_folclore';return null;}

async function rewardMilestone(userId,cardId,key){
 const idem=`legacy:${cardId}:${key}:${userId}`;
 const rows=await sql`WITH claim AS (
  UPDATE canonical_card_legacy_milestones SET rewarded_at=now() WHERE canonical_card_id=${cardId} AND creator_user_id=${userId} AND milestone_key=${key} AND rewarded_at IS NULL RETURNING xp_reward,coin_reward
 ), wallet AS (INSERT INTO dirty_coin_wallets(user_id,balance) VALUES(${userId},0) ON CONFLICT(user_id) DO NOTHING),
 xp AS (UPDATE users SET xp=xp+COALESCE((SELECT xp_reward FROM claim),0) WHERE id=${userId} AND EXISTS(SELECT 1 FROM claim) RETURNING xp),
 led AS (INSERT INTO dirty_coin_ledger(user_id,amount,transaction_type,idempotency_key,reference_type,reference_id,metadata)
  SELECT ${userId},coin_reward,'legacy_royalty',${idem},'canonical_card',${String(cardId)},jsonb_build_object('milestone',${key},'xp',xp_reward) FROM claim WHERE coin_reward>0 ON CONFLICT(idempotency_key) DO NOTHING RETURNING amount)
 UPDATE dirty_coin_wallets SET balance=balance+COALESCE((SELECT SUM(amount) FROM led),0),updated_at=now() WHERE user_id=${userId} AND EXISTS(SELECT 1 FROM claim) RETURNING balance,(SELECT xp_reward FROM claim)::int xp_reward,(SELECT coin_reward FROM claim)::int coin_reward`;
 return rows[0]||null;
}

async function processLegacyMilestones(userId){
 if(!enabled())return[];const id=n(userId),cards=await sql`SELECT s.*,cc.display_text FROM canonical_card_authors a JOIN canonical_card_stats s ON s.canonical_card_id=a.canonical_card_id JOIN canonical_cards cc ON cc.id=s.canonical_card_id WHERE a.user_id=${id}`;const paid=[];
 for(const s of cards){for(const d of defs.LEGACY_MILESTONES){if(!d.test(s))continue;await sql`INSERT INTO canonical_card_legacy_milestones(canonical_card_id,creator_user_id,milestone_key,xp_reward,coin_reward) VALUES(${s.canonical_card_id},${id},${d.key},${d.xp},${d.coins}) ON CONFLICT(canonical_card_id,creator_user_id,milestone_key) DO UPDATE SET xp_reward=GREATEST(canonical_card_legacy_milestones.xp_reward,EXCLUDED.xp_reward),coin_reward=GREATEST(canonical_card_legacy_milestones.coin_reward,EXCLUDED.coin_reward)`;const r=await rewardMilestone(id,s.canonical_card_id,d.key);if(r)paid.push({canonicalCardId:Number(s.canonical_card_id),cardText:s.display_text,milestoneKey:d.key,xp:Number(r.xp_reward||0),coins:Number(r.coin_reward||0)});}}
 const milestones=await sql`SELECT canonical_card_id,milestone_key,achieved_at FROM canonical_card_legacy_milestones WHERE creator_user_id=${id}`;for(const m of milestones){const eventKey=milestoneEventKey(m.milestone_key);if(!eventKey)continue;await sql`INSERT INTO achievement_events(event_id,event_key,user_id,canonical_card_id,source_key,metadata,occurred_at) VALUES(${`p10:legacy:${m.canonical_card_id}:${id}:${m.milestone_key}`},${eventKey},${id},${m.canonical_card_id},${m.milestone_key},'{}'::jsonb,${m.achieved_at}) ON CONFLICT(event_id) DO NOTHING`;}
 return paid;
}

function valueFor(def,events){const rows=events.filter(e=>e.event_key===def.eventKey);if(!def.distinct)return rows.length;const vals=new Set(rows.map(e=>e[def.distinct]).filter(v=>v!==null&&v!==undefined&&String(v)!==''));return vals.size;}
async function syncProgress(userId){
 if(!enabled())return{achievements:[],newUnlocks:[]};const id=n(userId),events=await sql`SELECT event_key,match_id,related_user_id,canonical_card_id,source_key,metadata,occurred_at FROM achievement_events WHERE user_id=${id} ORDER BY occurred_at,id`,old=await sql`SELECT achievement_key,progress,target,unlocked FROM achievement_progress WHERE user_id=${id}`,prior=new Map(old.map(x=>[x.achievement_key,x])),newUnlocks=[],out=[];
 for(const d of defs.ACHIEVEMENTS){const raw=valueFor(d,events),progress=Math.min(raw,d.target),unlocked=raw>=d.target,was=!!prior.get(d.key)?.unlocked;await sql`INSERT INTO achievement_progress(user_id,achievement_key,progress,target,unlocked,unlocked_at,last_event_at) VALUES(${id},${d.key},${progress},${d.target},${unlocked},CASE WHEN ${unlocked} THEN now() ELSE NULL END,(SELECT MAX(occurred_at) FROM achievement_events WHERE user_id=${id} AND event_key=${d.eventKey})) ON CONFLICT(user_id,achievement_key) DO UPDATE SET progress=EXCLUDED.progress,target=EXCLUDED.target,unlocked=achievement_progress.unlocked OR EXCLUDED.unlocked,unlocked_at=CASE WHEN achievement_progress.unlocked THEN achievement_progress.unlocked_at WHEN EXCLUDED.unlocked THEN now() ELSE NULL END,last_event_at=EXCLUDED.last_event_at,updated_at=now()`;if(unlocked){await sql`INSERT INTO user_unlocks(user_id,unlock_type,unlock_key) VALUES(${id},'badge',${d.key}) ON CONFLICT DO NOTHING`;if(d.title)await sql`INSERT INTO user_unlocks(user_id,unlock_type,unlock_key) VALUES(${id},'title',${d.title.key}) ON CONFLICT DO NOTHING`;}if(unlocked&&!was)newUnlocks.push({type:'achievement',key:d.key,name:d.name,icon:d.icon,title:d.title||null});out.push({...d,rarityInfo:defs.RARITIES[d.rarity]||defs.RARITIES.common,progress,rawProgress:raw,unlocked});}
 return{achievements:out,newUnlocks};
}

async function syncAchievements(userId){if(!enabled())return{enabled:false,achievements:[],newUnlocks:[],royalties:[]};const royalties=await processLegacyMilestones(userId);await syncCanonicalEvents(userId);const state=await syncProgress(userId);return{enabled:true,...state,royalties};}
function titleDefinitions(){return defs.ACHIEVEMENTS.filter(x=>x.title).map(x=>({key:x.title.key,name:x.title.name,icon:x.icon,rarity:x.rarity,description:x.description,achievementKey:x.key,target:x.target}));}
module.exports={enabled,syncCanonicalEvents,processLegacyMilestones,syncProgress,syncAchievements,titleDefinitions,milestoneEventKey};
