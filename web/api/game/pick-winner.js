const { withErrors, ok, fail, requireMethod, getBody } = require('../../lib/http');
const gameManager = require('../../lib/gameManager');
const roomStore = require('../../lib/roomStore');
const { broadcast } = require('../../lib/pusherServer');
const { broadcastGameOver } = require('../../lib/roomEvents');
const playerStats = require('../../lib/playerStats');
module.exports=withErrors(async(req,res)=>{if(!requireMethod(req,res,'POST'))return;const{playerId,code,submissionIndex}=getBody(req);if(!playerId||!code)return fail(res,400,'playerId e code são obrigatórios.');const room=await roomStore.loadRoom(code);if(!room)return fail(res,404,'Sala não encontrada.');const{winnerId,winnerNickname,winnerCard,gameOver}=gameManager.pickWinner(room,playerId,submissionIndex);const winner=room.players.get(winnerId);if(winner?.userId)await playerStats.recordBlackWin(winner.userId,room.currentRound.blackCard);await roomStore.saveRoom(room);await broadcast(room.code,'round_result',{winnerNickname,winnerCard,blackCard:room.currentRound.blackCard,roundNumber:room.currentRound.number,scores:gameManager.getScoresForRoom(room),gameOver});if(gameOver)await broadcastGameOver(room,'O jogo acabou!');ok(res);});
