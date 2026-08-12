const { withErrors, ok, fail, requireMethod, getBody } = require('../../lib/http');
const gameManager = require('../../lib/gameManager');
const roomStore = require('../../lib/roomStore');
const { applyPresenceSweep, broadcastPlayerListUpdate } = require('../../lib/roomEvents');
const { requireUser } = require('../../lib/auth');

module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'POST')) return;
  const user = await requireUser(req, res); if (!user) return;
  const { playerId, code } = getBody(req);
  if (!playerId || !code) return fail(res, 400, 'playerId e code são obrigatórios.');

  let room = await roomStore.loadRoom(code);
  if (!room) return fail(res, 404, 'Sala não encontrada.');
  const swept = await applyPresenceSweep(room);
  if (swept.deleted) return fail(res, 404, 'Sala não encontrada.');

  const { isRejoin } = await gameManager.joinRoom(room, playerId, user.display_name);
  const player = room.players.get(playerId); if (player) player.userId = user.id;
  await roomStore.saveRoom(room);
  await broadcastPlayerListUpdate(room);

  ok(res, { code: room.code, isCreator: room.creatorId === playerId,
    config: { maxPlayers: room.maxPlayers, pointsToWin: room.pointsToWin, handSize: room.handSize,
      useStandardDeck: room.useStandardDeck, cardCreationEnabled: room.cardCreationEnabled },
    state: room.state, players: gameManager.getPlayerList(room), isRejoin: !!isRejoin });
});
