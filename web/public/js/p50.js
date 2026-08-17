'use strict';
(()=>{
 if(window.CartP50)return;
 const VERSION='v1.4.50';
 const ORDER=[
  '#marketplace-menu-btn',
  '#friends-menu-btn',
  '[data-panel="cards"]',
  '[data-panel="rank"]',
  '#notifications-menu-btn',
  '[data-panel="history"]',
  '[data-panel="stats"]',
  '#audio-settings-menu-btn',
  '[data-panel="credits"]'
 ];
 function orderMenu(){if(window.HomeMenuP27?.apply)return HomeMenuP27.apply();const actions=document.querySelector('#home-main .profile-actions');if(!actions)return;ORDER.forEach((s,i)=>actions.querySelector(s)?.style.setProperty('order',String(i+1),'important'));}
 function fixFriends(){const b=document.getElementById('friends-menu-btn');if(!b)return;const arrow=b.querySelector('.home-action-arrow');if(arrow)arrow.setAttribute('aria-hidden','true');}
 function ensureCardCreator(panel){if(!panel||!panel.querySelector('.card-tools')||panel.querySelector('.p48-create-card-entry'))return;const b=document.createElement('button');b.type='button';b.className='btn btn-primary p48-create-card-entry';b.textContent='🧽 Criar nova Carta de Jogador';b.onclick=()=>window.CartP48?.openLibraryCreator(panel,'whiteCards');const tools=panel.querySelector('.card-tools');tools.parentNode.insertBefore(b,tools);}
 function settle(){orderMenu();fixFriends();const panel=document.getElementById('home-panel');if(panel?.querySelector('.mini-card-list'))ensureCardCreator(panel);}
 if(window.HomeScreen&&!HomeScreen.__p50Home){HomeScreen.__p50Home=true;const baseAccount=HomeScreen.renderAccount.bind(HomeScreen);HomeScreen.renderAccount=function(...args){const out=baseAccount(...args);queueMicrotask(settle);return out;};const baseCards=HomeScreen.renderCards.bind(HomeScreen);HomeScreen.renderCards=async function(panel,...args){const out=await baseCards(panel,...args);ensureCardCreator(panel);return out;};}
 if(window.CartP48Friends)CartP48Friends.__p50Started=true;
 window.addEventListener('pageshow',settle);document.addEventListener('visibilitychange',()=>{if(!document.hidden)settle();});queueMicrotask(settle);
 window.CartP50={VERSION,orderMenu,ensureCardCreator,settle};
})();
