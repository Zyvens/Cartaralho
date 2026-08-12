const { withErrors, ok, fail, requireMethod } = require('../../lib/http');
const roomStore = require('../../lib/roomStore');
const { sql } = require('../../lib/db');
const { cardMaterialTier, cardBorderTier } = require('../../lib/auth');

async function styleCard(userId,type,text){
  const base={text,materialTier:'standard',borderTier:'standard',isPlayerCard:false};
  if(!userId||!text)return base;
  const rows=await sql`SELECT matches_used,duplicate_creation_count,is_player_card FROM user_cards WHERE user_id=${userId} AND type=${type} AND lower(text)=lower(${text}) LIMIT 1`;
  if(!rows.length)return base;
  const r=rows[0];return{...base,materialTier:cardMaterialTier(r.matches_used),borderTier:cardBorderTier(r.duplicate_creation_count),isPlayerCard:!!r.is_player_card};
}

module.exports=withErrors(async(req,res)=>{
  if(!requireMethod(req,res,'GET'))return;
  const{code,playerId}=req.query;if(!code||!playerId)return fail(res,400,'code e playerId são obrigatórios.');
  const room=await roomStore.loadRoom(code);if(!room)return fail(res,404,'Sala não encontrada.');
  const player=room.players.get(playerId);if(!player)return fail(res,404,'Jogador não encontrado na sala.');
  const hand=[];for(const text of player.hand||[])hand.push(await styleCard(player.userId,'whiteCards',text));
  const blackCard=room.currentRound?await styleCard(player.userId,'blackCards',room.currentRound.blackCard):null;
  ok(res,{hand,blackCard,isHost:!!room.currentRound&&room.currentRound.hostId===playerId});
});
