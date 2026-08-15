'use strict';
const{sql}=require('./db');
const{cardMaterialTier}=require('./auth');

const TIER_ORDER={standard:0,copper:1,bronze:1,silver:2,gold:3,platinum:4};
function cardShape(row,reason){if(!row)return null;const materialTier=cardMaterialTier(row.matches_used);return{type:row.type,text:row.text,materialTier,matchesUsed:Number(row.matches_used||0),timesWon:Number(row.times_won||0),timesSeen:Number(row.times_seen||0),reason};}
async function cardsForUsers(userIds){
 const ids=[...new Set((userIds||[]).map(Number).filter(Number.isInteger).filter(x=>x>0))];if(!ids.length)return new Map();
 const rows=await sql`SELECT uc.user_id,uc.type,uc.text,uc.matches_used,uc.times_won,uc.times_seen,uc.is_player_card,uc.owned,EXISTS(SELECT 1 FROM card_origins co WHERE co.creator_user_id=uc.user_id AND co.type=uc.type AND co.text_key=lower(regexp_replace(trim(uc.text),'\\s+',' ','g'))) AS is_authored FROM user_cards uc WHERE uc.user_id=ANY(${ids}) AND uc.owned=true`;
 const grouped=new Map();for(const row of rows){const id=Number(row.user_id);if(!grouped.has(id))grouped.set(id,[]);grouped.get(id).push(row);}const out=new Map();
 for(const id of ids){const cards=grouped.get(id)||[],famous=cards.filter(c=>c.is_authored&&(Number(c.times_won||0)>=5||Number(c.matches_used||0)>10)).sort((a,b)=>Number(b.times_won||0)-Number(a.times_won||0)||Number(b.matches_used||0)-Number(a.matches_used||0)||Number(b.times_seen||0)-Number(a.times_seen||0))[0];if(famous){out.set(id,cardShape(famous,'famous_authored'));continue;}const progressed=cards.filter(c=>TIER_ORDER[cardMaterialTier(c.matches_used)]>0).sort((a,b)=>TIER_ORDER[cardMaterialTier(b.matches_used)]-TIER_ORDER[cardMaterialTier(a.matches_used)]||Number(b.matches_used||0)-Number(a.matches_used||0)||Number(b.times_won||0)-Number(a.times_won||0))[0];if(progressed)out.set(id,cardShape(progressed,'highest_progression'));}
 return out;
}
async function build(room){const players=Array.from(room?.players?.entries?.()||[]).filter(([,p])=>p?.active!==false),cards=await cardsForUsers(players.map(([,p])=>p.userId));return players.map(([id,p])=>({userId:p.userId||null,nickname:p.nickname,titleKey:p.titleKey||null,frameKey:p.frameKey||null,isCreator:String(id)===String(room.creatorId),showcaseCard:cards.get(Number(p.userId))||null}));}
module.exports={build,cardsForUsers,TIER_ORDER};
