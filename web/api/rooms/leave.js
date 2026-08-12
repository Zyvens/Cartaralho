const { withErrors, ok, fail, requireMethod, getBody } = require('../../lib/http');
const gameManager = require('../../lib/gameManager');
const roomStore = require('../../lib/roomStore');
const { broadcast } = require('../../lib/pusherServer');
const { applyPresenceSweep, broadcastPlayerListUpdate, broadcastNewRound, broadcastGameOver } = require('../../lib/roomEvents');

module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'POST')) return;
  const { playerId, code } = getBody(req);
  if (!playerId || !code) return fail(res, 400, 'playerId e code são obrigatórios.');

  const room = await roomStore.loadRoom(code);
  if (!room) return ok(res); // already gone — leaving is idempotent

  const swept = await applyPresenceSweep(room);
  if (swept.deleted) return ok(res);

  const result = gameManager.removePlayer(room, playerId, true);
  if (!result.removed) return ok(res);

  if (result.destroyed) {
    await broadcast(room.code, 'room_closed', { message: 'O Host desconectou. A sala foi encerrada.' });
    await roomStore.deleteRoom(room.code);
    return ok(res);
  }

  if (room.players.size === 0) {
    await roomStore.deleteRoom(room.code);
    return ok(res);
  }

  await roomStore.saveRoom(room);
  await broadcast(room.code, 'player_left', { nickname: result.nickname });

  if (result.gameOver) {
    await broadcastGameOver(room, 'Jogadores insuficientes. O jogo acabou!');
  } else {
    await broadcastPlayerListUpdate(room);
    if (result.czarDropped && room.currentRound) {
      await broadcast(room.code, 'round_skipped', { message: 'O Czar abandonou a partida. Pulando rodada...' });
      const { gameOver: nextGameOver } = gameManager.nextRound(room);
      await roomStore.saveRoom(room);
      if (nextGameOver) {
        await broadcastGameOver(room, 'O jogo acabou! Não há mais cartas pretas.');
      } else {
        await broadcastNewRound(room);
      }
    }
  }

  ok(res);
});
