'use strict';
(()=>{
 if(window.CartCardOriginalUI)return;
 CartDomains.claim('cardOriginalUI','domains/cardOriginalUI.js',()=>{
  const badgeText='🧬 CARTA ORIGINAL';
  function decorate(panel,cards=[]){
   if(!panel)return;
   const originals=new Set((cards||[]).filter(c=>c?.isOriginal||c?.is_original).map(c=>String(c.id)));
   panel.querySelectorAll('.p57-library-card-shell[data-card-id]').forEach(shell=>{
    const existing=shell.querySelector('.canonical-original-badge');
    if(!originals.has(String(shell.dataset.cardId))){existing?.remove();return;}
    if(existing)return;
    const meta=shell.querySelector('.p57-library-card-meta')||shell;
    const badge=document.createElement('span');
    badge.className='canonical-original-badge';
    badge.textContent=badgeText;
    badge.style.cssText='display:inline-flex;width:max-content;margin-top:.35rem;padding:.24rem .48rem;border:1px solid rgba(129,140,248,.42);border-radius:999px;background:rgba(79,70,229,.12);font-size:.68rem;font-weight:800;letter-spacing:.05em;color:#c7d2fe';
    meta.appendChild(badge);
   });
  }
  function install(){
   if(!window.HomeScreen||!window.CartCardsLibrary||HomeScreen.renderCards?.__cardOriginalOwned)return false;
   const base=HomeScreen.renderCards.bind(HomeScreen);
   const render=async function(panel){const cards=await base(panel);decorate(panel,cards);return cards;};
   render.__cardOriginalOwned=true;
   HomeScreen.renderCards=render;
   if(typeof ProfessionalUI!=='undefined')ProfessionalUI.renderCards=render;
   if(typeof MetaUI!=='undefined')MetaUI.renderCards=render;
   return true;
  }
  install();
  window.CartCardOriginalUI={install,decorate,badgeText};
 });
})();
