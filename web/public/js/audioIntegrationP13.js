'use strict';
(function audioIntegrationP13(){
  const SETTINGS_KEY='cartaralho:audio-settings:v1';
  const LEGACY_MUTE_KEY='cartaralho:music-muted:v1';
  const AUTOSTART_FIX_KEY='cartaralho:music-autostart-p18:v1';
  try{
    if(!localStorage.getItem(AUTOSTART_FIX_KEY)){
      window.CartSFX?.setSettings({music:true});
      localStorage.setItem(LEGACY_MUTE_KEY,'0');
      localStorage.setItem(AUTOSTART_FIX_KEY,'1');
    }else if(!localStorage.getItem(SETTINGS_KEY))window.CartSFX?.setSettings({music:localStorage.getItem(LEGACY_MUTE_KEY)!=='1'});
    else window.CartSFX?.applyMusic?.();
  }catch(_){window.CartSFX?.applyMusic?.();}

  // Web Audio não pode garantir som audível antes de interação no iOS. A trilha fica
  // armada ao carregar e é retomada no primeiro gesto aceito pelo navegador, sem exigir
  // que o usuário abra Configurações ou alterne Música manualmente.
  const resumeMusic=()=>{
    const s=window.CartSFX?.getSettings?.();
    if(s?.music===false)return;
    window.CartSoundtrack?.unmute?.();
  };
  const gestureEvents=['touchstart','pointerdown','click','keydown'];
  gestureEvents.forEach(type=>document.addEventListener(type,resumeMusic,{once:true,capture:true,passive:type!=='keydown'}));
  window.addEventListener('pageshow',resumeMusic);
  window.addEventListener('load',()=>{window.CartSFX?.applyMusic?.();resumeMusic();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)resumeMusic();});

  if(window.Modal&&!Modal.__p13Audio){
    Modal.__p13Audio=true;
    const show=Modal.show.bind(Modal),hide=Modal.hide.bind(Modal);
    Modal.show=function(options){const r=show(options);window.CartSFX?.play('modal_open');return r;};
    Modal.hide=function(){const had=!!this.overlay;const r=hide();if(had)window.CartSFX?.play('modal_close');return r;};
  }

  const overlaySelector='.profile-modal-overlay,.market-overlay,.buff-drawer-shell,.notifications-overlay';
  const seen=new WeakSet();
  const observer=new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes){if(node.nodeType!==1)continue;if(node.matches?.(overlaySelector)&&!seen.has(node)){seen.add(node);window.CartSFX?.play('modal_open');}}
      for(const node of record.removedNodes){if(node.nodeType===1&&node.matches?.(overlaySelector)&&seen.has(node))window.CartSFX?.play('modal_close');}
    }
  });
  observer.observe(document.body,{childList:true});
})();
