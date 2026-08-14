const { withErrors, ok, fail, requireMethod, getBody } = require('../../lib/http');
const { requireUser } = require('../../lib/auth');
const roomStore = require('../../lib/roomStore');
const roomConfig = require('../../lib/roomConfigP7');
const { broadcast } = require('../../lib/pusherServer');

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
  const config=roomConfig.publicConfig(room);
  try{await broadcast(room.code,'room_config_updated',{config});}
  catch(e){console.error('Falha ao transmitir room_config_updated:',e.message);}
  ok(res,{config});
});
