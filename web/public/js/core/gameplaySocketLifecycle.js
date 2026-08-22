'use strict';
/* Owner do lifecycle de socket da rodada/gameplay. */
(()=>{
  if(window.CartGameplaySocketLifecycle)return;
  let registered=false;

  function register(app){
    if(registered)return false;
    registered=true;

    SocketClient.on('new_round',data=>{
      app.state.roundNumber=data.roundNumber||app.state.roundNumber+1;
      app.state.currentBlackCard=data.blackCard;
      if(data.scores)app.state.scores=data.scores;
      app.state.localPlayersData=app.state.localPlayersData||{};
      app.state.localPlayersData[app.state.nickname]=data;
      if(app.state.isLocalMode){
        setTimeout(()=>app.handleLocalNextTurn(),300);
      }else{
        app.state.hand=data.hand||[];
        app.state.isHost=data.isHost||false;
        if(data.isHost)app.showScreen('host',{blackCard:data.blackCard,roundNumber:app.state.roundNumber});
        else app.showScreen('round',{blackCard:data.blackCard,hand:data.hand,roundNumber:app.state.roundNumber});
      }
    });

    SocketClient.on('card_played',data=>{
      if(app.state.currentScreen==='round')RoundScreen.updateSubmissionCount(data.submissionCount,data.totalExpected);
      if(app.state.currentScreen==='host')HostScreen.updateSubmissionCount(data.submissionCount,data.totalExpected);
    });

    SocketClient.on('all_cards_played',data=>{
      app.state.submissions=data.submissions;
      if(app.state.currentScreen==='host'&&data.submissions)HostScreen.showSubmissions(data.submissions);
    });

    SocketClient.on('round_result',data=>{
      app.state.localTurnQueue=null;
      app.showScreen('result',{
        blackCard:data.blackCard,
        winnerCard:data.winnerCard,
        winnerNickname:data.winnerNickname,
        scores:data.scores,
        roundNumber:data.roundNumber||app.state.roundNumber,
      });
    });

    SocketClient.on('game_over',data=>{
      Scoreboard.hide();
      app.showScreen('gameOver',{
        winner:data.winnerNickname||(data.ranking&&data.ranking[0]?data.ranking[0].nickname:'???'),
        ranking:data.ranking||[],
      });
    });

    SocketClient.on('round_skipped',data=>Toast.warning(data.message||'Rodada pulada.'));
    return true;
  }

  window.CartGameplaySocketLifecycle={register};
})();
