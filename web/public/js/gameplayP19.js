'use strict';

(function gameplayP19(){
  document.addEventListener('DOMContentLoaded',()=>{
    if(!window.SocketClient||!window.App)return;
    SocketClient.on('new_round',()=>{App.state.currentWinnerCards=null;});
    SocketClient.on('round_result',data=>{
      App.state.currentWinnerCards=Array.isArray(data?.winnerCards)&&data.winnerCards.length?[...data.winnerCards]:(data?.winnerCard?[data.winnerCard]:null);
    });
    SocketClient.on('game_over',()=>{App.state.currentWinnerCards=null;});
  },{once:true});
})();
