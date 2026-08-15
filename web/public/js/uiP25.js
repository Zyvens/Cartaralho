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
    const icon=(node.textContent||'').trim().match(/^\S+/)?.[0]||'';
    node.textContent=`${icon?icon+' ':''}${label}`;
  }

  function orderHome(){
    const actions=document.querySelector('.profile-actions');
    if(!actions)return;
    const nodes=[];
    ORDER.forEach((selector,index)=>{
      const node=actions.querySelector(selector);
      if(!node)return;
      nodes.push(node);
      node.style.setProperty('order',String(index+1),'important');
      setLabel(node,LABELS[selector]);
    });
    const current=[...actions.children].filter(node=>nodes.includes(node));
    const already=current.length===nodes.length&&current.every((node,index)=>node===nodes[index]);
    if(!already)nodes.forEach(node=>actions.appendChild(node));
  }

  function observeActions(){
    const actions=document.querySelector('.profile-actions');
    if(!actions||observed.has(actions))return;
    observed.add(actions);
    new MutationObserver(()=>orderHome()).observe(actions,{childList:true});
  }

  function removeRedundantCardEditorSave(){
    const screen=document.querySelector('.card-creation-screen');
    if(!screen)return;
    const bottom=screen.querySelector('#save-cards-btn');
    const top=screen.querySelector('#back-btn');
    if(bottom&&top&&/salvar\s+e\s+voltar\s+ao\s+lobby/i.test(top.textContent||''))top.remove();
  }

  function settle(){
    orderHome();
    observeActions();
    removeRedundantCardEditorSave();
    requestAnimationFrame(()=>{orderHome();removeRedundantCardEditorSave();});
    setTimeout(()=>{orderHome();observeActions();removeRedundantCardEditorSave();},80);
    setTimeout(()=>{orderHome();observeActions();removeRedundantCardEditorSave();},500);
  }

  if(window.HomeScreen&&!HomeScreen.__p25MobileMenuOrder){
    HomeScreen.__p25MobileMenuOrder=true;
    const base=HomeScreen.renderAccount.bind(HomeScreen);
    HomeScreen.renderAccount=function(...args){const out=base(...args);settle();return out;};
  }

  if(window.CardCreationScreen&&!CardCreationScreen.__p25SingleSave){
    CardCreationScreen.__p25SingleSave=true;
    const base=CardCreationScreen.render.bind(CardCreationScreen);
    CardCreationScreen.render=async function(...args){const out=await base(...args);removeRedundantCardEditorSave();return out;};
  }

  window.addEventListener('load',settle,{once:true});
  window.addEventListener('pageshow',settle);
  window.addEventListener('orientationchange',()=>setTimeout(settle,80));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)settle();});
  window.HomeUiP25={apply:orderHome,order:[...ORDER]};
  settle();
})();
