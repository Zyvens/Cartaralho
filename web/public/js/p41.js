'use strict';
(()=>{
 const VERSION='v1.4.41';
 const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
 const fmtDate=v=>v?new Date(v).toLocaleDateString('pt-BR'):'Não registrada';
 const tierLabel=v=>({standard:'Padrão',copper:'Cobre',bronze:'Bronze',silver:'Prata',gold:'Ouro',platinum:'Platina'}[String(v||'standard').toLowerCase()]||String(v||'Padrão'));

 function polishCardCreation(){
  const top=document.querySelector('.card-creation-screen > #back-btn');
  if(top&&/Salvar e voltar ao Lobby/i.test(top.textContent||''))top.remove();
 }

 async function sendCurrentUpdate(btn){
  if(!btn||btn.disabled)return;
  const old=btn.innerHTML;btn.disabled=true;btn.textContent='Enviando...';
  try{
   await AuthClient.request('/api/admin/creator-tools',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'megaphone',scope:'global',message:`Nova atualização ${VERSION} disponível. Reinicie o jogo para adicionar as atualizações.`})});
   Toast.success('Aviso de atualização megafonado.');
  }catch(e){Toast.error(e.message);}finally{btn.disabled=false;btn.innerHTML=old;}
 }
 function polishAdmin(){
  const eyebrow=document.querySelector('.creator-admin-head small');
  if(eyebrow)eyebrow.textContent='ADMIN • VitorIvens';
  const security=document.querySelector('.creator-admin-security');
  if(security)security.textContent='A interface administrativa aparece apenas para o administrador autorizado. O servidor valida a identidade novamente antes de executar qualquer comando e os créditos são protegidos contra duplicação.';
  const update=document.getElementById('admin-update-send');
  if(update&&!update.dataset.p41Update){update.dataset.p41Update='1';update.onclick=()=>sendCurrentUpdate(update);}
 }

 function closeCardDetail(){document.getElementById('p41-card-detail-overlay')?.remove();}
 function progressCopy(kind,current,progress){
  const next=progress?.nextTier;
  const remaining=Number(progress?.remaining);
  const help=kind==='material'?'Evolui conforme esta carta é usada em partidas diferentes.':'Evolui quando outros jogadores recriam esta carta em partidas em que você participou.';
  return `<article class="p41-progression-card"><span>${kind==='material'?'MATERIAL':'CONTORNO'}</span><div class="p41-tier-row"><b>${esc(tierLabel(current))}</b>${next?`<em>Próximo: ${esc(tierLabel(next))}</em>`:'<em>Nível máximo</em>'}</div><p>${help}</p>${next&&Number.isFinite(remaining)?`<small>Faltam <strong>${remaining.toLocaleString('pt-BR')}</strong> para a próxima evolução.</small>`:'<small>Esta evolução já chegou ao nível máximo.</small>'}</article>`;
 }
 function openCardDetail(card){
  closeCardDetail();
  const o=card.origin||{},isBlack=card.type==='blackCards';
  const overlay=document.createElement('div');overlay.id='p41-card-detail-overlay';overlay.className='p41-card-detail-overlay';
  overlay.innerHTML=`<section class="p41-card-detail-shell" role="dialog" aria-modal="true" aria-label="Detalhes da carta"><header class="p41-card-detail-head"><div><small>${isBlack?'🖤 CARTA PRETA':'🤍 CARTA BRANCA'}</small><h2>Detalhes da carta</h2></div><button class="p41-card-detail-close" type="button" aria-label="Fechar">✕</button></header><div class="p41-card-detail-body"><div class="p41-card-preview ${isBlack?'black':'white'}"><b>${esc(card.text)}</b><span>CARTA PARA CARTARALHO</span></div><div class="p41-progression-grid">${progressCopy('material',card.materialTier,card.materialProgress)}${progressCopy('border',card.borderTier,card.borderProgress)}</div><section class="p41-origin-section"><div class="p41-section-title"><span>ORIGEM</span><h3>História desta carta</h3></div><div class="p41-origin-grid"><div><small>Criada por</small><b>${esc(o.creatorName||'Legado do Cartaralho')}</b>${o.creatorUsername?`<span>@${esc(o.creatorUsername)}</span>`:''}</div><div><small>Primeira mesa</small><b>${esc(o.firstRoomCode||'Não registrada')}</b></div><div><small>Primeira aparição</small><b>${esc(fmtDate(o.firstSeenAt))}</b></div><div><small>Mesas visitadas</small><b>${Number(o.tablesVisited||0).toLocaleString('pt-BR')}</b></div><div><small>Pessoas que possuem</small><b>${Number(o.holders||0).toLocaleString('pt-BR')}</b></div><div><small>Recriações</small><b>${Number(o.recreatedCount||0).toLocaleString('pt-BR')}</b></div></div></section></div></section>`;
  document.body.appendChild(overlay);
  overlay.querySelector('.p41-card-detail-close').onclick=closeCardDetail;
  overlay.addEventListener('mousedown',e=>{if(e.target===overlay)closeCardDetail();});
 }

 async function renderMyCards(panel){
  const cards=(await AuthClient.cards()).filter(c=>c.owned!==false);
  panel.innerHTML=`<div class="home-form profile-panel p41-my-cards-panel"><button class="panel-close">✕</button><div class="p41-my-cards-heading"><span>COLEÇÃO</span><h3>Minhas Cartas</h3><p>Busque, filtre, favorite ou toque em uma carta para ver sua evolução e origem.</p></div><div class="card-tools"><input id="card-search" class="input" placeholder="Buscar carta..."><select id="card-filter" class="input"><option value="all">Todas</option><option value="blackCards">Pretas</option><option value="whiteCards">Brancas</option><option value="favorites">Favoritas</option><option value="player">De Jogadores</option></select></div><div class="mini-card-list p41-mini-card-list" id="card-list"></div></div>`;
  const draw=()=>{
   const search=panel.querySelector('#card-search'),filter=panel.querySelector('#card-filter'),root=panel.querySelector('#card-list');if(!root)return;
   const q=(search?.value||'').toLowerCase(),f=filter?.value||'all';
   const list=cards.filter(c=>c.text.toLowerCase().includes(q)&&(f==='all'||c.type===f||(f==='favorites'&&c.is_favorite)||(f==='player'&&c.is_player_card))).sort((a,b)=>Number(!!b.is_favorite)-Number(!!a.is_favorite)||String(a.text).localeCompare(String(b.text),'pt-BR'));
   root.innerHTML=list.map(c=>`<article class="profile-card p41-collection-card tier-${esc(c.materialTier)} border-${esc(c.borderTier)}" data-card-id="${c.id}" tabindex="0"><button class="favorite-card ${c.is_favorite?'on':''}" data-fav-id="${c.id}" aria-label="${c.is_favorite?'Remover dos favoritos':'Adicionar aos favoritos'}">${c.is_favorite?'★':'☆'}</button><span class="p41-card-type">${c.type==='blackCards'?'🖤 PRETA':'🤍 BRANCA'}</span><b>${esc(c.text)}</b><small>${esc(tierLabel(c.materialTier))} · contorno ${esc(tierLabel(c.borderTier))} · ${Number(c.matches_used||0).toLocaleString('pt-BR')} partida${Number(c.matches_used||0)===1?'':'s'}</small></article>`).join('')||'<p class="p41-empty-cards">Nenhuma carta encontrada.</p>';
   root.querySelectorAll('[data-fav-id]').forEach(btn=>btn.onclick=async e=>{e.stopPropagation();const c=cards.find(x=>String(x.id)===String(btn.dataset.favId));if(!c)return;c.is_favorite=!c.is_favorite;try{await AuthClient.favoriteCard(c.id,c.is_favorite);draw();}catch(err){c.is_favorite=!c.is_favorite;Toast.error(err.message);}});
   root.querySelectorAll('[data-card-id]').forEach(el=>{const open=()=>{const c=cards.find(x=>String(x.id)===String(el.dataset.cardId));if(c)openCardDetail(c);};el.onclick=open;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}};});
  };
  panel.querySelector('#card-search').oninput=draw;panel.querySelector('#card-filter').onchange=draw;draw();
 }
 function patchMyCards(){if(typeof MetaUI==='undefined'||MetaUI.__p41Cards)return;MetaUI.__p41Cards=true;MetaUI.renderCards=renderMyCards;}

 function closeRecycleConfirm(){document.getElementById('p41-recycle-confirm-overlay')?.remove();}
 function patchRecycling(){
  if(typeof MarketRecycling==='undefined'||MarketRecycling.__p41AnyCount)return;MarketRecycling.__p41AnyCount=true;
  MarketRecycling.paint=function(body,m){
   body.classList.remove('recycling-loading');const d=this.data||{},cards=d.cards||[],per=Number(d.policy?.rewardPerCard)||25,n=this.selected.size,valid=n>0,projected=n*per;
   body.innerHTML=`<section class="recycling-hero"><div><small>RECICLAGEM</small><h3>♻️ Desapega que passa.</h3><p>Selecione quantas Cartas de Jogador quiser retirar da coleção. A carta original, autoria e histórico continuam existindo.</p></div><div class="recycling-rate"><small>VALOR POR CARTA</small><b>🪙 ${m.money(per)}</b><span>cada carta reciclada</span></div></section><div class="recycling-warning">A reciclagem é permanente para a sua coleção atual. Você poderá adquirir a carta novamente no futuro.</div><div class="recycling-toolbar"><div><b>${n} selecionada${n===1?'':'s'}</b><small>${valid?`Você recebe 🪙 ${m.money(projected)}.`:'Selecione uma ou mais cartas.'}</small></div><button id="recycle-submit" class="btn btn-primary" ${valid&&!this.busy&&d.marketplaceEnabled!==false?'':'disabled'}>♻️ Reciclar${valid?' · 🪙 '+m.money(projected):''}</button></div><div class="recycling-grid">${cards.map(c=>`<button class="recycling-card ${this.selected.has(String(c.canonicalCardId))?'is-selected':''}" data-recycle-card="${c.canonicalCardId}" type="button"><span class="recycling-check">${this.selected.has(String(c.canonicalCardId))?'✓':''}</span><small>${c.type==='black'?'🖤 PRETA':'🤍 BRANCA'}${c.isFavorite?' · ⭐ FAVORITA':''}</small><b>${m.esc(c.text)}</b><span>${c.authors?`por ${m.esc(c.authors)}`:'Autoria não identificada'}</span></button>`).join('')||'<div class="market-empty recycling-empty">Você não possui Cartas de Jogador disponíveis para reciclar.</div>'}</div>`;
   body.querySelectorAll('[data-recycle-card]').forEach(card=>card.onclick=()=>{const id=String(card.dataset.recycleCard);this.selected.has(id)?this.selected.delete(id):this.selected.add(id);this.paint(body,m);});
   body.querySelector('#recycle-submit')?.addEventListener('click',()=>this.confirm(body,m));
  };
  MarketRecycling.confirm=function(body,m){
   const ids=[...this.selected].map(Number);if(!ids.length)return;const per=Number(this.data?.policy?.rewardPerCard)||25,reward=ids.length*per,chosen=(this.data?.cards||[]).filter(c=>ids.includes(Number(c.canonicalCardId)));
   closeRecycleConfirm();const overlay=document.createElement('div');overlay.id='p41-recycle-confirm-overlay';overlay.className='p41-recycle-confirm-overlay';overlay.innerHTML=`<section class="p41-recycle-confirm-shell" role="dialog" aria-modal="true"><header><div><small>CONFIRMAR RECICLAGEM</small><h2>${ids.length} carta${ids.length===1?'':'s'} · 🪙 ${m.money(reward)}</h2><p>Confira a seleção antes de reciclar. Esta ação remove as cartas da sua coleção atual.</p></div></header><div class="p41-recycle-confirm-list">${chosen.map(c=>`<article class="p41-recycle-card-preview ${c.type==='black'?'black':'white'}"><span>${c.type==='black'?'🖤 Carta Preta':'🤍 Carta Branca'}</span><b>${m.esc(c.text)}</b></article>`).join('')}</div><div class="p41-recycle-confirm-actions"><button class="btn btn-secondary" id="p41-recycle-cancel">Cancelar</button><button class="btn btn-primary" id="p41-recycle-go">♻️ Reciclar por 🪙 ${m.money(reward)}</button></div></section>`;document.body.appendChild(overlay);
   overlay.querySelector('#p41-recycle-cancel').onclick=closeRecycleConfirm;overlay.addEventListener('mousedown',e=>{if(e.target===overlay)closeRecycleConfirm();});overlay.querySelector('#p41-recycle-go').onclick=()=>{closeRecycleConfirm();this.recycle(body,m,ids);};
  };
 }

 function patchCardCreation(){if(typeof CardCreationScreen==='undefined'||CardCreationScreen.__p41TopButton)return;CardCreationScreen.__p41TopButton=true;const base=CardCreationScreen.render.bind(CardCreationScreen);CardCreationScreen.render=async function(...args){const out=await base(...args);polishCardCreation();return out;};}
 function settle(){polishCardCreation();polishAdmin();patchMyCards();patchRecycling();patchCardCreation();}
 const observer=new MutationObserver(()=>queueMicrotask(settle));observer.observe(document.documentElement,{childList:true,subtree:true});
 document.addEventListener('DOMContentLoaded',settle);settle();
 window.CartP41={VERSION,openCardDetail,polishAdmin,polishCardCreation};
})();
