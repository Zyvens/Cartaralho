'use strict';
(()=>{
 if(window.CartP54)return;
 const VERSION='v1.4.54';
 const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
 let latestStatsPayload=null;

 function mountNativeCardCreator(panel){
  const root=panel?.querySelector?.('.cards-library')||panel?.querySelector?.('.p41-my-cards-panel');
  if(!root)return null;
  let btn=root.querySelector('#p54-create-card-entry');
  if(!btn){
   btn=document.createElement('button');
   btn.type='button';
   btn.id='p54-create-card-entry';
   btn.className='btn btn-primary p54-create-card-entry';
   btn.innerHTML='🧽 Criar nova Carta de Jogador';
  }
  btn.onclick=()=>{
   const open=window.CartP48?.openLibraryCreator;
   if(typeof open!=='function')return Toast.error('Não foi possível abrir a criação de cartas.');
   open.call(CartP48,panel,'whiteCards');
  };
  const anchor=root.querySelector('.cards-library-toolbar')||root.querySelector('.card-tools');
  if(anchor){
   if(btn.parentNode!==root||btn.nextElementSibling!==anchor)root.insertBefore(btn,anchor);
  }else if(!btn.isConnected)root.prepend(btn);
  return btn;
 }

 function patchMyCardsRenderer(){
  if(window.ProfessionalUI&&!ProfessionalUI.__p54NativeCardCreator){
   ProfessionalUI.__p54NativeCardCreator=true;
   const base=ProfessionalUI.renderCards?.bind(ProfessionalUI);
   if(typeof base==='function')ProfessionalUI.renderCards=async function(panel,...args){
    const out=await base(panel,...args);
    mountNativeCardCreator(panel);
    return out;
   };
  }
  /* Mantém compatibilidade com o painel legado sem depender dele. */
  if(window.MetaUI&&!MetaUI.__p54NativeCardCreator){
   MetaUI.__p54NativeCardCreator=true;
   const base=MetaUI.renderCards?.bind(MetaUI);
   if(typeof base==='function')MetaUI.renderCards=async function(panel,...args){
    const out=await base(panel,...args);
    mountNativeCardCreator(panel);
    return out;
   };
  }
 }

 const TRANSACTION_COPY={
  starter_grant:'Bônus inicial recebido',
  match_placement:'Recompensa pela colocação na partida',
  match_survival:'Bônus de participação na partida',
  match_consolation:'Recompensa de consolação da partida',
  match_saqueador:'Recompensa do Saqueador',
  mission_reward:'Missão concluída',
  legacy_royalty:'Direitos autorais de uma carta',
  clean_card_purchase:'Compra de Carta Limpa',
  marketplace_purchase:'Compra no Mercado Paralelo',
  card_recycling:'Reciclagem de cartas',
  adjustment:'Ajuste de saldo',
  admin_reward:'Prêmio recebido da administração'
 };
 function transactionCopy(row){
  const type=String(row?.transaction_type||'');
  const meta=row?.metadata&&typeof row.metadata==='object'?row.metadata:{};
  if(type==='card_recycling'){
   const count=Number(meta.count||meta.cardCount||meta.cards?.length||0);
   if(count>0)return`Reciclagem de ${count} carta${count===1?'':'s'}`;
  }
  if(type==='mission_reward'&&meta.missionName)return`Missão concluída: ${String(meta.missionName)}`;
  if(type==='marketplace_purchase'&&meta.productName)return`Compra no Mercado Paralelo: ${String(meta.productName)}`;
  if(type==='legacy_royalty'&&meta.cardText)return`Direitos autorais: ${String(meta.cardText)}`;
  return TRANSACTION_COPY[type]||'Movimentação de moedas';
 }
 function ledgerHtml(payload){
  const ledger=payload?.economy?.ledger||[];
  const rows=ledger.map(row=>{
   const amount=Number(row.amount||0),date=row.created_at?new Date(row.created_at).toLocaleString('pt-BR'):'Data não disponível';
   return`<div class="p54-stats-ledger-row"><div><b>${esc(transactionCopy(row))}</b><small>${esc(date)}</small></div><strong class="${amount<0?'negative':'positive'}">${amount>0?'+':''}${amount.toLocaleString('pt-BR')} 🪙</strong></div>`;
  }).join('')||'<div class="p54-stats-ledger-empty">Nenhuma movimentação registrada ainda.</div>';
  return`<details class="p54-stats-ledger"><summary><span><small>MOEDAS SUJAS</small><b>Movimentações recentes</b></span><span class="p54-stats-ledger-summary-right"><em>${ledger.length} registro${ledger.length===1?'':'s'}</em><i aria-hidden="true">⌄</i></span></summary><div class="p54-stats-ledger-body">${rows}</div></details>`;
 }
 function removeLegacyStatsLedger(root){
  if(!root)return;
  root.querySelectorAll('.meta-section,.market-section,.economy-history,.stats-economy,.economy-ledger').forEach(section=>{
   if(section.classList.contains('p54-stats-ledger'))return;
   const heading=section.querySelector('h3,h4,.market-section-title')?.textContent||'';
   if(/extrato|movimenta(?:ção|ções)|moedas sujas|economia/i.test(heading))section.remove();
  });
 }
 function mountStatsLedger(panel,payload=latestStatsPayload){
  const root=panel?.querySelector?.(':scope > .home-form.profile-panel')||panel?.querySelector?.('.home-form.profile-panel')||panel;
  if(!root||!payload)return null;
  removeLegacyStatsLedger(root);
  root.querySelector('.p54-stats-ledger')?.remove();
  root.insertAdjacentHTML('beforeend',ledgerHtml(payload));
  return root.querySelector('.p54-stats-ledger');
 }
 function patchStats(){
  if(window.AuthClient&&!AuthClient.__p54StatsCache){
   AuthClient.__p54StatsCache=true;
   const baseStats=AuthClient.stats.bind(AuthClient);
   AuthClient.stats=async function(...args){const data=await baseStats(...args);latestStatsPayload=data;return data;};
  }
  if(window.HomeScreen&&!HomeScreen.__p54StatsLedger){
   HomeScreen.__p54StatsLedger=true;
   const base=HomeScreen.renderStats?.bind(HomeScreen);
   if(typeof base==='function')HomeScreen.renderStats=async function(panel,...args){
    const out=await base(panel,...args);
    mountStatsLedger(panel,latestStatsPayload);
    return out;
   };
  }
 }

 function settle(){
  patchMyCardsRenderer();
  patchStats();
  const panel=document.getElementById('home-panel');
  if(panel?.querySelector('.cards-library,.p41-my-cards-panel'))mountNativeCardCreator(panel);
 }

 settle();
 document.addEventListener('DOMContentLoaded',settle,{once:true});
 window.addEventListener('pageshow',settle);
 window.CartP54={VERSION,mountNativeCardCreator,mountStatsLedger,transactionCopy,settle};
})();
