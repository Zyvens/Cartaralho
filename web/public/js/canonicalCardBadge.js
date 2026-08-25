'use strict';
(()=>{
 if(window.CanonicalCardOriginalUI)return;
 const state={originalIds:new Set(),loading:null};
 async function refreshOriginals(){
  if(!AuthClient?.user){state.originalIds.clear();return state.originalIds;}
  if(state.loading)return state.loading;
  state.loading=(async()=>{
   try{const cards=await AuthClient.cards();state.originalIds=new Set((cards||[]).filter(c=>c?.isOriginal||c?.is_original).map(c=>String(c.id)));}
   catch(_){}
   return state.originalIds;
  })().finally(()=>{state.loading=null;});
  return state.loading;
 }
 function isOriginal(source){
  if(source&&typeof source==='object'&&(source.isOriginal||source.is_original))return true;
  const id=source&&typeof source==='object'?source.id:source;
  return id!==undefined&&id!==null&&state.originalIds.has(String(id));
 }
 function decorateCard(card,source){
  if(!card)return;
  const original=isOriginal(source);
  const existing=card.querySelector?.('.canonical-original-mark');
  if(!original){existing?.remove();return;}
  if(existing)return existing;
  const mark=document.createElement('span');
  mark.className='canonical-original-mark';
  mark.setAttribute('aria-label','Carta Original');
  mark.textContent='🧬 Original';
  card.appendChild(mark);
  return mark;
 }
 function decorate(root=document){
  root.querySelectorAll?.('.p57-library-card-shell[data-card-id]').forEach(shell=>{
   shell.querySelector('.canonical-original-badge')?.remove();
   const card=shell.querySelector('.p57-library-game-card,.game-card');
   decorateCard(card,shell.dataset.cardId);
  });
 }
 function installDetailBridge(){
  const detail=window.CardDetailUI;
  if(!detail||detail.__canonicalOriginalBridge||typeof detail.open!=='function')return !!detail?.__canonicalOriginalBridge;
  const baseOpen=detail.open.bind(detail);
  detail.open=function(card){
   const out=baseOpen(card);
   const preview=this.overlay?.querySelector?.('.p56-card-preview-host .p57-detail-game-card,.p56-card-preview-host .game-card');
   decorateCard(preview,card);
   return out;
  };
  detail.__canonicalOriginalBridge=true;
  return true;
 }
 async function sync(root=document){await refreshOriginals();decorate(root);installDetailBridge();}
 const observer=new MutationObserver(records=>{
  if(!AuthClient?.user)return;
  const relevant=records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('.p57-library-card-shell,.p57-cards-library')||n.querySelector?.('.p57-library-card-shell'))));
  if(relevant)sync(document);
 });
 if(document.body)observer.observe(document.body,{childList:true,subtree:true});
 window.addEventListener('pageshow',()=>sync(document));
 window.addEventListener('cartaralho:cards-changed',()=>sync(document));
 setTimeout(()=>sync(document),0);
 window.CanonicalCardOriginalUI={sync,decorate,decorateCard,isOriginal,installDetailBridge,refreshOriginals,state};
})();
