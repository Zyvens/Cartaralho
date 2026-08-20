'use strict';
(()=>{
 if(window.CartP56)return;
 const VERSION='v1.4.56';
 const TIER_LABEL={standard:'Padrão',copper:'Copper',bronze:'Bronze',silver:'Silver',gold:'Gold',platinum:'Platinum'};
 const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
 const fmt=v=>Number(v||0).toLocaleString('pt-BR');
 const tier=v=>TIER_LABEL[String(v||'standard').toLowerCase()]||String(v||'Padrão');
 const isBlack=c=>String(c?.type)==='blackCards'||String(c?.type)==='black';
 const cardText=c=>isBlack(c)&&window.CardComponent?CardComponent._formatBlackText(c.text):esc(c?.text||'');
 const creatorLabel=c=>{
  if(c?.is_native)return'Cartaralho';
  const o=c?.origin||{};
  return String(o.creatorUsername||c?.creator_username||o.creatorName||c?.creator_name||'Não identificado').replace(/^@/,'');
 };

 const AccountActions={
  decorate(){
   const strip=document.querySelector('.home-account-bar,.account-strip');
   const profile=document.getElementById('profile-shortcut'),logout=document.getElementById('logout-btn');
   if(!strip||!profile||!logout)return;
   let actions=strip.querySelector('.p56-account-actions');
   if(!actions){actions=document.createElement('div');actions.className='p56-account-actions';strip.insertBefore(actions,profile);actions.append(profile,logout);}
   profile.classList.add('p56-account-action','p56-profile-action');
   logout.classList.add('p56-account-action','p56-logout-action');
   profile.innerHTML='<span class="p56-account-action-icon" aria-hidden="true">👤</span><span class="p56-account-action-copy"><b>Perfil</b><small>Conta e aparência</small></span>';
   logout.innerHTML='<span class="p56-account-action-icon" aria-hidden="true">↪</span><span class="p56-account-action-copy"><b>Sair</b><small>Encerrar sessão</small></span>';
   profile.setAttribute('aria-label','Abrir perfil, conta e aparência');
   logout.setAttribute('aria-label','Sair da conta');
  },
  patch(){
   if(!window.HomeScreen||HomeScreen.__p56AccountActions)return;
   HomeScreen.__p56AccountActions=true;
   const base=HomeScreen.renderAccount.bind(HomeScreen);
   HomeScreen.renderAccount=function(...args){const out=base(...args);setTimeout(()=>AccountActions.decorate(),0);return out;};
   this.decorate();
  }
 };

 const Detail={
  overlay:null,keyHandler:null,
  clearLegacy(){
   document.getElementById('p41-card-detail-overlay')?.remove();
   document.querySelector('.p55-card-detail-overlay')?.remove();
   document.body.classList.remove('p55-card-detail-open');
  },
  close(){
   this.overlay?.remove();this.overlay=null;
   if(this.keyHandler)document.removeEventListener('keydown',this.keyHandler);
   this.keyHandler=null;document.body.classList.remove('p56-card-detail-open');
  },
  preview(c){
   if(!window.CardComponent){const fallback=document.createElement('article');fallback.className=`p56-card-art ${isBlack(c)?'black':'white'}`;fallback.innerHTML=`<b>${cardText(c)}</b>`;return fallback;}
   const value={text:c.text,materialTier:c.materialTier,borderTier:c.borderTier,isPlayerCard:!!c.is_player_card};
   const node=isBlack(c)?CardComponent.createBlackCard(value,{large:true,animated:false}):CardComponent.createWhiteCard(value,{large:true,animated:false});
   node.classList.add('p56-card-art');return node;
  },
  track(kind,c){
   const material=kind==='material',progress=material?c.materialProgress:c.borderProgress,current=material?c.materialTier:c.borderTier;
   const now=Number(progress?.current||0),remaining=Math.max(0,Number(progress?.remaining||0)),next=progress?.nextTier||null,goal=next?now+remaining:now;
   const pct=next?Math.max(3,Math.min(100,goal>0?(now/goal)*100:0)):100;
   const metric=material?'partidas diferentes com uso':'recriações por outros jogadores';
   const rule=material?'O material sobe quando esta carta é usada em partidas diferentes.':'O contorno sobe quando outros jogadores recriam a mesma carta em partidas em que você participou.';
   return `<article class="p56-progress-track"><div class="p56-progress-track-head"><div><span>${material?'MATERIAL':'CONTORNO'}</span><b>${tier(current)}</b></div><em>${next?`+${fmt(remaining)} → ${tier(next)}`:'NÍVEL MÁXIMO'}</em></div><div class="p56-progress-metric"><strong>${fmt(now)}</strong><span>${metric}</span>${next?`<small>${fmt(goal)} para ${tier(next)}</small>`:'<small>Progressão concluída</small>'}</div><div class="p56-progress-bar"><i style="width:${pct}%"></i></div><p>${rule}</p></article>`;
  },
  open(c){
   if(!c)return;
   this.close();this.clearLegacy();
   const o=c.origin||{},black=isBlack(c),creator=creatorLabel(c);
   const overlay=document.createElement('div');overlay.className='p56-card-detail-overlay';
   overlay.innerHTML=`<section class="p56-card-detail-shell" role="dialog" aria-modal="true" aria-label="Detalhes da carta"><header class="p56-card-detail-header"><div><span>MINHAS CARTAS</span><h2>Ficha da carta</h2></div><button type="button" class="p56-card-detail-close" aria-label="Fechar detalhes">✕</button></header><div class="p56-card-detail-body"><aside class="p56-card-detail-visual"><div class="p56-card-preview-host"></div><div class="p56-card-tags"><span>${black?'🖤 Preta':'🤍 Branca'}</span>${c.is_native?'<span>🎴 Nativa</span>':''}${c.is_player_card?'<span>★ De jogador</span>':''}${c.is_favorite?'<span>⭐ Favorita</span>':''}</div></aside><main class="p56-card-detail-info"><section class="p56-detail-section-head"><span>PROGRESSÃO</span><h3>Do uso ao prestígio</h3><p>Os números abaixo mostram o estado atual da carta sem esconder a próxima meta.</p></section><div class="p56-progress-grid">${this.track('material',c)}${this.track('border',c)}</div><section class="p56-origin-panel"><div class="p56-origin-heading"><span>ORIGEM</span><h3>Histórico da carta</h3></div><div class="p56-origin-grid"><div><small>CRIADA POR</small><b>${esc(creator)}</b>${o.creatorUsername&&!c.is_native?`<em>@${esc(o.creatorUsername)}</em>`:''}</div><div><small>MESAS VISITADAS</small><b>${fmt(o.tablesVisited)}</b></div><div><small>PESSOAS QUE POSSUEM</small><b>${fmt(o.holders)}</b></div><div><small>PRIMEIRA MESA</small><b>${esc(o.firstRoomCode||'—')}</b></div></div>${o.originUncertain?'<p class="p56-origin-note">Parte do histórico veio de registros antigos e pode estar incompleta.</p>':''}</section></main></div></section>`;
   document.body.appendChild(overlay);
   overlay.querySelector('.p56-card-preview-host').replaceChildren(this.preview(c));
   overlay.querySelector('.p56-card-detail-close').onclick=()=>this.close();
   overlay.addEventListener('mousedown',e=>{if(e.target===overlay)this.close();});
   this.keyHandler=e=>{if(e.key==='Escape')this.close();};document.addEventListener('keydown',this.keyHandler);
   document.body.classList.add('p56-card-detail-open');this.overlay=overlay;
  }
 };

 const Library={
  async render(panel){
   if(!panel)return;
   const cards=(await AuthClient.cards()).filter(c=>c.owned!==false);let filter='all',query='';
   const owned=c=>filter==='all'||(filter==='native'&&c.is_native)||(filter==='player'&&c.is_player_card)||(filter==='favorites'&&c.is_favorite)||c.type===filter;
   panel.innerHTML=`<div class="cards-library p56-cards-library"><button type="button" id="p54-create-card-entry" class="btn btn-primary p54-create-card-entry p56-create-card-entry"><span>＋</span><b>Criar nova Carta de Jogador</b></button><div class="cards-library-toolbar"><div class="cards-search-wrap"><span>⌕</span><input id="library-search" class="input" placeholder="Buscar na coleção..."></div><div class="cards-filter-tabs"><button data-card-filter="all" class="active">Todas</button><button data-card-filter="native">Nativas</button><button data-card-filter="player">De Jogadores</button><button data-card-filter="blackCards">Pretas</button><button data-card-filter="whiteCards">Brancas</button><button data-card-filter="favorites">Favoritas</button></div></div><div class="cards-library-summary"><span><b>${cards.length}</b> cartas</span><span><b>${cards.filter(c=>c.is_native).length}</b> nativas</span><span><b>${cards.filter(c=>c.is_player_card).length}</b> de jogadores</span></div><div id="library-grid" class="cards-library-grid p56-library-grid"></div></div>`;
   const draw=()=>{
    const root=panel.querySelector('#library-grid');if(!root)return;
    const list=cards.filter(c=>(!query||String(c.text||'').toLowerCase().includes(query))&&owned(c));
    root.innerHTML=list.map(c=>`<article class="library-card p56-library-card tier-${esc(c.materialTier)} border-${esc(c.borderTier)}" data-card-id="${c.id}" tabindex="0"><button class="favorite-card ${c.is_favorite?'on':''}" data-fav-id="${c.id}" aria-label="${c.is_favorite?'Remover dos favoritos':'Adicionar aos favoritos'}">${c.is_favorite?'★':'☆'}</button><div class="library-card-top"><span>${isBlack(c)?'🖤':'🤍'}</span><div>${c.is_native?'<em class="card-origin-tag native">NATIVA</em>':c.is_player_card?'<em class="card-origin-tag player">DE JOGADOR</em>':'<em class="card-origin-tag legacy">COLEÇÃO</em>'}</div></div><b class="p56-library-card-text">${cardText(c)}</b><small>Criado por ${esc(creatorLabel(c))}</small></article>`).join('')||'<div class="app-panel-empty"><b>Nenhuma carta encontrada.</b><p>Tente outro filtro ou termo de busca.</p></div>';
    root.querySelectorAll('[data-fav-id]').forEach(btn=>btn.onclick=async e=>{e.stopPropagation();const c=cards.find(x=>String(x.id)===String(btn.dataset.favId));if(!c)return;const old=!!c.is_favorite;c.is_favorite=!old;try{await AuthClient.favoriteCard(c.id,c.is_favorite);draw();}catch(err){c.is_favorite=old;Toast.error(err.message);}});
    root.querySelectorAll('[data-card-id]').forEach(el=>{const open=e=>{if(e?.target?.closest?.('[data-fav-id]'))return;const c=cards.find(x=>String(x.id)===String(el.dataset.cardId));if(c)Detail.open(c);};el.onclick=open;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(e);}};});
   };
   panel.querySelector('#library-search').oninput=e=>{query=e.target.value.toLowerCase().trim();draw();};
   panel.querySelectorAll('[data-card-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.cardFilter;panel.querySelectorAll('[data-card-filter]').forEach(x=>x.classList.toggle('active',x===b));draw();});
   panel.querySelector('#p54-create-card-entry').onclick=()=>{const open=window.CartP48?.openLibraryCreator;if(typeof open==='function')open.call(CartP48,panel,'whiteCards');else Toast.error('Não foi possível abrir a criação de cartas.');};
   draw();return cards;
  },
  consolidate(){
   if(window.ProfessionalUI)ProfessionalUI.renderCards=(panel,...args)=>Library.render(panel,...args);
   if(window.HomeScreen)HomeScreen.renderCards=(panel,...args)=>Library.render(panel,...args);
   if(window.MetaUI)MetaUI.renderCards=(panel,...args)=>Library.render(panel,...args);
  }
 };

 AccountActions.patch();Library.consolidate();
 window.addEventListener('pageshow',()=>{AccountActions.decorate();Library.consolidate();});
 window.CardDetailUI=Detail;
 window.CartP56={VERSION,AccountActions,Detail,Library,creatorLabel};
})();
