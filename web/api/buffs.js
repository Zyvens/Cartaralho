'use strict';
const{withErrors,ok,fail,getBody}=require('../lib/http');
const{requireUser}=require('../lib/auth');
const roomStore=require('../lib/roomStore');
const engine=require('../lib/buffEngine');
const definitions=require('../lib/buffDefinitions');
const{broadcast}=require('../lib/pusherServer');
function error(res,r){const msg=r.message||({feature_disabled:'Buffs estão temporariamente desativados.',room_disabled:'Buffs estão desligados nesta sala.',no_round:'Não há rodada ativa.',not_player:'Você não está ativo nesta sala.',invalid_buff:'Buff inválido.',invalid_activation_id:'Identificador de ativação inválido.',wrong_phase:'Este buff não pode ser usado nesta fase.',out_of_stock:'Você não possui este Buff no inventário.',quota_used:'Você já ativou um buff nesta rodada.',invalid_activation:'Ativação inválida.',missing_pending:'Não há escolha pendente para resolver.',invalid_selection:'Escolha exatamente duas cartas válidas para devolver.',conflict:'A rodada mudou. Atualize e tente novamente.'}[r.status]||'Não foi possível usar este buff.');return fail(res,['feature_disabled','room_disabled'].includes(r.status)?403:['invalid_buff','invalid_activation_id','invalid_activation','invalid_selection'].includes(r.status)?400:409,msg);}
module.exports=withErrors(async(req,res)=>{
 const user=await requireUser(req,res);if(!user)return;
 if(req.method==='GET'){
  const code=String(req.query?.code||'').trim().toUpperCase();if(!code)return fail(res,400,'Código da sala é obrigatório.');
  const room=await roomStore.loadRoom(code);if(!room)return fail(res,404,'Sala não encontrada.');
  const member=room.players.get(String(user.id));if(!member||member.active===false)return fail(res,403,'Você não participa desta sala.');
  return ok(res,{buffs:await engine.getState(room,user.id)});
 }
 if(req.method!=='POST')return fail(res,405,'Método não permitido. Use GET ou POST.');
 const{code,action='activate',buffKey,activationId,targetUserId,cardIndex,returnIndices}=getBody(req);if(!code)return fail(res,400,'Código da sala é obrigatório.');
 const room=await roomStore.loadRoom(code);if(!room)return fail(res,404,'Sala não encontrada.');const member=room.players.get(String(user.id));if(!member||member.active===false)return fail(res,403,'Você não participa desta sala.');
 if(action==='resolve_mao_de_vaca'){
  const r=await engine.resolveMaoDeVaca(room,user.id,activationId,returnIndices);if(r.status!=='ok')return error(res,r);
  await broadcast(room.code,'buff_resolved',{buffKey:'buff_mao_de_vaca',userId:user.id,nickname:member.nickname||user.display_name,message:'🐄 Mão de Vaca resolvida: duas cartas devolvidas.'});
  return ok(res,{result:r,buffs:await engine.getState(await roomStore.loadRoom(room.code),user.id)});
 }
 if(!definitions.get(buffKey))return error(res,{status:'invalid_buff'});
 const stock=await engine.inventory(user.id);if(!stock.some(x=>x.buff_key===buffKey&&Number(x.quantity)>0))return error(res,{status:'out_of_stock'});
 const r=await engine.activate(room,user.id,buffKey,activationId,{targetUserId,cardIndex});if(r.status!=='ok')return error(res,r);
 const def=definitions.get(buffKey);if(!r.replayed&&r.publicMessage)await broadcast(room.code,'buff_activated',{buffKey,name:def?.name||buffKey,icon:def?.icon||'⚡',userId:user.id,nickname:member.nickname||user.display_name,targetUserId:r.effect?.targetUserId||null,targetNickname:r.effect?.targetNickname||null,message:r.publicMessage});
 ok(res,{result:{replayed:r.replayed,effect:r.effect,inventory:r.inventory},buffs:await engine.getState(await roomStore.loadRoom(room.code),user.id)});
});
