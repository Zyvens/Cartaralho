'use strict';
(()=>{
 const VERSION='v1.4.39';
 const isAdmin=()=>Number(AuthClient?.user?.id)===1;
 const playFormOpen=()=>{const el=document.getElementById('play-form');return !!el&&getComputedStyle(el).display!=='none';};
 const mainHomeOpen=()=>App?.state?.currentScreen==='home'&&!!document.querySelector('.home-screen')&&!playFormOpen();
 const removeAdmin=()=>{document.getElementById('creator-admin-fab')?.remove();document.getElementById('creator-admin-overlay')?.remove();document.body.classList.remove('creator-admin-active');};
 let originalEnsure=null;
 function installGuard(){
  if(!window.CartP37?.ensureAdminButton||CartP37.__p39Guarded)return;
  originalEnsure=CartP37.ensureAdminButton.bind(CartP37);
  CartP37.ensureAdminButton=function(){
   if(!isAdmin()||!mainHomeOpen()){removeAdmin();return;}
   return originalEnsure();
  };
  CartP37.__p39Guarded=true;
 }
 function enforce(){
  installGuard();
  if(!isAdmin()||!mainHomeOpen()){removeAdmin();return;}
  CartP37?.ensureAdminButton?.();
 }
 function schedule(){for(const ms of[0,80,220])setTimeout(enforce,ms);}
 function init(){
  sessionStorage.setItem(`cartaralho_update_notice_${VERSION}`,'1');
  installGuard();
  document.addEventListener('click',e=>{
   if(e.target.closest('#btn-play,#back-play'))schedule();
  });
  schedule();
 }
 document.addEventListener('DOMContentLoaded',init);
 window.CartP39={VERSION,enforce,mainHomeOpen};
})();
