'use strict';
(()=>{
 const VERSION='v1.4.42';
 const NOTICE_PREFIX='cartaralho_update_notice_';
 const versionTuple=v=>String(v||'').replace(/^v/i,'').split('.').map(n=>Number(n)||0);
 const compareVersions=(a,b)=>{const aa=versionTuple(a),bb=versionTuple(b);for(let i=0;i<Math.max(aa.length,bb.length);i++){const d=(aa[i]||0)-(bb[i]||0);if(d)return d;}return 0;};
 function seedDurableNotices(){
  for(let i=0;i<localStorage.length;i++){
   const key=localStorage.key(i);
   if(key?.startsWith(NOTICE_PREFIX)&&localStorage.getItem(key)==='1')sessionStorage.setItem(key,'1');
  }
  for(const v of['v1.4.41',VERSION]){
   const key=`${NOTICE_PREFIX}${v}`;
   localStorage.setItem(key,'1');
   sessionStorage.setItem(key,'1');
  }
 }
 async function persistServerNotice(){
  try{
   const r=await fetch(`/api/version?_fresh=${Date.now()}`,{cache:'no-store'}),d=await r.json();
   if(!r.ok||!d.success)return;
   const server=String(d.currentVersion||'');
   if(!server||compareVersions(server,VERSION)<=0)return;
   const key=`${NOTICE_PREFIX}${server}`;
   if(sessionStorage.getItem(key)==='1'&&!localStorage.getItem(key))localStorage.setItem(key,'1');
   else if(localStorage.getItem(key)==='1')sessionStorage.setItem(key,'1');
  }catch(_){ }
 }
 function playFormOpen(){const el=document.getElementById('play-form');return !!el&&getComputedStyle(el).display!=='none';}
 function syncBack(){
  const home=document.querySelector('.home-screen');
  const form=document.getElementById('play-form');
  const back=document.getElementById('back-play');
  if(!home||!form||!back)return;
  if(playFormOpen()){
   if(back.parentElement!==home)home.appendChild(back);
   back.classList.add('p42-home-back');
   back.style.removeProperty('display');
  }else{
   if(back.parentElement!==form)form.prepend(back);
   back.classList.remove('p42-home-back');
  }
 }
 function schedule(){for(const ms of[0,40,120,260])setTimeout(syncBack,ms);}
 seedDurableNotices();
 document.addEventListener('click',e=>{if(e.target.closest('#btn-play,#back-play'))schedule();});
 const observer=new MutationObserver(()=>queueMicrotask(syncBack));
 observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
 document.addEventListener('DOMContentLoaded',()=>{schedule();setTimeout(persistServerNotice,120);setTimeout(persistServerNotice,900);});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(persistServerNotice,80);});
 window.addEventListener('load',schedule,{once:true});
 schedule();
 window.CartP42={VERSION,syncBack,persistServerNotice,compareVersions};
})();
