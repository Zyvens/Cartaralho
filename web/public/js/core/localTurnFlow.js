'use strict';
/* Owner do fluxo local/blind-screen entre jogadores no mesmo dispositivo. */
(()=>{
  if(window.CartLocalTurnFlow)return;

  function next(appController){
    const state=appController.state;
    if(!state.localTurnQueue){
      const players=state.players.map(p=>p.nickname);
      let hostNick=null;
      const nonHosts=[];
      for(const nick of players){
        if(state.localPlayersData[nick]&&state.localPlayersData[nick].isHost)hostNick=nick;
        else nonHosts.push(nick);
      }
      state.localTurnQueue=nonHosts;
      state.localHostNick=hostNick;
    }

    if(state.localTurnQueue.length>0){
      const nextNick=state.localTurnQueue.shift();
      SocketClient.setActiveLocalPlayer(nextNick);
      const data=state.localPlayersData[nextNick];
      const container=document.getElementById('app');
      if(!container)return;
      container.innerHTML=`
        <div class="lobby-screen" style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh;">
          <h2 class="gradient-text" style="font-size:2.5rem; margin-bottom:1rem;">Vez de: ${nextNick}</h2>
          <p style="color:var(--text-muted); margin-bottom:2rem;">Escolha sua carta (o Czar é ${state.localHostNick})</p>
          <button id="blind-start-btn" class="btn btn-primary btn-lg">Começar</button>
        </div>`;
      document.getElementById('blind-start-btn')?.addEventListener('click',()=>{
        appController.showScreen('round',{blackCard:state.currentBlackCard,hand:data.hand,roundNumber:state.roundNumber});
      });
      return;
    }

    SocketClient.setActiveLocalPlayer(state.localHostNick);
    const container=document.getElementById('app');
    if(!container)return;
    container.innerHTML=`
      <div class="lobby-screen" style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh;">
        <h2 class="gradient-text" style="font-size:2.5rem; margin-bottom:1rem;">Vez do Czar: ${state.localHostNick}</h2>
        <p style="color:var(--text-muted); margin-bottom:2rem;">Hora de escolher a melhor carta!</p>
        <button id="blind-start-btn" class="btn btn-primary btn-lg">Ver Cartas Jogadas</button>
      </div>`;
    document.getElementById('blind-start-btn')?.addEventListener('click',()=>{
      appController.showScreen('host',{blackCard:state.currentBlackCard,roundNumber:state.roundNumber});
    });
  }

  function install(app=window.App){
    if(!app||app.__localTurnOwned)return app;
    app.__localTurnOwned=true;
    app.handleLocalNextTurn=function(){return next(this);};
    return app;
  }

  window.CartLocalTurnFlow={next,install};
  install();
})();
