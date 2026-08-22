'use strict';
(()=>{
 if(window.CartP49)return;
 const VERSION='v1.4.49';
 const cacheKey=()=>`cartaralho_dirty_balance_${AuthClient?.user?.id||AuthClient?.user?.username||'anon'}`;
 const money=v=>Number(v||0).toLocaleString('pt-BR');
 let hydratePromise=null;
 function identity(){return document.querySelector('.account-strip .home-account-identity')||document.querySelector('.account-strip>div:has(strong)');}
 function ensureIdentity(){
  const strip=document.querySelector('.account-strip');if(!strip||!AuthClient?.user)return null;
  strip.classList.add('home-account-bar');
  const id=identity();if(id)id.classList.add('home-account-identity');
  return strip;
 }
 function cachedBalance(){try{const raw=localStorage.getItem(cacheKey());return raw===null?null:Number(raw);}catch(_){return null;}}
 function knownBalance(){
  const raw=AuthClient?.user?.dirty_balance;
  if(raw!==null&&raw!==undefined&&raw!==''&&Number.isFinite(Number(raw)))return Number(raw);
  const cached=cachedBalance();return cached!==null&&Number.isFinite(Number(cached))?Number(cached):null;
 }
 function saveBalance(v){try{if(Number.isFinite(Number(v)))localStorage.setItem(cacheKey(),String(Number(v)));}catch(_){}}
 function setBalance(v,{loading=false}={}){
  const slot=document.querySelector('.account-strip .p49-balance-slot');if(!slot)return;
  slot.dataset.loading=loading?'true':'false';
  const value=slot.querySelector('.p49-balance-value');if(value)value.textContent=v===null?'—':money(v);
 }
 function ensureBalanceSlot(){
  const strip=ensureIdentity();if(!strip)return null;
  let slot=strip.querySelector('.home-account-balance');
  if(!slot){
   slot=document.createElement('div');
   slot.className='home-account-balance p49-balance-slot';
   slot.setAttribute('aria-label','Saldo de Moedas Sujas');
   slot.innerHTML='<span aria-hidden="true">🪙</span><b class="p49-balance-value">—</b>';
   const profile=strip.querySelector('#profile-shortcut');strip.insertBefore(slot,profile||null);
  }else{
   slot.classList.add('p49-balance-slot');
   if(!slot.querySelector('.p49-balance-value')){
    const numeric=[...slot.querySelectorAll('b,strong,span')].find(x=>/\d|—/.test(x.textContent||''));
    if(numeric)numeric.classList.add('p49-balance-value');
   }
  }
  const value=knownBalance();
  if(value!==null){AuthClient.user.dirty_balance=value;saveBalance(value);setBalance(value,{loading:false});}
  else setBalance(null,{loading:true});
  return slot;
 }
 async function hydrateBalance(){
  if(!AuthClient?.user)return null;
  ensureBalanceSlot();
  if(hydratePromise)return hydratePromise;
  hydratePromise=(async()=>{
   try{
    if(window.CartP64?.refreshBalance)return await CartP64.refreshBalance('p49-reconcile');
    const d=await AuthClient.request(`/api/profile/wallet?_fresh=${Date.now()}`),v=Number(d?.dirtyBalance);
    if(Number.isFinite(v)){AuthClient.user.dirty_balance=v;saveBalance(v);setBalance(v,{loading:false});return v;}
   }catch(_){ }
   finally{hydratePromise=null;}
   document.querySelector('.p49-balance-slot')?.setAttribute('data-loading','false');
   return null;
  })();
  return hydratePromise;
 }
 function settle(){ensureBalanceSlot();queueMicrotask(ensureIdentity);setTimeout(hydrateBalance,0);}
 if(typeof HomeScreen!=='undefined'&&!HomeScreen.__p49AccountHydration){
  HomeScreen.__p49AccountHydration=true;
  const base=HomeScreen.renderAccount.bind(HomeScreen);
  HomeScreen.renderAccount=function(...args){const out=base(...args);ensureBalanceSlot();queueMicrotask(()=>{ensureIdentity();hydrateBalance();});return out;};
 }
 window.addEventListener('pageshow',()=>{ensureBalanceSlot();hydrateBalance();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)hydrateBalance();});
 settle();
 window.CartP49={VERSION,ensureIdentity,ensureBalanceSlot,hydrateBalance,setBalance,knownBalance};
})();
