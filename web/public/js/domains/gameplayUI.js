'use strict';
(()=>{
 if(window.CartGameplayDomain)return;
 CartDomains.claim('gameplayUI','domains/gameplayUI.js',()=>{
  function installWinnerCards(){if(!window.SocketClient||!window.App||SocketClient.__domainWinnerCards)return;SocketClient.__domainWinnerCards=true;SocketClient.on('new_round',()=>{App.state.currentWinnerCards=null;});SocketClient.on('round_result',data=>{App.state.currentWinnerCards=Array.isArray(data?.winnerCards)&&data.winnerCards.length?[...data.winnerCards]:(data?.winnerCard?[data.winnerCard]:null);});SocketClient.on('game_over',()=>{App.state.currentWinnerCards=null;});}
  function criticalScreens(){return{round:window.RoundScreen||null,host:window.HostScreen||null,result:window.ResultScreen||null,gameOver:window.GameOverScreen||null};}
  installWinnerCards();window.CartGameplayDomain={installWinnerCards,criticalScreens};
 });
})();
