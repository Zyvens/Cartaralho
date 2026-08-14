'use strict';
const{sql}=require('./db');
const playerStats=require('./playerStats');
const cardProgression=require('./cardProgressionService');
const contribution=require('./playerContribution');
const rules=require('./matchLootRules');
const enabled=()=>process.env.MATCH_LOOT_ENABLED!=='false';

async function resolveEconomy(room,economy,validForRewards=true){
 let x=economy;
 if(!x){
  const r=(await sql`SELECT engine_version,effective_players,effort_index,valid_for_rewards FROM match_reward_settlements WHERE room_code=${room.code} LIMIT 1`)[0];
  if(r)x={engineVersion:r.engine_version,effectivePlayers:Number(r.effective_players),effort:Number(r.effort_index),validForRewards:!!r.valid_for_rewards};
 }
 if(x)return{engineVersion:x.engineVersion||playerStats.REWARD_ENGINE_VERSION,effectivePlayers:Number(x.effectivePlayers||0),effort:Number(x.effort||0),valid:validForRewards!==false&&x.validForRewards!==false};
 const rounds=Number((await sql`SELECT COUNT(*)::int n FROM match_rounds WHERE room_code=${room.code}`)[0]?.n||0),players=Array.from(room.players.values()).filter(p=>p.userId).length,effectivePlayers=Math.max(3,Math.min(10,players)),effort=playerStats.effortIndex(room.pointsToWin||5,effectivePlayers);
 return{engineVersion:playerStats.REWARD_ENGINE_VERSION,effectivePlayers,effort,valid:validForRewards!==false&&rounds>0&&players>=3};
}

async function enforceContributionEligibility(room){
 if(!contribution.requirementEnabled(room))return[];
 const excluded=Array.from(room.players.values()).filter(p=>p?.userId&&!contribution.finalEligibility(room,p)).map(p=>Number(p.userId));
 for(const userId of excluded)await sql`UPDATE match_loot_entitlements SET eligible_count=0,quota=0,status='empty' WHERE match_id=${room.code} AND user_id=${userId} AND status<>'claimed'`;
 return excluded;
}

async function finalizeMatch(room,{economy=null,validForRewards=true}={}){
 if(!enabled())return{status:'disabled'};
 const e=await resolveEconomy(room,economy,validForRewards);
 const rows=await sql`SELECT settle_match_loot(${room.code},${e.valid},${e.engineVersion},${e.effectivePlayers},${e.effort}) result`,result=rows[0]?.result||{status:'unavailable'};
 const noLootUserIds=e.valid?await enforceContributionEligibility(room):[];
 return{...result,noLootUserIds};
}

async function expireEmpty(userId){
 await sql`UPDATE match_loot_entitlements e SET status='empty' WHERE e.user_id=${Number(userId)} AND e.status='pending' AND NOT EXISTS(SELECT 1 FROM match_loot_eligibility l WHERE l.match_id=e.match_id AND l.user_id=e.user_id AND NOT EXISTS(SELECT 1 FROM canonical_card_ownerships o WHERE o.user_id=e.user_id AND o.canonical_card_id=l.canonical_card_id))`;
}

async function getPending(userId,matchId=null){
 const id=Number(userId);await expireEmpty(id);
 const ents=matchId
  ?await sql`SELECT * FROM match_loot_entitlements WHERE user_id=${id} AND match_id=${String(matchId)} ORDER BY created_at DESC`
  :await sql`SELECT * FROM match_loot_entitlements WHERE user_id=${id} AND status='pending' ORDER BY created_at DESC`;
 const out=[];
 for(const e of ents){
  const cards=await sql`SELECT l.canonical_card_id,cc.card_type,cc.display_text,l.source_user_id,l.source_name_snapshot,l.source_reason,l.first_round_number,l.snapshot,
   COALESCE((SELECT json_agg(COALESCE(u.display_name,a.author_name_snapshot,u.username,'Criador desconhecido') ORDER BY a.authored_at,a.user_id) FROM canonical_card_authors a LEFT JOIN users u ON u.id=a.user_id WHERE a.canonical_card_id=cc.id),'[]'::json) authors
   FROM match_loot_eligibility l JOIN canonical_cards cc ON cc.id=l.canonical_card_id
   WHERE l.match_id=${e.match_id} AND l.user_id=${id}
     AND NOT EXISTS(SELECT 1 FROM canonical_card_ownerships o WHERE o.user_id=${id} AND o.canonical_card_id=l.canonical_card_id)
   ORDER BY cc.card_type,cc.display_text,cc.id`;
  const quota=Number(e.quota||0),available=cards.length;
  out.push({matchId:e.match_id,status:e.status,finalPosition:Number(e.final_position),baseQuota:Number(e.base_quota),effort:Number(e.effort_index),requestedQuota:Number(e.requested_quota),quota,claimableQuota:Math.min(quota,available),eligibleCount:Number(e.eligible_count),availableCount:available,createdAt:e.created_at,claimedAt:e.claimed_at||null,claimedCardIds:e.claimed_card_ids||[],cards});
 }
 return{enabled:enabled(),pending:out,pendingCount:out.filter(x=>x.status==='pending'&&x.availableCount>0).length};
}

async function claim(userId,{matchId,claimId,cardIds=[]}={}){
 if(!enabled())return{status:'disabled'};
 const ids=Array.from(new Set((cardIds||[]).map(Number).filter(Number.isInteger).filter(x=>x>0)));
 const rows=await sql`SELECT claim_match_loot(${Number(userId)},${String(matchId||'')},${String(claimId||'')},${JSON.stringify(ids)}::jsonb) result`;
 const result=rows[0]?.result||{status:'unavailable'};
 if(result.status==='ok'&&!result.replayed){for(const cardId of result.granted||[])await cardProgression.refreshCanonicalStats(Number(cardId));}
 return result;
}
module.exports={...rules,enabled,finalizeMatch,enforceContributionEligibility,getPending,claim};
