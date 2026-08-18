'use strict';
(()=>{
 if(window.CartP64)return;
 const VERSION='v1.4.64',GLOBAL_CHANNEL='cartaralho-global';
 let channel=null,retryTimer=null,toastObserver=null;
 const money=v=>Number(v||0).toLocaleString('pt-BR');
 const userId=()=>AuthClient?.user?.id||AuthClient?.user?.username||null;
 const cacheKey=()=>`cartaralho_dirty_balance_${userId()||'anon'}`;

 function readCachedBalance(){
  const fromUser=Number(AuthClient?.user?.dirty_balance);
  if(Number.isFinite(fromUser))return fromUser;
  try{const raw=localStorage.getItem(cacheKey());if(raw!==null){const v=Number(raw);if(Number.isFinite(v))return v;}}catch(_){ }
  return null;
 }
 function writeCachedBalance(v){
  try{localStorage.setItem(cacheKey(),String(Number(v)));}catch(_){ }
 }
 function balanceSlot(){
  if(!AuthClient?.user)return null;
  const strip=document.querySelector('.account-strip,.home-account-bar');if(!strip)return null;
  let slot=strip.querySelector('.home-account-balance,.p49-balance-slot,[aria-label="Saldo de Moedas Sujas"]');
  if(!slot){
   slot=document.createElement('div');
   slot.className='home-account-balance p49-balance-slot';
   slot.setAttribute('aria-label','Saldo de Moedas Sujas');
   slot.innerHTML='<span aria-hidden="true">🪙</span><b class="p49-balance-value">—</b>';
   const actions=strip.querySelector('.p56-account-actions'),profile=document.getElementById('profile-shortcut');
   strip.insertBefore(slot,actions||profile||null);
  }
  slot.classList.add('home-account-balance','p49-balance-slot');
  let value=slot.querySelector('.p49-balance-value');
  if(!value){
   value=[...slot.querySelectorAll('b,strong')].find(el=>/\d|—/.test(el.textContent||''));
   if(!value){value=document.createElement('b');slot.appendChild(value);}
   value.classList.add('p49-balance-value');
  }
  slot.dataset.loading='false';
  slot.style.visibility='visible';slot.style.opacity='1';
  return slot;
 }
 function primeBalance(){
  const slot=balanceSlot();if(!slot)return null;
  const cached=readCachedBalance(),value=slot.querySelector('.p49-balance-value');
  if(value&&cached!==null)value.textContent=money(cached);
  return slot;
 }
 function applyBalance(value,{source='wallet',marketData=null}={}){
  const v=Number(value);if(!Number.isFinite(v))return false;
  if(AuthClient?.user)AuthClient.user.dirty_balance=v;
  writeCachedBalance(v);
  primeBalance();
  document.querySelectorAll('.home-account-balance,.p49-balance-slot,[aria-label="Saldo de Moedas Sujas"]').forEach(slot=>{
   slot.dataset.loading='false';slot.style.visibility='visible';slot.style.opacity='1';
   let el=slot.querySelector('.p49-balance-value')||[...slot.querySelectorAll('b,strong')].find(x=>/\d|—/.test(x.textContent||''));
   if(el){el.classList.add('p49-balance-value');el.textContent=money(v);}
  });
  if(window.MarketUI){
   if(marketData)MarketUI.data={...(MarketUI.data||{}),...marketData,dirtyBalance:v};
   else if(MarketUI.data)MarketUI.data.dirtyBalance=v;
   if(MarketUI.overlay)MarketUI.render();
  }
  window.dispatchEvent(new CustomEvent('cartaralho:balance-updated',{detail:{dirtyBalance:v,source}}));
  return true;
 }
 async function refreshBalance(source='wallet-refresh'){
  if(!AuthClient?.user)return null;
  try{
   const d=await AuthClient.request(`/api/profile/wallet?_fresh=${Date.now()}`),v=Number(d?.dirtyBalance);
   if(Number.isFinite(v)){applyBalance(v,{source});return v;}
  }catch(_){ }
  return null;
 }
 function isForMe(data={}){
  const targets=Array.isArray(data.targetUserIds)?data.targetUserIds.map(Number):null;
  return !targets?.length||targets.includes(Number(AuthClient?.user?.id));
 }
 function onBalanceUpdated(data={}){
  if(!isForMe(data))return;
  if(data.balance!==null&&data.balance!==undefined&&data.balance!==''){
   const exact=Number(data.balance);if(Number.isFinite(exact))applyBalance(exact,{source:data.reason||'balance_updated'});
  }
  setTimeout(()=>refreshBalance(data.reason||'balance_updated'),20);
 }
 function onRewardMegaphone(data={}){
  if(data.kind!=='reward'||!isForMe(data))return;
  /* Fallback de entrega: a notificação só dispara a consulta; o saldo continua vindo do backend. */
  setTimeout(()=>refreshBalance('reward_megaphone_fallback'),25);
 }
 async function bindRealtime(){
  try{
   await SocketClient._waitReady();
   const p=SocketClient.pusher;if(!p){scheduleRetry();return false;}
   channel=p.subscribe(GLOBAL_CHANNEL);if(!channel){scheduleRetry();return false;}
   if(!channel.__p64Wallet){channel.__p64Wallet=true;channel.bind('balance_updated',onBalanceUpdated);channel.bind('admin_megaphone',onRewardMegaphone);}
   if(retryTimer){clearTimeout(retryTimer);retryTimer=null;}return true;
  }catch(_){scheduleRetry();return false;}
 }
 function scheduleRetry(){if(retryTimer)return;retryTimer=setTimeout(()=>{retryTimer=null;bindRealtime();},500);}
 function observeRewardToasts(){
  if(toastObserver)return;const host=document.getElementById('toast-container');if(!host)return;
  toastObserver=new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes||[])if(n?.nodeType===1&&(n.matches?.('.megaphone')||n.querySelector?.('.megaphone'))&&(n.querySelector?.('.toast-megaphone-reward')||n.matches?.(':has(.toast-megaphone-reward)'))){setTimeout(()=>refreshBalance('reward_toast_fallback'),25);return;}});
  toastObserver.observe(host,{childList:true,subtree:true});
 }
 function patchRequests(){
  if(!window.AuthClient||AuthClient.__p64WalletResponses)return;AuthClient.__p64WalletResponses=true;
  const base=AuthClient.request.bind(AuthClient);
  AuthClient.request=async function(path,options={}){
   const data=await base(path,options);
   try{
    const route=String(path||'').split('?')[0],method=String(options?.method||'GET').toUpperCase();
    if(method!=='GET'){
     if(route==='/api/admin/creator-tools'){
      const targetId=Number(data?.target?.id),meId=Number(AuthClient?.user?.id),targetUser=String(data?.target?.username||'').toLowerCase(),meUser=String(AuthClient?.user?.username||'').toLowerCase();
      const self=(Number.isFinite(targetId)&&targetId===meId)||(targetUser&&targetUser===meUser);
      if(self&&data?.balance!==null&&data?.balance!==undefined){const v=Number(data.balance);if(Number.isFinite(v))applyBalance(v,{source:'admin_reward_response'});}
      else if(data?.scope==='global'&&Number(data?.credited)>0)setTimeout(()=>refreshBalance('admin_reward_global_response'),20);
     }else if(route==='/api/recycling'){
      const v=Number(data?.recycling?.balance);if(Number.isFinite(v))applyBalance(v,{source:'card_recycling_response'});
     }else if(route==='/api/cards/clean'){
      const v=Number(data?.inventory?.dirtyBalance);if(Number.isFinite(v))applyBalance(v,{source:'clean_card_response'});
     }else if(route==='/api/marketplace'){
      const v=Number(data?.purchase?.dirtyBalance);if(Number.isFinite(v))applyBalance(v,{source:'marketplace_response'});
     }
    }
   }catch(_){ }
   return data;
  };
 }
 function patchHome(){
  if(!window.HomeScreen||HomeScreen.__p64NativeWallet)return;HomeScreen.__p64NativeWallet=true;
  const base=HomeScreen.renderAccount.bind(HomeScreen);
  HomeScreen.renderAccount=function(...args){const out=base(...args);primeBalance();queueMicrotask(()=>{primeBalance();refreshBalance('home_render');});return out;};
 }
 function patchCardProgressionCopy(){
  const D=window.CartP56?.Detail||window.CardDetailUI;if(!D||D.__p64CollectionBorder)return;D.__p64CollectionBorder=true;
  const oldTrack=D.track?.bind(D);
  D.track=function(kind,c){
   if(kind!=='border')return oldTrack?oldTrack(kind,c):'';
   const progress=c?.borderProgress||{},current=c?.borderTier||'standard',now=Number(progress.current??c?.ownedDistinctCards??0),remaining=Math.max(0,Number(progress.remaining||0)),next=progress.nextTier||null,goal=next?now+remaining:now,pct=next?Math.max(3,Math.min(100,goal>0?(now/goal)*100:0)):100;
   const label=window.CartP57?.label||((v)=>String(v||'Padrão'));
   const fmt=v=>Number(v||0).toLocaleString('pt-BR');
   return `<article class="p56-progress-track"><div class="p56-progress-track-head"><div><span>CONTORNO</span><b>${label(current)}</b></div><em>${next?`+${fmt(remaining)} → ${label(next)}`:'NÍVEL MÁXIMO'}</em></div><div class="p56-progress-metric"><strong>${fmt(now)}</strong><span>cartas diferentes na sua coleção</span>${next?`<small>${fmt(goal)} para ${label(next)}</small>`:'<small>Progressão concluída</small>'}</div><div class="p56-progress-bar"><i style="width:${pct}%"></i></div><p>O contorno sobe conforme a quantidade de cartas diferentes que você possui.</p></article>`;
  };
  window.CardDetailUI=D;
 }
 function settle(){patchRequests();patchHome();primeBalance();bindRealtime();observeRewardToasts();patchCardProgressionCopy();}
 settle();queueMicrotask(settle);
 document.addEventListener('DOMContentLoaded',settle,{once:true});
 window.addEventListener('pageshow',()=>{settle();refreshBalance('pageshow');});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){settle();refreshBalance('visibility_resume');}});
 window.CartP64={VERSION,readCachedBalance,primeBalance,applyBalance,refreshBalance,bindRealtime,patchCardProgressionCopy};
})();
