const { withErrors, ok, fail, requireMethod, getBody } = require('../../lib/http');
const roomStore = require('../../lib/roomStore');
const { applyPresenceSweep, broadcastPlayerListUpdate, getMinimumGrace } = require('../../lib/roomEvents');

/** Called every ~15s by every connected client. Keeps last_active fresh and
 *  runs presence cleanup, replacing socket.io's implicit connection tracking. */
module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'POST')) return;
  const { playerId, code } = getBody(req);
  if (!playerId || !code) return fail(res, 400, 'playerId e code são obrigatórios.');

  const room = await roomStore.loadRoom(code);
  if (!room) return fail(res, 404, 'Sala não encontrada.');

  const swept = await applyPresenceSweep(room);
  if (swept.deleted) return fail(res, 404, 'Sala não encontrada.');
  if (swept.gameOver) return ok(res, { state: room.state, gameOver: true });

  const player = room.players.get(String(playerId));
  if (player && player.active !== false) {
    const wasDisconnected = !player.connected;
    player.connected = true;
    player.lastActive = Date.now();
    await roomStore.saveRoom(room);
    if (wasDisconnected) await broadcastPlayerListUpdate(room);
  }

  ok(res, { state: room.state, minimumGrace: getMinimumGrace(room) });
});
