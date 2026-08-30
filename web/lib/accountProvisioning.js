'use strict';
const{sql}=require('./db');
const{ensureStarterCoins}=require('./playerStats');
const cleanCards=require('./cleanCards');

async function ensureStarterDeck(userId){
 if(!userId)return;
 await sql`INSERT INTO user_cards(user_id,type,text,owned)
   SELECT ${userId},type,text,true FROM deck_cards WHERE is_hidden=false
   ON CONFLICT(user_id,type,text) DO UPDATE SET owned=true`;
}

async function readDirtyBalance(userId){
 const wallet=(await sql`SELECT balance FROM dirty_coin_wallets WHERE user_id=${userId} LIMIT 1`)[0]||{};
 return Number(wallet.balance||0);
}

async function ensureAccountProvisioned(userId,{retry=true}={}){
 const failed=[];
 const run=async(step,fn)=>{
  try{return await fn();}
  catch(error){
   failed.push(step);
   console.error(`[Account Provisioning] ${step} failed for user ${userId}:`,error?.message||error);
   return null;
  }
 };
 const pass=async()=>{
  await run('starter_deck',()=>ensureStarterDeck(userId));
  await run('starter_coins',()=>ensureStarterCoins(userId));
  await run('starter_clean_cards',()=>cleanCards.ensureStarterCleanCards(userId));
 };
 await pass();
 if(retry&&failed.length){
  const firstFailures=new Set(failed.splice(0));
  if(firstFailures.has('starter_deck'))await run('starter_deck',()=>ensureStarterDeck(userId));
  if(firstFailures.has('starter_coins'))await run('starter_coins',()=>ensureStarterCoins(userId));
  if(firstFailures.has('starter_clean_cards'))await run('starter_clean_cards',()=>cleanCards.ensureStarterCleanCards(userId));
 }
 const dirtyBalance=await run('dirty_wallet',()=>readDirtyBalance(userId));
 return{complete:failed.length===0,failedSteps:[...new Set(failed)],dirtyBalance:Number(dirtyBalance||0)};
}

module.exports={ensureStarterDeck,readDirtyBalance,ensureAccountProvisioned};
