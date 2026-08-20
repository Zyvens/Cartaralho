'use strict';
(()=>{
 if(window.CartMissionsDomain)return;
 CartDomains.claim('missionsUI','domains/missionsUI.js',()=>{
  const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
  function missionRow(m){const progress=Number(m?.progress||0),target=Math.max(1,Number(m?.target||1)),pct=Math.min(100,(progress/target)*100),coins=Math.max(0,Math.round(Number(m?.coins||0))),xp=Math.max(0,Math.round(Number(m?.xp||0)));return `<div class="mission-row ${m?.completed?'done':''}"><b>${m?.completed?'✅':'🎯'} ${esc(m?.name||'Missão')}</b><small class="mission-copy">${esc(m?.description||'')}</small><div class="p52-mission-rewards"><span class="p52-mission-coin-pill" title="Moedas Sujas recebidas ao concluir">🪙 +${coins.toLocaleString('pt-BR')}</span><span class="mission-xp-pill">+${xp.toLocaleString('pt-BR')} XP</span></div><div class="mission-progress"><span style="width:${pct}%"></span></div><small class="mission-count">${progress}/${Number(m?.target||0)}</small></div>`;}
  function closeStartup(){try{sessionStorage.setItem('cartaralho_missions_opened','1');}catch(_){ }if(window.MetaUI){MetaUI.missionOpen=false;document.getElementById('mission-card')?.classList.add('hidden');}}
  function install(){if(!window.MetaUI||MetaUI.__domainMissions)return;MetaUI.__domainMissions=true;MetaUI.missionRow=missionRow;closeStartup();const ensure=MetaUI.ensureMissionUI?.bind(MetaUI);if(ensure)MetaUI.ensureMissionUI=async function(...args){try{sessionStorage.setItem('cartaralho_missions_opened','1');}catch(_){ }return ensure(...args);};}
  install();window.addEventListener('pageshow',closeStartup);window.CartMissionsDomain={missionRow,closeStartup,install};
 });
})();
