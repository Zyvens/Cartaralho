const { withErrors, ok, fail, requireMethod, getBody } = require('../../lib/http');
const gameManager = require('../../lib/gameManager');
const roomStore = require('../../lib/roomStore');
const { requireUser } = require('../../lib/auth');

module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'POST')) return;
  const user = await requireUser(req, res); if (!user) return;
  const { playerId, config } = getBody(req);
  if (!playerId) return fail(res, 400, 'playerId é obrigatório.');

  const { code, room } = await gameManager.createRoom(playerId, user.display_name, config || {});
  room.cardCreationEnabled = config?.cardCreationEnabled !== false;
  const player = room.players.get(playerId); if (player) player.userId = user.id;
  await roomStore.saveRoom(room);

  ok(res, { code, config: { maxPlayers: room.maxPlayers, pointsToWin: room.pointsToWin, handSize: room.handSize,
    useStandardDeck: room.useStandardDeck, cardCreationEnabled: room.cardCreationEnabled }, players: gameManager.getPlayerList(room) });
});
