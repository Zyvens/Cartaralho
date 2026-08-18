'use strict';
const{broadcastGlobal}=require('./pusherServer');

async function notifyBalanceUpdated({userIds=null,balance=null,reason='transaction'}={}){
 const targets=Array.isArray(userIds)?[...new Set(userIds.map(Number).filter(Number.isFinite))]:null;
 try{
  const payload={targetUserIds:targets&&targets.length?targets:null,reason:String(reason||'transaction')};
  if(balance!==null&&balance!==undefined&&balance!==''){
   const exact=Number(balance);if(Number.isFinite(exact))payload.balance=exact;
  }
  return await broadcastGlobal('balance_updated',payload);
 }catch(_){
  /* A entrega realtime é best-effort e nunca desfaz uma transação confirmada. */
  return null;
 }
}

module.exports={notifyBalanceUpdated};
