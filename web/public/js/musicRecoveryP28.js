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
      // No Safari/iOS, muted=false não garante que o AudioContext esteja rodando.
      // unmute() também cria/retoma o contexto e rearma o scheduler da trilha.
      await window.CartSoundtrack?.unmute?.();
      return true;
    }catch(_){return false;}
  }

  function gestureAttempt(){attempt(true);}
  function armPersistentGestures(){
    // Não usa once:true: se o primeiro gesto ocorrer antes de o Safari liberar
    // Web Audio (PWA restaurada/aba retomada), o gesto seguinte tenta de novo.
    document.addEventListener('touchstart',gestureAttempt,{capture:true,passive:true});
    document.addEventListener('pointerdown',gestureAttempt,{capture:true,passive:true});
    document.addEventListener('click',gestureAttempt,{capture:true,passive:true});
    document.addEventListener('keydown',gestureAttempt,{capture:true});
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
