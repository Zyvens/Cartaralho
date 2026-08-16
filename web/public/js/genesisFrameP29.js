'use strict';
(()=>{
  const SELECTOR='.avatar-frame.frame-genese-celestial';

  function mount(frame){
    if(!frame||frame.querySelector(':scope > .genese-atom-track'))return frame;
    const track=document.createElement('span');
    track.className='genese-atom-track';
    track.setAttribute('aria-hidden','true');
    const particle=document.createElement('i');
    particle.className='genese-atom-particle';
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

  window.GenesisFrameP29={decorate,mount};
})();
