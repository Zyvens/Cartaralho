'use strict';
(()=>{
 if(window.CartP66)return;
 const VERSION='v1.4.66';
 const LABEL={standard:'Padrão',copper:'Bronze',bronze:'Bronze',silver:'Prata',gold:'Ouro',platinum:'Platina'};
 const fmt=v=>Number(v||0).toLocaleString('pt-BR');
 const label=v=>LABEL[String(v||'standard').toLowerCase()]||String(v||'Padrão');

 function progressionTrack(kind,c){
  const background=kind==='material';
  const progress=background?c?.materialProgress:c?.borderProgress;
  const current=background?c?.materialTier:c?.borderTier;
  const explicit=background?c?.personalRoundWins:c?.worldHolders;
  const now=Number(explicit??progress?.current??0);
  const remaining=Math.max(0,Number(progress?.remaining||0));
  const next=progress?.nextTier||null;
  const goal=next?now+remaining:now;
  const pct=next?Math.max(3,Math.min(100,goal>0?(now/goal)*100:0)):100;
  const title=background?'FUNDO':'CONTORNO';
  const metric=background?'rodadas vencidas com esta carta':'pessoas que possuem esta carta no mundo';
  const rule=background
   ?'O fundo sobe quando você vence uma rodada utilizando esta carta.'
   :'O contorno sobe conforme mais jogadores passam a possuir esta mesma Carta Canônica. Cartas coletadas por Espólio entram automaticamente nesta contagem.';
  return `<article class="p56-progress-track"><div class="p56-progress-track-head"><div><span>${title}</span><b>${label(current)}</b></div><em>${next?`+${fmt(remaining)} → ${label(next)}`:'NÍVEL MÁXIMO'}</em></div><div class="p56-progress-metric"><strong>${fmt(now)}</strong><span>${metric}</span>${next?`<small>${fmt(goal)} para ${label(next)}</small>`:'<small>Progressão concluída</small>'}</div><div class="p56-progress-bar"><i style="width:${pct}%"></i></div><p>${rule}</p></article>`;
 }

 function patchDetail(){
  const D=window.CartP56?.Detail||window.CardDetailUI;if(!D||D.__p66Progression)return;
  D.__p66Progression=true;
  D.track=function(kind,c){return progressionTrack(kind,c);};
  window.CardDetailUI=D;
 }

 function decorateLibrary(panel,cards){
  if(!panel||!Array.isArray(cards))return;
  const byId=new Map(cards.map(c=>[String(c.id),c]));
  panel.querySelectorAll('.p56-library-card[data-card-id]').forEach(el=>{
   const c=byId.get(String(el.dataset.cardId)),small=el.querySelector('small');if(!c||!small)return;
   small.textContent=`Fundo ${label(c.materialTier)} · contorno ${label(c.borderTier)} · ${fmt(c.personalRoundWins)} vitória${Number(c.personalRoundWins||0)===1?'':'s'} · ${fmt(c.worldHolders)} dono${Number(c.worldHolders||0)===1?'':'s'}`;
  });
 }
 function patchLibrary(){
  const L=window.CartP56?.Library;if(!L||L.__p66Progression)return;
  L.__p66Progression=true;
  const base=L.render.bind(L);
  L.render=async function(panel,...args){const cards=await base(panel,...args);decorateLibrary(panel,cards);return cards;};
 }

 function settle(){patchDetail();patchLibrary();}
 settle();queueMicrotask(settle);
 window.addEventListener('pageshow',settle);
 window.CartP66={VERSION,progressionTrack,decorateLibrary,settle};
})();
