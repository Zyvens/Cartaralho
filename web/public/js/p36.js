'use strict';
(()=>{
 if(typeof RoomRulesUI==='undefined'||typeof CreateRoomScreen==='undefined'||typeof LobbyScreen==='undefined'||typeof RewardPreviewUI==='undefined')return;
 if(RoomRulesUI.__p36UnifiedAccordions)return;
 RoomRulesUI.__p36UnifiedAccordions=true;

 const RULE_ITEMS='<ul class="rules-list"><li><strong>Objetivo da partida:</strong> Seja o primeiro a alcançar a quantidade de pontos escolhida para a mesa. Cada rodada vencida vale 1 ponto.</li><li><strong>Como funciona uma rodada:</strong> Uma Carta Preta apresenta a frase ou situação da vez. Os demais jogadores escolhem suas respostas entre as Cartas Brancas da mão, e o jogador responsável pela rodada escolhe a resposta vencedora.</li><li><strong>Sua mão de cartas:</strong> Cada jogador começa com a quantidade de Cartas Brancas definida nas configurações. Depois de usar cartas, a mão é completada novamente para a rodada seguinte.</li><li><strong>Cartas de Jogador:</strong> A mesa pode permitir cartas personalizadas que você já possui e, separadamente, permitir a criação de novas cartas antes da partida.</li><li><strong>Recompensas:</strong> Mesas com mais participantes e partidas com mais pontos para vencer podem oferecer recompensas maiores. A quantidade de cartas na mão serve apenas para dar mais opções durante a rodada.</li><li><strong>Espólio:</strong> Para poder receber Cartas de Jogador dos outros ao final, você precisa contribuir com pelo menos uma Carta de Jogador para aquela partida. Quem não contribuir ainda pode jogar normalmente, mas fica sem Espólio.</li><li><strong>BUFFs:</strong> Se estiverem liberados, os jogadores podem usar vantagens consumíveis compradas no Mercado Paralelo. Cada pessoa pode ativar no máximo um novo BUFF por rodada.</li><li><strong>Narrador e inatividade:</strong> O Narrador pode ler os momentos públicos da partida em voz alta. Se a remoção por inatividade estiver ligada, quem ficar muito tempo sem interagir pode sair da mesa e depois reingressar pelo código.</li></ul>';
 const chevron='<span class="dashboard-collapse-chevron" aria-hidden="true">⌄</span>';

 function accordion(title,subtitle,eyebrow,body,extra=''){
  return `<details class="dashboard-card room-info-accordion ${extra}"><summary class="dashboard-section-heading dashboard-collapsible-heading"><div><small>${eyebrow}</small><h3>${title}</h3><p>${subtitle}</p></div>${chevron}</summary><div class="dashboard-card-body">${body}</div></details>`;
 }

 RoomRulesUI.howToPlay=function(extra=''){
  return accordion('📜 Como Jogar','Um guia rápido da partida, das cartas e das opções especiais da mesa.','REGRAS',RULE_ITEMS,`how-to-play-card ${extra}`);
 };

 const baseSummary=RoomRulesUI.summary.bind(RoomRulesUI);
 RoomRulesUI.summary=function(config={},options={}){
  let html=baseSummary(config,options);
  html=html.replace('<section class="room-summary-card"','<details class="room-summary-card room-info-accordion"')
   .replace('<header class="room-summary-heading">','<summary class="room-summary-heading dashboard-collapsible-heading">')
   .replace('</header>',`${chevron}</summary>`)
   .replace(/<\/section>$/,'</details>');
  return html;
 };

 function normalizeCreate(){
  document.querySelector('.create-room-screen .how-to-play-card')?.classList.add('room-info-accordion');
  const old=document.querySelector('.create-room-screen .dashboard-estimate-card');
  if(old&&!old.matches('details')){
   const body=old.querySelector('#preview-economic');
   const details=document.createElement('details');
   details.className='dashboard-card dashboard-estimate-card room-info-accordion';
   details.innerHTML=`<summary class="dashboard-section-heading dashboard-collapsible-heading"><div><small>RECOMPENSAS</small><h3>🏆 Estimativa para mesa cheia</h3><p>Confira as recompensas previstas quando a sala estiver com sua capacidade máxima.</p></div>${chevron}</summary><div class="dashboard-card-body"></div>`;
   if(body)details.querySelector('.dashboard-card-body').appendChild(body);
   old.replaceWith(details);
  }
 }

 const createRender=CreateRoomScreen.render.bind(CreateRoomScreen);
 CreateRoomScreen.render=function(...args){const out=createRender(...args);normalizeCreate();return out;};

 function normalizeLobby(){
  document.querySelector('.lobby-rules-wrap .room-summary-card')?.classList.add('lobby-info-accordion');
  const old=document.querySelector('.lobby-reward-card');
  if(old&&!old.matches('details')){
   const body=old.querySelector('#lobby-economy-preview');
   const details=document.createElement('details');
   details.className='lobby-reward-card room-info-accordion lobby-info-accordion';
   details.innerHTML=`<summary class="dashboard-section-heading dashboard-collapsible-heading"><div><small>RECOMPENSAS</small><h3>🏆 Estimativa para mesa cheia</h3><p>Veja quanto cada colocação pode receber se a sala atingir o número máximo de jogadores.</p></div>${chevron}</summary><div class="dashboard-card-body"></div>`;
   if(body)details.querySelector('.dashboard-card-body').appendChild(body);
   old.replaceWith(details);
  }
  const reward=document.querySelector('.lobby-reward-card');
  if(reward&&!document.querySelector('.lobby-how-to-play'))reward.insertAdjacentHTML('afterend',RoomRulesUI.howToPlay('lobby-how-to-play lobby-info-accordion'));
  const edit=document.querySelector('[data-room-summary-edit]');
  edit?.addEventListener('click',e=>e.preventDefault());
 }

 const lobbyRender=LobbyScreen.render.bind(LobbyScreen);
 LobbyScreen.render=function(...args){const out=lobbyRender(...args);normalizeLobby();return out;};

 LobbyScreen.loadPreview=async function(){
  const token=++this.previewToken,box=document.getElementById('lobby-economy-preview');
  if(!box||!App.state.roomCode)return;
  try{
   const d=await RewardPreviewUI.request({code:App.state.roomCode});
   const full=d.fullTable||d.preview;
   if(token===this.previewToken&&box)box.innerHTML=RewardPreviewUI.card(full,'Estimativa para mesa cheia','Valores previstos para uma sala com a capacidade máxima configurada.');
  }catch(e){if(token===this.previewToken&&box)box.innerHTML=`<div class="economy-preview"><small>${e.message}</small></div>`;}
 };
})();
