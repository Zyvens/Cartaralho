'use strict';
(()=>{
 if(window.CartReactionsDomain)return;
 CartDomains.claim('reactionsUI','domains/reactionsUI.js',()=>{
  const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
  function showReaction(data={}){const pop=document.createElement('div');pop.className='reaction-pop';pop.innerHTML=data.avatarData?`<img src="${esc(data.avatarData)}" alt=""><span>${esc(data.nickname||'Jogador')}</span><b>${esc(data.emoji)}</b>`:`<span class="reaction-avatar">${esc((data.nickname||'?').charAt(0))}</span><span>${esc(data.nickname||'Jogador')}</span><b>${esc(data.emoji)}</b>`;document.body.appendChild(pop);setTimeout(()=>pop.remove(),2300);}
  function updateReactionDock(name){document.getElementById('reaction-dock')?.remove();if(!['round','host','result'].includes(name)||!SocketClient.roomCode)return;const dock=document.createElement('div');dock.id='reaction-dock';dock.className='reaction-dock';dock.innerHTML=['😂','💀','🤡','😭','🤨'].map(emoji=>`<button data-react="${emoji}" title="Reagir">${emoji}</button>`).join('');document.body.appendChild(dock);dock.querySelectorAll('[data-react]').forEach(button=>button.onclick=async()=>{try{await MetaClient.react(SocketClient.roomCode,button.dataset.react);}catch(e){Toast.error(e.message);}});}
  if(window.MetaUI){MetaUI.showReaction=showReaction;MetaUI.updateReactionDock=updateReactionDock;}
  window.CartReactionsDomain={showReaction,updateReactionDock};
 });
})();
