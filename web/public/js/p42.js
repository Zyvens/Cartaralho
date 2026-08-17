'use strict';
(()=>{
 const VERSION='v1.4.42';
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
 document.addEventListener('click',e=>{if(e.target.closest('#btn-play,#back-play'))schedule();});
 const observer=new MutationObserver(()=>queueMicrotask(syncBack));
 observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
 document.addEventListener('DOMContentLoaded',schedule);
 window.addEventListener('load',schedule,{once:true});
 schedule();
 window.CartP42={VERSION,syncBack};
})();
