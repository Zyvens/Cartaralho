const RewardPreviewUI={
 async request(params){
  const q=new URLSearchParams(params);
  const url=`/api/rooms/preview?${q}`;
  const fetchPreview=()=>fetch(url,{headers:AuthClient.headers(),cache:'no-store'});
  let r=await fetchPreview();
  // Alguns navegadores podem reutilizar uma resposta condicional antiga durante o rollout.
  // Se isso acontecer, uma única repetição com cache-buster recupera o JSON sem exigir ação do usuário.
  if(r.status===304){q.set('_fresh',Date.now().toString());r=await fetch(`/api/rooms/preview?${q}`,{headers:AuthClient.headers(),cache:'no-store'});}
  const text=await r.text();
  let d={};
  if(text){try{d=JSON.parse(text);}catch{throw new Error('A estimativa recebeu uma resposta inválida. Tente novamente.');}}
  if(!r.ok||!d.success)throw new Error(d.error||'Falha ao calcular recompensa.');
  return d;
 },
 money(n){return Number(n||0).toLocaleString('pt-BR');},
 placementCard(icon,label,coins,loot,{survival=false}={}){const cardCount=Number(loot||0),coinLabel=survival?'Sobrevivência':'Prêmio';return`<article class="economy-placement-card ${survival?'is-survival':''}"><header><span class="economy-placement-medal">${icon}</span><div><small>Colocação</small><b>${label}</b></div></header><div class="economy-placement-rewards"><div class="economy-reward-chip economy-reward-coins"><small>${coinLabel}</small><b>${this.money(coins)} 🪙</b></div><div class="economy-reward-chip economy-reward-loot"><small>Espólio</small><b>${cardCount} carta${cardCount===1?'':'s'}</b></div></div></article>`;},
 card(p,title='Estimativa da partida',subtitle='Moedas e Espólio por colocação.'){if(!p)return'<div class="economy-preview loading">Calculando...</div>';const c=p.class||{},loot=p.loot||{},payout=p.payouts||{};return`<section class="economy-preview class-${c.key||'padrao'}"><header class="economy-preview-head"><div><small>RECOMPENSAS</small><h3>🏆 ${title}</h3><p>${subtitle}</p></div></header><div class="economy-preview-body"><div class="economy-match-overview"><div class="economy-classification"><small>CLASSIFICAÇÃO</small><b>${c.icon||'🎯'} Partida ${c.label||'Padrão'}</b></div><div class="economy-match-facts"><span>👥 ${p.participants} jogadores</span><span>🏁 ${p.pointsToWin} pontos</span><span>⏱️ ${c.duration||'moderada'}</span></div></div><div class="economy-placement-grid">${this.placementCard('🥇','1º lugar',payout.first?.total,loot.first)}${this.placementCard('🥈','2º lugar',payout.second?.total,loot.second)}${this.placementCard('🥉','3º lugar',payout.third?.total,loot.third)}${this.placementCard('🃏','Demais',payout.survivalBonus,loot.other,{survival:true})}</div><small class="economy-note">A mão (${p.handSize} cartas) muda variedade, não recompensa. Valores finais usam participação efetiva.</small></div></section>`;},
 lobby(data){if(!data?.preview)return this.card(null);const current=this.card(data.preview,'Estimativa da partida','Participantes atuais · valores finais usam participação efetiva.');if(Number(data.participants)>=Number(data.maxPlayers))return current;return`${current}<details class="full-table-preview"><summary>Ver recompensa se a mesa encher (${data.maxPlayers})</summary>${this.card(data.fullTable,'Estimativa para mesa cheia','Cenário com a capacidade máxima da sala.')}</details>`;}
};

// Renderer fonte é autoritativo. Patches legados podem tentar atribuir RewardPreviewUI.card;
// o setter compatível ignora a sobrescrita sem interromper os demais refinamentos antigos.
const P15RewardCard=RewardPreviewUI.card;
Object.defineProperty(RewardPreviewUI,'card',{enumerable:true,configurable:false,get(){return P15RewardCard;},set(){}});
