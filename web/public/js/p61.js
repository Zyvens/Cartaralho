'use strict';
(()=>{
 if(window.CartP61)return;
 const VERSION='v1.4.61',GLOBAL_CHANNEL='cartaralho-global';
 const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
 const money=v=>Number(v||0).toLocaleString('pt-BR');

 /* A versão carregada nunca deve se anunciar como atualização pendente para si mesma. */
 try{
  const key=`cartaralho_update_notice_${VERSION}`;
  sessionStorage.setItem(key,'1');
  localStorage.setItem(key,'1');
 }catch(_){ }

 async function serverVersion(){
  try{const d=await AuthClient.request('/api/version');return String(d?.currentVersion||VERSION);}catch(_){return VERSION;}
 }
 async function sendCurrentUpdate(btn){
  if(!btn||btn.disabled)return;
  const old=btn.innerHTML;btn.disabled=true;btn.textContent='Enviando...';
  try{
   const current=await serverVersion();
   await AuthClient.request('/api/admin/creator-tools',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'megaphone',scope:'global',message:`Nova atualização ${current} disponível. Reinicie o jogo para adicionar as atualizações.`})});
   Toast.success(`Aviso da ${current} enviado para todos.`);
  }catch(e){Toast.error(e.message||'Não foi possível enviar o aviso.');}
  finally{btn.disabled=false;btn.innerHTML=old;}
 }
 /* P41 ainda possui um handler histórico. Captura o clique antes dele e usa /api/version. */
 document.addEventListener('click',e=>{
  const btn=e.target.closest?.('#admin-update-send');if(!btn)return;
  e.preventDefault();e.stopImmediatePropagation();sendCurrentUpdate(btn);
 },true);

 function cacheBalance(value){
  const id=AuthClient?.user?.id||AuthClient?.user?.username;if(!id)return;
  try{localStorage.setItem(`cartaralho_dirty_balance_${id}`,String(value));}catch(_){ }
 }
 function applyBalance(value,marketData=null){
  const v=Number(value);if(!Number.isFinite(v))return;
  if(AuthClient?.user)AuthClient.user.dirty_balance=v;
  cacheBalance(v);
  window.CartP49?.ensureBalanceSlot?.();
  window.CartP49?.setBalance?.(v,{loading:false});
  if(window.MarketUI){
   if(marketData)MarketUI.data={...(MarketUI.data||{}),...marketData,dirtyBalance:v};
   else if(MarketUI.data)MarketUI.data.dirtyBalance=v;
   if(MarketUI.overlay)MarketUI.render();
  }
  window.dispatchEvent(new CustomEvent('cartaralho:balance-updated',{detail:{dirtyBalance:v,source:'admin-reward'}}));
 }
 async function syncDirtyBalance(){
  if(!AuthClient?.user)return null;
  try{
   const d=await AuthClient.request('/api/marketplace'),v=Number(d?.dirtyBalance);
   if(Number.isFinite(v)){applyBalance(v,d);return v;}
  }catch(_){
   try{const d=await AuthClient.cleanCards(),v=Number(d?.inventory?.dirtyBalance);if(Number.isFinite(v)){applyBalance(v);return v;}}catch(__){ }
  }
  return null;
 }
 function rewardForCurrentUser(data={}){
  if(data.kind!=='reward')return false;
  const targets=Array.isArray(data.targetUserIds)?data.targetUserIds.map(Number):null;
  return !targets?.length||targets.includes(Number(AuthClient?.user?.id));
 }
 async function bindRewardSync(){
  try{
   await SocketClient._waitReady();
   const channel=SocketClient.pusher?.subscribe(GLOBAL_CHANNEL);if(!channel||channel.__p61WalletSync)return;
   channel.__p61WalletSync=true;
   channel.bind('admin_megaphone',data=>{if(rewardForCurrentUser(data))setTimeout(syncDirtyBalance,20);});
  }catch(_){ }
 }

 const TRANSACTION_LABELS={
  starter_grant:'Bônus inicial recebido',
  match_placement:'Premiação pela colocação na partida',
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
 function transactionLabel(row={}){
  const type=String(row.transaction_type||''),meta=row.metadata&&typeof row.metadata==='object'?row.metadata:{};
  if(type==='card_recycling'){
   const count=Number(meta.count||meta.cardCount||meta.cards?.length||0);
   return count>0?`Reciclagem de ${count} carta${count===1?'':'s'}`:'Reciclagem de carta';
  }
  if(type==='mission_reward'&&meta.missionName)return`Missão concluída: ${String(meta.missionName)}`;
  if(type==='marketplace_purchase'&&meta.productName)return`Compra no Mercado Paralelo: ${String(meta.productName)}`;
  if(type==='legacy_royalty'&&meta.cardText)return`Direitos autorais: ${String(meta.cardText)}`;
  if(/recycl/i.test(type))return'Reciclagem de carta';
  if(/admin.*reward|reward.*admin/i.test(type))return'Prêmio recebido da administração';
  return TRANSACTION_LABELS[type]||'Movimentação de moedas';
 }
 function metaStat(label,value){return`<div class="meta-stat"><small>${esc(label)}</small><b>${value}</b></div>`;}
 function ledgerHtml(economy={}){
  const ledger=Array.isArray(economy.ledger)?economy.ledger:[];
  const rows=ledger.map(row=>{
   const amount=Number(row.amount||0),date=row.created_at?new Date(row.created_at).toLocaleString('pt-BR'):'Data não disponível';
   return`<div class="p61-ledger-row"><strong class="${amount<0?'negative':'positive'}">${amount>0?'+':''}${money(amount)}</strong><div><b>${esc(transactionLabel(row))}</b><small>${esc(date)}</small></div></div>`;
  }).join('')||'<div class="p61-ledger-empty">Nenhuma movimentação registrada ainda.</div>';
  return`<details class="p61-stats-ledger"><summary><div><small>MOEDAS SUJAS</small><b>Movimentações recentes</b><span>Toque para abrir o histórico da sua conta.</span></div><div class="p61-ledger-summary"><strong>🪙 ${money(economy.balance)}</strong><em>${ledger.length} registro${ledger.length===1?'':'s'}</em><i aria-hidden="true">⌄</i></div></summary><div class="p61-ledger-body">${rows}</div></details>`;
 }
 async function renderStats(panel){
  const d=await AuthClient.stats(),s=d.stats||{},titles=d.titles||d.badges||[],economy=d.economy||{};
  panel.innerHTML=`<div class="home-form profile-panel p61-stats-panel"><button class="panel-close">✕</button><h3>Estatísticas</h3><div class="stats-grid"><div><b>${s.matches||0}</b><span>Partidas</span></div><div><b>${s.matches_won||0}</b><span>Vitórias</span></div><div><b>${s.rounds_won||0}</b><span>Rodadas ganhas</span></div><div><b>${s.total_points||0}</b><span>Pontos</span></div></div><div class="meta-section"><h4>Estatísticas cômicas</h4><div class="meta-stat-grid">${metaStat('Taxa de vitória',`${Number(s.win_rate||0)}%`)}${metaStat('Mestre que mais escolheu você',s.master_most_chose?`${esc(s.master_most_chose.display_name)} · ${Number(s.master_most_chose.votes||0)} votos`:'—')}${metaStat('Quem mais perdeu para você',s.player_most_lost_to_you?`${esc(s.player_most_lost_to_you.display_name)} · ${Number(s.player_most_lost_to_you.losses||0)} derrotas`:'—')}${metaStat('Maior sequência de vitórias',Number(s.longest_win_streak||0))}${metaStat('Maior sequência de derrotas',Number(s.longest_loss_streak||0))}${metaStat('Carta que insiste e nunca ganhou',s.card_never_won?`${esc(s.card_never_won.text)} · ${Number(s.card_never_won.times_used||0)} usos`:'—')}${metaStat('Resposta mais vencedora',s.most_winning_answer?`${esc(s.most_winning_answer.text)} · ${Number(s.most_winning_answer.wins||0)} vitórias`:'—')}${metaStat('Mestres diferentes que já escolheram você',Number(s.unique_masters_that_chose_you||0))}</div></div>${ledgerHtml(economy)}<div class="meta-section"><h4>Badges e títulos</h4><div class="unlock-grid">${titles.map(t=>`<div class="unlock-card ${MetaUI.rarityClass(t.rarity)} ${t.unlocked?'':'locked'}"><span class="unlock-icon">${esc(t.icon)}</span><div><b>${esc(t.name)}</b><small>${esc(t.description)}</small></div><em>${Number(t.progress||0)}/${Number(t.target||0)}</em></div>`).join('')}</div></div></div>`;
 }
 if(window.HomeScreen){HomeScreen.renderStats=renderStats;HomeScreen.__p61StatsLedger=true;}

 bindRewardSync();
 document.addEventListener('DOMContentLoaded',bindRewardSync,{once:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)bindRewardSync();});
 window.CartP61={VERSION,serverVersion,sendCurrentUpdate,syncDirtyBalance,applyBalance,transactionLabel,renderStats};
})();
