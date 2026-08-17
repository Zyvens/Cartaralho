'use strict';
(()=>{
 if(window.CartP55)return;
 const VERSION='v1.4.55';
 const TIER_LABEL={standard:'Padrão',copper:'Copper',bronze:'Bronze',silver:'Silver',gold:'Gold',platinum:'Platinum'};
 const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
 const labelTier=v=>TIER_LABEL[String(v||'standard').toLowerCase()]||String(v||'Padrão');

 const Detail={
  cards:new Map(),overlay:null,keyHandler:null,
  remember(cards){for(const c of cards||[])if(c?.id!=null)this.cards.set(String(c.id),c);return cards;},
  close(){
   if(this.overlay){this.overlay.remove();this.overlay=null;}
   if(this.keyHandler){document.removeEventListener('keydown',this.keyHandler);this.keyHandler=null;}
   document.body.classList.remove('p55-card-detail-open');
  },
  formattedText(c){return String(c?.type)==='blackCards'&&window.CardComponent?CardComponent._formatBlackText(c.text):esc(c?.text||'');},
  cardPreview(c){
   const value={text:c.text,materialTier:c.materialTier,borderTier:c.borderTier,isPlayerCard:!!c.is_player_card};
   const black=String(c.type)==='blackCards';
   const node=black?CardComponent.createBlackCard(value,{large:true,animated:false}):CardComponent.createWhiteCard(value,{large:true,animated:false});
   node.classList.add('p55-detail-card-preview');
   return node;
  },
  progression(kind,c){
   const material=kind==='material',progress=material?c.materialProgress:c.borderProgress,current=material?c.materialTier:c.borderTier;
   const next=progress?.nextTier||null,now=Number(progress?.current||0),target=Number(progress?.target||0),remaining=Number(progress?.remaining||0);
   const pct=next&&target>=0?Math.max(0,Math.min(100,(now/Math.max(1,target+1))*100)):100;
   const copy=material
    ?(next?`Use esta carta em mais ${remaining} partida${remaining===1?'':'s'} diferente${remaining===1?'':'s'} para alcançar ${labelTier(next)}.`:'Esta carta já atingiu o material máximo.')
    :(next?`Faltam ${remaining} recriação${remaining===1?'':'ões'} desta carta por outros jogadores, em partidas com você, para alcançar ${labelTier(next)}.`:'Esta carta já atingiu o contorno máximo.');
   return `<article class="p55-evolution-card"><div class="p55-evolution-head"><span>${material?'MATERIAL':'CONTORNO'}</span><b>${labelTier(current)}</b></div><p>${copy}</p><div class="p55-evolution-bar"><i style="width:${pct}%"></i></div><div class="p55-evolution-foot"><small>${material?`${now} partida${now===1?'':'s'} com uso`:`${now} recriação${now===1?'':'ões'}`}</small><strong>${next?`Próximo: ${labelTier(next)}`:'Nível máximo'}</strong></div></article>`;
  },
  open(c){
   if(!c)return;
   this.close();
   const o=c.origin||{},black=String(c.type)==='blackCards';
   const overlay=document.createElement('div');
   overlay.className='p55-card-detail-overlay';
   overlay.innerHTML=`<section class="p55-card-detail-shell" role="dialog" aria-modal="true" aria-label="Detalhes da carta"><header class="p55-card-detail-header"><div><span>DETALHES DA CARTA</span><h2>Evolução e origem</h2></div><button type="button" class="p55-card-detail-close" aria-label="Fechar">✕</button></header><main class="p55-card-detail-body"><section class="p55-card-detail-hero"><div class="p55-card-preview-host"></div><div class="p55-card-detail-summary"><div class="p55-card-detail-pills"><span>${black?'🖤 Carta Preta':'🤍 Carta Branca'}</span>${c.is_player_card?'<span>★ De Jogador</span>':''}${c.is_favorite?'<span>⭐ Favorita</span>':''}${c.is_native?'<span>🎴 Nativa</span>':''}</div><h3>${this.formattedText(c)}</h3><p>A evolução desta carta acompanha o uso real nas partidas e as recriações feitas por outros jogadores.</p></div></section><section class="p55-evolution-grid">${this.progression('material',c)}${this.progression('border',c)}</section><section class="p55-origin-card"><div class="p55-origin-title"><span>ORIGEM</span><h3>De onde veio esta carta</h3></div><div class="p55-origin-grid"><div><small>CRIADA POR</small><b>${esc(c.is_native?'Cartaralho':o.creatorName||'Origem não identificada')}</b></div><div><small>MESAS VISITADAS</small><b>${Number(o.tablesVisited||0)}</b></div><div><small>PESSOAS QUE POSSUEM</small><b>${Number(o.holders||0)}</b></div>${o.firstRoomCode?`<div><small>PRIMEIRA MESA</small><b>${esc(o.firstRoomCode)}</b></div>`:''}</div>${o.originUncertain?'<p class="p55-origin-note">Alguns dados de origem foram recuperados de registros antigos e podem estar incompletos.</p>':''}</section></main></section>`;
   document.body.appendChild(overlay);
   overlay.querySelector('.p55-card-preview-host').replaceChildren(this.cardPreview(c));
   overlay.querySelector('.p55-card-detail-close').onclick=()=>this.close();
   overlay.addEventListener('click',e=>{if(e.target===overlay)this.close();});
   this.keyHandler=e=>{if(e.key==='Escape')this.close();};
   document.addEventListener('keydown',this.keyHandler);
   document.body.classList.add('p55-card-detail-open');
   this.overlay=overlay;
  }
 };

 if(window.AuthClient&&!AuthClient.__p55CardsCache){
  AuthClient.__p55CardsCache=true;
  const baseCards=AuthClient.cards.bind(AuthClient);
  AuthClient.cards=async function(...args){return Detail.remember(await baseCards(...args));};
 }

 if(window.ProfessionalUI&&!ProfessionalUI.__p55CardDetail){
  ProfessionalUI.__p55CardDetail=true;
  const baseRender=ProfessionalUI.renderCards.bind(ProfessionalUI);
  ProfessionalUI.renderCards=async function(panel,...args){
   const out=await baseRender(panel,...args);
   if(panel&&!panel.__p55DetailCapture){
    panel.__p55DetailCapture=true;
    panel.addEventListener('click',e=>{
     if(e.target.closest('[data-fav-id]'))return;
     const card=e.target.closest('[data-card-id]');
     if(!card||!panel.contains(card))return;
     const data=Detail.cards.get(String(card.dataset.cardId));
     if(!data)return;
     e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
     Detail.open(data);
    },true);
   }
   return out;
  };
 }

 window.CardDetailUI=Detail;
 window.CartP55={VERSION,Detail};
})();
