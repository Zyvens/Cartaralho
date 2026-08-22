'use strict';
(()=>{
 if(window.CartMatchEconomyUI)return;
 CartDomains.claim('matchEconomyUI','domains/matchEconomyUI.js',()=>{
  const fmt=n=>Number(n||0).toLocaleString('pt-BR');
  function payoutForCurrentUser(data){
   const uid=AuthClient?.user?.id;
   return (data?.economy?.payouts||[]).find(x=>String(x.userId)===String(uid))||null;
  }
  function notifyPayout(data){
   const p=payoutForCurrentUser(data);
   if(!p||Number(p.total||0)<=0)return false;
   Toast.success(`🪙 +${fmt(p.total)} Moedas Sujas nesta partida${p.survival?` · +${fmt(p.survival)} sobrevivência`:''}.`);
   return true;
  }
  let registered=false;
  function register(){if(registered)return false;registered=true;SocketClient.on('game_over',notifyPayout);return true;}
  register();
  window.CartMatchEconomyUI={register,notifyPayout,payoutForCurrentUser,fmt};
 });
})();
