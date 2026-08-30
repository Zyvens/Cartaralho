'use strict';
const test=require('node:test'),assert=require('node:assert/strict');

async function loadOwner(mocks,run){
 const ownerPath=require.resolve('../lib/accountProvisioning'),dbPath=require.resolve('../lib/db'),statsPath=require.resolve('../lib/playerStats'),cleanPath=require.resolve('../lib/cleanCards');
 const paths=[ownerPath,dbPath,statsPath,cleanPath],prior=new Map(paths.map(p=>[p,require.cache[p]]));
 require.cache[dbPath]={id:dbPath,filename:dbPath,loaded:true,exports:{sql:mocks.sql}};
 require.cache[statsPath]={id:statsPath,filename:statsPath,loaded:true,exports:{ensureStarterCoins:mocks.ensureStarterCoins}};
 require.cache[cleanPath]={id:cleanPath,filename:cleanPath,loaded:true,exports:{ensureStarterCleanCards:mocks.ensureStarterCleanCards}};
 delete require.cache[ownerPath];
 const priorError=console.error;console.error=()=>{};
 try{return await run(require(ownerPath));}
 finally{
  console.error=priorError;
  for(const p of paths){const cached=prior.get(p);if(cached)require.cache[p]=cached;else delete require.cache[p];}
 }
}

function queryText(strings){return Array.isArray(strings)?strings.join(' '):String(strings||'');}

test('provisionamento repete uma etapa transitória e conclui sem duplicar grant',async()=>{
 let deckCalls=0,coinCalls=0,cleanCalls=0;
 const sql=async strings=>{
  const text=queryText(strings);
  if(text.includes('INSERT INTO user_cards')){deckCalls++;if(deckCalls===1)throw new Error('transient deck error');return[];}
  if(text.includes('SELECT balance FROM dirty_coin_wallets'))return[{balance:5000}];
  return[];
 };
 await loadOwner({sql,ensureStarterCoins:async()=>{coinCalls++;},ensureStarterCleanCards:async()=>{cleanCalls++;}},async owner=>{
  const result=await owner.ensureAccountProvisioned(7);
  assert.equal(result.complete,true);
  assert.deepEqual(result.failedSteps,[]);
  assert.equal(result.dirtyBalance,5000);
 });
 assert.equal(deckCalls,2);
 assert.equal(coinCalls,1);
 assert.equal(cleanCalls,1);
});

test('falha persistente de item inicial não invalida a conta e fica sinalizada',async()=>{
 const sql=async strings=>queryText(strings).includes('SELECT balance FROM dirty_coin_wallets')?[{balance:5000}]:[];
 let cleanCalls=0;
 await loadOwner({sql,ensureStarterCoins:async()=>{},ensureStarterCleanCards:async()=>{cleanCalls++;throw new Error('function unavailable');}},async owner=>{
  const result=await owner.ensureAccountProvisioned(11);
  assert.equal(result.complete,false);
  assert.deepEqual(result.failedSteps,['starter_clean_cards']);
  assert.equal(result.dirtyBalance,5000);
 });
 assert.equal(cleanCalls,2);
});
