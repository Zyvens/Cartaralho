const { withErrors, ok, fail, requireMethod, getBody } = require('../../lib/http');
const gameManager = require('../../lib/gameManager');
const roomStore = require('../../lib/roomStore');
const { broadcast } = require('../../lib/pusherServer');
const { broadcastNewRound } = require('../../lib/roomEvents');

module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'POST')) return;
  const { playerId, code } = getBody(req);
  if (!playerId || !code) return fail(res, 400, 'playerId e code são obrigatórios.');

  const room = await roomStore.loadRoom(code);
  if (!room) return fail(res, 404, 'Sala não encontrada.');

  await gameManager.startGame(room, playerId);
  await roomStore.saveRoom(room);

  await broadcast(room.code, 'game_started', {
    message: 'O jogo começou!',
    totalBlackCards: room.blackDeck.length + 1,
    totalPlayers: room.players.size,
  });
  await broadcastNewRound(room);

  ok(res);
});
