'use strict';
(()=>{
 if(window.CartGameplayDomain)return;
 CartDomains.claim('gameplayUI','domains/gameplayUI.js',()=>{
  function installWinnerCards(){if(!window.SocketClient||!window.App||SocketClient.__domainWinnerCards)return;SocketClient.__domainWinnerCards=true;SocketClient.on('new_round',()=>{App.state.currentWinnerCards=null;});SocketClient.on('round_result',data=>{App.state.currentWinnerCards=Array.isArray(data?.winnerCards)&&data.winnerCards.length?[...data.winnerCards]:(data?.winnerCard?[data.winnerCard]:null);});SocketClient.on('game_over',()=>{App.state.currentWinnerCards=null;});}
  function installMinimumPlayersGrace(){if(!window.SocketClient||!window.MinimumPlayersGrace||SocketClient.__domainMinimumPlayersGrace)return false;SocketClient.__domainMinimumPlayersGrace=true;SocketClient.on('insufficient_players_started',d=>MinimumPlayersGrace.start(d));SocketClient.on('insufficient_players_cancelled',d=>MinimumPlayersGrace.cancel(d));SocketClient.on('minimum_players_sync',d=>{if(d?.minimumGrace)MinimumPlayersGrace.start(d.minimumGrace);else if(MinimumPlayersGrace.active)MinimumPlayersGrace.hide();});['game_over','room_closed','room_cancelled'].forEach(e=>SocketClient.on(e,()=>MinimumPlayersGrace.hide()));return true;}
  function criticalScreens(){return{round:window.RoundScreen||null,host:window.HostScreen||null,result:window.ResultScreen||null,gameOver:window.GameOverScreen||null};}
  installWinnerCards();installMinimumPlayersGrace();window.CartGameplayDomain={installWinnerCards,installMinimumPlayersGrace,criticalScreens};
 });
})();
