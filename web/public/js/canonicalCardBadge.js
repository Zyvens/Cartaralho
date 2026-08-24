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
 function decorate(root=document){
  root.querySelectorAll?.('.p57-library-card-shell[data-card-id]').forEach(shell=>{
   const original=state.originalIds.has(String(shell.dataset.cardId));
   shell.querySelector('.canonical-original-badge')?.remove();
   const card=shell.querySelector('.p57-library-game-card,.game-card');
   const existing=card?.querySelector('.canonical-original-mark');
   if(!original){existing?.remove();return;}
   if(!card||existing)return;
   const mark=document.createElement('span');
   mark.className='canonical-original-mark';
   mark.setAttribute('aria-label','Carta Original');
   mark.textContent='🧬 Original';
   card.appendChild(mark);
  });
 }
 async function sync(root=document){await refreshOriginals();decorate(root);}
 const observer=new MutationObserver(records=>{
  if(!AuthClient?.user)return;
  const relevant=records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('.p57-library-card-shell,.p57-cards-library')||n.querySelector?.('.p57-library-card-shell'))));
  if(relevant)sync(document);
 });
 if(document.body)observer.observe(document.body,{childList:true,subtree:true});
 window.addEventListener('pageshow',()=>sync(document));
 window.addEventListener('cartaralho:cards-changed',()=>sync(document));
 setTimeout(()=>sync(document),0);
 window.CanonicalCardOriginalUI={sync,decorate,refreshOriginals,state};
})();
