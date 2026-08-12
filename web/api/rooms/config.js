const { withErrors, ok, fail, requireMethod, getBody } = require('../../lib/http');
const gameManager = require('../../lib/gameManager');
const roomStore = require('../../lib/roomStore');

module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'POST')) return;
  const { playerId, code, partialConfig } = getBody(req);
  if (!playerId || !code) return fail(res, 400, 'playerId e code são obrigatórios.');

  const room = await roomStore.loadRoom(code);
  if (!room) return fail(res, 404, 'Sala não encontrada.');

  gameManager.updateRoomConfig(room, playerId, partialConfig || {});
  await roomStore.saveRoom(room);

  ok(res);
});
