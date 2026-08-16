'use strict';
(()=>{
  const RECOVERY_KEY='cartaralho:music-recovery-p28:v1';
  const LEGACY_MUTE_KEY='cartaralho:music-muted:v1';
  const SETTINGS_KEY='cartaralho:audio-settings:v1';
  let lastAttempt=0;

  function readSettings(){
    try{return window.CartSFX?.getSettings?.()||JSON.parse(localStorage.getItem(SETTINGS_KEY)||'null')||{};}
    catch(_){return window.CartSFX?.getSettings?.()||{};}
  }

  function wantsMusic(){return readSettings().music!==false;}

  function migrateOnce(){
    try{
      if(localStorage.getItem(RECOVERY_KEY))return;
      // Recupera instalações que ficaram presas em music:false por regressões antigas.
      localStorage.setItem(LEGACY_MUTE_KEY,'0');
      window.CartSFX?.setSettings?.({music:true});
      localStorage.setItem(RECOVERY_KEY,'1');
    }catch(_){window.CartSFX?.setSettings?.({music:true});}
  }

  async function attempt(force=false){
    if(!wantsMusic())return false;
    const now=Date.now();
    if(!force&&now-lastAttempt<180)return false;
    lastAttempt=now;
    try{
      // Não confia apenas no flag muted: no Safari o AudioContext pode continuar
      // bloqueado/suspenso mesmo quando a preferência lógica já diz "ligado".
      await window.CartSoundtrack?.unmute?.();
      return true;
    }catch(_){return false;}
  }

  function gestureAttempt(){attempt(true);}
  function armPersistentGestures(){
    // Intencionalmente não usa once:true. Se o primeiro gesto não desbloquear o
    // Web Audio (comum em restauração de PWA/aba no iOS), o próximo gesto tenta novamente.
    document.addEventListener('touchstart',gestureAttempt,{capture:true,passive:true});
    document.addEventListener('pointerdown',gestureAttempt,{capture:true,passive:true});
    document.addEventListener('click',gestureAttempt,{capture:true,passive:true});
    document.addEventListener('keydown',gestureAttempt,{capture:true});
  }

  migrateOnce();
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
