'use strict';
(()=>{
 if(window.CartP63)return;
 const VERSION='v1.4.63',GLOBAL_CHANNEL='cartaralho-global';
 let retryTimer=null,balanceFetchPromise=null;
 const money=v=>Number(v||0).toLocaleString('pt-BR');

 function cacheBalance(v){
  const id=AuthClient?.user?.id||AuthClient?.user?.username;if(!id)return;
  try{localStorage.setItem(`cartaralho_dirty_balance_${id}`,String(Number(v)));}catch(_){ }
 }
 function applyBalance(value,{source='transaction',marketData=null}={}){
  const v=Number(value);if(!Number.isFinite(v))return false;
  if(AuthClient?.user)AuthClient.user.dirty_balance=v;
  cacheBalance(v);
  window.CartP49?.ensureBalanceSlot?.();
  window.CartP49?.setBalance?.(v,{loading:false});
  document.querySelectorAll('.account-strip .p49-balance-value').forEach(el=>{el.textContent=money(v);});
  if(window.MarketUI){
   if(marketData)MarketUI.data={...(MarketUI.data||{}),...marketData,dirtyBalance:v};
   else if(MarketUI.data)MarketUI.data.dirtyBalance=v;
   if(MarketUI.overlay)MarketUI.render();
  }
  window.dispatchEvent(new CustomEvent('cartaralho:balance-updated',{detail:{dirtyBalance:v,source}}));
  return true;
 }
 async function fetchAuthoritativeBalance(source='transaction-ping'){
  if(!AuthClient?.user)return null;
  if(balanceFetchPromise)return balanceFetchPromise;
  balanceFetchPromise=(async()=>{
   try{
    const d=await AuthClient.request(`/api/profile/wallet?_fresh=${Date.now()}`),v=Number(d?.dirtyBalance);
    if(Number.isFinite(v)){applyBalance(v,{source});return v;}
   }catch(_){ }
   return null;
  })().finally(()=>{balanceFetchPromise=null;});
  return balanceFetchPromise;
 }
 function isForCurrentUser(data={}){
  const targets=Array.isArray(data.targetUserIds)?data.targetUserIds.map(Number):null;
  return !targets?.length||targets.includes(Number(AuthClient?.user?.id));
 }
 function onBalanceUpdated(data={}){
  if(!isForCurrentUser(data))return;
  const exact=Number(data.balance);
  if(data.balance!==null&&data.balance!==undefined&&data.balance!==''&&Number.isFinite(exact))applyBalance(exact,{source:data.reason||'balance_updated'});
  /* O evento entrega o saldo imediatamente; a confirmação usa apenas o endpoint leve da carteira. */
  setTimeout(()=>fetchAuthoritativeBalance(data.reason||'balance_updated'),25);
 }
 async function bindBalanceChannel(){
  try{
   await SocketClient._waitReady();
   const pusher=SocketClient.pusher;
   if(!pusher){scheduleRetry();return false;}
   const channel=pusher.subscribe(GLOBAL_CHANNEL);
   if(!channel){scheduleRetry();return false;}
   if(!channel.__p63BalanceSync){
    channel.__p63BalanceSync=true;
    channel.bind('balance_updated',onBalanceUpdated);
   }
   if(retryTimer){clearTimeout(retryTimer);retryTimer=null;}
   return true;
  }catch(_){scheduleRetry();return false;}
 }
 function scheduleRetry(){
  if(retryTimer)return;
  retryTimer=setTimeout(()=>{retryTimer=null;bindBalanceChannel();},500);
 }

 /* Também atualiza pelo retorno da própria transação, sem esperar realtime. */
 function patchRequest(){
  if(!window.AuthClient||AuthClient.__p63BalanceResponses)return;
  AuthClient.__p63BalanceResponses=true;
  const base=AuthClient.request.bind(AuthClient);
  AuthClient.request=async function(path,options={}){
   const data=await base(path,options);
   try{
    const p=String(path||'').split('?')[0],method=String(options?.method||'GET').toUpperCase();
    if(method!=='GET'){
     if(p==='/api/admin/creator-tools'){
      const targetId=Number(data?.target?.id),me=Number(AuthClient?.user?.id),v=Number(data?.balance);
      if(targetId===me&&Number.isFinite(v))applyBalance(v,{source:'admin_reward_response'});
      else if(data?.scope==='global'&&Number(data?.credited)>0)setTimeout(()=>fetchAuthoritativeBalance('admin_reward_global_response'),25);
     }else if(p==='/api/recycling'){
      const v=Number(data?.recycling?.balance);if(Number.isFinite(v))applyBalance(v,{source:'card_recycling_response'});
     }else if(p==='/api/cards/clean'){
      const v=Number(data?.inventory?.dirtyBalance);if(Number.isFinite(v))applyBalance(v,{source:'clean_card_purchase_response'});
     }else if(p==='/api/marketplace'){
      const v=Number(data?.purchase?.dirtyBalance);if(Number.isFinite(v))applyBalance(v,{source:'marketplace_purchase_response'});
     }
    }
   }catch(_){ }
   return data;
  };
 }
 function settle(){patchRequest();bindBalanceChannel();}
 settle();
 document.addEventListener('DOMContentLoaded',settle,{once:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){bindBalanceChannel();fetchAuthoritativeBalance('visibility_resume');}});
 window.addEventListener('pageshow',()=>{bindBalanceChannel();fetchAuthoritativeBalance('pageshow');});
 window.CartP63={VERSION,applyBalance,fetchAuthoritativeBalance,onBalanceUpdated,bindBalanceChannel,patchRequest};
})();
