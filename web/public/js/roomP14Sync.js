'use strict';

(function roomP14SyncBootstrap(){
  function apply(data,{rerender=true}={}){
    const config=data?.config;if(!config||!window.App)return null;
    App.state.config={...(App.state.config||{}),...config};
    App.state.maxPlayers=Number(config.maxPlayers||App.state.maxPlayers||6);
    App.state.useStandardDeck=config.useStandardDeck!==false;
    if(config.narratorEnabled===false)window.CartNarrator?.cancel?.();
    if(rerender&&App.state.currentScreen==='lobby'){
      const app=document.getElementById('app');
      if(app)window.LobbyScreen?.render?.(app,{code:App.state.roomCode});
    }
    return App.state.config;
  }
  function register(){window.SocketClient?.on?.('room_config_updated',data=>apply(data));}
  window.CartRoomConfigSync={apply};
  document.addEventListener('DOMContentLoaded',register,{once:true});
})();
