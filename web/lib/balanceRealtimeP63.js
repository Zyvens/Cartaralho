'use strict';
const{broadcastGlobal}=require('./pusherServer');

async function notifyBalanceUpdated({userIds=null,balance=null,reason='transaction'}={}){
 const targets=Array.isArray(userIds)?[...new Set(userIds.map(Number).filter(Number.isFinite))]:null;
 try{
  return await broadcastGlobal('balance_updated',{
   targetUserIds:targets&&targets.length?targets:null,
   balance:Number.isFinite(Number(balance))?Number(balance):null,
   reason:String(reason||'transaction')
  });
 }catch(_){
  /* A entrega realtime é best-effort e nunca desfaz uma transação confirmada. */
  return null;
 }
}

module.exports={notifyBalanceUpdated};
