'use strict';
(()=>{
 if(window.CartP67)return;
 const VERSION='v1.4.67';
 const LABEL={standard:'Padrão',copper:'Bronze',bronze:'Bronze',silver:'Prata',gold:'Ouro',platinum:'Platina'};
 const fmt=v=>Number(v||0).toLocaleString('pt-BR');
 const label=v=>LABEL[String(v||'standard').toLowerCase()]||String(v||'Padrão');
 let statsObserver=null;

 function progressionTrack(kind,c){
  const background=kind==='material';
  const progress=background?c?.materialProgress:c?.borderProgress;
  const current=background?c?.materialTier:c?.borderTier;
  const explicit=background?c?.personalRoundWins:c?.lootCollectors;
  const now=Number(explicit??progress?.current??0);
  const remaining=Math.max(0,Number(progress?.remaining||0));
  const next=progress?.nextTier||null;
  const goal=next?Number(progress?.target??(now+remaining)):now;
  const pct=next?Math.max(3,Math.min(100,goal>0?(now/goal)*100:0)):100;
  const title=background?'FUNDO':'BORDA';
  const metric=background?'rodadas vencidas com esta carta':'coletas por Espólio por outros jogadores';
  const rule=background
   ?'O fundo sobe quando você vence uma rodada utilizando esta carta. Ele indica quão boa esta carta é nas partidas.'
   :'A borda sobe quando outros jogadores coletam esta carta em Espólios. Ela indica a popularidade da carta.';
  return `<article class="p56-progress-track"><div class="p56-progress-track-head"><div><span>${title}</span><b>${label(current)}</b></div><em>${next?`+${fmt(remaining)} → ${label(next)}`:'NÍVEL MÁXIMO'}</em></div><div class="p56-progress-metric"><strong>${fmt(now)}</strong><span>${metric}</span>${next?`<small>${fmt(goal)} para ${label(next)}</small>`:'<small>Progressão concluída</small>'}</div><div class="p56-progress-bar"><i style="width:${pct}%"></i></div><p>${rule}</p></article>`;
 }

 function patchDetail(){
  const D=window.CartP56?.Detail||window.CardDetailUI;if(!D)return;
  D.track=function(kind,c){return progressionTrack(kind,c);};
  D.__p67Progression=true;
  window.CardDetailUI=D;
 }

 function creatorLabel(c){
  if(c?.is_native)return'Cartaralho';
  const o=c?.origin||{};
  return String(o.creatorUsername||o.creatorName||'Não identificado');
 }
 function decorateLibrary(panel,cards){
  if(!panel||!Array.isArray(cards))return;
  const byId=new Map(cards.map(c=>[String(c.id),c]));
  panel.querySelectorAll('.p56-library-card[data-card-id]').forEach(el=>{
   const c=byId.get(String(el.dataset.cardId)),small=el.querySelector('small');if(!c||!small)return;
   small.textContent=`Criado por ${creatorLabel(c)}`;
  });
 }
 function patchLibrary(){
  const L=window.CartP56?.Library;if(!L||L.__p67AuthorFooter)return;
  L.__p67AuthorFooter=true;
  const base=L.render.bind(L);
  L.render=async function(panel,...args){const cards=await base(panel,...args);decorateLibrary(panel,cards);return cards;};
 }

 function purgeStatsEconomy(panel){
  if(!panel)return;
  panel.querySelectorAll('.p61-stats-ledger,.p54-stats-ledger,.stats-economy,.economy-history,.economy-ledger').forEach(node=>node.remove());
  panel.querySelectorAll('.meta-section,.market-section').forEach(section=>{
   const heading=section.querySelector('h3,h4,.market-section-title')?.textContent||'';
   if(/extrato|movimenta(?:ção|ções)|moedas sujas|economia/i.test(heading))section.remove();
  });
 }
 async function renderStats(panel){
  if(!window.MetaUI?.renderStats)throw new Error('Estatísticas indisponíveis.');
  statsObserver?.disconnect();statsObserver=null;
  const out=await MetaUI.renderStats(panel);
  purgeStatsEconomy(panel);
  if(window.MutationObserver){
   statsObserver=new MutationObserver(()=>purgeStatsEconomy(panel));
   statsObserver.observe(panel,{childList:true,subtree:true});
  }
  queueMicrotask(()=>purgeStatsEconomy(panel));
  requestAnimationFrame(()=>purgeStatsEconomy(panel));
  return out;
 }
 function patchStats(){
  if(!window.HomeScreen||!window.MetaUI)return;
  HomeScreen.renderStats=renderStats;
  HomeScreen.__p67StatsOnly=true;
  const panel=document.getElementById('home-panel');
  if(panel?.querySelector('.profile-panel'))purgeStatsEconomy(panel);
 }

 function settle(){patchDetail();patchLibrary();patchStats();}
 settle();queueMicrotask(settle);
 document.addEventListener('DOMContentLoaded',settle,{once:true});
 window.addEventListener('pageshow',settle);
 window.CartP67={VERSION,progressionTrack,creatorLabel,decorateLibrary,purgeStatsEconomy,renderStats,settle};
})();
