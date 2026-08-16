'use strict';
(()=>{
  const SELECTOR='.avatar-frame.frame-genese-celestial';
  const STAR='✦';

  function mount(frame){
    if(!frame)return frame;
    const existing=frame.querySelector(':scope > .genese-atom-track');
    if(existing){
      const particle=existing.querySelector(':scope > .genese-atom-particle');
      if(particle&&particle.textContent!==STAR)particle.textContent=STAR;
      return frame;
    }
    const track=document.createElement('span');
    track.className='genese-atom-track';
    track.setAttribute('aria-hidden','true');
    const particle=document.createElement('i');
    particle.className='genese-atom-particle genese-atom-star';
    particle.textContent=STAR;
    track.appendChild(particle);
    frame.appendChild(track);
    return frame;
  }

  function decorate(root=document){
    if(root?.nodeType===1&&root.matches?.(SELECTOR))mount(root);
    root?.querySelectorAll?.(SELECTOR).forEach(mount);
  }

  decorate(document);

  // Observa apenas nós adicionados. Inserir a própria órbita não cria loop:
  // o track não contém outro .avatar-frame.frame-genese-celestial.
  const observer=new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes){
        if(node.nodeType===1)decorate(node);
      }
    }
  });
  if(document.body)observer.observe(document.body,{childList:true,subtree:true});

  window.GenesisFrameP29={decorate,mount,STAR};
})();
