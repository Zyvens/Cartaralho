const { withErrors, ok, fail, requireMethod, getBody } = require('../../lib/http');
const { requireUser } = require('../../lib/auth');
const gameManager = require('../../lib/gameManager');
const matchStartP6 = require('../../lib/matchStartP6');
const rewardPreview = require('../../lib/rewardPreview');
const roomStore = require('../../lib/roomStore');
const { broadcast } = require('../../lib/pusherServer');
const { broadcastNewRound } = require('../../lib/roomEvents');

module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'POST')) return;
  const user=await requireUser(req,res);if(!user)return;
  const { code } = getBody(req);
  if (!code) return fail(res, 400, 'code é obrigatório.');
  const room = await roomStore.loadRoom(code);
  if (!room) return fail(res, 404, 'Sala não encontrada.');
  if(room.creatorId!==String(user.id))return fail(res,403,'Apenas o criador da sala pode iniciar o jogo.');
  if(room.rewardConfigSnapshot)return fail(res,409,'A configuração econômica desta partida já foi congelada.');
  const snapshot=rewardPreview.freezeRoom(room);
  room.rewardConfigSnapshot=snapshot;
  room.rewardConfigStartedAt=snapshot.frozenAt;
  const useMatchLoot=process.env.MATCH_LOOT_ENABLED!=='false';
  if(useMatchLoot)await matchStartP6.startGame(room,String(user.id));
  else await gameManager.startGame(room,String(user.id));
  await roomStore.saveRoom(room);
  await broadcast(room.code, 'game_started', {
    message: 'O jogo começou!',
    totalBlackCards: room.blackDeck.length + 1,
    totalPlayers: snapshot.participantsAtStart,
    rewardConfigSnapshot:snapshot,
  });
  await broadcastNewRound(room);
  ok(res,{rewardConfigSnapshot:snapshot});
});
