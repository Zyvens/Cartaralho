'use strict';
/* Runtime owner do estado de sessão/partida do App.
   Extraído do app.js sem alterar bootstrap, roteamento ou listeners de socket. */
(()=>{
  if(window.CartAppState)return;

  const initial=()=>({
    nickname:'',
    roomCode:'',
    roomRevision:0,
    isCreator:false,
    currentScreen:'home',
    players:[],
    hand:[],
    currentBlackCard:null,
    isHost:false,
    scores:[],
    roundNumber:0,
    maxPlayers:6,
    blackCardsPerPlayer:5,
    whiteCardsPerPlayer:20,
    playMode:'online',
    isGuest:false,
    guestCode:'',
  });

  const reset=current=>({
    nickname:current?.nickname||'',
    roomCode:'',
    roomRevision:0,
    isCreator:false,
    currentScreen:'home',
    players:[],
    hand:[],
    currentBlackCard:null,
    isHost:false,
    scores:[],
    roundNumber:0,
    maxPlayers:6,
    blackCardsPerPlayer:5,
    whiteCardsPerPlayer:20,
    useStandardDeck:true,
  });

  function install(app=window.App){
    if(!app||app.__stateOwned)return app;
    app.__stateOwned=true;
    // Neste ponto app.js acabou de ser avaliado e o bootstrap ainda aguarda DOMContentLoaded.
    // Recriar o estado aqui mantém exatamente o primeiro estado observável do controller.
    app.state=initial();
    app.resetState=function(){
      this.state=reset(this.state);
      window.Scoreboard?.hide?.();
      // Deliberadamente não limpa CardCreationScreen.blackCards/whiteCards:
      // os rascunhos sobrevivem a host drop como no comportamento histórico.
      return this.state;
    };
    return app;
  }

  window.CartAppState={initial,reset,install};
  install();
})();
