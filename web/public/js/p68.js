'use strict';
(()=>{
 if(window.CartP68)return;
 const VERSION='v1.4.68';
 const TIER_RANK={standard:0,copper:1,bronze:1,silver:2,gold:3,platinum:4};
 const RARITY_BY_RANK=[
  {key:'common',label:'Comum'},
  {key:'uncommon',label:'Incomum'},
  {key:'rare',label:'Rara'},
  {key:'epic',label:'Épica'},
  {key:'legendary',label:'Lendária'}
 ];
 const fmt=v=>Number(v||0).toLocaleString('pt-BR');
 const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
 function tierRank(v){return TIER_RANK[String(v||'standard').toLowerCase()]??0;}
 function winLossCoefficient(card){
  const wins=Math.max(0,Number(card?.globalWins??card?.origin?.globalWins??0));
  const losses=Math.max(0,Number(card?.globalLosses??card?.origin?.globalLosses??0));
  if(!Number.isFinite(wins)||!Number.isFinite(losses))return null;
  if(losses===0)return wins>0?1:null;
  const value=wins/losses;
  return Number.isFinite(value)?value:null;
 }
 function rarityState(card){
  const rank=Math.min(tierRank(card?.materialTier),tierRank(card?.borderTier));
  const base=RARITY_BY_RANK[Math.max(0,Math.min(4,rank))]||RARITY_BY_RANK[0];
  const coefficient=winLossCoefficient(card);
  if(rank>=4&&coefficient!==null&&coefficient>=.8)return{key:'super-trunfo',label:'Super Trunfo',rank:5,coefficient};
  return{...base,rank,coefficient};
 }
 function formatDate(value){
  if(!value)return'—';
  const date=new Date(value);if(Number.isNaN(date.getTime()))return'—';
  return date.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'});
 }
 function creatorData(card){
  if(card?.is_native)return{name:'Cartaralho',username:null};
  const o=card?.origin||{};
  return{name:String(o.creatorName||o.creatorUsername||'Não identificado'),username:o.creatorUsername?`@${String(o.creatorUsername).replace(/^@/,'')}`:null};
 }
 function cell(label,value,sub=null){return`<div><small>${esc(label)}</small><b>${esc(value)}</b>${sub?`<em>${esc(sub)}</em>`:''}</div>`;}
 function rebuildHistory(overlay,card){
  const grid=overlay?.querySelector('.p56-origin-grid');if(!grid)return;
  const o=card?.origin||{},creator=creatorData(card);
  const seen=Math.max(0,Number(card?.externalPresenceMatches??o.seenByCurrentUser??0));
  const holders=Math.max(0,Number(card?.worldHolders??o.holders??0));
  const plays=Math.max(0,Number(card?.globalPlays??o.globalPlays??o.tablesVisited??0));
  const wins=Math.max(0,Number(card?.globalWins??o.globalWins??0));
  const losses=Math.max(0,Number(card?.globalLosses??o.globalLosses??Math.max(0,plays-wins)));
  grid.classList.add('p68-origin-grid');
  grid.innerHTML=[
   cell('CRIADO POR',creator.name,creator.username),
   cell('DATA',formatDate(o.createdAt||card?.created_at)),
   cell('PRIMEIRA MESA',o.firstRoomCode||'—'),
   cell('AVISTADA EM JOGOS',fmt(seen)),
   cell('PESSOAS QUE POSSUEM',fmt(holders)),
   cell('MESAS VISITADAS',fmt(plays)),
   cell('MESAS VENCEDORAS',fmt(wins)),
   cell('MESAS PERDEDORAS',fmt(losses))
  ].join('');
 }
 function decorateRarity(overlay,card){
  if(!overlay)return null;
  const rarity=rarityState(card),shell=overlay.querySelector('.p56-card-detail-shell'),tags=overlay.querySelector('.p56-card-tags');
  if(shell){
   [...shell.classList].filter(x=>x.startsWith('p68-rarity-')).forEach(x=>shell.classList.remove(x));
   shell.classList.add('p68-rarity-themed',`p68-rarity-${rarity.key}`);
   shell.dataset.cardRarity=rarity.key;
  }
  if(tags){
   tags.querySelectorAll('.p68-rarity-pill').forEach(x=>x.remove());
   [...tags.children].forEach(x=>{if(/\b(?:Branca|Preta)\b/i.test(x.textContent||''))x.remove();});
   const pill=document.createElement('span');pill.className=`p68-rarity-pill p68-rarity-pill-${rarity.key}`;pill.textContent=rarity.label;
   if(rarity.key==='super-trunfo')pill.title='Super Trunfo: Lendária com coeficiente global de vitórias/derrotas igual ou superior a 80%.';
   tags.prepend(pill);
  }
  return rarity;
 }
 function decorateDetail(card){
  const overlay=document.querySelector('.p56-card-detail-overlay');if(!overlay||!card)return;
  decorateRarity(overlay,card);rebuildHistory(overlay,card);
 }
 function patchDetail(){
  const D=window.CartP56?.Detail||window.CardDetailUI;if(!D||D.__p68RarityHistory)return;
  D.__p68RarityHistory=true;
  const base=D.open.bind(D);
  D.open=function(card,...args){const out=base(card,...args);decorateDetail(card);return out;};
  window.CardDetailUI=D;
 }
 function settle(){patchDetail();}
 settle();queueMicrotask(settle);
 document.addEventListener('DOMContentLoaded',settle,{once:true});
 window.addEventListener('pageshow',settle);
 window.CartP68={VERSION,tierRank,winLossCoefficient,rarityState,formatDate,creatorData,rebuildHistory,decorateRarity,decorateDetail,settle};
})();
