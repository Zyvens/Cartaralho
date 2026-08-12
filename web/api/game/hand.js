const { withErrors, ok, fail, requireMethod } = require('../../lib/http');
const roomStore = require('../../lib/roomStore');

/** Fetched by each client right after the public 'new_round' broadcast —
 *  Pusher can't send a different payload per subscriber, so each player's
 *  hand (and host status) is pulled individually instead. */
module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'GET')) return;
  const { code, playerId } = req.query;
  if (!code || !playerId) return fail(res, 400, 'code e playerId são obrigatórios.');

  const room = await roomStore.loadRoom(code);
  if (!room) return fail(res, 404, 'Sala não encontrada.');

  const player = room.players.get(playerId);
  if (!player) return fail(res, 404, 'Jogador não encontrado na sala.');

  const isHost = !!room.currentRound && room.currentRound.hostId === playerId;

  ok(res, { hand: player.hand, isHost });
});
