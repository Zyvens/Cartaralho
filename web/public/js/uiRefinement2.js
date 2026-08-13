(()=>{
const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
const tierLabel=t=>({standard:'Padrão',copper:'Bronze',silver:'Prata',gold:'Ouro',platinum:'Platina'}[t]||'Padrão');
const borderLabel=t=>({standard:'Padrão',bronze:'Bronze',silver:'Prata',gold:'Ouro',platinum:'Platina'}[t]||'Padrão');

function polishHomeCopy(){
  const copy=document.getElementById('home-play-copy');
  if(!copy)return;
  copy.classList.add('home-play-copy-centered');
  const title=copy.querySelector('h2');
  if(title&&!title.querySelector('.home-copy-line'))title.innerHTML='<span class="home-copy-line home-copy-line-first">Abra uma mesa</span><span class="home-copy-line home-copy-line-second"> e deixe o bom senso do lado de fora.</span>';
}

function polishPlayIdentity(){
  const form=document.getElementById('play-form');if(!form)return;
  form.querySelector('#match-avatar')?.remove();
  const identity=form.querySelector('.match-identity');if(!identity)return;
  identity.classList.add('match-alias-only');
  const group=identity.querySelector('.input-group');if(!group)return;
  if(!group.querySelector('.match-alias-heading')){
    const h=document.createElement('div');h.className='match-alias-heading';h.innerHTML='<span>APELIDO DA PARTIDA</span><h2>Crie um apelido</h2><p>Seu Rank continua ligado ao seu nome de usuário, independentemente do apelido.</p>';
    group.prepend(h);
  }
  const small=group.querySelector('small');if(small)small.remove();
  const input=group.querySelector('#match-nickname');if(input)input.placeholder='Seu apelido nesta partida';
}

const observer=new MutationObserver(()=>{polishPlayIdentity();polishHomeCopy();});
observer.observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('click',e=>{if(e.target.closest('#btn-play'))setTimeout(polishPlayIdentity,0);});
setTimeout(polishHomeCopy,0);

if(window.ProfessionalUI){
  ProfessionalUI.renderCards=async function(panel){
    const cards=(await AuthClient.cards()).filter(c=>c.owned!==false);let filter='all',query='';
    panel.innerHTML=`<section class="cards-library game-library"><div class="cards-library-toolbar"><div class="cards-search-wrap"><span>⌕</span><input id="library-search" class="input" placeholder="Buscar na coleção..."></div><div class="cards-filter-tabs"><button data-card-filter="all" class="active">Todas</button><button data-card-filter="native">Nativas</button><button data-card-filter="player">De Jogadores</button><button data-card-filter="blackCards">Pretas</button><button data-card-filter="whiteCards">Brancas</button><button data-card-filter="favorites">Favoritas</button></div></div><div id="game-library-grid" class="game-library-grid"></div></section>`;
    const grid=panel.querySelector('#game-library-grid');
    const draw=()=>{
      const list=cards.filter(c=>{
        const qok=String(c.text||'').toLowerCase().includes(query);
        const fok=filter==='all'||(filter==='native'&&c.is_native)||(filter==='player'&&c.is_player_card)||c.type===filter||(filter==='favorites'&&c.is_favorite);
        return qok&&fok;
      });
      grid.replaceChildren();
      if(!list.length){grid.innerHTML='<div class="app-panel-empty"><b>Nenhuma carta encontrada.</b><p>Tente outro filtro ou termo de busca.</p></div>';return;}
      list.forEach(c=>{
        const wrap=document.createElement('article');wrap.className=`collection-game-card material-${c.materialTier||'standard'} outline-${c.borderTier||'standard'}`;wrap.dataset.cardId=c.id;
        const data={text:c.text,materialTier:c.materialTier||'standard',borderTier:c.borderTier||'standard',isPlayerCard:!!c.is_player_card};
        const card=c.type==='blackCards'?CardComponent.createBlackCard(data,{animated:false}):CardComponent.createWhiteCard(data,{animated:false});
        card.classList.add('collection-card-face');card.querySelector('.card-progression-badge')?.remove();
        if((c.materialTier||'standard')!=='standard'){
          const badge=document.createElement('span');badge.className='collection-material-badge';badge.textContent=tierLabel(c.materialTier);card.appendChild(badge);
        }
        const meta=document.createElement('div');meta.className='collection-card-meta';meta.innerHTML=`<span>${c.is_native?'NATIVA':c.is_player_card?'DE JOGADOR':'COLEÇÃO'}</span><small>${Number(c.matches_used||0)} partida${Number(c.matches_used||0)===1?'':'s'}</small><button class="collection-favorite ${c.is_favorite?'on':''}" type="button" aria-label="Favoritar">${c.is_favorite?'★':'☆'}</button>`;
        wrap.append(card,meta);grid.appendChild(wrap);
      });
      grid.querySelectorAll('.collection-favorite').forEach(btn=>btn.onclick=async e=>{e.stopPropagation();const wrap=btn.closest('[data-card-id]'),c=cards.find(x=>String(x.id)===String(wrap.dataset.cardId));if(!c)return;c.is_favorite=!c.is_favorite;await AuthClient.favoriteCard(c.id,c.is_favorite);draw();});
      grid.querySelectorAll('[data-card-id]').forEach(wrap=>wrap.onclick=()=>{const c=cards.find(x=>String(x.id)===String(wrap.dataset.cardId));if(!c)return;Modal.show({title:c.text,message:`<strong>Material: ${tierLabel(c.materialTier)}</strong><br>${esc(c.rarityExplanation?.material||'')}<br><br><strong>Contorno: ${borderLabel(c.borderTier)}</strong><br>${esc(c.rarityExplanation?.border||'')}<br><br><strong>Origem:</strong> ${esc(c.origin?.creatorName||'Cartaralho')} · ${Number(c.origin?.tablesVisited||0)} mesas · ${Number(c.origin?.holders||0)} pessoas possuem.`,confirmText:'Fechar'});});
    };
    panel.querySelector('#library-search').oninput=e=>{query=e.target.value.trim().toLowerCase();draw();};
    panel.querySelectorAll('[data-card-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.cardFilter;panel.querySelectorAll('[data-card-filter]').forEach(x=>x.classList.toggle('active',x===b));draw();});
    draw();
  };
}
})();
