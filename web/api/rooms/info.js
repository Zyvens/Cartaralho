const { withErrors, ok, fail, requireMethod } = require('../../lib/http');
const gameManager = require('../../lib/gameManager');
const roomStore = require('../../lib/roomStore');
const { applyPresenceSweep } = require('../../lib/roomEvents');

module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'GET')) return;
  const { code } = req.query;
  if (!code) return fail(res, 400, 'code é obrigatório.');

  const room = await roomStore.loadRoom(code);
  if (!room) return fail(res, 404, 'Sala não encontrada.');

  const swept = await applyPresenceSweep(room);
  if (swept.deleted) return fail(res, 404, 'Sala não encontrada.');

  ok(res, {
    code: room.code,
    state: room.state,
    config: {
      maxPlayers: room.maxPlayers,
      blackCardsPerPlayer: room.blackCardsPerPlayer,
      whiteCardsPerPlayer: room.whiteCardsPerPlayer,
    },
    players: gameManager.getPlayerList(room),
    playerCount: room.players.size,
  });
});
