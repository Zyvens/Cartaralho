'use strict';
const{sql}=require('./db');
const{GAME_STATES}=require('./constants');
const defs=require('./buffDefinitions');
const advancedRound=require('./advancedRoundEngine');
const uid=x=>Number(x)||0;
const aid=x=>String(x||'').trim();
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

function serialSimple(r){
 if(!r)return null;
 return{number:r.number,blackCard:r.blackCard,hostIndex:r.hostIndex,hostId:r.hostId,submissions:Object.fromEntries(r.submissions||new Map()),winnerId:r.winnerId||null,winnerCard:r.winnerCard||null,buffState:r.buffState||null};
}
function serialRound(r){return advancedRound.isV2(r)?advancedRound.serializeRound(r):serialSimple(r);}
function hasSubmitted(room,targetId){return advancedRound.isV2(room.currentRound)?advancedRound.hasPlayerSubmission(room.currentRound,String(targetId)):room.currentRound?.submissions?.has?.(String(targetId));}
function phase(room,actorId){
 if(!room?.currentRound)return defs.PHASES.PREPARATION;
 if(room.state!==GAME_STATES.EM_ANDAMENTO)return defs.PHASES.TRANSITION;
 if(advancedRound.isV2(room.currentRound))return advancedRound.entries(room.currentRound).length?defs.PHASES.SUBMISSIONS:defs.PHASES.HAND;
 return room.currentRound.submissions?.has?.(String(actorId))?defs.PHASES.SUBMISSIONS:defs.PHASES.HAND;
}
async function prior(userId,activationId){return(await sql`SELECT * FROM buff_activations WHERE user_id=${uid(userId)} AND activation_id=${aid(activationId)} LIMIT 1`)[0]||null;}
async function inventory(userId){return sql`SELECT bi.buff_key,bi.quantity,mc.name,mc.description,mc.price FROM buff_inventory bi JOIN market_catalog mc ON mc.product_key=bi.buff_key WHERE bi.user_id=${uid(userId)} AND bi.quantity>0 ORDER BY mc.sort_order,mc.product_key`;}

async function activate(room,userId,activationId,input={}){
 const actorId=String(userId),activation=aid(activationId),old=await prior(userId,activation);
 if(old)return{status:'ok',replayed:true,effect:old.effect||{},inventory:await inventory(userId)};
 if(process.env.BUFFS_FEATURE_ENABLED==='false')return{status:'feature_disabled'};
 if(!room?.buffsEnabled)return{status:'room_disabled'};
 if(!room?.currentRound)return{status:'no_round'};
 const actor=room.players.get(actorId),def=defs.get('buff_amigo_de_merda'),currentPhase=phase(room,actorId);
 if(!actor||actor.active===false)return{status:'not_player'};
 if(activation.length<8)return{status:'invalid_activation_id'};
 if(!def.phases.includes(currentPhase))return{status:'wrong_phase',phase:currentPhase};
 const tid=String(input.targetUserId||''),target=room.players.get(tid);
 if(!tid||tid===actorId||!target||target.active===false)return{status:'invalid_target',message:'Escolha um adversário ativo.'};
 if(tid===String(room.currentRound.hostId)||hasSubmitted(room,tid))return{status:'target_already_submitted',message:'O alvo precisa ainda estar aguardando para responder.'};
 const n=(target.hand||[]).length;
 if(!n)return{status:'empty_target_hand',message:'O alvo não possui cartas para trocar.'};

 const beforeRound=serialRound(room.currentRound),beforeDeck=[...(room.whiteDeck||[])],beforeHand=[...target.hand];
 if(advancedRound.isV2(room.currentRound)){
   const rs=advancedRound.roomState(room.currentRound);rs.temporaryPossessions||={};rs.temporaryPossessions[tid]=[];
 }
 room.whiteDeck.push(...target.hand.splice(0));
 shuffle(room.whiteDeck);
 for(let i=0;i<n;i++)target.hand.push(room.whiteDeck.pop());
 const afterRound=serialRound(room.currentRound),afterDeck=[...room.whiteDeck],afterHand=[...target.hand],targetDbId=uid(target.userId||tid),actorDbId=uid(actor.userId||actorId);
 const effect={targetUserId:targetDbId,targetNickname:target.nickname,oldHandSize:n,newHandSize:afterHand.length,redrawn:true};
 const q=[
   sql`SELECT user_id FROM buff_inventory WHERE user_id=${actorDbId} AND buff_key='buff_amigo_de_merda' FOR UPDATE`,
   sql`SELECT 1/(SELECT COUNT(*)::int FROM buff_inventory WHERE user_id=${actorDbId} AND buff_key='buff_amigo_de_merda' AND quantity>0) ok`,
   sql`SELECT 1/(1-(SELECT COUNT(*)::int FROM buff_activations WHERE room_code=${room.code} AND round_number=${room.currentRound.number} AND user_id=${actorDbId})) ok`,
   sql`UPDATE rooms SET current_round=${JSON.stringify(afterRound)}::jsonb,white_deck=${JSON.stringify(afterDeck)}::jsonb,updated_at=now() WHERE code=${room.code} AND current_round IS NOT DISTINCT FROM ${JSON.stringify(beforeRound)}::jsonb AND white_deck=${JSON.stringify(beforeDeck)}::jsonb`,
   sql`SELECT 1/(SELECT COUNT(*)::int FROM rooms WHERE code=${room.code} AND current_round IS NOT DISTINCT FROM ${JSON.stringify(afterRound)}::jsonb AND white_deck=${JSON.stringify(afterDeck)}::jsonb) ok`,
   sql`UPDATE players SET hand=${JSON.stringify(afterHand)}::jsonb WHERE room_code=${room.code} AND user_id=${targetDbId} AND hand=${JSON.stringify(beforeHand)}::jsonb`,
   sql`SELECT 1/(SELECT COUNT(*)::int FROM players WHERE room_code=${room.code} AND user_id=${targetDbId} AND hand=${JSON.stringify(afterHand)}::jsonb) ok`,
   sql`INSERT INTO buff_activations(activation_id,room_code,round_number,user_id,buff_key,target_user_id,phase,status,effect) VALUES(${activation},${room.code},${room.currentRound.number},${actorDbId},'buff_amigo_de_merda',${targetDbId},${currentPhase},'resolved',${JSON.stringify(effect)}::jsonb)`,
   sql`UPDATE buff_inventory SET quantity=quantity-1,updated_at=now() WHERE user_id=${actorDbId} AND buff_key='buff_amigo_de_merda' AND quantity>0`,
   sql`INSERT INTO buff_inventory_ledger(user_id,buff_key,delta,transaction_type,idempotency_key,reference_type,reference_id,metadata) VALUES(${actorDbId},'buff_amigo_de_merda',-1,'activation',${`activation:${actorDbId}:${activation}`},'match',${room.code},jsonb_build_object('round',${room.currentRound.number},'engineVersion','amigo-redraw-p32'))`,
   sql`SELECT 1/(SELECT COUNT(*)::int FROM buff_activations WHERE user_id=${actorDbId} AND activation_id=${activation}) committed`
 ];
 try{
   await sql.transaction(q,{isolationMode:'Serializable'});
   return{status:'ok',replayed:false,effect,publicMessage:`🌀 ${actor.nickname} foi um Amigo de Merda e obrigou ${target.nickname} a trocar a mão inteira.`,inventory:await inventory(actorDbId)};
 }catch(e){
   const committed=await prior(actorDbId,activation);if(committed)return{status:'ok',replayed:true,effect:committed.effect||{},inventory:await inventory(actorDbId)};
   if(String(e.code)==='23505')return{status:'quota_used',message:'Você já ativou um Buff nesta rodada.'};
   if(['22012','40001'].includes(String(e.code)))return{status:'conflict',message:'O estado da rodada mudou. Atualize e tente novamente.'};
   throw e;
 }
}
module.exports={activate};
