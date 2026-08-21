'use strict';
(()=>{
 if(window.CartP74)return;
 const VERSION='v1.4.74',GLOBAL_CHANNEL='cartaralho-global';
 const money=v=>Number(v||0).toLocaleString('pt-BR');
 let refreshTimer=null,adminBound=false;

 function accountStrip(){
  const host=document.getElementById('home-account');
  const root=host?.querySelector(':scope > .account-strip')||host?.querySelector('.account-strip')||null;
  if(root)root.classList.add('home-account-bar','p74-account-strip');
  return root;
 }
 function actionHost(root=accountStrip()){
  if(!root)return null;
  window.CartP73?.reconcileActions?.();
  const host=root.querySelector('.p56-account-actions');
  if(host&&host.parentElement!==root)root.appendChild(host);
  return host||null;
 }
 function knownBalance(explicit){
  const direct=Number(explicit);
  if(explicit!==null&&explicit!==undefined&&explicit!==''&&Number.isFinite(direct))return direct;
  if(window.CartP65?.knownBalance){const v=CartP65.knownBalance();if(v!==null&&v!==undefined&&Number.isFinite(Number(v)))return Number(v);}
  const user=window.AuthClient?.user,fromUser=Number(user?.dirty_balance);
  if(user?.dirty_balance!==null&&user?.dirty_balance!==undefined&&Number.isFinite(fromUser))return fromUser;
  if(!user)return null;
  try{const raw=localStorage.getItem(`cartaralho_dirty_balance_${user.id||user.username}`);if(raw!==null&&Number.isFinite(Number(raw)))return Number(raw);}catch(_){ }
  return null;
 }
 function cacheBalance(v){
  const user=window.AuthClient?.user;if(!user||!Number.isFinite(Number(v)))return;
  try{localStorage.setItem(`cartaralho_dirty_balance_${user.id||user.username}`,String(Number(v)));}catch(_){ }
 }
 function ensureBalance(explicit=null){
  const root=accountStrip(),user=window.AuthClient?.user;if(!root||!user)return null;
  const actions=actionHost(root);
  let slot=window.CartP65?.canonicalizeBalance?.(explicit)||root.querySelector('.home-account-balance,.p49-balance-slot,[aria-label*="Moedas Sujas"]');
  if(!slot)slot=document.querySelector('#home-account .home-account-balance,#home-account .p49-balance-slot,#home-account [aria-label*="Moedas Sujas"]');
  if(!slot)slot=document.createElement('div');
  if(slot.parentElement!==root)root.insertBefore(slot,actions||null);
  else if(actions&&slot.nextElementSibling!==actions)root.insertBefore(slot,actions);
  root.querySelectorAll('.home-account-balance,.p49-balance-slot,[aria-label*="Moedas Sujas"]').forEach(x=>{if(x!==slot)x.remove();});
  slot.className='home-account-balance p49-balance-slot p62-market-ledger-shortcut p74-wallet-slot';
  slot.setAttribute('role','button');slot.setAttribute('tabindex','0');
  slot.setAttribute('aria-label','Abrir extrato de Moedas Sujas no Mercado Paralelo');
  slot.setAttribute('title','Abrir extrato no Mercado Paralelo');slot.dataset.loading='false';
  const value=knownBalance(explicit);
  if(value!==null){user.dirty_balance=value;cacheBalance(value);}
  let icon=slot.querySelector('.p65-balance-icon');if(!icon){icon=document.createElement('span');icon.className='p65-balance-icon';icon.setAttribute('aria-hidden','true');slot.prepend(icon);}icon.textContent='🪙';
  let number=slot.querySelector('.p49-balance-value');if(!number){number=document.createElement('b');number.className='p49-balance-value';slot.appendChild(number);}number.textContent=value===null?'—':money(value);
  return slot;
 }
 function syncAuthoritative(source='p74-wallet-sync'){
  if(!window.AuthClient?.user)return Promise.resolve(null);
  if(window.CartP64?.refreshBalance)return Promise.resolve(CartP64.refreshBalance(source)).then(v=>{if(v!==null&&v!==undefined)ensureBalance(v);return v;});
  if(window.CartP63?.fetchAuthoritativeBalance)return Promise.resolve(CartP63.fetchAuthoritativeBalance(source)).then(v=>{if(v!==null&&v!==undefined)ensureBalance(v);return v;});
  if(window.CartP61?.syncDirtyBalance)return Promise.resolve(CartP61.syncDirtyBalance()).then(v=>{if(v!==null&&v!==undefined)ensureBalance(v);return v;});
  return AuthClient.request(`/api/profile/wallet?_fresh=${Date.now()}`).then(d=>{const v=Number(d?.dirtyBalance);if(Number.isFinite(v)){ensureBalance(v);return v;}return null;}).catch(()=>null);
 }
 function scheduleAuthoritative(source='p74-wallet-sync',delay=0){
  if(refreshTimer)clearTimeout(refreshTimer);
  refreshTimer=setTimeout(()=>{refreshTimer=null;syncAuthoritative(source);},delay);
 }
 function rewardForCurrentUser(data={}){
  if(data.kind!=='reward')return false;
  const ids=Array.isArray(data.targetUserIds)?data.targetUserIds.map(Number):null;
  return !ids?.length||ids.includes(Number(AuthClient?.user?.id));
 }
 async function bindAdminRewards(){
  if(adminBound||!window.SocketClient)return;
  try{
   await SocketClient._waitReady();const channel=SocketClient.pusher?.subscribe(GLOBAL_CHANNEL);if(!channel)return;
   if(channel.__p74WalletPlacement){adminBound=true;return;}
   channel.__p74WalletPlacement=true;adminBound=true;
   channel.bind('admin_megaphone',data=>{
    if(!rewardForCurrentUser(data))return;
    const exact=Number(data?.balance);if(Number.isFinite(exact))ensureBalance(exact);
    scheduleAuthoritative('p74-admin-reward',20);
    setTimeout(()=>syncAuthoritative('p74-admin-reward-confirm'),180);
   });
  }catch(_){adminBound=false;}
 }
 function patchHome(){
  if(!window.HomeScreen||HomeScreen.__p74WalletPlacement)return;
  HomeScreen.__p74WalletPlacement=true;
  const base=HomeScreen.renderAccount.bind(HomeScreen);
  HomeScreen.renderAccount=function(...args){const out=base(...args);ensureBalance();queueMicrotask(()=>ensureBalance());requestAnimationFrame(()=>ensureBalance());return out;};
 }
 function patchProfessionalUI(){
  if(!window.ProfessionalUI||ProfessionalUI.__p74WalletPlacement)return;
  ProfessionalUI.__p74WalletPlacement=true;
  const base=ProfessionalUI.polishHome.bind(ProfessionalUI);
  ProfessionalUI.polishHome=function(...args){const out=base(...args);ensureBalance();return out;};
 }
 function settle(){patchHome();patchProfessionalUI();ensureBalance();bindAdminRewards();}
 settle();queueMicrotask(settle);
 document.addEventListener('DOMContentLoaded',settle,{once:true});
 window.addEventListener('pageshow',()=>{settle();scheduleAuthoritative('p74-pageshow',20);});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){settle();scheduleAuthoritative('p74-visibility',20);}});
 window.addEventListener('cartaralho:balance-updated',e=>ensureBalance(e?.detail?.dirtyBalance));
 window.CartP74={VERSION,accountStrip,knownBalance,ensureBalance,syncAuthoritative,bindAdminRewards,settle};
})();
