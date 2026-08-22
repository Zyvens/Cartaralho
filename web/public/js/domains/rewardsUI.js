'use strict';
(()=>{
 if(window.CartRewardsDomain)return;
 CartDomains.claim('rewardsUI','domains/rewardsUI.js',()=>{
  const fmt=n=>Number(n||0).toLocaleString('pt-BR');
  function ensurePreviewContract(){if(!window.RewardPreviewUI)return;RewardPreviewUI.__domainOwned=true;}
  function finalRewardState(){return window.FinalRewardUI?{code:FinalRewardUI.code,window:FinalRewardUI.window,settled:FinalRewardUI.settled}:null;}
  function validateSaqueadorCopy(root=document){root.querySelectorAll?.('#final-reward-window').forEach(box=>{const p=box.querySelector('p');if(p&&/pote/i.test(p.textContent||'')&&!/coloca/i.test(p.textContent||''))p.textContent='O pote do Saqueador contém somente a premiação de colocação. Sobrevivência, consolação, Espólio e demais recompensas ficam fora do assalto.';});}
  function payoutForCurrentUser(data){const uid=AuthClient?.user?.id;return(data?.economy?.payouts||[]).find(x=>String(x.userId)===String(uid))||null;}
  function notifyMatchPayout(data){const p=payoutForCurrentUser(data);if(!p||Number(p.total||0)<=0)return false;Toast.success(`🪙 +${fmt(p.total)} Moedas Sujas nesta partida${p.survival?` · +${fmt(p.survival)} sobrevivência`:''}.`);return true;}
  let payoutListenerRegistered=false;
  function registerMatchPayout(){if(payoutListenerRegistered)return false;payoutListenerRegistered=true;SocketClient.on('game_over',notifyMatchPayout);return true;}
  function installLootGameOver(){if(!window.GameOverScreen||GameOverScreen.__domainLoot)return false;GameOverScreen.__domainLoot=true;const base=GameOverScreen.render.bind(GameOverScreen);GameOverScreen.render=function(container,data={}){const out=base(container,data);const matchId=data.matchId||App.state.roomCode;setTimeout(()=>window.LootUI?.attachGameOver?.(matchId),80);return out;};return true;}
  ensurePreviewContract();registerMatchPayout();installLootGameOver();const observer=new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1)validateSaqueadorCopy(n);});if(document.body)observer.observe(document.body,{childList:true,subtree:true});window.CartRewardsDomain={ensurePreviewContract,finalRewardState,validateSaqueadorCopy,payoutForCurrentUser,notifyMatchPayout,registerMatchPayout,installLootGameOver};
 });
})();
