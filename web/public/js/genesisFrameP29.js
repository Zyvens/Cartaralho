'use strict';
(()=>{
  const SELECTOR='.avatar-frame.frame-genese-celestial';
  const STAR='✦';
  const STAR_COUNT=6;

  function syncStars(track){
    const current=[...track.querySelectorAll(':scope > .genese-atom-particle')];
    if(current.length!==STAR_COUNT)track.replaceChildren();

    const stars=current.length===STAR_COUNT?current:[];
    for(let index=0;index<STAR_COUNT;index+=1){
      let particle=stars[index];
      if(!particle){
        particle=document.createElement('i');
        track.appendChild(particle);
      }
      particle.className='genese-atom-particle genese-atom-star';
      particle.textContent=STAR;
      particle.setAttribute('aria-hidden','true');
      particle.style.setProperty('--genese-star-index',String(index));
    }
    return track;
  }

  function mount(frame){
    if(!frame)return frame;
    let track=frame.querySelector(':scope > .genese-atom-track');
    if(!track){
      track=document.createElement('span');
      track.className='genese-atom-track';
      track.setAttribute('aria-hidden','true');
      frame.appendChild(track);
    }
    syncStars(track);
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

  window.GenesisFrameP29={decorate,mount,syncStars,STAR,STAR_COUNT};
})();
