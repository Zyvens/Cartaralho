const { withErrors, ok, fail, requireMethod, getBody } = require('../../lib/http');
const { requireUser } = require('../../lib/auth');
const roomStore = require('../../lib/roomStore');
const roomConfig = require('../../lib/roomConfigP7');

module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'POST')) return;
  const user=await requireUser(req,res);if(!user)return;
  const { code, partialConfig } = getBody(req);
  if (!code) return fail(res, 400, 'code é obrigatório.');
  const room = await roomStore.loadRoom(code);
  if (!room) return fail(res, 404, 'Sala não encontrada.');
  try { roomConfig.apply(room, String(user.id), partialConfig || {}); }
  catch (e) { return fail(res, 409, e.message); }
  await roomStore.saveRoom(room);
  ok(res,{config:roomConfig.publicConfig(room)});
});
