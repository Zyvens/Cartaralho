'use strict';
/* Roteador-base do Cartaralho.
   Owner da transição de telas; navigationUI continua sendo o writer final e captura esta função. */
(()=>{
  if(window.CartScreenRouter)return;

  function render(name,app,data={}){
    switch(name){
      case 'home': HomeScreen.render(app); break;
      case 'waitingHost': WaitingHostScreen.render(app); break;
      case 'guest': GuestScreen.render(app); break;
      case 'createRoom': CreateRoomScreen.render(app); break;
      case 'lobby': LobbyScreen.render(app,data); break;
      case 'serverDash': ServerDashScreen.render(app); break;
      case 'cardCreation': CardCreationScreen.render(app,data); break;
      case 'round': RoundScreen.render(app,data); break;
      case 'host': HostScreen.render(app,data); break;
      case 'result': ResultScreen.render(app,data); break;
      case 'gameOver': GameOverScreen.render(app,data); break;
      case 'admin': AdminScreen.render(app); break;
      default: HomeScreen.render(app);
    }
  }

  function cleanup(current){
    if(current==='result')window.ResultScreen?.cleanup?.();
    if(current==='waitingHost')window.WaitingHostScreen?.cleanup?.();
  }

  function show(appController,name,data={}){
    cleanup(appController.state.currentScreen);
    appController.state.currentScreen=name;
    const app=document.getElementById('app');
    if(!app)return;
    app.classList.add('screen-exit');
    setTimeout(()=>{
      app.innerHTML='';
      app.classList.remove('screen-exit');
      app.classList.add('screen-enter');
      render(name,app,data);
      setTimeout(()=>app.classList.remove('screen-enter'),400);
    },300);
  }

  function install(app=window.App){
    if(!app||app.__screenRouterOwned)return app;
    app.__screenRouterOwned=true;
    app.showScreen=function(name,data={}){return show(this,name,data);};
    return app;
  }

  window.CartScreenRouter={render,cleanup,show,install};
  install();
})();
