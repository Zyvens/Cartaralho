'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');

if(!process.env.DATABASE_URL){
 test('integração de Cartas Limpas requer DATABASE_URL',{skip:'DATABASE_URL ausente'},()=>{});
}else{
 const{sql}=require('../lib/db');
 const clean=require('../lib/cleanCards');
 const{ensureStarterCoins}=require('../lib/playerStats');
 test('grants, compra, criação e concorrência são idempotentes',async()=>{
  const suffix=`p03_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,users=[],cards=[];
  try{
   for(const label of['a','b','c','d']){const u=(await sql`INSERT INTO users(username,display_name,password_hash) VALUES(${`${suffix}_${label}`},${`P03 ${label}`},'p03-test') RETURNING id,display_name`)[0];users.push(u);await ensureStarterCoins(u.id);}
   const first=await clean.ensureStarterCleanCards(users[0].id),again=await clean.ensureStarterCleanCards(users[0].id);assert.equal(first.whiteBalance,20);assert.equal(first.blackBalance,20);assert.equal(again.whiteBalance,20);assert.equal(again.blackBalance,20);
   const purchaseId=`purchase_${suffix}`;const before=await clean.getInventory(users[0].id);const p1=await clean.purchase(users[0].id,'white',purchaseId),p2=await clean.purchase(users[0].id,'white',purchaseId);assert.equal(p1.status,'ok');assert.equal(p2.replayed,true);const afterPurchase=await clean.getInventory(users[0].id);assert.equal(afterPurchase.whiteBalance,before.whiteBalance+1);assert.equal(afterPurchase.dirtyBalance,before.dirtyBalance-200);

   const text=`Carta paga ${suffix}`,creationId=`creation_${suffix}`;const c1=await clean.create({userId:users[0].id,type:'white',text,matchId:`${suffix}_m1`,creatorName:users[0].display_name,creationId}),c2=await clean.create({userId:users[0].id,type:'whiteCards',text,matchId:`${suffix}_m1`,creatorName:users[0].display_name,creationId});cards.push(c1.canonicalCardId);assert.equal(c1.status,'created');assert.equal(c2.replayed,true);const duplicate=await clean.create({userId:users[0].id,type:'white',text:`  CARTA   PAGA ${suffix} `,matchId:`${suffix}_m1`,creatorName:users[0].display_name,creationId:`different_${suffix}`});assert.equal(duplicate.status,'duplicate_owned');const afterCreate=await clean.getInventory(users[0].id);assert.equal(afterCreate.whiteBalance,afterPurchase.whiteBalance-1);

   const shared=`Coautoria paga ${suffix}`;const same=await Promise.all([clean.create({userId:users[1].id,type:'black',text:shared,matchId:`${suffix}_same`,creatorName:users[1].display_name,creationId:`same_b_${suffix}`}),clean.create({userId:users[2].id,type:'blackCards',text:` COAUTORIA   PAGA ${suffix} `,matchId:`${suffix}_same`,creatorName:users[2].display_name,creationId:`same_c_${suffix}`})]);cards.push(same[0].canonicalCardId);assert.equal(String(same[0].canonicalCardId),String(same[1].canonicalCardId));const authors=await sql`SELECT user_id FROM canonical_card_authors WHERE canonical_card_id=${same[0].canonicalCardId}`;assert.equal(authors.length,2);
   const later=await clean.create({userId:users[3].id,type:'black',text:shared,matchId:`${suffix}_later`,creatorName:users[3].display_name,creationId:`later_d_${suffix}`});assert.equal(later.creationKind,'independent');const authorsAfter=await sql`SELECT user_id FROM canonical_card_authors WHERE canonical_card_id=${same[0].canonicalCardId}`;assert.equal(authorsAfter.length,2);

   await clean.ensureStarterCleanCards(users[3].id);await sql`UPDATE clean_card_wallets SET white_balance=0 WHERE user_id=${users[3].id}`;const blockedText=`Sem credito ${suffix}`,blocked=await clean.create({userId:users[3].id,type:'white',text:blockedText,matchId:`${suffix}_blocked`,creatorName:users[3].display_name,creationId:`blocked_${suffix}`});assert.equal(blocked.status,'insufficient_clean_cards');const exists=await sql`SELECT 1 FROM canonical_cards WHERE normalized_text=${blockedText.toLowerCase()} AND card_type='white'`;assert.equal(exists.length,0);
  }finally{
   for(const user of users)await sql`DELETE FROM users WHERE id=${user.id}`;
   for(const id of [...new Set(cards.filter(Boolean))])await sql`DELETE FROM canonical_cards WHERE id=${id}`;
  }
 });
}
