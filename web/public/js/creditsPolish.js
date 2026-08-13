(()=>{
  document.addEventListener('click',(event)=>{
    const trigger=event.target.closest('[data-panel="credits"]');
    if(!trigger)return;
    setTimeout(()=>{
      const panel=document.getElementById('home-panel');
      const card=panel?.querySelector('.profile-panel');
      if(!card||card.querySelector('.credits-produced-by'))return;
      const line=document.createElement('p');
      line.className='credits-produced-by';
      line.innerHTML='<span>Produzido por:</span> <strong>Vitor Ivens</strong>';
      card.appendChild(line);
    },0);
  });
})();
