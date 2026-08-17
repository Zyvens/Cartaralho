'use strict';
(()=>{
 const VERSION='v1.4.38';
 const isHome=()=>App?.state?.currentScreen==='home'&&!!document.querySelector('.home-screen');
 const isAdmin=()=>Number(AuthClient?.user?.id)===1;
 const removeAdmin=()=>{document.getElementById('creator-admin-fab')?.remove();document.getElementById('creator-admin-overlay')?.remove();document.body.classList.remove('creator-admin-active');};
 const baseEnsure=()=>window.CartP37?.ensureAdminButton?.();
 function enforceAdminVisibility(){
  if(!isAdmin()||!isHome()){removeAdmin();return;}
  baseEnsure();
 }
 function scheduleEnforcement(){for(const ms of[0,320,400,500])setTimeout(enforceAdminVisibility,ms);}
 function patchNavigation(){
  if(App.__p38AdminHomeOnly)return;App.__p38AdminHomeOnly=true;
  const show=App.showScreen.bind(App);
  App.showScreen=function(name,...args){const out=show(name,...args);scheduleEnforcement();return out;};
 }
 function init(){
  // P37 continua fazendo o polling da versão. Em clientes já atualizados,
  // esta marca evita que a própria versão P38 seja anunciada novamente após o reload.
  sessionStorage.setItem(`cartaralho_update_notice_${VERSION}`,'1');
  patchNavigation();
  scheduleEnforcement();
 }
 document.addEventListener('DOMContentLoaded',init);
 window.CartP38={VERSION,enforceAdminVisibility};
})();
