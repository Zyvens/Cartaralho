'use strict';
(()=>{
 if(window.CartP73)return;
 const VERSION='v1.4.73';
 const money=v=>Number(v||0).toLocaleString('pt-BR');
 const strip=()=>document.querySelector('.home-account-bar,.account-strip');
 const authClient=()=>typeof AuthClient!=='undefined'?AuthClient:window.AuthClient;
 const homeScreen=()=>typeof HomeScreen!=='undefined'?HomeScreen:window.HomeScreen;
 const professionalUI=()=>typeof ProfessionalUI!=='undefined'?ProfessionalUI:window.ProfessionalUI;

 function ensureAction(button,kind){
  if(!button)return;
  const profile=kind==='profile';
  button.classList.add('p56-account-action',profile?'p56-profile-action':'p56-logout-action');
  // professionalUI is an older decorator. Its mobile rule hides every span inside
  // .home-header-button; P56/P73 own these buttons now, so the legacy marker must go.
  button.classList.remove('home-header-button');
  if(!button.querySelector('.p56-account-action-icon')||!button.querySelector('.p56-account-action-copy')){
   button.innerHTML=profile
    ?'<span class="p56-account-action-icon" aria-hidden="true">👤</span><span class="p56-account-action-copy"><b>Perfil</b><small>Conta e aparência</small></span>'
    :'<span class="p56-account-action-icon" aria-hidden="true">↪</span><span class="p56-account-action-copy"><b>Sair</b><small>Encerrar sessão</small></span>';
  }
  button.setAttribute('aria-label',profile?'Abrir perfil, conta e aparência':'Sair da conta');
  button.setAttribute('title',profile?'Perfil':'Sair');
 }

 function reconcileActions(){
  const root=strip(),profile=document.getElementById('profile-shortcut'),logout=document.getElementById('logout-btn');
  if(!root||!profile||!logout)return null;
  let host=root.querySelector('.p56-account-actions');
  if(!host){host=document.createElement('div');host.className='p56-account-actions';root.appendChild(host);}
  if(profile.parentElement!==host)host.appendChild(profile);
  if(logout.parentElement!==host)host.appendChild(logout);
  ensureAction(profile,'profile');ensureAction(logout,'logout');
  return host;
 }

 function fallbackBalance(explicit){
  const root=strip(),user=authClient()?.user;if(!root||!user)return null;
  let slot=root.querySelector('.home-account-balance,.p49-balance-slot,[aria-label*="Moedas Sujas"]');
  if(!slot){slot=document.createElement('div');root.insertBefore(slot,root.querySelector('.p56-account-actions,#profile-shortcut')||null);}
  root.querySelectorAll('.home-account-balance,.p49-balance-slot,[aria-label*="Moedas Sujas"]').forEach(x=>{if(x!==slot)x.remove();});
  slot.className='home-account-balance p49-balance-slot p62-market-ledger-shortcut';
  slot.setAttribute('role','button');slot.setAttribute('tabindex','0');slot.setAttribute('aria-label','Abrir extrato de Moedas Sujas no Mercado Paralelo');slot.setAttribute('title','Abrir extrato no Mercado Paralelo');slot.dataset.loading='false';
  let value=null;
  const direct=Number(explicit);if(explicit!==null&&explicit!==undefined&&explicit!==''&&Number.isFinite(direct))value=direct;
  else if(user.dirty_balance!==null&&user.dirty_balance!==undefined&&Number.isFinite(Number(user.dirty_balance)))value=Number(user.dirty_balance);
  else{try{const key=`cartaralho_dirty_balance_${user.id||user.username}`;const raw=localStorage.getItem(key);if(raw!==null&&Number.isFinite(Number(raw)))value=Number(raw);}catch(_){ }}
  if(value!==null)user.dirty_balance=value;
  slot.innerHTML=`<span class="p65-balance-icon" aria-hidden="true">🪙</span><b class="p49-balance-value">${value===null?'—':money(value)}</b>`;
  return slot;
 }

 function reconcileBalance(explicit){
  if(!authClient()?.user)return null;
  if(window.CartP65?.canonicalizeBalance)return CartP65.canonicalizeBalance(explicit);
  return fallbackBalance(explicit);
 }

 function reconcile(explicit){
  if(!authClient()?.user)return;
  reconcileActions();
  reconcileBalance(explicit);
 }

 function patchProfessionalUI(){
  const ui=professionalUI();if(!ui||ui.__p73AccountStrip)return;
  ui.__p73AccountStrip=true;
  const base=ui.polishHome.bind(ui);
  ui.polishHome=function(...args){const out=base(...args);reconcile();return out;};
 }

 function patchHome(){
  const home=homeScreen();if(!home||home.__p73AccountStrip)return;
  home.__p73AccountStrip=true;
  const base=home.renderAccount.bind(home);
  home.renderAccount=function(...args){
   const out=base(...args);
   // First paint uses /api/auth/me's dirty_balance (or the local last-known value).
   // No wallet request is required before the slot exists.
   reconcile();
   queueMicrotask(()=>reconcile());
   requestAnimationFrame(()=>reconcile());
   return out;
  };
 }

 function settle(){patchProfessionalUI();patchHome();reconcile();}
 settle();queueMicrotask(settle);
 document.addEventListener('DOMContentLoaded',settle,{once:true});
 window.addEventListener('pageshow',settle);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)settle();});
 window.addEventListener('cartaralho:balance-updated',e=>reconcile(e?.detail?.dirtyBalance));
 window.CartP73={VERSION,reconcile,reconcileActions,reconcileBalance,settle};
})();
