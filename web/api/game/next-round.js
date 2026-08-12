const { withErrors, ok, fail, requireMethod, getBody } = require('../../lib/http');
const gameManager = require('../../lib/gameManager');
const roomStore = require('../../lib/roomStore');
const { GAME_STATES } = require('../../lib/constants');
const { broadcastNewRound, broadcastGameOver } = require('../../lib/roomEvents');
module.exports=withErrors(async(req,res)=>{if(!requireMethod(req,res,'POST'))return;const{code,expectedRoundNumber}=getBody(req);if(!code)return fail(res,400,'code é obrigatório.');const room=await roomStore.loadRoom(code);if(!room)return ok(res);if(room.state!==GAME_STATES.RESULTADO_RODADA||!room.currentRound||room.currentRound.number!==expectedRoundNumber)return ok(res);const{gameOver}=await gameManager.nextRound(room);await roomStore.saveRoom(room);if(gameOver)await broadcastGameOver(room,'O jogo acabou! Não há mais cartas pretas.');else await broadcastNewRound(room);ok(res);});
