'use strict';
(()=>{
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
  let observedMain=null,mainObserver=null,scheduled=false,normalizing=false;
  function actionsRoot(){return document.querySelector('#home-main .profile-actions');}
  function normalize(){
    const actions=actionsRoot();if(!actions)return;
    const ordered=ORDER.map(selector=>actions.querySelector(selector)).filter(Boolean);
    ordered.forEach((node,index)=>{node.dataset.homeOrder=String(index+1);node.style.setProperty('order',String(index+1),'important');});
    const known=new Set(ordered),current=[...actions.children].filter(node=>known.has(node));
    if(current.length===ordered.length&&current.every((node,index)=>node===ordered[index]))return;
    normalizing=true;actions.append(...ordered,...[...actions.children].filter(node=>!known.has(node)));normalizing=false;
  }
  function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;normalize();observeMain();});}
  function observeMain(){
    const main=document.getElementById('home-main');if(!main||main===observedMain)return;
    mainObserver?.disconnect();observedMain=main;mainObserver=new MutationObserver(()=>{if(!normalizing)schedule();});mainObserver.observe(main,{childList:true,subtree:true});
  }
  function settle(){observeMain();normalize();requestAnimationFrame(()=>{observeMain();normalize();});}
  if(window.HomeScreen&&!HomeScreen.__p27StableMenu){
    HomeScreen.__p27StableMenu=true;
    const baseAccount=HomeScreen.renderAccount.bind(HomeScreen);HomeScreen.renderAccount=function(...args){const out=baseAccount(...args);settle();return out;};
    const baseRender=HomeScreen.render.bind(HomeScreen);HomeScreen.render=async function(...args){const out=await baseRender(...args);settle();return out;};
  }
  window.addEventListener('load',settle,{once:true});
  window.addEventListener('pageshow',settle);
  window.addEventListener('orientationchange',()=>requestAnimationFrame(settle));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)settle();});
  window.HomeMenuP27={apply:normalize,order:[...ORDER],settle};
  settle();
})();
