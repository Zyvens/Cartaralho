'use strict';
(()=>{
 if(window.CartP70)return;
 const VERSION='v1.4.70';
 const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
 const isBlack=c=>String(c?.type)==='blackCards'||String(c?.type)==='black';
 const cardText=c=>isBlack(c)&&typeof CardComponent!=='undefined'?CardComponent._formatBlackText(c.text):esc(c?.text||'');
 const creatorLabel=c=>{
  if(c?.is_native)return'Cartaralho';
  const o=c?.origin||{};
  return String(o.creatorUsername||o.creatorName||'Não identificado');
 };

 async function renderStats(panel){
  if(!panel)throw new Error('Painel de Estatísticas indisponível.');
  if(!window.MetaUI?.renderStats)throw new Error('Estatísticas indisponíveis.');
  return MetaUI.renderStats(panel);
 }

 async function renderCards(panel){
  if(!panel)return[];
  const cards=(await AuthClient.cards()).filter(c=>c.owned!==false);let filter='all',query='';
  const owned=c=>filter==='all'||(filter==='native'&&c.is_native)||(filter==='player'&&c.is_player_card)||(filter==='favorites'&&c.is_favorite)||c.type===filter;
  panel.innerHTML=`<div class="cards-library p56-cards-library"><button type="button" id="p54-create-card-entry" class="btn btn-primary p54-create-card-entry p56-create-card-entry"><span>＋</span><b>Criar nova Carta de Jogador</b></button><div class="cards-library-toolbar"><div class="cards-search-wrap"><span>⌕</span><input id="library-search" class="input" placeholder="Buscar na coleção..."></div><div class="cards-filter-tabs"><button data-card-filter="all" class="active">Todas</button><button data-card-filter="native">Nativas</button><button data-card-filter="player">De Jogadores</button><button data-card-filter="blackCards">Pretas</button><button data-card-filter="whiteCards">Brancas</button><button data-card-filter="favorites">Favoritas</button></div></div><div class="cards-library-summary"><span><b>${cards.length}</b> cartas</span><span><b>${cards.filter(c=>c.is_native).length}</b> nativas</span><span><b>${cards.filter(c=>c.is_player_card).length}</b> de jogadores</span></div><div id="library-grid" class="cards-library-grid p56-library-grid"></div></div>`;
  const draw=()=>{
   const root=panel.querySelector('#library-grid');if(!root)return;
   const list=cards.filter(c=>(!query||String(c.text||'').toLowerCase().includes(query))&&owned(c));
   root.innerHTML=list.map(c=>{
    const origin=c.is_native?'<em class="card-origin-tag native">NATIVA</em>':(!c.is_player_card?'<em class="card-origin-tag legacy">COLEÇÃO</em>':'');
    return`<article class="library-card p56-library-card tier-${esc(c.materialTier)} border-${esc(c.borderTier)}" data-card-id="${c.id}" tabindex="0"><button class="favorite-card ${c.is_favorite?'on':''}" data-fav-id="${c.id}" aria-label="${c.is_favorite?'Remover dos favoritos':'Adicionar aos favoritos'}">${c.is_favorite?'★':'☆'}</button><div class="library-card-top"><span>${isBlack(c)?'🖤':'🤍'}</span><div>${origin}</div></div><b class="p56-library-card-text">${cardText(c)}</b><small class="p70-card-author">Criado por ${esc(creatorLabel(c))}</small></article>`;
   }).join('')||'<div class="app-panel-empty"><b>Nenhuma carta encontrada.</b><p>Tente outro filtro ou termo de busca.</p></div>';
   root.querySelectorAll('[data-fav-id]').forEach(btn=>btn.onclick=async e=>{
    e.stopPropagation();const c=cards.find(x=>String(x.id)===String(btn.dataset.favId));if(!c)return;
    const old=!!c.is_favorite;c.is_favorite=!old;
    try{await AuthClient.favoriteCard(c.id,c.is_favorite);draw();}catch(err){c.is_favorite=old;Toast.error(err.message);}
   });
   root.querySelectorAll('[data-card-id]').forEach(el=>{
    const open=e=>{if(e?.target?.closest?.('[data-fav-id]'))return;const c=cards.find(x=>String(x.id)===String(el.dataset.cardId));const detail=window.CartP56?.Detail||window.CardDetailUI;if(c&&detail?.open)detail.open(c);};
    el.onclick=open;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(e);}};
   });
  };
  panel.querySelector('#library-search').oninput=e=>{query=e.target.value.toLowerCase().trim();draw();};
  panel.querySelectorAll('[data-card-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.cardFilter;panel.querySelectorAll('[data-card-filter]').forEach(x=>x.classList.toggle('active',x===b));draw();});
  panel.querySelector('#p54-create-card-entry').onclick=()=>{const open=window.CartP48?.openLibraryCreator;if(typeof open==='function')open.call(CartP48,panel,'whiteCards');else Toast.error('Não foi possível abrir a criação de cartas.');};
  draw();return cards;
 }

 function install(){
  if(typeof HomeScreen!=='undefined'){
   HomeScreen.renderStats=renderStats;
   HomeScreen.renderCards=renderCards;
   HomeScreen.__p70CanonicalStats=true;
   HomeScreen.__p70CanonicalCards=true;
  }
  if(window.ProfessionalUI)ProfessionalUI.renderCards=renderCards;
  if(window.MetaUI)MetaUI.renderCards=renderCards;
  if(window.CartP56?.Library)CartP56.Library.render=renderCards;
  if(window.CartP61)CartP61.renderStats=renderStats;
  if(window.CartP54)CartP54.mountStatsLedger=()=>null;
 }

 install();
 window.addEventListener('pageshow',install);
 window.CartP70={VERSION,creatorLabel,renderStats,renderCards,install};
})();
