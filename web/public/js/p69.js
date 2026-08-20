'use strict';
(()=>{
 if(window.CartP69)return;
 const VERSION='v1.4.69';
 let statsObserver=null,libraryObserver=null,lastCards=[];

 function purgeStatsEconomy(root){
  if(!root)return;
  root.querySelectorAll('.p61-stats-ledger,.p54-stats-ledger,.stats-economy,.economy-history,.economy-ledger,[class*="stats-ledger"]').forEach(node=>node.remove());
  root.querySelectorAll('.meta-section,.market-section,section,details').forEach(node=>{
   const heading=node.querySelector('h2,h3,h4,summary,.market-section-title')?.textContent||'';
   if(/moedas\s+sujas|extrato|movimenta(?:ção|ções)|economia/i.test(heading))node.remove();
  });
 }
 function watchStats(root){
  statsObserver?.disconnect();statsObserver=null;
  purgeStatsEconomy(root);
  if(!window.MutationObserver)return;
  statsObserver=new MutationObserver(()=>purgeStatsEconomy(root));
  statsObserver.observe(root,{childList:true,subtree:true});
 }
 async function renderStatsOnly(panel){
  const renderer=window.MetaUI?.renderStats;
  if(typeof renderer!=='function')throw new Error('Estatísticas indisponíveis.');
  const out=await renderer.call(MetaUI,panel);
  const root=panel.querySelector('.home-form.profile-panel')||panel;
  watchStats(root);
  queueMicrotask(()=>purgeStatsEconomy(root));
  requestAnimationFrame(()=>purgeStatsEconomy(root));
  return out;
 }
 function patchStats(){
  if(!window.HomeScreen||!window.MetaUI)return;
  HomeScreen.renderStats=renderStatsOnly;
  HomeScreen.__p69StatsOnly=true;
  if(window.CartP61)CartP61.renderStats=renderStatsOnly;
  if(window.CartP54)CartP54.mountStatsLedger=panel=>{const root=panel?.querySelector?.('.home-form.profile-panel')||panel;purgeStatsEconomy(root);return null;};
  const active=document.querySelector('.app-panel-body .home-form.profile-panel,#home-panel .home-form.profile-panel');
  if(active&&/Estatísticas/i.test(active.querySelector('h3')?.textContent||''))watchStats(active);
 }

 function creatorLabel(c){
  if(c?.is_native)return'Cartaralho';
  const o=c?.origin||{};
  return String(o.creatorUsername||o.creatorName||'Não identificado');
 }
 function decorateLibrary(panel,cards=lastCards){
  if(!panel||!Array.isArray(cards))return;
  lastCards=cards;
  const byId=new Map(cards.map(c=>[String(c.id),c]));
  panel.querySelectorAll('.p56-library-card[data-card-id]').forEach(card=>{
   const data=byId.get(String(card.dataset.cardId));if(!data)return;
   card.querySelectorAll('.card-origin-tag.player').forEach(tag=>tag.remove());
   const footer=card.querySelector('small');if(footer)footer.textContent=`Criado por ${creatorLabel(data)}`;
  });
 }
 function watchLibrary(panel,cards){
  libraryObserver?.disconnect();libraryObserver=null;
  decorateLibrary(panel,cards);
  if(!window.MutationObserver)return;
  libraryObserver=new MutationObserver(()=>decorateLibrary(panel,lastCards));
  const root=panel.querySelector('#library-grid')||panel;
  libraryObserver.observe(root,{childList:true,subtree:true});
 }
 function patchLibrary(){
  const L=window.CartP56?.Library;if(!L)return;
  if(!L.__p69PersistentAuthor){
   L.__p69PersistentAuthor=true;
   const base=L.render.bind(L);
   L.render=async function(panel,...args){const cards=await base(panel,...args);watchLibrary(panel,cards||[]);return cards;};
  }
  L.consolidate?.();
  const panel=document.querySelector('.app-panel-body,#home-panel');
  if(panel?.querySelector('.p56-library-card')&&lastCards.length)watchLibrary(panel,lastCards);
 }

 function settle(){patchStats();patchLibrary();}
 settle();queueMicrotask(settle);
 document.addEventListener('DOMContentLoaded',settle,{once:true});
 window.addEventListener('pageshow',settle);
 window.CartP69={VERSION,purgeStatsEconomy,renderStatsOnly,creatorLabel,decorateLibrary,watchLibrary,settle};
})();
