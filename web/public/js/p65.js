'use strict';
(()=>{
 if(window.CartP65)return;
 const VERSION='v1.4.65';
 const money=v=>Number(v||0).toLocaleString('pt-BR');
 const userKey=()=>AuthClient?.user?.id||AuthClient?.user?.username||'anon';
 const cacheKey=()=>`cartaralho_dirty_balance_${userKey()}`;

 function knownBalance(explicit){
  const direct=Number(explicit);if(explicit!==null&&explicit!==undefined&&explicit!==''&&Number.isFinite(direct))return direct;
  const fromUser=Number(AuthClient?.user?.dirty_balance);if(AuthClient?.user?.dirty_balance!==null&&AuthClient?.user?.dirty_balance!==undefined&&Number.isFinite(fromUser))return fromUser;
  try{const raw=localStorage.getItem(cacheKey());if(raw!==null){const v=Number(raw);if(Number.isFinite(v))return v;}}catch(_){ }
  return null;
 }
 function cache(v){try{if(Number.isFinite(Number(v)))localStorage.setItem(cacheKey(),String(Number(v)));}catch(_){ }}
 function strip(){return document.querySelector('.account-strip,.home-account-bar');}
 function candidates(root=strip()){
  if(!root)return[];
  return [...root.querySelectorAll('.home-account-balance,.p49-balance-slot,[aria-label*="Moedas Sujas"]')];
 }
 function canonicalizeBalance(explicit=null){
  const root=strip();if(!root||!AuthClient?.user)return null;
  let slots=candidates(root),slot=slots[0]||null;
  if(!slot){
   slot=document.createElement('div');
   const anchor=root.querySelector('.p56-account-actions,#profile-shortcut');
   root.insertBefore(slot,anchor||null);
  }
  slots.filter(x=>x!==slot).forEach(x=>x.remove());
  slot.className='home-account-balance p49-balance-slot p62-market-ledger-shortcut';
  slot.setAttribute('role','button');slot.setAttribute('tabindex','0');
  slot.setAttribute('aria-label','Abrir extrato de Moedas Sujas no Mercado Paralelo');
  slot.setAttribute('title','Abrir extrato no Mercado Paralelo');
  slot.dataset.loading='false';
  const v=knownBalance(explicit);
  if(v!==null){if(AuthClient.user)AuthClient.user.dirty_balance=v;cache(v);}
  slot.replaceChildren();
  const icon=document.createElement('span');icon.className='p65-balance-icon';icon.setAttribute('aria-hidden','true');icon.textContent='🪙';
  const value=document.createElement('b');value.className='p49-balance-value';value.textContent=v===null?'—':money(v);
  slot.append(icon,value);
  return slot;
 }
 function patchHome(){
  if(!window.HomeScreen||HomeScreen.__p65ImmediateWallet)return;
  HomeScreen.__p65ImmediateWallet=true;
  const base=HomeScreen.renderAccount.bind(HomeScreen);
  HomeScreen.renderAccount=function(...args){const out=base(...args);canonicalizeBalance();return out;};
 }
 function patchP49(){
  if(!window.CartP49||CartP49.__p65CanonicalWallet)return;
  CartP49.__p65CanonicalWallet=true;
  CartP49.ensureBalanceSlot=()=>canonicalizeBalance();
  CartP49.setBalance=(v)=>canonicalizeBalance(v);
 }
 function patchP64(){
  if(!window.CartP64||CartP64.__p65CanonicalWallet)return;
  CartP64.__p65CanonicalWallet=true;
  const refresh=CartP64.refreshBalance?.bind(CartP64);
  if(refresh)CartP64.refreshBalance=async function(...args){const v=await refresh(...args);canonicalizeBalance(v);return v;};
 }
 function patchDetail(){
  const D=window.CartP56?.Detail||window.CardDetailUI;if(!D||D.__p65ExternalBorder)return;
  D.__p65ExternalBorder=true;
  const base=D.track?.bind(D);
  D.track=function(kind,c){
   if(kind!=='border')return base?base(kind,c):'';
   const p=c?.borderProgress||{},current=c?.borderTier||'standard';
   const now=Number(p.current??c?.externalPresenceMatches??0),remaining=Math.max(0,Number(p.remaining||0)),next=p.nextTier||null,goal=next?now+remaining:now;
   const pct=next?Math.max(3,Math.min(100,goal>0?(now/goal)*100:0)):100;
   const label=window.CartP57?.label||((v)=>String(v||'Padrão'));
   const fmt=v=>Number(v||0).toLocaleString('pt-BR');
   return `<article class="p56-progress-track"><div class="p56-progress-track-head"><div><span>CONTORNO</span><b>${label(current)}</b></div><em>${next?`+${fmt(remaining)} → ${label(next)}`:'NÍVEL MÁXIMO'}</em></div><div class="p56-progress-metric"><strong>${fmt(now)}</strong><span>partidas com presença externa</span>${next?`<small>${fmt(goal)} para ${label(next)}</small>`:'<small>Progressão concluída</small>'}</div><div class="p56-progress-bar"><i style="width:${pct}%"></i></div><p>O contorno sobe quando outro jogador traz esta mesma Carta Canônica para uma partida em que você participa. Cada partida conta uma vez; usar a sua própria cópia não conta.</p></article>`;
  };
  window.CardDetailUI=D;
 }
 function settle(){patchHome();patchP49();patchP64();patchDetail();canonicalizeBalance();}
 settle();queueMicrotask(settle);
 window.addEventListener('cartaralho:balance-updated',e=>canonicalizeBalance(e?.detail?.dirtyBalance));
 window.addEventListener('pageshow',settle);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)settle();});
 window.CartP65={VERSION,knownBalance,canonicalizeBalance,settle};
})();
