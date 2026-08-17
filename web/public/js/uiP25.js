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
  const LABELS={'#friends-menu-btn':'Amigos de Merda','[data-panel="stats"]':'Estatística'};
  function setLabel(node,label){
    if(!node||!label)return;
    const copy=node.querySelector('.home-action-copy b');
    if(copy&&copy.textContent!==label)copy.textContent=label;
  }
  function orderHome(){
    const actions=document.querySelector('.profile-actions');if(!actions)return;
    ORDER.forEach((selector,index)=>{const node=actions.querySelector(selector);if(!node)return;node.style.setProperty('order',String(index+1),'important');setLabel(node,LABELS[selector]);});
  }
  function removeRedundantCardEditorSave(){
    const screen=document.querySelector('.card-creation-screen');if(!screen)return;
    const bottom=screen.querySelector('#save-cards-btn'),top=screen.querySelector('#back-btn');
    if(bottom&&top&&/salvar\s+e\s+voltar\s+ao\s+lobby/i.test(top.textContent||''))top.remove();
  }
  function settle(){orderHome();removeRedundantCardEditorSave();queueMicrotask(()=>{orderHome();removeRedundantCardEditorSave();});}
  if(window.HomeScreen&&!HomeScreen.__p25MobileMenuOrder){HomeScreen.__p25MobileMenuOrder=true;const base=HomeScreen.renderAccount.bind(HomeScreen);HomeScreen.renderAccount=function(...args){const out=base(...args);settle();return out;};}
  if(window.CardCreationScreen&&!CardCreationScreen.__p25SingleSave){HomeScreen.__p25SingleSave=true;const base=CardCreationScreen.render.bind(CardCreationScreen);CardCreationScreen.render=async function(...args){const out=await base(...args);removeRedundantCardEditorSave();return out;};}
  window.HomeUiP25={apply:orderHome,order:[...ORDER],settle};
  window.addEventListener('load',settle,{once:true});
  window.addEventListener('pageshow',settle);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)settle();});
  settle();
})();
