(()=>{
'use strict';
if(!window.MarketUI)return;
const purchaseId=()=>window.crypto?.randomUUID?.()||`cosmetic-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const ownedSet=m=>new Set((m.data?.cosmeticOwnerships||[]).map(x=>x.productKey));
const cfg=p=>p.config||{};
const RARITY_ORDER=Object.freeze({common:1,rare:2,superrare:3,epic:4,legendary:5,celestial:6});
const sortByRarity=(a,b)=>{
 const ar=RARITY_ORDER[cfg(a).rarity]||99,br=RARITY_ORDER[cfg(b).rarity]||99;
 return ar-br||Number(a.sort_order||0)-Number(b.sort_order||0)||Number(a.price||0)-Number(b.price||0)||String(a.name||'').localeCompare(String(b.name||''),'pt-BR');
};
const C={
 ensureTab(m){
  const nav=m.overlay?.querySelector('.market-tabs');if(!nav)return;
  const existing=nav.querySelector('[data-market-tab="cosmetics"]');
  if(m.data?.cosmeticsFeatureEnabled===false){existing?.remove();if(m.tab==='cosmetics')m.tab='shop';return;}
  if(existing)return;
  const b=document.createElement('button');b.className='market-tab';b.dataset.marketTab='cosmetics';b.innerHTML='✨ Cosméticos';
  const inventory=nav.querySelector('[data-market-tab="inventory"]');nav.insertBefore(b,inventory||null);
  b.onclick=()=>{m.tab='cosmetics';m.render();};
 },
 preview(p,m){
  const c=cfg(p),rarity=c.rarity||'rare',equip=c.equipKey||'',type=c.cosmeticType;
  if(type==='frame'){
   const avatar=AuthClient.user?.avatar_data?`<img src="${m.esc(AuthClient.user.avatar_data)}" alt="">`:'<span class="cosmetic-avatar-fallback">🎭</span>';
   return `<div class="cosmetic-preview-frame"><span class="avatar-frame frame-${m.esc(equip)}">${avatar}</span></div>`;
  }
  return `<div class="cosmetic-preview-title"><span class="equipped-title title-rarity-${m.esc(rarity)}" data-title-key="${m.esc(equip)}">${m.esc(p.name)}</span></div>`;
 },
 card(p,m,owned,locked){
  const c=cfg(p),rarity=c.rarity||'rare',ownedNow=owned.has(p.product_key),disabled=m.data.marketplaceEnabled===false||locked||ownedNow;
  return `<article class="market-product cosmetic-product rarity-${m.esc(rarity)} ${ownedNow?'cosmetic-owned':''}">
   <div class="cosmetic-product-top"><small>${c.cosmeticType==='frame'?'MOLDURA COSMÉTICA':'TÍTULO COMPRÁVEL'}</small><span class="cosmetic-rarity rarity-${m.esc(rarity)}">${m.esc(({common:'Comum',rare:'Incomum',superrare:'Raro',epic:'Épico',legendary:'Lendário',celestial:'Celestial'})[rarity]||rarity)}</span></div>
   ${this.preview(p,m)}<h4>${m.esc(p.name)}</h4><p>${m.esc(p.description)}</p>
   <div class="cosmetic-permanent">${ownedNow?'✓ Seu · permanente':'∞ Compra permanente'}</div>
   <div class="market-price"><strong>🪙 ${m.money(p.price)}</strong><button class="market-buy" data-buy-cosmetic="${m.esc(p.product_key)}" ${disabled?'disabled':''}>${ownedNow?'Adquirido':locked?'🔒 Nível 5':'Comprar'}</button></div>
  </article>`;
 },
 render(body,m){
  const products=(m.data.catalog||[]).filter(x=>x.category==='cosmetic'),frames=products.filter(x=>x.product_kind==='cosmetic_frame').sort(sortByRarity),titles=products.filter(x=>x.product_kind==='cosmetic_title').sort(sortByRarity),owned=ownedSet(m),level=Number(m.data.userLevel||1),min=Number(m.data.cosmeticMinimumLevel||5),locked=!m.data.cosmeticEligible;
  body.innerHTML=`<section class="cosmetic-hero"><div><small>PRESTÍGIO DUVIDOSO</small><h3>Cosméticos</h3><p>Itens permanentes, mecanicamente inúteis e visualmente indispensáveis — como todo símbolo de status respeitável.</p></div><div class="cosmetic-level ${locked?'locked':'ready'}"><span>NÍVEL</span><b>${level}</b><small>${locked?`🔒 Compras liberadas no nível ${min}`:'✓ Compras liberadas'}</small></div></section>${locked?`<div class="cosmetic-lock-note"><b>🔒 Disponível no nível ${min}</b><span>As prévias já estão liberadas. Jogue e acumule XP para comprar.</span></div>`:''}<section class="market-section"><div class="market-section-title"><div><h3>◉ Molduras de Ostentação</h3><p>Cosméticos de avatar ordenados de Comum até Celestial. Não substituem nem avançam as molduras Copper, Silver, Gold e Platinum de progressão.</p></div></div><div class="market-grid cosmetic-grid">${frames.map(p=>this.card(p,m,owned,locked)).join('')}</div></section><section class="market-section"><div class="market-section-title"><div><h3>🏷️ Títulos Compráveis</h3><p>Achievement não está à venda. Aqui ficam somente títulos explicitamente marcados como cosméticos, também ordenados por raridade.</p></div></div><div class="market-grid cosmetic-grid">${titles.map(p=>this.card(p,m,owned,locked)).join('')}</div></section><section class="cosmetic-special-note"><b>✦ Prestígio especial</b><span><strong>O Criador</strong> e <strong>Betinha</strong> nunca aparecem à venda: são entitlements especiais.</span></section>`;
  body.querySelectorAll('[data-buy-cosmetic]').forEach(b=>b.onclick=()=>this.confirm(b.dataset.buyCosmetic,m));
  window.MetaUI?.decorateTitles?.();
 },
 confirm(key,m){
  if(m.buying||!m.data.cosmeticEligible||m.data.cosmeticsFeatureEnabled===false)return;
  const p=(m.data.catalog||[]).find(x=>x.product_key===key&&x.category==='cosmetic');if(!p)return;
  Modal.show({title:`Prévia · ${p.name}`,message:`<div class="cosmetic-modal-preview">${this.preview(p,m)}</div><p>${m.esc(p.description)}</p><p><strong>Compra permanente por 🪙 ${m.money(p.price)}</strong></p>`,confirmText:'Comprar',cancelText:'Cancelar',onConfirm:()=>this.buy(p,m)});
 },
 async buy(product,m){
  if(m.buying)return;m.buying=true;
  try{
   const r=await AuthClient.request('/api/marketplace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productKey:product.product_key,purchaseId:purchaseId()})}),p=r.purchase;
   await m.load();m.render();
   Modal.show({title:p.replayed?'Compra já processada':'Prestígio adquirido',message:`<strong>${m.esc(product.name)}</strong><br>🪙 ${m.money(p.price)}<br><br>O item agora é seu permanentemente. Você pode equipá-lo no Perfil.`,confirmText:'Fechar'});
  }catch(e){Toast.error(e.message);}finally{m.buying=false;}
 }
};
const oldOpen=MarketUI.open.bind(MarketUI),oldRender=MarketUI.render.bind(MarketUI);
MarketUI.open=async function(tab='shop'){
 const target=tab==='cosmetics'?'shop':tab,r=await oldOpen(target);C.ensureTab(this);if(tab==='cosmetics'&&this.data?.cosmeticsFeatureEnabled!==false){this.tab='cosmetics';this.render();}return r;
};
MarketUI.render=function(){
 if(!this.overlay||!this.data)return;C.ensureTab(this);
 if(this.tab!=='cosmetics')return oldRender();
 this.overlay.querySelector('#market-dirty-balance').textContent=`🪙 ${this.money(this.data.dirtyBalance)}`;
 this.overlay.querySelectorAll('[data-market-tab]').forEach(b=>b.classList.toggle('active',b.dataset.marketTab==='cosmetics'));
 C.render(this.overlay.querySelector('.market-body'),this);
};
window.CosmeticUI=C;
})();
