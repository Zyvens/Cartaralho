'use strict';
(()=>{
  const SETTINGS_KEY='cartaralho:audio-settings:v1';
  let lastAttempt=0;

  function readSettings(){
    try{return window.CartSFX?.getSettings?.()||JSON.parse(localStorage.getItem(SETTINGS_KEY)||'null')||{};}
    catch(_){return window.CartSFX?.getSettings?.()||{};}
  }

  function wantsMusic(){return readSettings().music!==false;}

  async function attempt(force=false){
    if(!wantsMusic())return false;
    const now=Date.now();
    if(!force&&now-lastAttempt<180)return false;
    lastAttempt=now;
    try{
      const ok=await (window.CartSoundtrack?.resume?.()||window.CartSoundtrack?.unmute?.());
      return ok===true||window.CartSoundtrack?.state==='running';
    }catch(_){return false;}
  }

  function gestureAttempt(){attempt(true);}
  function armPersistentGestures(){
    ['touchstart','touchend','pointerdown','pointerup','click','keydown'].forEach(type=>
      document.addEventListener(type,gestureAttempt,{capture:true,passive:type!=='keydown'})
    );
  }

  armPersistentGestures();

  const settle=()=>{
    window.CartSFX?.applyMusic?.();
    attempt();
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',settle,{once:true});
  else queueMicrotask(settle);
  window.addEventListener('load',settle,{once:true});
  window.addEventListener('pageshow',()=>attempt(true));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)attempt(true);});
  window.addEventListener('cartaralho:audio-settings',e=>{if(e.detail?.music!==false)attempt(true);});

  window.CartMusicRecoveryP28={attempt,wantsMusic};
})();
