const { withErrors, ok, fail, requireMethod, getBody } = require('../../lib/http');
const gameManager = require('../../lib/gameManager');
const roomStore = require('../../lib/roomStore');
const { broadcast } = require('../../lib/pusherServer');
const { applyPresenceSweep } = require('../../lib/roomEvents');
const playerStats = require('../../lib/playerStats');
const { sql } = require('../../lib/db');
const { cardMaterialTier, cardBorderTier } = require('../../lib/auth');

async function submissionStyle(userId,text){
  const base={text,materialTier:'standard',borderTier:'standard',isPlayerCard:false};
  if(!userId||!text)return base;
  const rows=await sql`SELECT matches_used,duplicate_creation_count,is_player_card FROM user_cards WHERE user_id=${userId} AND type='whiteCards' AND lower(text)=lower(${text}) LIMIT 1`;
  if(!rows.length)return base;const r=rows[0];return{...base,materialTier:cardMaterialTier(r.matches_used),borderTier:cardBorderTier(r.duplicate_creation_count),isPlayerCard:!!r.is_player_card};
}

module.exports=withErrors(async(req,res)=>{
  if(!requireMethod(req,res,'POST'))return;
  const{playerId,code,cardIndex}=getBody(req);if(!playerId||!code)return fail(res,400,'playerId e code são obrigatórios.');
  const room=await roomStore.loadRoom(code);if(!room)return fail(res,404,'Sala não encontrada.');
  const swept=await applyPresenceSweep(room);if(swept.deleted)return fail(res,404,'Sala não encontrada.');
  const{allPlayed,playedCard}=gameManager.playCard(room,playerId,cardIndex);const player=room.players.get(playerId);
  if(player?.userId&&playedCard)await playerStats.recordUse(room.code,player.userId,'whiteCards',playedCard);
  const nonHost=room.playerOrder.filter(id=>id!==room.currentRound.hostId&&room.players.has(id)&&room.players.get(id).connected);
  let submissions=null;
  if(allPlayed){
    const entries=Array.from(room.currentRound.submissions.entries());
    for(let i=entries.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[entries[i],entries[j]]=[entries[j],entries[i]];}
    room.currentRound.submissions=new Map(entries);submissions=[];
    for(let index=0;index<entries.length;index++){
      const[id,s]=entries[index],owner=room.players.get(id);
      submissions.push({index,card:await submissionStyle(owner?.userId,s.card)});
    }
  }
  await roomStore.saveRoom(room);
  await broadcast(room.code,'card_played',{submissionCount:room.currentRound.submissions.size,totalExpected:nonHost.length});
  if(submissions)await broadcast(room.code,'all_cards_played',{submissions,blackCard:room.currentRound.blackCard});
  ok(res);
});
