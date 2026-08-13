'use strict';
const{sql}=require('./db');
const canonicalCards=require('./canonicalCards');
const{submissionIsCreation}=require('./cardIdentity');

async function alreadyOwns(userId,canonicalCardId){
 if(!userId||!canonicalCardId)return false;
 const rows=await sql`SELECT 1 FROM canonical_card_ownerships WHERE user_id=${Number(userId)} AND canonical_card_id=${canonicalCardId} LIMIT 1`;
 return rows.length>0;
}

async function inferSubmittedCard({type,text,userId}={}){
 const existing=await canonicalCards.getCanonicalCard(type,text);
 const owned=existing?await alreadyOwns(userId,existing.id):false;
 return{canonicalCard:existing,alreadyOwned:owned,isCreation:submissionIsCreation(userId,owned)};
}

module.exports={alreadyOwns,inferSubmittedCard};
