'use strict';
/* Compositor único dos owners de socket do App. */
(()=>{
  if(window.CartSocketLifecycle)return;
  let registered=false;

  function register(app=window.App){
    if(registered)return false;
    if(!app)throw new Error('App indisponível para registrar lifecycle de socket.');
    registered=true;
    CartRoomSocketLifecycle.register(app);
    CartGameplaySocketLifecycle.register(app);
    return true;
  }

  function install(app=window.App){
    if(!app||app.__socketLifecycleOwned)return app;
    app.__socketLifecycleOwned=true;
    app.registerSocketEvents=function(){return register(this);};
    return app;
  }

  window.CartSocketLifecycle={register,install};
  install();
})();
