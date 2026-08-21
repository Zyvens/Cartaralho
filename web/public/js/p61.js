'use strict';
(()=>{
 if(window.CartP61)return;
 const VERSION='v1.4.61',GLOBAL_CHANNEL='cartaralho-global';
 try{const key=`cartaralho_update_notice_${VERSION}`;sessionStorage.setItem(key,'1');localStorage.setItem(key,'1');}catch(_){ }
 async function serverVersion(){try{const d=await AuthClient.request('/api/version');return String(d?.currentVersion||VERSION);}catch(_){return VERSION;}}
 async function sendCurrentUpdate(btn){
  if(!btn||btn.disabled)return;const old=btn.innerHTML;btn.disabled=true;btn.textContent='Enviando...';
  try{const current=await serverVersion();await AuthClient.request('/api/admin/creator-tools',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'megaphone',scope:'global',message:`Nova atualização ${current} disponível. Reinicie o jogo para adicionar as atualizações.`})});Toast.success(`Aviso da ${current} enviado para todos.`);}catch(e){Toast.error(e.message||'Não foi possível enviar o aviso.');}finally{btn.disabled=false;btn.innerHTML=old;}
 }
 document.addEventListener('click',e=>{const btn=e.target.closest?.('#admin-update-send');if(!btn)return;e.preventDefault();e.stopImmediatePropagation();sendCurrentUpdate(btn);},true);
 function cacheBalance(value){const id=AuthClient?.user?.id||AuthClient?.user?.username;if(!id)return;try{localStorage.setItem(`cartaralho_dirty_balance_${id}`,String(value));}catch(_){ }}
 function applyBalance(value,marketData=null){
  const v=Number(value);if(!Number.isFinite(v))return;if(AuthClient?.user)AuthClient.user.dirty_balance=v;cacheBalance(v);window.CartP49?.ensureBalanceSlot?.();window.CartP49?.setBalance?.(v,{loading:false});
  if(window.MarketUI){if(marketData)MarketUI.data={...(MarketUI.data||{}),...marketData,dirtyBalance:v};else if(MarketUI.data)MarketUI.data.dirtyBalance=v;if(MarketUI.overlay)MarketUI.render();}
  window.dispatchEvent(new CustomEvent('cartaralho:balance-updated',{detail:{dirtyBalance:v,source:'admin-reward'}}));
 }
 async function syncDirtyBalance(){
  if(!AuthClient?.user)return null;
  try{const d=await AuthClient.request(`/api/profile/wallet?_fresh=${Date.now()}`),v=Number(d?.dirtyBalance);if(Number.isFinite(v)){applyBalance(v);return v;}}catch(_){ }return null;
 }
 function rewardForCurrentUser(data={}){if(data.kind!=='reward')return false;const targets=Array.isArray(data.targetUserIds)?data.targetUserIds.map(Number):null;return !targets?.length||targets.includes(Number(AuthClient?.user?.id));}
 async function bindRewardSync(){try{await SocketClient._waitReady();const channel=SocketClient.pusher?.subscribe(GLOBAL_CHANNEL);if(!channel||channel.__p61WalletSync)return;channel.__p61WalletSync=true;channel.bind('admin_megaphone',data=>{if(rewardForCurrentUser(data))setTimeout(syncDirtyBalance,20);});}catch(_){ }}
 bindRewardSync();document.addEventListener('DOMContentLoaded',bindRewardSync,{once:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden)bindRewardSync();});
 window.CartP61={VERSION,serverVersion,sendCurrentUpdate,syncDirtyBalance,applyBalance};
})();
