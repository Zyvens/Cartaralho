'use strict';
const{withErrors,ok,fail,getBody}=require('../../lib/http');
const{requireUser}=require('../../lib/auth');
const cleanCards=require('../../lib/cleanCards');
const{notifyBalanceUpdated}=require('../../lib/balanceRealtimeP63');

module.exports=withErrors(async(req,res)=>{
 const user=await requireUser(req,res);if(!user)return;
 const enabled=process.env.PAID_CARD_CREATION_ENABLED!=='false';
 if(req.method==='GET')return ok(res,{paidCardCreationEnabled:enabled,inventory:await cleanCards.getInventory(user.id,20)});
 if(req.method!=='POST')return fail(res,405,'Método não permitido. Use GET ou POST.');
 if(!enabled)return fail(res,503,'Compra de Cartas Limpas temporariamente indisponível. Seus créditos permanecem preservados.');
 const{action='purchase',type,purchaseId}=getBody(req);
 if(action!=='purchase')return fail(res,400,'Ação inválida.');
 const result=await cleanCards.purchase(user.id,type,purchaseId);
 if(result.status==='invalid_type')return fail(res,400,'Tipo de Carta Limpa inválido.');
 if(result.status==='invalid_idempotency_key')return fail(res,400,'Identificador da compra inválido.');
 if(result.status==='insufficient_dirty_coins')return fail(res,409,`Moedas Sujas insuficientes. Você precisa de ${cleanCards.UNIT_PRICE}.`);
 if(result.status!=='ok')return fail(res,400,'Não foi possível comprar a Carta Limpa.');
 await notifyBalanceUpdated({userIds:[user.id],balance:result.dirtyBalance,reason:'clean_card_purchase'});
 ok(res,{inventory:result});
});
