'use strict';
(()=>{
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
 const LABELS={'#friends-menu-btn':'Amigos de Merda','[data-panel="stats"]':'Estatística'};
 function setLabel(node,label){if(!node||!label)return;const copy=node.querySelector('.home-action-copy b');if(copy){if(copy.textContent!==label)copy.textContent=label;return;}}
 function apply(){const actions=document.querySelector('.profile-actions');if(!actions)return;ORDER.forEach((sel,index)=>{const node=actions.querySelector(sel);if(!node)return;node.style.setProperty('order',String(index+1),'important');setLabel(node,LABELS[sel]);});}
 function settle(){apply();queueMicrotask(apply);}
 if(window.HomeScreen&&!HomeScreen.__p24MenuOrder){HomeScreen.__p24MenuOrder=true;const base=HomeScreen.renderAccount.bind(HomeScreen);HomeScreen.renderAccount=function(...args){const out=base(...args);settle();return out;};}
 window.HomeMenuP24={apply,order:[...ORDER],settle};
 window.addEventListener('load',settle,{once:true});settle();
})();
