(()=>{
 const previousCards=HomeScreen.renderCards;
 HomeScreen.renderCards=async panel=>{
  await previousCards(panel);
  const cards=await AuthClient.cards();
  const originals=new Set(cards.filter(card=>card.isOriginal).map(card=>String(card.id)));
  const decorate=()=>panel.querySelectorAll('.profile-card[data-card-id]').forEach(card=>{
   if(!originals.has(String(card.dataset.cardId))||card.querySelector('.canonical-original-badge'))return;
   const badge=document.createElement('span');badge.className='canonical-original-badge';badge.textContent='🧬 CARTA ORIGINAL';badge.style.cssText='display:inline-flex;width:max-content;margin-top:.35rem;padding:.24rem .48rem;border:1px solid rgba(129,140,248,.42);border-radius:999px;background:rgba(79,70,229,.12);font-size:.68rem;font-weight:800;letter-spacing:.05em;color:#c7d2fe';card.appendChild(badge);
  });decorate();const list=panel.querySelector('#card-list');if(list)new MutationObserver(decorate).observe(list,{childList:true});
 };
 const fmt=n=>Number(n||0).toLocaleString('pt-BR');
 async function economy(){try{return await AuthClient.stats();}catch(_){return null;}}
 const previousAccount=HomeScreen.renderAccount.bind(HomeScreen);
 HomeScreen.renderAccount=function(){previousAccount();if(!AuthClient.user)return;setTimeout(async()=>{const d=await economy();if(!d?.economyUiEnabled||!d.economy)return;const strip=document.querySelector('.account-strip');if(!strip||document.getElementById('dirty-coins-balance'))return;const pill=document.createElement('button');pill.id='dirty-coins-balance';pill.className='btn btn-secondary btn-sm';pill.style.cssText='font-weight:900;white-space:nowrap';pill.textContent=`🪙 ${fmt(d.economy.balance)}`;pill.title='Moedas Sujas';pill.onclick=()=>HomeScreen.openPanel('stats');strip.insertBefore(pill,strip.querySelector('#profile-shortcut')||null);},0);};
 const previousStats=HomeScreen.renderStats.bind(HomeScreen);
 HomeScreen.renderStats=async panel=>{await previousStats(panel);const d=await economy();if(!d?.economyUiEnabled||!d.economy)return;const root=panel.querySelector('.profile-panel');if(!root)return;const labels={starter_grant:'Bônus inicial',match_placement:'Colocação',match_survival:'Sobrevivência',match_consolation:'Consolação',mission_reward:'Missão',adjustment:'Ajuste'};const section=document.createElement('div');section.className='meta-section';section.innerHTML=`<h4>🪙 Moedas Sujas</h4><div class="xp-card"><b>Saldo: ${fmt(d.economy.balance)}</b><small>Ledger auditável · saldo ligado à conta</small></div><div class="recent-matches">${(d.economy.ledger||[]).slice(0,10).map(x=>`<div><b>+${fmt(x.amount)} · ${labels[x.transaction_type]||x.transaction_type}</b><span>${new Date(x.created_at).toLocaleString('pt-BR')}</span></div>`).join('')||'<p>Nenhuma movimentação.</p>'}</div>`;root.insertBefore(section,root.children[1]||null);};
 SocketClient.on('game_over',data=>{const uid=AuthClient.user?.id,p=(data?.economy?.payouts||[]).find(x=>String(x.userId)===String(uid));if(p&&p.total>0)Toast.success(`🪙 +${fmt(p.total)} Moedas Sujas nesta partida${p.survival?` · +${fmt(p.survival)} sobrevivência`:''}.`);});
})();
