'use strict';
(()=>{
 if(window.CartP74)return;
 const VERSION='v1.4.77',GLOBAL_CHANNEL='cartaralho-global';
 const money=v=>Number(v||0).toLocaleString('pt-BR');
 const authClient=()=>typeof AuthClient!=='undefined'?AuthClient:window.AuthClient;
 const socketClient=()=>typeof SocketClient!=='undefined'?SocketClient:window.SocketClient;
 const homeScreen=()=>typeof HomeScreen!=='undefined'?HomeScreen:window.HomeScreen;
 const professionalUI=()=>typeof ProfessionalUI!=='undefined'?ProfessionalUI:window.ProfessionalUI;
 let refreshTimer=null,realtimeBound=false,observer=null,ensureQueued=false,pendingExplicit=null;

 function accountStrip(){
  const host=document.getElementById('home-account');
  const root=host?.querySelector(':scope > .account-strip')||host?.querySelector('.account-strip')||null;
  if(root)root.classList.add('home-account-bar','p74-account-strip');
  return root;
 }
 function knownBalance(explicit){
  const direct=Number(explicit);
  if(explicit!==null&&explicit!==undefined&&explicit!==''&&Number.isFinite(direct))return direct;
  const user=authClient()?.user,fromUser=Number(user?.dirty_balance);
  if(user?.dirty_balance!==null&&user?.dirty_balance!==undefined&&user?.dirty_balance!==''&&Number.isFinite(fromUser))return fromUser;
  if(!user)return null;
  try{const raw=localStorage.getItem(`cartaralho_dirty_balance_${user.id||user.username}`);if(raw!==null&&Number.isFinite(Number(raw)))return Number(raw);}catch(_){ }
  return null;
 }
 function cacheBalance(v){
  const user=authClient()?.user;if(!user||!Number.isFinite(Number(v)))return;
  user.dirty_balance=Number(v);
  try{localStorage.setItem(`cartaralho_dirty_balance_${user.id||user.username}`,String(Number(v)));}catch(_){ }
 }
 function ensureBalance(explicit=null){
  const root=accountStrip(),user=authClient()?.user;if(!root||!user)return null;
  const actions=root.querySelector('.p56-account-actions');
  const anchor=actions||root.querySelector('#profile-shortcut,#logout-btn');
  let slot=root.querySelector('.p74-wallet-slot,.home-account-balance,.p49-balance-slot,[aria-label*="Moedas Sujas"]');
  if(!slot)slot=document.createElement('div');
  if(slot.parentElement!==root)root.insertBefore(slot,anchor||null);
  else if(anchor&&slot.nextElementSibling!==anchor)root.insertBefore(slot,anchor);
  root.querySelectorAll('.home-account-balance,.p49-balance-slot,[aria-label*="Moedas Sujas"]').forEach(x=>{if(x!==slot)x.remove();});
  slot.className='home-account-balance p49-balance-slot p62-market-ledger-shortcut p74-wallet-slot';
  slot.setAttribute('role','button');slot.setAttribute('tabindex','0');
  slot.setAttribute('aria-label','Abrir extrato de Moedas Sujas no Mercado Paralelo');
  slot.setAttribute('title','Abrir extrato no Mercado Paralelo');slot.dataset.loading='false';
  const value=knownBalance(explicit);if(value!==null)cacheBalance(value);
  let icon=slot.querySelector('.p65-balance-icon');
  if(!icon){icon=document.createElement('span');icon.className='p65-balance-icon';icon.setAttribute('aria-hidden','true');slot.prepend(icon);}
  if(icon.textContent!=='🪙')icon.textContent='🪙';
  let number=slot.querySelector('.p49-balance-value');
  if(!number){number=document.createElement('b');number.className='p49-balance-value';slot.appendChild(number);}
  const text=value===null?'—':money(value);if(number.textContent!==text)number.textContent=text;
  return slot;
 }
 function scheduleEnsure(explicit=null){
  if(explicit!==null&&explicit!==undefined&&explicit!==''&&Number.isFinite(Number(explicit)))pendingExplicit=Number(explicit);
  if(ensureQueued)return;
  ensureQueued=true;
  queueMicrotask(()=>{ensureQueued=false;const value=pendingExplicit;pendingExplicit=null;ensureBalance(value);});
 }
 function syncAuthoritative(source='p74-wallet-sync'){
  const auth=authClient();if(!auth?.user)return Promise.resolve(null);
  if(window.CartP64?.refreshBalance)return Promise.resolve(CartP64.refreshBalance(source)).then(v=>{if(v!==null&&v!==undefined)ensureBalance(v);return v;});
  if(window.CartP63?.fetchAuthoritativeBalance)return Promise.resolve(CartP63.fetchAuthoritativeBalance(source)).then(v=>{if(v!==null&&v!==undefined)ensureBalance(v);return v;});
  if(window.CartP61?.syncDirtyBalance)return Promise.resolve(CartP61.syncDirtyBalance()).then(v=>{if(v!==null&&v!==undefined)ensureBalance(v);return v;});
  return auth.request(`/api/profile/wallet?_fresh=${Date.now()}`).then(d=>{const v=Number(d?.dirtyBalance);if(Number.isFinite(v)){ensureBalance(v);return v;}return null;}).catch(()=>null);
 }
 function scheduleAuthoritative(source='p74-wallet-sync',delay=0){
  if(refreshTimer)clearTimeout(refreshTimer);
  refreshTimer=setTimeout(()=>{refreshTimer=null;syncAuthoritative(source);},delay);
 }
 function forCurrentUser(data={}){
  const ids=Array.isArray(data.targetUserIds)?data.targetUserIds.map(Number):null;
  return !ids?.length||ids.includes(Number(authClient()?.user?.id));
 }
 function onBalanceRealtime(data={}){
  if(!forCurrentUser(data))return;
  const exact=Number(data?.balance);
  if(data?.balance!==null&&data?.balance!==undefined&&data?.balance!==''&&Number.isFinite(exact))ensureBalance(exact);
  else scheduleAuthoritative(data?.reason||'p74-balance-event',0);
 }
 function onAdminMegaphone(data={}){
  if(data.kind!=='reward'||!forCurrentUser(data))return;
  const exact=Number(data?.balance);
  if(data?.balance!==null&&data?.balance!==undefined&&data?.balance!==''&&Number.isFinite(exact))ensureBalance(exact);
  scheduleAuthoritative('p74-admin-reward',0);
 }
 async function bindRealtime(){
  const socket=socketClient();if(realtimeBound||!socket)return;
  try{
   await socket._waitReady();const channel=socket.pusher?.subscribe(GLOBAL_CHANNEL);if(!channel)return;
   if(channel.__p74WalletPlacement){realtimeBound=true;return;}
   channel.__p74WalletPlacement=true;realtimeBound=true;
   channel.bind('balance_updated',onBalanceRealtime);
   channel.bind('admin_megaphone',onAdminMegaphone);
  }catch(_){realtimeBound=false;}
 }
 function patchHome(){
  const home=homeScreen();if(!home||home.__p74WalletPlacement)return;
  home.__p74WalletPlacement=true;
  const base=home.renderAccount.bind(home);
  home.renderAccount=function(...args){const out=base(...args);ensureBalance();queueMicrotask(()=>ensureBalance());requestAnimationFrame(()=>ensureBalance());return out;};
 }
 function patchProfessionalUI(){
  const ui=professionalUI();if(!ui||ui.__p74WalletPlacement)return;
  ui.__p74WalletPlacement=true;
  const base=ui.polishHome.bind(ui);
  ui.polishHome=function(...args){const out=base(...args);ensureBalance();return out;};
 }
 function observeAccount(){
  if(observer)return;
  const host=document.getElementById('app')||document.body;if(!host)return;
  observer=new MutationObserver(records=>{
   const relevant=records.some(r=>[...(r.addedNodes||[]),...(r.removedNodes||[])].some(n=>n?.nodeType===1&&(n.matches?.('#home-account,.account-strip,.p56-account-actions,.p74-wallet-slot')||n.querySelector?.('#home-account,.account-strip,.p56-account-actions,.p74-wallet-slot'))));
   if(relevant)scheduleEnsure();
  });
  observer.observe(host,{childList:true,subtree:true});
 }
 function settle(){patchHome();patchProfessionalUI();ensureBalance();bindRealtime();observeAccount();}
 settle();queueMicrotask(settle);
 document.addEventListener('DOMContentLoaded',settle,{once:true});
 window.addEventListener('pageshow',()=>{settle();scheduleAuthoritative('p74-pageshow',20);});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){settle();scheduleAuthoritative('p74-visibility',20);}});
 window.addEventListener('cartaralho:balance-updated',e=>scheduleEnsure(e?.detail?.dirtyBalance));
 window.CartP74={VERSION,accountStrip,knownBalance,ensureBalance,syncAuthoritative,bindRealtime,settle};
})();
