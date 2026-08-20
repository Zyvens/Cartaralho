'use strict';
(()=>{
 if(window.CartP67)return;
 const VERSION='v1.4.67';
 const LABEL={standard:'Padrão',copper:'Bronze',bronze:'Bronze',silver:'Prata',gold:'Ouro',platinum:'Platina'};
 const fmt=v=>Number(v||0).toLocaleString('pt-BR');
 const label=v=>LABEL[String(v||'standard').toLowerCase()]||String(v||'Padrão');
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
  const rule=background?'O fundo sobe quando você vence uma rodada utilizando esta carta. Ele indica quão boa esta carta é nas partidas.':'A borda sobe quando outros jogadores coletam esta carta em Espólios. Ela indica a popularidade da carta.';
  return `<article class="p56-progress-track"><div class="p56-progress-track-head"><div><span>${title}</span><b>${label(current)}</b></div><em>${next?`+${fmt(remaining)} → ${label(next)}`:'NÍVEL MÁXIMO'}</em></div><div class="p56-progress-metric"><strong>${fmt(now)}</strong><span>${metric}</span>${next?`<small>${fmt(goal)} para ${label(next)}</small>`:'<small>Progressão concluída</small>'}</div><div class="p56-progress-bar"><i style="width:${pct}%"></i></div><p>${rule}</p></article>`;
 }
 function patchDetail(){const D=window.CartP56?.Detail||window.CardDetailUI;if(!D)return;D.track=function(kind,c){return progressionTrack(kind,c);};D.__p67Progression=true;window.CardDetailUI=D;}
 function settle(){patchDetail();}
 settle();queueMicrotask(settle);document.addEventListener('DOMContentLoaded',settle,{once:true});window.addEventListener('pageshow',settle);
 window.CartP67={VERSION,progressionTrack,settle};
})();
