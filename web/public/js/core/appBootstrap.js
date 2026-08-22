'use strict';
/* Owner do bootstrap do App. Mantém a ordem histórica de socket/listeners/guest/primeira tela. */
(()=>{
  if(window.CartAppBootstrap)return;

  function detectGuest(app){
    const hostname=window.location.hostname;
    if(hostname.endsWith('.loca.lt')&&hostname.startsWith('cartaralho-')){
      const parts=hostname.split('-');
      if(parts.length>1){
        const codePart=parts[1].split('.')[0];
        app.state.isGuest=true;
        app.state.guestCode=codePart.toUpperCase();
      }
    }
    return app.state.isGuest;
  }

  function chooseFirstScreen(app){
    if(app.state.isGuest){
      if(app.state.guestCode)app.showScreen('guest');
      else app.showScreen('waitingHost');
    }else app.showScreen('home');
  }

  function init(app){
    SocketClient.init();
    app.registerSocketEvents();
    detectGuest(app);
    chooseFirstScreen(app);
  }

  function install(app=window.App){
    if(!app||app.__bootstrapOwned)return app;
    app.__bootstrapOwned=true;
    app.init=function(){return init(this);};
    return app;
  }

  window.CartAppBootstrap={detectGuest,chooseFirstScreen,init,install};
  install();
})();
