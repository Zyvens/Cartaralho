'use strict';
(()=>{
 if(window.CartRewardsDomain)return;
 CartDomains.claim('rewardsUI','domains/rewardsUI.js',()=>{
  function ensurePreviewContract(){if(!window.RewardPreviewUI)return;RewardPreviewUI.__domainOwned=true;}
  function finalRewardState(){return window.FinalRewardUI?{code:FinalRewardUI.code,window:FinalRewardUI.window,settled:FinalRewardUI.settled}:null;}
  function validateSaqueadorCopy(root=document){root.querySelectorAll?.('#final-reward-window').forEach(box=>{const p=box.querySelector('p');if(p&&/pote/i.test(p.textContent||'')&&!/coloca/i.test(p.textContent||''))p.textContent='O pote do Saqueador contém somente a premiação de colocação. Sobrevivência, consolação, Espólio e demais recompensas ficam fora do assalto.';});}
  ensurePreviewContract();const observer=new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1)validateSaqueadorCopy(n);});if(document.body)observer.observe(document.body,{childList:true,subtree:true});window.CartRewardsDomain={ensurePreviewContract,finalRewardState,validateSaqueadorCopy};
 });
})();
