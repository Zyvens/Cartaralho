'use strict';
(()=>{
 if(window.CartRoomShareDomain)return;
 CartDomains.claim('roomShareUI','domains/roomShareUI.js',()=>{
  const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
  async function copyRoomLink(url){
   try{
    if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(url);
    else{const area=document.createElement('textarea');area.value=url;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();if(!document.execCommand('copy'))throw new Error('copy failed');area.remove();}
    Toast.success('Link da sala copiado!');
   }catch(_){Toast.error('Não foi possível copiar o link.');}
  }
  function addRoomShare(){
   const code=App.state.roomCode;if(!code)return;
   const root=document.getElementById('app')?.firstElementChild;if(!root||document.getElementById('room-share-tools'))return;
   const url=`${location.origin}/?room=${code}`,bar=document.createElement('button');
   bar.type='button';bar.id='room-share-tools';bar.className='direct-room-hint room-share-copy';bar.setAttribute('aria-label','Copiar link direto da sala');
   bar.innerHTML=`<span class="room-share-copy-main"><span class="room-share-copy-icon" aria-hidden="true">🔗</span><span class="room-share-copy-label">Link direto:</span><span class="room-share-copy-url">${esc(url)}</span></span><span class="room-share-copy-hint">clique para copiar</span>`;
   bar.addEventListener('click',()=>copyRoomLink(url));root.prepend(bar);
  }
  function applyDirectRoomHint(){const direct=new URLSearchParams(location.search).get('room');if(!direct)return;const code=String(direct).replace(/[^a-z0-9]/gi,'').toUpperCase().slice(0,6),input=document.getElementById('room-code-input');if(!input||!code)return;input.value=code;const mode=document.getElementById('mode-selection'),play=document.getElementById('play-form');if(mode)mode.style.display='none';if(play)play.style.display='block';if(play&&!document.getElementById('direct-room-hint')){const hint=document.createElement('div');hint.id='direct-room-hint';hint.className='direct-room-hint';hint.textContent=`🔗 Link direto detectado: sala ${code}. Entre, reingresse ou assista.`;play.prepend(hint);}}
  if(window.MetaUI)MetaUI.addRoomShare=addRoomShare;
  window.CartRoomShareDomain={addRoomShare,applyDirectRoomHint,copyRoomLink};
 })
})();
