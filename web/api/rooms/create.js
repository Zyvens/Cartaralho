const { withErrors, ok, fail, requireMethod, getBody } = require('../../lib/http');
const gameManager = require('../../lib/gameManager');

module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'POST')) return;
  const { playerId, nickname, config } = getBody(req);
  if (!playerId) return fail(res, 400, 'playerId é obrigatório.');

  const { code, room } = await gameManager.createRoom(playerId, nickname, config || {});

  ok(res, {
    code,
    config: {
      maxPlayers: room.maxPlayers,
      blackCardsPerPlayer: room.blackCardsPerPlayer,
      whiteCardsPerPlayer: room.whiteCardsPerPlayer,
      useStandardDeck: room.useStandardDeck,
    },
    players: gameManager.getPlayerList(room),
  });
});
