'use strict';
(()=>{
 if(window.CartP50)return;
 const VERSION='v1.4.50';
 const ORDER=[
  '#marketplace-menu-btn',
  '#friends-menu-btn',
  '[data-panel="cards"]',
  '[data-panel="rank"]',
  '[data-panel="history"]',
  '#notifications-menu-btn',
  '[data-panel="stats"]',
  '#audio-settings-menu-btn',
  '[data-panel="credits"]'
 ];
 let menuBusy=false,menuScheduled=false;
 function orderMenu(){
  const actions=document.querySelector('#home-main .profile-actions');if(!actions||menuBusy)return;
  const nodes=ORDER.map(s=>actions.querySelector(s)).filter(Boolean);
  nodes.forEach((n,i)=>n.style.setProperty('order',String(i+1),'important'));
  const known=new Set(nodes),current=[...actions.children].filter(n=>known.has(n));
  if(current.length===nodes.length&&current.every((n,i)=>n===nodes[i]))return;
  menuBusy=true;actions.append(...nodes,...[...actions.children].filter(n=>!known.has(n)));menuBusy=false;
 }
 function scheduleMenu(){if(menuScheduled)return;menuScheduled=true;queueMicrotask(()=>{menuScheduled=false;orderMenu();});}
 function fixFriends(){
  const b=document.getElementById('friends-menu-btn');if(!b)return;
  const arrow=b.querySelector('.home-action-arrow');if(arrow)arrow.setAttribute('aria-hidden','true');
 }
 function ensureCardCreator(panel){
  if(!panel||!panel.querySelector('.card-tools')||panel.querySelector('.p48-create-card-entry'))return;
  const b=document.createElement('button');b.type='button';b.className='btn btn-primary p48-create-card-entry';b.textContent='🧽 Criar nova Carta de Jogador';
  b.onclick=()=>window.CartP48?.openLibraryCreator(panel,'whiteCards');
  const tools=panel.querySelector('.card-tools');tools.parentNode.insertBefore(b,tools);
 }
 function settle(){scheduleMenu();fixFriends();const panel=document.getElementById('home-panel');if(panel?.querySelector('.mini-card-list'))ensureCardCreator(panel);}
 if(window.HomeScreen&&!HomeScreen.__p50Home){
  HomeScreen.__p50Home=true;
  const baseAccount=HomeScreen.renderAccount.bind(HomeScreen);
  HomeScreen.renderAccount=function(...args){const out=baseAccount(...args);queueMicrotask(settle);return out;};
  const baseCards=HomeScreen.renderCards.bind(HomeScreen);
  HomeScreen.renderCards=async function(panel,...args){const out=await baseCards(panel,...args);ensureCardCreator(panel);return out;};
 }
 /* Evita trabalho de presença em background e reinicializações duplicadas ao voltar ao app. */
 if(window.CartP48Friends){
  const F=CartP48Friends,baseStart=F.start.bind(F);
  F.start=function(){if(this.__p50Started)return;this.__p50Started=true;baseStart();};
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){F.beat();F.updateHomePill(true);}});
 }
 const observer=new MutationObserver(()=>{if(!menuBusy)scheduleMenu();});
 const observe=()=>{const main=document.getElementById('home-main');if(main&&!main.__p50Observed){main.__p50Observed=true;observer.observe(main,{childList:true,subtree:true});}};
 window.addEventListener('pageshow',()=>{observe();settle();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)settle();});
 queueMicrotask(()=>{observe();settle();});
 window.CartP50={VERSION,orderMenu,ensureCardCreator,settle};
})();
