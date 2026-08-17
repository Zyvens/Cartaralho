'use strict';
(()=>{
 if(window.CartP52)return;
 const VERSION='v1.4.52';
 const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};

 function installMissionRow(){
  if(!window.MetaUI||MetaUI.__p52MissionRow)return;
  MetaUI.__p52MissionRow=true;
  MetaUI.missionRow=function(m){
   const progress=Number(m?.progress||0),target=Math.max(1,Number(m?.target||1)),pct=Math.min(100,(progress/target)*100),coins=Math.max(0,Math.round(Number(m?.coins||0))),xp=Math.max(0,Math.round(Number(m?.xp||0)));
   return `<div class="mission-row ${m?.completed?'done':''}"><b>${m?.completed?'✅':'🎯'} ${esc(m?.name||'Missão')}</b><small class="mission-copy">${esc(m?.description||'')}</small><div class="p52-mission-rewards"><span class="p52-mission-coin-pill" title="Moedas Sujas recebidas ao concluir">🪙 +${coins.toLocaleString('pt-BR')}</span><span class="mission-xp-pill">+${xp.toLocaleString('pt-BR')} XP</span></div><div class="mission-progress"><span style="width:${pct}%"></span></div><small class="mission-count">${progress}/${Number(m?.target||0)}</small></div>`;
  };
 }

 function ensureCardCreator(panel){
  const tools=panel?.querySelector('.card-tools');if(!tools)return;
  let btn=panel.querySelector('.p48-create-card-entry');
  if(!btn){btn=document.createElement('button');btn.type='button';btn.className='btn btn-primary p48-create-card-entry';btn.textContent='🧽 Criar nova Carta de Jogador';btn.onclick=()=>window.CartP48?.openLibraryCreator(panel,'whiteCards');}
  if(btn.nextElementSibling!==tools)tools.parentNode.insertBefore(btn,tools);
 }
 function patchCards(){
  if(!window.MetaUI||MetaUI.__p52Cards)return;
  MetaUI.__p52Cards=true;
  const base=MetaUI.renderCards.bind(MetaUI);
  MetaUI.renderCards=async function(panel,...args){const out=await base(panel,...args);ensureCardCreator(panel);requestAnimationFrame(()=>ensureCardCreator(panel));return out;};
 }

 function patchFastRestore(){
  if(!window.AuthClient||AuthClient.__p52FastRestore)return;
  AuthClient.__p52FastRestore=true;
  const base=AuthClient.restore.bind(AuthClient);
  AuthClient.restore=async function(){if(this.user&&this.token)return this.user;return base();};
 }
 function patchImmediateAccount(){
  if(!window.HomeScreen||HomeScreen.__p52ImmediateAccount)return;
  HomeScreen.__p52ImmediateAccount=true;
  const base=HomeScreen.renderAccount.bind(HomeScreen);
  HomeScreen.renderAccount=function(...args){const out=base(...args);window.CartP49?.ensureBalanceSlot?.();window.CartP37?.ensureAdminButton?.();window.HomeMenuP27?.settle?.();return out;};
 }

 function installStableBackground(){
  if(!window.HomeScreen||HomeScreen.__p52StableBackground)return;
  HomeScreen.__p52StableBackground=true;
  HomeScreen.__p52BgGeneration=0;
  HomeScreen.__p52BgTimeouts=new Set();
  HomeScreen.stopDynamicBackground=function(){
   this.__p52BgGeneration=(this.__p52BgGeneration||0)+1;
   if(this.bgInterval){clearInterval(this.bgInterval);this.bgInterval=null;}
   for(const id of this.__p52BgTimeouts||[])clearTimeout(id);
   this.__p52BgTimeouts?.clear();
  };
  HomeScreen.initDynamicBackground=function(){
   this.stopDynamicBackground();
   const generation=this.__p52BgGeneration,container=document.getElementById('dynamic-bg-container');if(!container)return;
   const later=(fn,ms)=>{const id=setTimeout(()=>{this.__p52BgTimeouts.delete(id);fn();},ms);this.__p52BgTimeouts.add(id);return id;};
   fetch('/api/sample-cards').then(r=>r.json()).then(data=>{
    if(generation!==this.__p52BgGeneration||document.getElementById('dynamic-bg-container')!==container)return;
    const all=[...(data.blackCards||[]).map(c=>({text:c.text,type:'black'})),...(data.whiteCards||[]).map(c=>({text:c.text,type:'white'}))];if(!all.length)return;
    let count=0;
    const valid=()=>generation===this.__p52BgGeneration&&document.getElementById('dynamic-bg-container')===container&&!document.hidden;
    const spawn=()=>{
     if(!valid()||count>=6)return;
     count++;const c=all[Math.floor(Math.random()*all.length)],el=document.createElement('div');el.className=`dynamic-floating-card ${c.type}`;el.style.left=`${10+Math.random()*80}%`;el.style.top=`${10+Math.random()*80}%`;el.innerHTML=`<div class="card-watermark">Cartaralho</div><div class="card-text">${this.escape(c.text)}</div>`;container.appendChild(el);
     later(()=>{if(el.isConnected)el.style.opacity='1';},50);
     later(()=>{if(el.isConnected)el.style.opacity='0';later(()=>{el.remove();count=Math.max(0,count-1);},800);},4500+Math.random()*3000);
    };
    for(let i=0;i<3;i++)later(spawn,i*400);
    this.bgInterval=setInterval(()=>{if(!valid())return;spawn();},2200);
   }).catch(()=>{});
  };
 }
 function patchScreenLifecycle(){
  if(!window.App||App.__p52BackgroundLifecycle)return;
  App.__p52BackgroundLifecycle=true;
  const base=App.showScreen.bind(App);
  App.showScreen=function(name,data={}){if(name!=='home')HomeScreen.stopDynamicBackground?.();return base(name,data);};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)HomeScreen.stopDynamicBackground?.();else if(App.state?.currentScreen==='home'&&document.querySelector('.home-screen'))HomeScreen.initDynamicBackground?.();});
  window.addEventListener('pagehide',()=>HomeScreen.stopDynamicBackground?.());
 }

 function patchNotificationsOrder(){
  if(!window.NotificationsUI||NotificationsUI.__p52MenuOrder)return;
  NotificationsUI.__p52MenuOrder=true;
  const base=NotificationsUI.ensureButton.bind(NotificationsUI);
  NotificationsUI.ensureButton=function(...args){const out=base(...args);queueMicrotask(()=>window.HomeMenuP27?.settle?.());return out;};
 }

 patchFastRestore();
 installMissionRow();
 patchCards();
 patchImmediateAccount();
 installStableBackground();
 patchScreenLifecycle();
 patchNotificationsOrder();
 queueMicrotask(()=>{installMissionRow();patchCards();patchImmediateAccount();patchNotificationsOrder();if(App?.state?.currentScreen==='home'&&document.querySelector('.home-screen'))HomeScreen.initDynamicBackground?.();});
 window.CartP52={VERSION,ensureCardCreator,installMissionRow};
})();
