'use strict';
const{withErrors,ok,fail,getBody}=require('../lib/http');
const{requireUser}=require('../lib/auth');
const recycling=require('../lib/cardRecycling');
const{notifyBalanceUpdated}=require('../lib/balanceRealtimeP63');
module.exports=withErrors(async(req,res)=>{
 const user=await requireUser(req,res);if(!user)return;
 const enabled=process.env.MARKETPLACE_ENABLED!=='false';
 if(req.method==='GET')return ok(res,{marketplaceEnabled:enabled,...await recycling.list(user.id)});
 if(req.method!=='POST')return fail(res,405,'Método não permitido. Use GET ou POST.');
 if(!enabled)return fail(res,503,'Mercado Paralelo temporariamente fechado. A Reciclagem também está pausada.');
 const{cardIds,recyclingId}=getBody(req),result=await recycling.recycle(user.id,cardIds,recyclingId);
 await notifyBalanceUpdated({userIds:[user.id],balance:result.balance,reason:'card_recycling'});
 ok(res,{recycling:result,policy:recycling.policy()});
});
