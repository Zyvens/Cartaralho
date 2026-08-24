'use strict';
(()=>{
 if(window.CartRoomShareDomain)return;
 CartDomains.claim('roomShareUI','domains/roomShareUI.js',()=>{
  const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
  function addRoomShare(){const code=App.state.roomCode;if(!code)return;const root=document.getElementById('app')?.firstElementChild;if(!root||document.getElementById('room-share-tools'))return;const bar=document.createElement('div');bar.id='room-share-tools';bar.className='direct-room-hint';bar.innerHTML=`🔗 Link direto: <b>${location.origin}/?room=${esc(code)}</b> <button id="copy-room-link" class="btn btn-secondary btn-sm">Copiar</button>`;root.prepend(bar);bar.querySelector('#copy-room-link').onclick=()=>navigator.clipboard.writeText(`${location.origin}/?room=${code}`).then(()=>Toast.success('Link da sala copiado!')).catch(()=>Toast.error('Não foi possível copiar o link.'));}
  function applyDirectRoomHint(){const direct=new URLSearchParams(location.search).get('room');if(!direct)return;const code=String(direct).replace(/[^a-z0-9]/gi,'').toUpperCase().slice(0,6),input=document.getElementById('room-code-input');if(!input||!code)return;input.value=code;const mode=document.getElementById('mode-selection'),play=document.getElementById('play-form');if(mode)mode.style.display='none';if(play)play.style.display='block';if(play&&!document.getElementById('direct-room-hint')){const hint=document.createElement('div');hint.id='direct-room-hint';hint.className='direct-room-hint';hint.textContent=`🔗 Link direto detectado: sala ${code}. Entre, reingresse ou assista.`;play.prepend(hint);}}
  if(window.MetaUI)MetaUI.addRoomShare=addRoomShare;
  window.CartRoomShareDomain={addRoomShare,applyDirectRoomHint};
 })
})();
