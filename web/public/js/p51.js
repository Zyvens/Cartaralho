'use strict';
(()=>{
 if(window.CartP51)return;
 const VERSION='v1.4.51';
 const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
 function normalizeNotifications(){
  document.querySelectorAll('.notifications-spoiler-summary').forEach(summary=>{
   const heading=summary.querySelector('.notifications-spoiler-heading');
   const pill=summary.querySelector('.notifications-section-new');
   if(heading&&pill&&pill.nextElementSibling!==heading)summary.insertBefore(pill,heading);
  });
 }
 if(window.NotificationsUI&&!NotificationsUI.__p51Order){
  NotificationsUI.__p51Order=true;
  const baseOpen=NotificationsUI.open.bind(NotificationsUI);
  NotificationsUI.open=async function(...args){const out=await baseOpen(...args);normalizeNotifications();return out;};
 }
 if(window.MetaUI&&!MetaUI.__p51MissionCoins){
  MetaUI.__p51MissionCoins=true;
  MetaUI.missionRow=function(m){
   const coins=Math.max(0,Math.round(Number(m?.coins||0))),target=Math.max(1,Number(m?.target||1)),progress=Number(m?.progress||0);
   return`<div class="mission-row ${m?.completed?'done':''}"><div class="p51-mission-head"><b>${m?.completed?'✅':'🎯'} ${esc(m?.name||'Missão')}</b><span class="p51-mission-coin-pill" title="Recompensa ao concluir">🪙 +${coins.toLocaleString('pt-BR')}</span></div><small style="display:block">${esc(m?.description||'')} · +${Number(m?.xp||0)} XP</small><div class="mission-progress"><span style="width:${Math.min(100,(progress/target)*100)}%"></span></div><small>${progress}/${Number(m?.target||0)}</small></div>`;
  };
 }
 window.addEventListener('pageshow',normalizeNotifications);
 window.CartP51={VERSION,normalizeNotifications};
})();
