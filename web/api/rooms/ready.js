'use strict';
const{withErrors,ok,fail,requireMethod,getBody}=require('../../lib/http');
const{requireUser}=require('../../lib/auth');
const roomStore=require('../../lib/roomStore');
const readiness=require('../../lib/roomReadiness');
const gameManager=require('../../lib/gameManager');
const{broadcast}=require('../../lib/pusherServer');
const{applyPresenceSweep}=require('../../lib/roomEvents');
module.exports=withErrors(async(req,res)=>{
 if(!requireMethod(req,res,'POST'))return;
 const user=await requireUser(req,res);if(!user)return;
 const body=getBody(req),code=body.code,ready=body.ready===true;
 if(!code)return fail(res,400,'code é obrigatório.');
 const room=await roomStore.loadRoom(code);if(!room)return fail(res,404,'Sala não encontrada.');
 const swept=await applyPresenceSweep(room);if(swept.deleted)return fail(res,404,'Sala não encontrada.');
 if(ready){
  const gate=readiness.contributionStatus(room,String(user.id));
  // Mão de Vaca é uma decisão válida do jogador, não um erro HTTP. O primeiro clique apenas pede confirmação.
  if(gate.requiresConfirmation&&body.acceptNoContribution!==true)return ok(res,{confirmationRequired:true,confirmationCode:'NO_CONTRIBUTION_LOOT_WARNING',ready:false,state:room.state,contributionCount:gate.contributionCount,lootEligible:false});
 }
 const result=readiness.setReady(room,String(user.id),ready);
 await roomStore.saveRoom(room);
 const statuses=gameManager.getPlayerList(room).map(p=>({nickname:p.nickname,cardsReady:p.cardsReady}));
 // Prontidão usa somente status textual: avatarData em base64 fazia o evento ultrapassar o limite do Pusher e podia retornar 413 para o Host.
 await broadcast(room.code,'cards_submitted',{playerStatuses:statuses,changed:false,readyChanged:true,message:result.ready?'Prontidão atualizada.':'Prontidão cancelada.'});
 ok(res,{confirmationRequired:false,ready:result.ready,allReady:result.allReady,state:room.state,playerStatuses:statuses,contributionCount:result.contributionCount,lootEligible:result.lootEligible});
});
