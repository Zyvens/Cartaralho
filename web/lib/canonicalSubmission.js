'use strict';
const{sql}=require('./db');
const canonicalCards=require('./canonicalCards');

async function alreadyOwns(userId,canonicalCardId){
 if(!userId||!canonicalCardId)return false;
 const rows=await sql`SELECT 1 FROM canonical_card_ownerships WHERE user_id=${Number(userId)} AND canonical_card_id=${canonicalCardId} LIMIT 1`;
 return rows.length>0;
}

async function resolveSubmittedCard({type,text,userId,creatorName=null,matchId}={}){
 const existing=await canonicalCards.getCanonicalCard(type,text);
 const owned=existing?await alreadyOwns(userId,existing.id):false;
 const isCreation=Boolean(userId&&!owned);
 const resolved=await canonicalCards.resolveCanonicalCard({
  type,text,userId,creatorName,matchId,isCreation,
  acquisitionSource:isCreation?null:'legacy_import',
  sourceMatchId:matchId
 });
 return{...resolved,alreadyOwned:owned,isCreation};
}

module.exports={alreadyOwns,resolveSubmittedCard};
