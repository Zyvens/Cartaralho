const { withErrors, ok, fail, requireMethod, getBody } = require('../../lib/http');
const roomStore = require('../../lib/roomStore');
const roomConfig = require('../../lib/roomConfigP7');

module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'POST')) return;
  const { playerId, code, partialConfig } = getBody(req);
  if (!playerId || !code) return fail(res, 400, 'playerId e code são obrigatórios.');
  const room = await roomStore.loadRoom(code);
  if (!room) return fail(res, 404, 'Sala não encontrada.');
  try { roomConfig.apply(room, playerId, partialConfig || {}); }
  catch (e) { return fail(res, 409, e.message); }
  await roomStore.saveRoom(room);
  ok(res,{config:roomConfig.publicConfig(room)});
});
