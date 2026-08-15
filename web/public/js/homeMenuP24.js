'use strict';
(()=>{
 const ORDER=[
  '#marketplace-menu-btn',
  '#notifications-menu-btn',
  '#friends-menu-btn',
  '[data-panel="cards"]',
  '[data-panel="rank"]',
  '[data-panel="history"]',
  '[data-panel="stats"]',
  '#audio-settings-menu-btn',
  '[data-panel="credits"]'
 ];
 const LABELS={
  '#friends-menu-btn':'Amigos de Merda',
  '[data-panel="stats"]':'Estatística'
 };
 const observed=new WeakSet();

 function setLabel(node,label){
  if(!node||!label)return;
  const copy=node.querySelector('.home-action-copy b');
  if(copy){if(copy.textContent!==label)copy.textContent=label;return;}
  // Fallback para o intervalo curtíssimo antes da camada ProfessionalUI polir o botão.
  const icon=node.textContent.trim().match(/^\S+/)?.[0]||'';
  node.textContent=`${icon?icon+' ':''}${label}`;
 }

 function apply(){
  const actions=document.querySelector('.profile-actions');if(!actions)return;
  const nodes=ORDER.map(sel=>actions.querySelector(sel)).filter(Boolean);
  for(const[sel,label]of Object.entries(LABELS))setLabel(actions.querySelector(sel),label);
  const current=[...actions.children].filter(el=>nodes.includes(el));
  const already=current.length===nodes.length&&current.every((el,i)=>el===nodes[i]);
  if(!already)nodes.forEach(node=>actions.appendChild(node));
 }

 function observe(){
  const actions=document.querySelector('.profile-actions');if(!actions||observed.has(actions))return;
  observed.add(actions);
  const obs=new MutationObserver(()=>apply());obs.observe(actions,{childList:true});
 }

 function settle(){apply();observe();queueMicrotask(apply);setTimeout(apply,0);setTimeout(apply,80);}

 if(window.HomeScreen&&!HomeScreen.__p24MenuOrder){
  HomeScreen.__p24MenuOrder=true;
  const base=HomeScreen.renderAccount.bind(HomeScreen);
  HomeScreen.renderAccount=function(...args){const out=base(...args);settle();return out;};
 }
 window.HomeMenuP24={apply,order:[...ORDER]};
 window.addEventListener('load',settle,{once:true});
 settle();
})();
