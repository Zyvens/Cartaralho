'use strict';
const{withErrors,ok,fail,getBody}=require('../lib/http');
const{requireUser}=require('../lib/auth');
const marketplace=require('../lib/marketplace');
module.exports=withErrors(async(req,res)=>{
 const user=await requireUser(req,res);if(!user)return;
 const enabled=process.env.MARKETPLACE_ENABLED!=='false';
 if(req.method==='GET')return ok(res,{marketplaceEnabled:enabled,...await marketplace.getState(user.id)});
 if(req.method!=='POST')return fail(res,405,'Método não permitido. Use GET ou POST.');
 if(!enabled)return fail(res,503,'Mercado Paralelo temporariamente fechado. Compras concluídas e seu inventário permanecem preservados.');
 const{productKey,purchaseId}=getBody(req),r=await marketplace.purchase(user.id,productKey,purchaseId);
 if(r.status==='invalid_idempotency_key')return fail(res,400,'Identificador da compra inválido.');
 if(r.status==='invalid_product')return fail(res,400,'Produto inválido ou indisponível.');
 if(r.status==='insufficient_dirty_coins')return fail(res,409,`Moedas Sujas insuficientes. Esta compra custa ${r.price}.`);
 if(r.status==='empty_pool')return fail(res,409,'Você já possui todas as Cartas de Jogador disponíveis para este pack.');
 if(r.status==='insufficient_pool')return fail(res,409,`Não há ${r.required} Cartas Canônicas elegíveis ainda. Disponíveis: ${r.available}.`);
 if(r.status!=='ok')return fail(res,409,'Não foi possível concluir esta compra agora.');
 ok(res,{purchase:r});
});
