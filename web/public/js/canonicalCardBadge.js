(()=>{
 const previous=HomeScreen.renderCards;
 HomeScreen.renderCards=async panel=>{
  await previous(panel);
  const cards=await AuthClient.cards();
  const originals=new Set(cards.filter(card=>card.isOriginal).map(card=>String(card.id)));
  const decorate=()=>panel.querySelectorAll('.profile-card[data-card-id]').forEach(card=>{
   if(!originals.has(String(card.dataset.cardId))||card.querySelector('.canonical-original-badge'))return;
   const badge=document.createElement('span');
   badge.className='canonical-original-badge';
   badge.textContent='🧬 CARTA ORIGINAL';
   badge.style.cssText='display:inline-flex;width:max-content;margin-top:.35rem;padding:.24rem .48rem;border:1px solid rgba(129,140,248,.42);border-radius:999px;background:rgba(79,70,229,.12);font-size:.68rem;font-weight:800;letter-spacing:.05em;color:#c7d2fe';
   card.appendChild(badge);
  });
  decorate();
  const list=panel.querySelector('#card-list');
  if(list)new MutationObserver(decorate).observe(list,{childList:true});
 };
})();
