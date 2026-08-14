'use strict';
const{withErrors,ok,fail,getBody}=require('../lib/http');
const{requireUser}=require('../lib/auth');
const matchLoot=require('../lib/matchLoot');
module.exports=withErrors(async(req,res)=>{
 const user=await requireUser(req,res);if(!user)return;
 if(req.method==='GET'){
  const matchId=req.query?.matchId||null;
  return ok(res,await matchLoot.getPending(user.id,matchId));
 }
 if(req.method!=='POST')return fail(res,405,'Método não permitido. Use GET ou POST.');
 if(!matchLoot.enabled())return fail(res,503,'Espólio temporariamente indisponível. Seus direitos já registrados permanecem preservados.');
 const{action='claim',matchId,claimId,cardIds=[]}=getBody(req);
 if(action!=='claim')return fail(res,400,'Ação inválida.');
 const r=await matchLoot.claim(user.id,{matchId,claimId,cardIds});
 if(r.status==='invalid_request'||r.status==='invalid_selection'||r.status==='invalid_idempotency_key')return fail(res,400,'Seleção de Espólio inválida.');
 if(r.status==='quota_exceeded')return fail(res,409,`Você pode escolher no máximo ${r.quota} cartas deste Espólio.`);
 if(r.status==='ineligible_card')return fail(res,409,'Uma das cartas não pertence ao seu Espólio elegível.');
 if(r.status==='already_claimed')return fail(res,409,'Este Espólio já foi confirmado.');
 if(r.status==='empty')return fail(res,409,'Este Espólio não possui mais cartas disponíveis.');
 if(r.status==='not_found')return fail(res,404,'Espólio não encontrado.');
 if(r.status!=='ok')return fail(res,400,'Não foi possível confirmar o Espólio.');
 return ok(res,r);
});
