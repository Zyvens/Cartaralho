const { withErrors, ok, fail, requireMethod, getBody } = require('../../lib/http');
const { requireUser } = require('../../lib/auth');
const roomStore = require('../../lib/roomStore');
const { applyPresenceSweep, broadcastPlayerListUpdate, getMinimumGrace } = require('../../lib/roomEvents');

/** Called every ~15s by every connected client. Keeps last_active fresh and
 *  runs presence cleanup, replacing socket.io's implicit connection tracking. */
module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'POST')) return;
  const user = await requireUser(req, res);
  if (!user) return;
  const { code } = getBody(req);
  if (!code) return fail(res, 400, 'code é obrigatório.');

  const room = await roomStore.loadRoom(code);
  if (!room) return fail(res, 404, 'Sala não encontrada.');

  const playerId = String(user.id);
  const player = room.players.get(playerId);
  if (!player || player.active === false) return fail(res, 403, 'Você não está ativo nesta sala.');

  const swept = await applyPresenceSweep(room);
  if (swept.deleted) return fail(res, 404, 'Sala não encontrada.');
  if (swept.gameOver) return ok(res, { state: room.state, gameOver: true });

  const livePlayer = room.players.get(playerId);
  if (!livePlayer || livePlayer.active === false) return fail(res, 403, 'Você não está ativo nesta sala.');
  const wasDisconnected = !livePlayer.connected;
  livePlayer.connected = true;
  livePlayer.lastActive = Date.now();
  await roomStore.saveRoom(room);
  if (wasDisconnected) await broadcastPlayerListUpdate(room);

  ok(res, { state: room.state, minimumGrace: getMinimumGrace(room) });
});
