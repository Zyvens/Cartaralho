'use strict';
(()=>{
 if(window.CartP57)return;
 const VERSION='v1.4.57';
 const LEVEL_LABEL={standard:'Padrão',copper:'Bronze',bronze:'Bronze',silver:'Prata',gold:'Ouro',platinum:'Platina'};
 const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
 const fmt=v=>Number(v||0).toLocaleString('pt-BR');
 const label=v=>LEVEL_LABEL[String(v||'standard').toLowerCase()]||String(v||'Padrão');
 const isBlack=c=>String(c?.type)==='blackCards'||String(c?.type)==='black';
 const component=()=>typeof CardComponent!=='undefined'?CardComponent:null;
 const valueOf=c=>({text:c?.text||'',materialTier:c?.materialTier||'standard',borderTier:c?.borderTier||'standard',isPlayerCard:!!c?.is_player_card});

 function patchCardComponentLabels(){
  const C=component();if(!C||C.__p57LocalizedTiers)return;
  C.__p57LocalizedTiers=true;
  const base=C._decorate;
  C._decorate=function(card,data){
   const out=base.call(this,card,data),badge=card.querySelector('.card-progression-badge');
   if(badge){
    const material=data.materialTier!=='standard'?label(data.materialTier):'';
    const border=data.borderTier!=='standard'?` · borda ${label(data.borderTier)}`:'';
    badge.textContent=`★ ${material||'DE JOGADOR'}${border}`;
   }
   return out;
  };
 }

 function gameCard(c,{large=false,mini=false,className='' }={}){
  const C=component();
  if(!C){
   const fallback=document.createElement('article');fallback.className=`game-card ${isBlack(c)?'black':'white'} ${className}`.trim();
   fallback.innerHTML=`<div class="card-text">${isBlack(c)?esc(c?.text||'').replace(/_+/g,'<span class="black-card-gap">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>'):esc(c?.text||'')}</div><div class="card-watermark">CARTA PARA CARTARALHO</div>`;
   return fallback;
  }
  const options={large,mini,animated:false};
  const node=isBlack(c)?C.createBlackCard(valueOf(c),options):C.createWhiteCard(valueOf(c),options);
  className.split(/\s+/).filter(Boolean).forEach(x=>node.classList.add(x));
  return node;
 }

 const Detail={
  patch(){
   const D=window.CartP56?.Detail||window.CardDetailUI;if(!D||D.__p57CanonicalCard)return;
   D.__p57CanonicalCard=true;
   D.preview=c=>gameCard(c,{large:true,className:'p56-card-art p57-detail-game-card'});
   D.track=function(kind,c){
    const material=kind==='material',progress=material?c.materialProgress:c.borderProgress,current=material?c.materialTier:c.borderTier;
    const now=Number(progress?.current||0),remaining=Math.max(0,Number(progress?.remaining||0)),next=progress?.nextTier||null,goal=next?now+remaining:now;
    const pct=next?Math.max(3,Math.min(100,goal>0?(now/goal)*100:0)):100;
    const metric=material?'partidas diferentes com uso':'recriações por outros jogadores';
    const rule=material?'O material sobe quando esta carta é usada em partidas diferentes.':'O contorno sobe quando outros jogadores recriam a mesma carta em partidas em que você participou.';
    return `<article class="p56-progress-track"><div class="p56-progress-track-head"><div><span>${material?'MATERIAL':'CONTORNO'}</span><b>${label(current)}</b></div><em>${next?`+${fmt(remaining)} → ${label(next)}`:'NÍVEL MÁXIMO'}</em></div><div class="p56-progress-metric"><strong>${fmt(now)}</strong><span>${metric}</span>${next?`<small>${fmt(goal)} para ${label(next)}</small>`:'<small>Progressão concluída</small>'}</div><div class="p56-progress-bar"><i style="width:${pct}%"></i></div><p>${rule}</p></article>`;
   };
   window.CardDetailUI=D;
  }
 };

 const Library={
  async render(panel){
   if(!panel)return;
   const cards=(await AuthClient.cards()).filter(c=>c.owned!==false);let filter='all',query='';
   const matchesFilter=c=>filter==='all'||(filter==='native'&&c.is_native)||(filter==='player'&&c.is_player_card)||(filter==='favorites'&&c.is_favorite)||c.type===filter;
   panel.innerHTML=`<div class="cards-library p57-cards-library"><button type="button" id="p57-create-card-entry" class="btn btn-primary p54-create-card-entry p56-create-card-entry p57-create-card-entry"><span>＋</span><b>Criar nova Carta de Jogador</b></button><div class="cards-library-toolbar"><div class="cards-search-wrap"><span>⌕</span><input id="library-search" class="input" placeholder="Buscar na coleção..."></div><div class="cards-filter-tabs"><button data-card-filter="all" class="active">Todas</button><button data-card-filter="native">Nativas</button><button data-card-filter="player">De Jogadores</button><button data-card-filter="blackCards">Pretas</button><button data-card-filter="whiteCards">Brancas</button><button data-card-filter="favorites">Favoritas</button></div></div><div class="cards-library-summary"><span><b>${cards.length}</b> cartas</span><span><b>${cards.filter(c=>c.is_native).length}</b> nativas</span><span><b>${cards.filter(c=>c.is_player_card).length}</b> de jogadores</span></div><div id="library-grid" class="cards-library-grid p57-library-grid"></div></div>`;
   const draw=()=>{
    const root=panel.querySelector('#library-grid');if(!root)return;
    const list=cards.filter(c=>(!query||String(c.text||'').toLowerCase().includes(query))&&matchesFilter(c));root.replaceChildren();
    if(!list.length){root.innerHTML='<div class="app-panel-empty"><b>Nenhuma carta encontrada.</b><p>Tente outro filtro ou termo de busca.</p></div>';return;}
    list.forEach(c=>{
     const shell=document.createElement('article');shell.className='p57-library-card-shell';shell.dataset.cardId=c.id;shell.tabIndex=0;shell.setAttribute('role','button');shell.setAttribute('aria-label',`Abrir detalhes da carta: ${String(c.text||'')}`);
     const card=gameCard(c,{className:'p57-library-game-card'});
     const fav=document.createElement('button');fav.type='button';fav.className=`favorite-card p57-library-favorite ${c.is_favorite?'on':''}`;fav.dataset.favId=c.id;fav.setAttribute('aria-label',c.is_favorite?'Remover dos favoritos':'Adicionar aos favoritos');fav.textContent=c.is_favorite?'★':'☆';
     const meta=document.createElement('div');meta.className='p57-library-card-meta';meta.innerHTML=`<span class="p57-card-origin ${c.is_native?'native':c.is_player_card?'player':'legacy'}">${c.is_native?'NATIVA':c.is_player_card?'DE JOGADOR':'COLEÇÃO'}</span><small>${label(c.materialTier)} · contorno ${label(c.borderTier)} · ${fmt(c.matches_used)} partida${Number(c.matches_used||0)===1?'':'s'}</small>`;
     shell.append(card,fav,meta);root.appendChild(shell);
     const open=()=>{const D=window.CartP56?.Detail||window.CardDetailUI;if(D?.open)D.open(c);};
     shell.onclick=e=>{if(e.target.closest('[data-fav-id]'))return;open();};
     shell.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('[data-fav-id]')){e.preventDefault();open();}};
     fav.onclick=async e=>{e.stopPropagation();const old=!!c.is_favorite;c.is_favorite=!old;try{await AuthClient.favoriteCard(c.id,c.is_favorite);draw();}catch(err){c.is_favorite=old;Toast.error(err.message);}};
    });
   };
   panel.querySelector('#library-search').oninput=e=>{query=e.target.value.toLowerCase().trim();draw();};
   panel.querySelectorAll('[data-card-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.cardFilter;panel.querySelectorAll('[data-card-filter]').forEach(x=>x.classList.toggle('active',x===b));draw();});
   panel.querySelector('#p57-create-card-entry').onclick=()=>{const open=window.CartP48?.openLibraryCreator;if(typeof open==='function')open.call(CartP48,panel,'whiteCards');else Toast.error('Não foi possível abrir a criação de cartas.');};
   draw();return cards;
  },
  patch(){
   const render=(panel,...args)=>Library.render(panel,...args);
   if(window.CartP56?.Library)CartP56.Library.render=render;
   if(window.ProfessionalUI)ProfessionalUI.renderCards=render;
   if(window.HomeScreen)HomeScreen.renderCards=render;
   if(window.MetaUI)MetaUI.renderCards=render;
  }
 };

 const Recycling={
  normalize(body){
   const C=component();if(!C||!body)return;
   const cards=window.MarketRecycling?.data?.cards||[],map=new Map(cards.map(c=>[String(c.canonicalCardId),c]));
   body.querySelectorAll('[data-recycle-card]').forEach(node=>{const c=map.get(String(node.dataset.recycleCard));if(!c||String(c.type)!=='black')return;const text=node.querySelector('b');if(text)text.innerHTML=C._formatBlackText(c.text);});
  },
  normalizeConfirm(){
   const C=component();if(!C)return;
   document.querySelectorAll('.p41-recycle-card-preview.black b').forEach(node=>{node.innerHTML=C._formatBlackText(node.textContent||'');});
  },
  patch(){
   const R=window.MarketRecycling;if(!R||R.__p57CanonicalGaps)return;R.__p57CanonicalGaps=true;
   const paint=R.paint.bind(R);R.paint=function(body,m){const out=paint(body,m);Recycling.normalize(body);return out;};
   if(typeof R.confirm==='function'){const confirm=R.confirm.bind(R);R.confirm=function(...args){const out=confirm(...args);queueMicrotask(()=>Recycling.normalizeConfirm());return out;};}
   R.cardText=(c,m)=>String(c?.type)==='black'&&component()?component()._formatBlackText(c.text):m.esc(c?.text||'');
  }
 };

 const Frames={
  activate(root=document){
   root.querySelectorAll?.('.profile-modal-frame-grid').forEach(grid=>{grid.classList.add('p57-live-frame-grid');grid.classList.remove('profile-modal-frame-grid');});
  },
  patch(){
   if(!window.ProfileModal||ProfileModal.__p57LiveFrames)return;ProfileModal.__p57LiveFrames=true;
   const render=ProfileModal.renderFrames.bind(ProfileModal);
   ProfileModal.renderFrames=function(body,...args){const out=render(body,...args);Frames.activate(body);return out;};
   Frames.activate();
  }
 };

 function settle(){patchCardComponentLabels();Detail.patch();Library.patch();Recycling.patch();Frames.patch();Recycling.normalize(document.querySelector('.marketplace-body,.market-body'));Frames.activate();}
 settle();queueMicrotask(settle);window.addEventListener('pageshow',settle);
 window.CartP57={VERSION,label,gameCard,Detail,Library,Recycling,Frames,settle};
})();
