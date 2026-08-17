'use strict';
(()=>{
 if(typeof RoomRulesUI==='undefined'||typeof CreateRoomScreen==='undefined'||typeof LobbyScreen==='undefined'||typeof RewardPreviewUI==='undefined')return;
 if(RoomRulesUI.__p36UnifiedAccordions)return;
 RoomRulesUI.__p36UnifiedAccordions=true;

 const RULE_ITEMS='<ul class="rules-list"><li><strong>Recompensa:</strong> Somente pontos e participantes alimentam o Reward Engine; a mão não aumenta prêmio.</li><li><strong>Participantes reais:</strong> O preview inicial presume mesa cheia; no Lobby a liquidação usa participação efetiva.</li><li><strong>Cartas novas:</strong> Criar Carta Suja custa Carta Limpa e pode ser desativado separadamente.</li><li><strong>Cartas próprias:</strong> Usar cartas já possuídas é outra permissão e nunca cria nova autoria.</li><li><strong>BUFFs:</strong> Quando permitidos, são consumíveis server-side; falhas não gastam item e cada pessoa ativa no máximo um novo BUFF por rodada.</li><li><strong>Narrador:</strong> Quando ativo, o dispositivo do criador narra apenas informações públicas da partida.</li><li><strong>Espólio:</strong> Cartas dos outros não entram automaticamente na coleção; a curadoria ocorre ao fim de partida válida.</li><li><strong>AFK:</strong> Quando ativo, inatividade prolongada remove da mesa com possibilidade de reingresso.</li></ul>';
 const chevron='<span class="dashboard-collapse-chevron" aria-hidden="true">⌄</span>';

 function accordion(title,subtitle,eyebrow,body,extra=''){
  return `<details class="dashboard-card room-info-accordion ${extra}"><summary class="dashboard-section-heading dashboard-collapsible-heading"><div><small>${eyebrow}</small><h3>${title}</h3><p>${subtitle}</p></div>${chevron}</summary><div class="dashboard-card-body">${body}</div></details>`;
 }

 RoomRulesUI.howToPlay=function(extra=''){
  return accordion('📜 Como Jogar','Abra quando quiser revisar como cada opção afeta a partida.','REGRAS',RULE_ITEMS,`how-to-play-card ${extra}`);
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
   details.innerHTML=`<summary class="dashboard-section-heading dashboard-collapsible-heading"><div><small>RECOMPENSAS</small><h3>🏆 Estimativa para mesa cheia</h3><p>Veja o que uma mesa completa pode render antes de criar a partida.</p></div>${chevron}</summary><div class="dashboard-card-body"></div>`;
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
   details.innerHTML=`<summary class="dashboard-section-heading dashboard-collapsible-heading"><div><small>RECOMPENSAS</small><h3>🏆 Estimativa para mesa cheia</h3><p>Cenário econômico com a capacidade máxima configurada para a sala.</p></div>${chevron}</summary><div class="dashboard-card-body"></div>`;
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
   if(token===this.previewToken&&box)box.innerHTML=RewardPreviewUI.card(full,'Estimativa para mesa cheia','Cenário com a capacidade máxima da sala.');
  }catch(e){if(token===this.previewToken&&box)box.innerHTML=`<div class="economy-preview"><small>${e.message}</small></div>`;}
 };
})();
