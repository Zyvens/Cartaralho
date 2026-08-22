'use strict';
(()=>{
 if(window.CardLegacyProgressionUI)return;
 const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
 const fmt=n=>Number(n||0).toLocaleString('pt-BR');
 const labelLevel=k=>({nascente:'Nascente',espalhando:'Espalhando',viral:'Viral',classico:'Clássico',folclore:'Folclore'}[k]||k||'Nascente');
 async function appendLegacy(panel){
  if(!panel||!AuthClient?.user)return null;
  let data;try{data=await AuthClient.request('/api/profile/legacy');}catch(_){return null;}
  if(!data?.progressionEnabled)return data;
  const l=data.legacy||{},root=panel.querySelector('.profile-panel');
  if(!root||root.querySelector('#my-card-legacy'))return data;
  const section=document.createElement('section');
  section.id='my-card-legacy';section.className='meta-section';
  section.innerHTML=`<h4>🧬 Meu Legado</h4><div class="meta-stat-grid"><div class="meta-stat"><b>${fmt(l.originalCards)}</b><small>Cartas originais</small></div><div class="meta-stat"><b>${fmt(l.playersReached)}</b><small>Jogadores alcançados</small></div><div class="meta-stat"><b>${fmt(l.creativeCoincidences)}</b><small>Coincidências criativas</small></div><div class="meta-stat"><b>${fmt(l.globalWins)}</b><small>Vitórias globais</small></div></div><div class="origin-box" style="margin-top:10px"><b>Criações mais relevantes</b>${(l.cards||[]).slice(0,5).map(c=>`<div style="display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span>${esc(c.display_text)}</span><small>${esc(labelLevel(c.legacy_level))} · ${fmt(c.reach_count)} donos · ${fmt(c.presence_count)} partidas</small></div>`).join('')||'<small style="display:block;margin-top:6px;color:var(--text-muted)">Você ainda não possui criações originais com Legado registrado.</small>'}</div>`;
  root.appendChild(section);return data;
 }
 let installed=false;
 function installStatsExtension(){
  if(installed||!window.HomeScreen?.renderStats)return false;
  installed=true;
  const base=HomeScreen.renderStats.bind(HomeScreen);
  HomeScreen.renderStats=async function(panel,...args){const out=await base(panel,...args);await appendLegacy(panel);return out;};
  if(typeof MetaUI!=='undefined')MetaUI.renderStats=HomeScreen.renderStats;
  return true;
 }
 function celebrateOriginalPlay(data){
  const plays=Array.isArray(data?.originalPlays)?data.originalPlays:[];
  if(plays.length){const names=[...new Set(plays.map(x=>x.nickname).filter(Boolean))];setTimeout(()=>Toast.info(`🧬 DIRETO DA FONTE · ${names.slice(0,2).join(' e ')}${names.length>2?` e +${names.length-2}`:''} jogou uma criação original.`),180);}
  if(data?.originalCelebration)setTimeout(()=>Toast.success(`${data.originalCelebration.message} · ${data.originalCelebration.detail}`),520);
 }
 let socketRegistered=false;
 function registerSocket(){if(socketRegistered)return false;socketRegistered=true;SocketClient.on('round_result',celebrateOriginalPlay);return true;}
 registerSocket();
 window.addEventListener('load',installStatsExtension,{once:true});
 setTimeout(installStatsExtension,0);
 window.CardLegacyProgressionUI={appendLegacy,installStatsExtension,celebrateOriginalPlay,registerSocket,labelLevel,fmt};
})();
