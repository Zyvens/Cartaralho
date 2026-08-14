'use strict';
const{withErrors,ok,fail,requireMethod}=require('../../lib/http');
const{requireUser}=require('../../lib/auth');
const roomStore=require('../../lib/roomStore');
const gameManager=require('../../lib/gameManager');
const rewardPreview=require('../../lib/rewardPreview');
module.exports=withErrors(async(req,res)=>{
 if(!requireMethod(req,res,'GET'))return;
 const user=await requireUser(req,res);if(!user)return;
 const code=String(req.query?.code||'').trim().toUpperCase();
 if(code){
  const room=await roomStore.loadRoom(code);if(!room)return fail(res,404,'Sala não encontrada.');
  const member=Array.from(room.players.values()).some(p=>String(p.userId)===String(user.id));if(!member)return fail(res,403,'Você não participa desta sala.');
  const participants=gameManager.activeCount(room),preview=rewardPreview.preview({pointsToWin:room.pointsToWin,participants,handSize:room.handSize});
  const fullTable=rewardPreview.preview({pointsToWin:room.pointsToWin,participants:room.maxPlayers,handSize:room.handSize});
  return ok(res,{mode:'lobby',preview,fullTable,maxPlayers:room.maxPlayers,participants,rewardConfigSnapshot:room.rewardConfigSnapshot||null});
 }
 const preview=rewardPreview.preview({pointsToWin:req.query?.pointsToWin,participants:req.query?.participants,handSize:req.query?.handSize});
 ok(res,{mode:'configuration',preview});
});
