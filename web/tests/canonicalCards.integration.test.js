'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');

if(!process.env.DATABASE_URL){
 test('integração canônica requer DATABASE_URL',{skip:'DATABASE_URL ausente'},()=>{});
}else{
 const{sql}=require('../lib/db');
 const canonical=require('../lib/canonicalCards');
 test('concorrência preserva identidade, autoria e posse únicas',async()=>{
  const suffix=`p01_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  const users=[];const cards=[];
  try{
   for(const label of['a','b','c']){const row=(await sql`INSERT INTO users(username,display_name,password_hash) VALUES(${`${suffix}_${label}`},${`Teste ${label}`},'p01-test-only') RETURNING id,display_name`)[0];users.push(row);}
   const sameMatch=`${suffix}_same`;
   const sameText=`Coautoria ${suffix}`;
   const same=await Promise.all([
    canonical.resolveCanonicalCard({type:'whiteCards',text:sameText,userId:users[0].id,creatorName:users[0].display_name,matchId:sameMatch,isCreation:true}),
    canonical.resolveCanonicalCard({type:'white',text:`  COAUTORIA   ${suffix} `,userId:users[1].id,creatorName:users[1].display_name,matchId:sameMatch,isCreation:true})
   ]);
   cards.push(same[0].canonicalCard.id);
   assert.equal(String(same[0].canonicalCard.id),String(same[1].canonicalCard.id));
   const coauthors=await canonical.listAuthors(same[0].canonicalCard.id);
   assert.equal(coauthors.length,2);

   const raceText=`Corrida ${suffix}`;
   const race=await Promise.all([
    canonical.resolveCanonicalCard({type:'black',text:raceText,userId:users[0].id,creatorName:users[0].display_name,matchId:`${suffix}_m1`,isCreation:true}),
    canonical.resolveCanonicalCard({type:'blackCards',text:`CORRIDA ${suffix}`,userId:users[1].id,creatorName:users[1].display_name,matchId:`${suffix}_m2`,isCreation:true})
   ]);
   cards.push(race[0].canonicalCard.id);
   assert.equal(String(race[0].canonicalCard.id),String(race[1].canonicalCard.id));
   const raceCard=await canonical.getCanonicalCard('black',raceText);
   const raceAuthors=await canonical.listAuthors(raceCard.id);
   assert.equal(raceAuthors.length,1);

   await Promise.all([
    canonical.resolveCanonicalCard({type:'black',text:raceText,userId:users[2].id,acquisitionSource:'legacy_import'}),
    canonical.resolveCanonicalCard({type:'blackCards',text:raceText,userId:users[2].id,acquisitionSource:'legacy_import'})
   ]);
   const afterAuthors=await canonical.listAuthors(raceCard.id);
   assert.equal(afterAuthors.length,1);
   const ownershipCount=Number((await sql`SELECT COUNT(*)::int n FROM canonical_card_ownerships WHERE canonical_card_id=${raceCard.id} AND user_id=${users[2].id}`)[0].n);
   assert.equal(ownershipCount,1);
  }finally{
   for(const id of [...new Set(cards)])await sql`DELETE FROM canonical_cards WHERE id=${id}`;
   for(const user of users)await sql`DELETE FROM users WHERE id=${user.id}`;
  }
 });
}
