'use strict';
/* Owner do lifecycle de sala/presença/preparação e erros de transporte. */
(()=>{
  if(window.CartRoomSocketLifecycle)return;
  let registered=false;

  function register(app){
    if(registered)return false;
    registered=true;

    SocketClient.on('room_created',data=>{
      app.state.roomCode=data.code;
      app.state.roomRevision=Number(data.roomRevision||0);
      app.state.isCreator=true;
      app.state.config=data.config||{};
      app.state.maxPlayers=data.config?.maxPlayers||6;
      app.state.blackCardsPerPlayer=data.config?.blackCardsPerPlayer||5;
      app.state.whiteCardsPerPlayer=data.config?.whiteCardsPerPlayer||20;
      app.state.useStandardDeck=data.config?.useStandardDeck!==false;
      app.state.players=data.players||[{nickname:app.state.nickname,cardsReady:false,isCreator:true,connected:true}];
      const isLocalhost=window.location.hostname==='localhost'||window.location.hostname==='127.0.0.1';
      if(isLocalhost&&app.state.playMode!=='local-server')SocketClient.socket.emit('set_host_mode',{mode:app.state.playMode,activeRoom:data.code});
      Toast.success(`Mesa criada! Código: ${data.code}`);
      app.showScreen('lobby',{code:data.code});
    });

    SocketClient.on('room_joined',data=>{
      app.state.roomCode=data.code;
      app.state.roomRevision=Number(data.roomRevision||0);
      app.state.config=data.config||{};
      app.state.maxPlayers=data.config?.maxPlayers||6;
      app.state.blackCardsPerPlayer=data.config?.blackCardsPerPlayer||5;
      app.state.whiteCardsPerPlayer=data.config?.whiteCardsPerPlayer||20;
      app.state.useStandardDeck=data.config?.useStandardDeck!==false;
      app.state.players=data.players||[];
      app.state.isCreator=data.isCreator||false;
      Toast.success(`Entrou na sala ${data.code}`);
      app.showScreen('lobby',{code:data.code});
    });

    SocketClient.on('room_closed',data=>{
      app.state.roomCode=null;
      const hostname=window.location.hostname,isLocalhost=hostname==='localhost'||hostname==='127.0.0.1';
      if(hostname.endsWith('.loca.lt')||window.__isOnlineEmulator){
        const appContainer=document.getElementById('app');
        if(appContainer)appContainer.innerHTML=`
          <div class="home-screen" style="display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:100vh; padding: 20px; text-align:center;">
            <h2 style="color:var(--primary); margin-bottom: 20px;">Partida Encerrada</h2>
            <p style="font-size:1.2rem; color:var(--text-muted);">O host finalizou a sala. Feche esta janela e solicite um novo link.</p>
          </div>`;
      }else if(!isLocalhost&&app.state.isGuest)app.showScreen('waitingHost');
      else{
        Toast.error(data.message||'A sala foi encerrada.');
        app.resetState();
        app.showScreen('home');
      }
    });

    SocketClient.on('player_list_update',data=>{
      app.state.players=data.players||[];
      app.state.scores=data.players.map(p=>({nickname:p.nickname,score:p.score||0,isHost:p.isHost||false}));
      if(app.state.currentScreen==='lobby')LobbyScreen.update(data.players);
      if(['round','host','result'].includes(app.state.currentScreen))Scoreboard.update(app.state.scores);
    });

    SocketClient.on('cards_submitted',data=>{
      if(!data.playerStatuses)return;
      const incomingRevision=Number(data.roomRevision||0),currentRevision=Number(app.state.roomRevision||0);
      if(incomingRevision&&incomingRevision<currentRevision)return;
      if(incomingRevision)app.state.roomRevision=incomingRevision;
      app.state.players=app.state.players.map(p=>{
        const status=data.playerStatuses.find(s=>s.nickname===p.nickname);
        if(status)p.cardsReady=status.cardsReady;
        return p;
      });
      const myStatus=data.playerStatuses.find(s=>s.nickname===app.state.nickname);
      if(app.state.currentScreen==='cardCreation'){
        if(app.state.isLocalMode){
          Toast.success(`Cartas de ${SocketClient.activeNickname} cadastradas com sucesso!`);
          CardCreationScreen.blackCards=[];
          CardCreationScreen.whiteCards=[];
          const pending=app.state.players.filter(p=>!p.cardsReady);
          if(pending.length>0){
            SocketClient.setActiveLocalPlayer(pending[0].nickname);
            app.showScreen('cardCreation',{bypassBlindScreen:false});
          }else app.showScreen('lobby');
        }else if(myStatus&&myStatus.cardsReady){
          Toast.success('Cartas cadastradas com sucesso!');
          CardCreationScreen.blackCards=[];
          CardCreationScreen.whiteCards=[];
          app.showScreen('lobby');
        }
      }
      if(app.state.currentScreen==='lobby')LobbyScreen.update(app.state.players);
    });

    SocketClient.on('all_cards_ready',()=>Toast.info('Todos os jogadores cadastraram suas cartas!'));
    SocketClient.on('game_started',data=>Toast.success(data?.message||'A partida começou!'));

    SocketClient.on('error',data=>{
      const msg=typeof data==='string'?data:(data?.message||'Ocorreu um erro.');
      if(msg.toLowerCase().includes('sala não encontrada')&&app.state.currentScreen==='home'){
        const codeInput=document.getElementById('room-code-input');
        if(codeInput&&codeInput.value){
          const code=codeInput.value.trim();
          Toast.info('Buscando sala na rede online...');
          app.showScreen('onlineEmulator',{code});
          const joinBtn=document.getElementById('join-room-btn');
          if(joinBtn){joinBtn.disabled=false;joinBtn.innerHTML='Entrar na Mesa';}
          return;
        }
      }
      Toast.error(msg);
      if(app.state.currentScreen==='home'){
        [document.getElementById('create-room-btn'),document.getElementById('join-room-btn'),document.getElementById('create-single-btn')].forEach(btn=>{
          if(!btn)return;
          btn.disabled=false;
          const emoji=btn.querySelector('.btn-icon-emoji');
          if(!emoji)btn.textContent='Tentar novamente';
        });
      }
    });

    SocketClient.on('player_disconnected',data=>Toast.warning(`${data.nickname||'Um jogador'} desconectou.`));
    SocketClient.on('player_left',data=>Toast.warning(`${data.nickname||'Um jogador'} saiu da partida definitivamente.`));

    SocketClient.on('room_cancelled',data=>{
      app.state.roomCode=null;
      const hostname=window.location.hostname,isLocalhost=hostname==='localhost'||hostname==='127.0.0.1';
      if(hostname.endsWith('.loca.lt')||window.__isOnlineEmulator){
        const appContainer=document.getElementById('app');
        if(appContainer)appContainer.innerHTML=`
          <div class="home-screen" style="display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:100vh; padding: 20px; text-align:center;">
            <h2 style="color:var(--primary); margin-bottom: 20px;">Partida Cancelada</h2>
            <p style="font-size:1.2rem; color:var(--text-muted);">O host cancelou a partida. Feche esta janela e solicite um novo link.</p>
          </div>`;
      }else if(!isLocalhost&&app.state.isGuest)app.showScreen('waitingHost');
      else{
        Toast.error(data.message||'A partida foi cancelada/encerrada.');
        app.showScreen('home');
      }
    });

    SocketClient.on('player_abandoned',data=>{
      let seconds=15;
      Modal.show({
        title:'⚠️ Partida Encerrada',
        message:`${data.message}<br><br>Voltando ao início em <strong id="afk-timer">${seconds}</strong>s`,
        confirmText:'Voltar Agora',
        onConfirm:()=>{app.state.roomCode=null;app.showScreen('home');}
      });
      const interval=setInterval(()=>{
        seconds--;
        const timerEl=document.getElementById('afk-timer');
        if(timerEl)timerEl.textContent=seconds;
        if(seconds<=0){
          clearInterval(interval);
          const modalWrap=document.querySelector('.modal-overlay');
          if(modalWrap)modalWrap.remove();
          app.state.roomCode=null;
          app.showScreen('home');
        }
      },1000);
    });

    SocketClient.on('player_reconnected',data=>Toast.info(`${data.nickname||'Um jogador'} reconectou!`));
    SocketClient.on('server_status_update',data=>{
      const hostname=window.location.hostname,isLocalhost=hostname==='localhost'||hostname==='127.0.0.1';
      if(!isLocalhost&&data.mode==='waiting'&&app.state.isGuest&&app.state.currentScreen!=='waitingHost')app.showScreen('waitingHost');
    });
    return true;
  }

  window.CartRoomSocketLifecycle={register};
})();
