const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const gameManager = require('./gameManager');
const { calculateRanking } = require('./gameLogic');
const { GAME_STATES } = require('./constants');

// ─────────────────────────── SERVER SETUP ───────────────────────────

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

// ─────────────────────────── PUBLIC API ───────────────────────────
const os = require('os');

app.get('/api/ip', (req, res) => {
  const interfaces = os.networkInterfaces();
  let localIp = 'localhost';

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Pula interfaces internas e IPv6
      if (iface.family === 'IPv4' && !iface.internal) {
        localIp = iface.address;
        break;
      }
    }
  }
  
  res.json({ ip: localIp });
});

// Import deckManager here to use it in public API
const deckManager = require('./deckManager');

app.get('/api/sample-cards', (req, res) => {
  const deck = deckManager.getDeck();
  
  // Helper to shuffle and slice
  const sample = (arr, size) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
  };
  
  const sampleBlack = sample(deck.blackCards || [], 8);
  const sampleWhite = sample(deck.whiteCards || [], 12);
  
  res.json({ blackCards: sampleBlack, whiteCards: sampleWhite });
});

// ─────────────────────────── ADMIN API ───────────────────────────

function adminAuth(req, res, next) {
  const auth = req.headers.authorization;
  const expected = `${process.env.ADMIN_USER || 'admin'}:${process.env.ADMIN_PASSWORD || 'admin123'}`;
  if (auth === expected) {
    next();
  } else {
    res.status(401).json({ error: 'Não autorizado' });
  }
}

app.get('/api/admin/deck', adminAuth, (req, res) => {
  res.json(deckManager.getDeck());
});

app.post('/api/admin/deck', adminAuth, (req, res) => {
  const { type, text } = req.body;
  if (!type || !text) return res.status(400).json({ error: 'Tipo e texto obrigatórios' });
  const result = deckManager.addCard(type, text, true);
  res.json(result);
});

app.post('/api/admin/deck/import', adminAuth, (req, res) => {
  try {
    deckManager.importDeck(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/deck/:type/:index', adminAuth, (req, res) => {
  const { type, index } = req.params;
  const success = deckManager.deleteCard(type, parseInt(index, 10));
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Carta não encontrada' });
  }
});

app.patch('/api/admin/deck/:type/:index/hide', adminAuth, (req, res) => {
  const { type, index } = req.params;
  const success = deckManager.toggleHideCard(type, parseInt(index, 10));
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Carta não encontrada' });
  }
});

app.get('/api/admin/active-rooms', (req, res) => {
  res.json({ count: gameManager.rooms.size });
});

const PORT = process.env.PORT || 14273;

let currentTunnel = null;
let globalHostMode = 'waiting'; // 'waiting', 'online', 'local-multi', 'local-single', 'local-server'
let globalActiveRoom = null;

app.get('/api/server-status', (req, res) => {
  res.json({ mode: globalHostMode, activeRoom: globalActiveRoom });
});
app.post('/api/tunnel', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'O código da sala é obrigatório para gerar o túnel.' });
    }
    const safeCode = code.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    // Se já existe um túnel e é para o mesmo código, retorne-o
    if (currentTunnel && !currentTunnel.closed && currentTunnel.clientId === `cartaralho-${safeCode}`) {
      return res.json({ url: currentTunnel.url });
    }

    // Se houver um túnel aberto para outro código, feche-o
    if (currentTunnel && !currentTunnel.closed) {
      currentTunnel.close();
    }

    const localtunnel = require('localtunnel');
    currentTunnel = await localtunnel({ port: PORT, subdomain: `cartaralho-${safeCode}` });
    
    currentTunnel.on('close', () => {
      currentTunnel = null;
    });

    res.json({ url: currentTunnel.url });
  } catch (err) {
    console.error('[Tunnel Error]', err);
    res.status(500).json({ error: 'Erro ao criar túnel: ' + err.message });
  }
});

// ─────────────────────────── HELPERS ───────────────────────────

/**
 * Emite a lista de jogadores atualizada para todos na sala.
 */
function emitPlayerListUpdate(roomCode, room) {
  const playerList = gameManager.getPlayerList(room);
  io.to(roomCode).emit('player_list_update', {
    players: playerList,
    state: room.state,
    playerCount: room.players.size,
    maxPlayers: room.maxPlayers,
  });
}

/**
 * Emite dados personalizados de nova rodada para cada jogador.
 */
function emitNewRound(roomCode, room) {
  const round = room.currentRound;
  const hostPlayer = room.players.get(round.hostId);

  for (const [socketId, player] of room.players) {
    if (!player.connected) continue;

    const isHost = socketId === round.hostId;
    const playerSocket = io.sockets.sockets.get(socketId);

    if (playerSocket) {
      playerSocket.emit('new_round', {
        roundNumber: round.number,
        blackCard: round.blackCard,
        hostNickname: hostPlayer ? hostPlayer.nickname : 'Desconhecido',
        isHost,
        hand: player.hand,
        scores: getScoresForRoom(room),
      });
    }
  }
}

/**
 * Retorna as pontuações dos jogadores da sala.
 */
function getScoresForRoom(room) {
  const scores = [];
  for (const [, player] of room.players) {
    scores.push({
      nickname: player.nickname,
      score: player.score,
    });
  }
  return scores.sort((a, b) => b.score - a.score);
}

// ─────────────────────────── SOCKET.IO EVENTS ───────────────────────────

// Intervalo Global para checar AFK
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of gameManager.rooms) {
    if (!room.afkEnabled) continue;
    
    for (const [playerId, player] of room.players) {
      // 6 minutos = 6 * 60 * 1000 = 360000 ms
      if (now - player.lastActive > 360000) {
        const playerSocket = io.sockets.sockets.get(playerId);
        if (playerSocket) {
          console.log(`[AFK] Kickando ${player.nickname} por inatividade.`);
          playerSocket.disconnect(true);
        }
      }
    }
  }
}, 60000); // Check every minute

io.on('connection', (socket) => {
  console.log(`[Conexão] Socket conectado: ${socket.id}`);

  socket.use((packet, next) => {
    try {
      const code = gameManager.socketToRoom.get(socket.id);
      if (code) {
        const room = gameManager.rooms.get(code);
        if (room) {
          const player = room.players.get(socket.id);
          if (player) {
            player.lastActive = Date.now();
          }
        }
      }
    } catch (e) {}
    next();
  });

  socket.on('set_host_mode', (data) => {
    try {
      const ip = socket.handshake.address;
      // Trust local connections only
      if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
        globalHostMode = data.mode || 'waiting';
        globalActiveRoom = data.activeRoom || null;
        io.emit('server_status_update', { mode: globalHostMode, activeRoom: globalActiveRoom });
      }
    } catch (e) { console.error('Error setting host mode', e); }
  });

  // ─────────── CREATE ROOM ───────────

  socket.on('create_room', (data, callback) => {
    try {
      const { nickname, config } = data || {};
      const ip = socket.handshake.address;
      const sessionId = socket.handshake.auth?.sessionId || socket.handshake.query?.sessionId;
      const { code, room } = gameManager.createRoom(socket.id, nickname, config || {}, ip, sessionId);

      socket.join(code);

      const response = {
        code,
        config: {
          maxPlayers: room.maxPlayers,
          blackCardsPerPlayer: room.blackCardsPerPlayer,
          whiteCardsPerPlayer: room.whiteCardsPerPlayer,
          useStandardDeck: room.useStandardDeck,
        },
      };

      socket.emit('room_created', response);
      if (typeof callback === 'function') callback({ success: true, ...response });

      emitPlayerListUpdate(code, room);
    } catch (err) {
      console.error(`[Erro] create_room: ${err.message}`);
      socket.emit('error', { message: err.message });
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // ─────────── JOIN ROOM ───────────

  socket.on('join_room', (data, callback) => {
    try {
      const { nickname, code } = data || {};

      if (!code) {
        throw new Error('O código da sala é obrigatório.');
      }

      const ip = socket.handshake.address;
      const sessionId = socket.handshake.auth?.sessionId || socket.handshake.query?.sessionId;
      const { room } = gameManager.joinRoom(socket.id, nickname, code, ip, sessionId);
      const upperCode = code.toUpperCase().trim();

      socket.join(upperCode);

      socket.emit('room_joined', {
        code: upperCode,
        config: {
          maxPlayers: room.maxPlayers,
          blackCardsPerPlayer: room.blackCardsPerPlayer,
          whiteCardsPerPlayer: room.whiteCardsPerPlayer,
          useStandardDeck: room.useStandardDeck,
        },
        state: room.state,
      });
      if (typeof callback === 'function') callback({ success: true, code: upperCode });

      emitPlayerListUpdate(upperCode, room);
    } catch (err) {
      console.error(`[Erro] join_room: ${err.message}`);
      socket.emit('error', { message: err.message });
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // ─────────── LOCAL LOBBY MANAGEMENT ───────────

  socket.on('update_room_config', (data) => {
    try {
      const { code, partialConfig } = data;
      const room = gameManager.rooms.get(code);
      if (room && room.players.get(socket.id)?.isCreator) {
        if (partialConfig.maxPlayers) {
          room.maxPlayers = partialConfig.maxPlayers;
        }
      }
    } catch (err) {
      console.error(`[Erro] update_room_config: ${err.message}`);
    }
  });

  socket.on('rename_local_player', (data) => {
    try {
      const { oldNickname, newNickname, code } = data;
      const room = gameManager.rooms.get(code);
      if (room && room.players.get(socket.id)?.isCreator) {
        // Encontrar o jogador pelo nickname antigo
        for (const [id, player] of room.players) {
          if (player.nickname === oldNickname) {
            player.nickname = newNickname;
            emitPlayerListUpdate(code, room);
            break;
          }
        }
      }
    } catch (err) {
      console.error(`[Erro] rename_local_player: ${err.message}`);
    }
  });

  socket.on('kick_local_player', (data) => {
    try {
      const { nickname, code } = data;
      const room = gameManager.rooms.get(code);
      if (room && room.players.get(socket.id)?.isCreator) {
        // Encontrar o socket id pelo nickname
        for (const [id, player] of room.players) {
          if (player.nickname === nickname && !player.isCreator) {
            // Desconectar o socket falso local forçadamente
            const playerSocket = io.sockets.sockets.get(id);
            if (playerSocket) playerSocket.disconnect(true);
            break;
          }
        }
      }
    } catch (err) {
      console.error(`[Erro] kick_local_player: ${err.message}`);
    }
  });

  // ─────────── SUBMIT CARDS ───────────

  socket.on('submit_cards', (data, callback) => {
    try {
      const { code, blackCards, whiteCards } = data || {};

      if (!code) {
        throw new Error('O código da sala é obrigatório.');
      }

      const { room, allReady } = gameManager.submitCards(socket.id, code, blackCards, whiteCards);
      const upperCode = code.toUpperCase().trim();

      // Emitir status de cartas para a sala
      const playerStatuses = [];
      for (const [, player] of room.players) {
        playerStatuses.push({
          nickname: player.nickname,
          cardsReady: player.cardsReady,
        });
      }

      io.to(upperCode).emit('cards_submitted', { playerStatuses });

      if (allReady) {
        io.to(upperCode).emit('all_cards_ready', {
          message: 'Todos os jogadores enviaram suas cartas! O jogo pode ser iniciado.',
        });
      }

      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      console.error(`[Erro] submit_cards: ${err.message}`);
      socket.emit('error', { message: err.message });
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // ─────────── CANCEL / END ROOM ───────────

  const handleEndRoom = (data, callback, eventName) => {
    try {
      const { code } = data || {};
      if (!code) throw new Error('O código da sala é obrigatório.');

      const upperCode = code.toUpperCase().trim();
      const room = gameManager.getRoom(upperCode);

      if (!room) throw new Error('Sala não encontrada.');
      if (room.creatorId !== socket.id) throw new Error('Apenas o anfitrião pode realizar esta ação.');

      // Notify all players
      if (eventName === 'end_room') {
        const { calculateRanking } = require('./gameLogic');
        const ranking = calculateRanking(room);
        io.to(upperCode).emit('game_over', {
          message: 'O anfitrião encerrou a partida precocemente.',
          ranking,
          winnerNickname: ranking[0]?.nickname || 'Ninguém'
        });
      } else {
        io.to(upperCode).emit('room_cancelled', {
          message: 'O anfitrião cancelou a partida.'
        });
      }

      // Remove all players from the room map and socket rooms
      for (const [playerId] of room.players) {
        gameManager.socketToRoom.delete(playerId);
        const playerSocket = io.sockets.sockets.get(playerId);
        if (playerSocket) playerSocket.leave(upperCode);
      }
      gameManager.rooms.delete(upperCode);

      // Desabilitar o servidor (localtunnel) se for a mesma sala online
      if (currentTunnel && !currentTunnel.closed && currentTunnel.clientId === `cartaralho-${upperCode.toLowerCase()}`) {
        currentTunnel.close();
        currentTunnel = null;
      }

      if (globalActiveRoom === upperCode) {
        globalHostMode = 'waiting';
        globalActiveRoom = null;
        io.emit('server_status_update', { mode: globalHostMode, activeRoom: globalActiveRoom });
      }

      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      console.error(`[Erro] ${eventName}: ${err.message}`);
      socket.emit('error', { message: err.message });
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  };

  socket.on('cancel_room', (data, callback) => handleEndRoom(data, callback, 'cancel_room'));
  socket.on('end_room', (data, callback) => handleEndRoom(data, callback, 'end_room'));

  socket.on('cancel_all_rooms', () => {
    try {
      const roomCodes = Array.from(gameManager.rooms.keys());
      roomCodes.forEach(code => {
        handleEndRoom({ code }, null, 'cancel_room');
      });
      globalHostMode = 'waiting';
      globalActiveRoom = null;
      io.emit('server_status_update', { mode: globalHostMode, activeRoom: globalActiveRoom });
    } catch (e) {
      console.error('Erro ao cancelar todas as salas', e);
    }
  });

  // ─────────── START GAME ───────────

  socket.on('start_game', (data, callback) => {
    try {
      const { code } = data || {};

      if (!code) {
        throw new Error('O código da sala é obrigatório.');
      }

      const { room } = gameManager.startGame(socket.id, code);
      const upperCode = code.toUpperCase().trim();

      io.to(upperCode).emit('game_started', {
        message: 'O jogo começou!',
        totalBlackCards: room.blackDeck.length + 1, // +1 para a carta em jogo
        totalPlayers: room.players.size,
      });

      // Emitir dados personalizados da rodada para cada jogador
      emitNewRound(upperCode, room);

      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      console.error(`[Erro] start_game: ${err.message}`);
      socket.emit('error', { message: err.message });
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // ─────────── PLAY CARD ───────────

  socket.on('play_card', (data, callback) => {
    try {
      const { code, cardIndex } = data || {};

      if (!code) {
        throw new Error('O código da sala é obrigatório.');
      }

      const { room, allPlayed } = gameManager.playCard(socket.id, code, cardIndex);
      const upperCode = code.toUpperCase().trim();

      // Emitir contagem de cartas jogadas (sem revelar quem jogou o quê)
      const submissionCount = room.currentRound.submissions.size;
      const nonHostPlayers = room.playerOrder.filter(
        id => id !== room.currentRound.hostId && room.players.has(id) && room.players.get(id).connected
      );
      const totalExpected = nonHostPlayers.length;

      io.to(upperCode).emit('card_played', {
        submissionCount,
        totalExpected,
      });

      // Se todos jogaram, enviar submissões anônimas para o host
      if (allPlayed) {
        const anonymousSubmissions = [];
        let index = 0;
        for (const [, submission] of room.currentRound.submissions) {
          anonymousSubmissions.push({
            index,
            card: submission.card,
          });
          index++;
        }

        // Embaralhar as submissões para anonimato adicional
        for (let i = anonymousSubmissions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [anonymousSubmissions[i], anonymousSubmissions[j]] = [anonymousSubmissions[j], anonymousSubmissions[i]];
        }

        // Re-indexar após embaralhamento
        anonymousSubmissions.forEach((sub, idx) => {
          sub.index = idx;
        });

        // Reordenar as submissões no Map para corresponder à ordem embaralhada
        const reorderedSubmissions = new Map();
        const originalEntries = Array.from(room.currentRound.submissions.entries());
        const shuffledIndices = anonymousSubmissions.map((sub, idx) => {
          // Encontrar a entrada original que corresponde a esta carta
          const origIdx = originalEntries.findIndex(([, s]) => s.card === sub.card);
          return originalEntries[origIdx];
        });

        // Reconstruir o Map na ordem embaralhada
        room.currentRound.submissions = new Map();
        for (const sub of anonymousSubmissions) {
          const matchingEntry = originalEntries.find(([, s]) => s.card === sub.card);
          if (matchingEntry) {
            room.currentRound.submissions.set(matchingEntry[0], matchingEntry[1]);
            // Remover para evitar duplicatas se houver cartas iguais
            const idx = originalEntries.indexOf(matchingEntry);
            originalEntries.splice(idx, 1);
          }
        }

        io.to(upperCode).emit('all_cards_played', {
          submissions: anonymousSubmissions,
          blackCard: room.currentRound.blackCard,
        });
      }

      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      console.error(`[Erro] play_card: ${err.message}`);
      socket.emit('error', { message: err.message });
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // ─────────── PICK WINNER ───────────

  socket.on('pick_winner', (data, callback) => {
    try {
      const { code, submissionIndex } = data || {};

      if (!code) {
        throw new Error('O código da sala é obrigatório.');
      }

      const result = gameManager.pickWinner(socket.id, code, submissionIndex);
      const upperCode = code.toUpperCase().trim();
      const { room, winnerNickname, winnerCard, gameOver } = result;

      // Emitir resultado da rodada para todos
      io.to(upperCode).emit('round_result', {
        winnerNickname,
        winnerCard,
        blackCard: room.currentRound.blackCard,
        roundNumber: room.currentRound.number,
        scores: getScoresForRoom(room),
        gameOver,
      });

      if (gameOver) {
        // Emitir ranking final
        const ranking = calculateRanking(room);
        io.to(upperCode).emit('game_over', {
          message: 'O jogo acabou!',
          ranking,
          winnerNickname: ranking[0]?.nickname || 'Desconhecido',
        });
      } else {
        // Auto-avançar para próxima rodada após 5 segundos
        setTimeout(() => {
          try {
            const currentRoom = gameManager.getRoom(upperCode);
            if (!currentRoom || currentRoom.state === GAME_STATES.FINALIZADA) return;

            const { room: updatedRoom, gameOver: nextGameOver } = gameManager.nextRound(upperCode);

            if (nextGameOver) {
              const ranking = calculateRanking(updatedRoom);
              io.to(upperCode).emit('game_over', {
                message: 'O jogo acabou! Não há mais cartas pretas.',
                ranking,
                winnerNickname: ranking[0]?.nickname || 'Desconhecido',
              });
            } else {
              emitNewRound(upperCode, updatedRoom);
            }
          } catch (err) {
            console.error(`[Erro] auto nextRound: ${err.message}`);
          }
        }, 5000);
      }

      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      console.error(`[Erro] pick_winner: ${err.message}`);
      socket.emit('error', { message: err.message });
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // ─────────── DISCONNECT ───────────

  socket.on('disconnect', (reason) => {
    console.log(`[Desconexão] Socket: ${socket.id} | Motivo: ${reason}`);

    try {
      const result = gameManager.removePlayer(socket.id);

      if (result && result.room) {
        const { room, code, nickname, czarDropped } = result;
        console.log(`[Jogador Desconectou] ${nickname} (${socket.id}) da Sala ${code}`);

        // Emit disconnected
        io.to(code).emit('player_disconnected', {
          nickname: nickname,
          id: socket.id,
        });

        if (room.destroyed) {
          io.to(code).emit('room_closed', {
            message: 'O Host desconectou. A sala foi encerrada.'
          });
          for (const [pid] of room.players) {
            gameManager.socketToRoom.delete(pid);
          }
        } else {
          // Iniciar timeout de 2 minutos para remover se for meio de jogo
          if (!room.disconnectTimeouts) room.disconnectTimeouts = new Map();
          const tid = setTimeout(() => {
            try {
              const explicitResult = gameManager.removePlayer(socket.id, true);
              if (explicitResult && explicitResult.room) {
                io.to(code).emit('player_left', { nickname: nickname });
                
                if (explicitResult.gameOver) {
                  const ranking = calculateRanking(explicitResult.room);
                  io.to(code).emit('game_over', {
                    message: 'Jogadores insuficientes. O jogo acabou!',
                    ranking,
                    winnerNickname: ranking[0]?.nickname || 'Desconhecido',
                  });
                } else {
                  emitPlayerListUpdate(code, explicitResult.room);
                  if (explicitResult.czarDropped) {
                    io.to(code).emit('round_skipped', { message: 'O Czar da rodada foi removido. Pulando...' });
                    gameManager.nextRound(code);
                    io.to(code).emit('new_round', getRoundData(explicitResult.room));
                  }
                }
              }
            } catch(e) { console.error('Erro no timeout de disconnect', e); }
          }, 120000);
          room.disconnectTimeouts.set(socket.id, tid);

          // Lidar com queda instantânea do Czar
          if (czarDropped) {
            io.to(code).emit('round_skipped', { message: 'O Czar desconectou. Pulando para a próxima rodada...' });
            gameManager.nextRound(code);
            io.to(code).emit('new_round', getRoundData(room));
          }

          emitPlayerListUpdate(code, room);
        }
      }
    } catch (err) {
      console.error(`[Erro] disconnect handler: ${err.message}`);
    }
  });

  socket.on('leave_room', (data, callback) => {
    try {
      const result = gameManager.removePlayer(socket.id, true);
      if (result && result.room) {
        const { room, code, nickname, czarDropped, gameOver } = result;
        io.to(code).emit('player_left', { nickname: nickname });
        
        if (gameOver) {
          const ranking = calculateRanking(room);
          io.to(code).emit('game_over', {
            message: 'Jogadores insuficientes. O jogo acabou!',
            ranking,
            winnerNickname: ranking[0]?.nickname || 'Desconhecido',
          });
        } else {
          emitPlayerListUpdate(code, room);
          if (czarDropped) {
            io.to(code).emit('round_skipped', { message: 'O Czar abandonou a partida. Pulando rodada...' });
            gameManager.nextRound(code);
            io.to(code).emit('new_round', getRoundData(room));
          }
        }
      }
      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      console.error(`[Erro] leave_room: ${err.message}`);
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // ─────────── GET ROOM INFO ───────────

  socket.on('get_room_info', (data, callback) => {
    try {
      const { code } = data || {};
      const room = gameManager.getRoom(code);

      if (!room) {
        throw new Error('Sala não encontrada.');
      }

      const response = {
        code: room.code,
        state: room.state,
        config: {
          maxPlayers: room.maxPlayers,
          blackCardsPerPlayer: room.blackCardsPerPlayer,
          whiteCardsPerPlayer: room.whiteCardsPerPlayer,
        },
        players: gameManager.getPlayerList(room),
        playerCount: room.players.size,
      };

      if (typeof callback === 'function') callback({ success: true, ...response });
    } catch (err) {
      socket.emit('error', { message: err.message });
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });
});

// ─────────────────────────── START SERVER ───────────────────────────

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`Porta ${PORT} já está em uso. O servidor provavelmente já está rodando.`);
  } else {
    console.error(`Erro no servidor:`, e);
  }
});

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║        🃏 CARTARALHO - Servidor 🃏        ║
║──────────────────────────────────────────║
║  Rodando na porta: ${PORT}                 ║
║  http://localhost:${PORT}                  ║
╚══════════════════════════════════════════╝
  `);
});
