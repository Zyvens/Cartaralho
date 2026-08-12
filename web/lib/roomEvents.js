const { broadcast } = require('./pusherServer');
const gameManager = require('./gameManager');
const roomStore = require('./roomStore');
const { sql } = require('./db');

async function broadcastPlayerListUpdate(room) {
  await broadcast(room.code, 'player_list_update', {
    players: gameManager.getPlayerList(room),
    state: room.state,
    playerCount: room.players.size,
    maxPlayers: room.maxPlayers,
  });
}

async function broadcastNewRound(room) {
  const round = room.currentRound;
  const hostPlayer = room.players.get(round.hostId);
  await broadcast(room.code, 'new_round', {
    roundNumber: round.number,
    blackCard: round.blackCard,
    hostNickname: hostPlayer ? hostPlayer.nickname : 'Desconhecido',
    hostId: round.hostId,
    scores: gameManager.getScoresForRoom(room),
  });
}

async function broadcastGameOver(room, message) {
  const ranking = gameManager.calculateRanking(room);
  await broadcast(room.code, 'game_over', {
    message,
    ranking,
    winnerNickname: ranking[0]?.nickname || 'Desconhecido',
  });
  await sql`
    INSERT INTO match_history (room_code, ranking, winner_nickname)
    VALUES (${room.code}, ${JSON.stringify(ranking)}, ${ranking[0]?.nickname || null})
  `;
}

/**
 * Runs presence cleanup (the HTTP replacement for socket 'disconnect') and
 * broadcasts whatever changed. Call this near the top of every room-mutating
 * handler, right after loading the room, before the handler's own action.
 */
async function applyPresenceSweep(room) {
  const events = gameManager.sweepPresence(room);
  if (events.disconnected.length === 0 && events.removed.length === 0) return { deleted: false };

  if (room.players.size === 0) {
    await roomStore.deleteRoom(room.code);
    return { deleted: true };
  }

  await roomStore.saveRoom(room);

  for (const d of events.disconnected) {
    await broadcast(room.code, 'player_disconnected', { nickname: d.nickname, id: d.playerId });
  }

  for (const r of events.removed) {
    if (r.destroyed) {
      await broadcast(room.code, 'room_closed', { message: 'O Host desconectou. A sala foi encerrada.' });
      await roomStore.deleteRoom(room.code);
      return { deleted: true };
    }

    await broadcast(room.code, 'player_left', { nickname: r.nickname });

    if (r.gameOver) {
      await broadcastGameOver(room, 'Jogadores insuficientes. O jogo acabou!');
    } else if (r.czarDropped && room.currentRound) {
      await broadcast(room.code, 'round_skipped', { message: 'O Czar da rodada foi removido. Pulando...' });
      const { gameOver: nextGameOver } = gameManager.nextRound(room);
      await roomStore.saveRoom(room);
      if (nextGameOver) {
        await broadcastGameOver(room, 'O jogo acabou! Não há mais cartas pretas.');
      } else {
        await broadcastNewRound(room);
      }
    }
  }

  if (room.players.size === 0) {
    await roomStore.deleteRoom(room.code);
    return { deleted: true };
  }

  await broadcastPlayerListUpdate(room);
  return { deleted: false };
}

module.exports = { broadcastPlayerListUpdate, broadcastNewRound, broadcastGameOver, applyPresenceSweep };
