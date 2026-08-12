const { withErrors, ok, fail, requireMethod, getBody } = require('../../lib/http');
const gameManager = require('../../lib/gameManager');
const roomStore = require('../../lib/roomStore');
const { broadcast } = require('../../lib/pusherServer');
const { broadcastGameOver } = require('../../lib/roomEvents');

/** mode: 'cancel' (lobby, before the game starts) or 'end' (mid-game, host stops early). */
module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'POST')) return;
  const { playerId, code, mode } = getBody(req);
  if (!playerId || !code) return fail(res, 400, 'playerId e code são obrigatórios.');

  const room = await roomStore.loadRoom(code);
  if (!room) return fail(res, 404, 'Sala não encontrada.');
  if (room.creatorId !== playerId) return fail(res, 403, 'Apenas o anfitrião pode realizar esta ação.');

  if (mode === 'end') {
    await broadcastGameOver(room, 'O anfitrião encerrou a partida precocemente.');
  } else {
    await broadcast(room.code, 'room_cancelled', { message: 'O anfitrião cancelou a partida.' });
  }

  await roomStore.deleteRoom(room.code);
  ok(res);
});
