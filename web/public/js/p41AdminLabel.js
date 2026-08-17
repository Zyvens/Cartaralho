'use strict';
(()=>{
 const apply=()=>{const label=document.querySelector('.creator-admin-head small');if(label)label.textContent='admin • VitorIvens';};
 const observer=new MutationObserver(()=>queueMicrotask(apply));observer.observe(document.documentElement,{childList:true,subtree:true});
 document.addEventListener('DOMContentLoaded',apply);apply();
})();
