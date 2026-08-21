'use strict';
const{withErrors,ok,fail,getBody}=require('../../lib/http');
const admin=require('../../lib/creatorAdmin');
const{broadcastGlobal}=require('../../lib/pusherServer');
const{notifyBalanceUpdated}=require('../../lib/balanceRealtime');

function scopeOf(v){return String(v||'global')==='individual'?'individual':'global';}
function targetIds(scope,user){return scope==='individual'?[Number(user.id)]:null;}

module.exports=withErrors(async(req,res)=>{
 if(req.method!=='POST')return fail(res,405,'Método não permitido. Use POST.');
 const actor=await admin.requireCreatorAdmin(req,res);if(!actor)return;
 const body=getBody(req)||{},action=String(body.action||''),scope=scopeOf(body.scope),message=admin.cleanText(body.message,240);
 if(!message)return fail(res,400,'Escreva uma mensagem para o aviso.');
 let target=null;
 if(scope==='individual'){
  target=await admin.resolveUser(body.target);
  if(!target)return fail(res,404,'Usuário não encontrado. Use o username ou nome exato da conta.');
  if(target.ambiguous)return fail(res,409,'Há mais de uma conta com esse nome. Use o @username exato.');
 }
 if(action==='megaphone'){
  const eventId=await broadcastGlobal('admin_megaphone',{kind:'announcement',message,targetUserIds:targetIds(scope,target),sentByUserId:Number(actor.id)});
  return ok(res,{eventId,scope,target:target?{id:Number(target.id),username:target.username,displayName:target.display_name}:null});
 }
 if(action==='reward'){
  const amount=admin.validateAmount(body.amount),operationId=admin.safeOperationId(body.operationId);
  if(!amount)return fail(res,400,'Quantidade inválida. Use de 1 a 10.000.000 moedas.');
  if(!operationId)return fail(res,400,'operationId inválido.');
  let credited=0,balance=null;
  if(scope==='individual'){balance=await admin.creditIndividual(target.id,amount,operationId,message);credited=1;}
  else credited=await admin.creditAll(amount,operationId,message);

  /* O saldo é sincronizado a partir da transação confirmada, independente do megafone. */
  const balanceEventId=await notifyBalanceUpdated({
   userIds:targetIds(scope,target),
   balance:scope==='individual'?balance:null,
   reason:'admin_reward'
  });

  let eventId=null,megaphoneDelivered=true;
  try{eventId=await broadcastGlobal('admin_megaphone',{kind:'reward',message,amount,targetUserIds:targetIds(scope,target),sentByUserId:Number(actor.id)});}catch(_){megaphoneDelivered=false;}
  return ok(res,{scope,amount,credited,balance,balanceEventId,eventId,megaphoneDelivered,target:target?{id:Number(target.id),username:target.username,displayName:target.display_name}:null});
 }
 return fail(res,400,'Ação administrativa inválida.');
});
