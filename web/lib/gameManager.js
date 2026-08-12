const { GAME_STATES, MIN_PLAYERS, HAND_SIZE } = require('./constants');
const {
  validateNickname,
  validateCards,
  validateRoomJoin,
  validateCardPlay,
  validatePickWinner,
} = require('./validators');
const {
  generateRoomCode,
  buildDecks,
  dealHands,
  drawCard,
  getNextHostIndex,
  calculateRanking,
} = require('./gameLogic');
const roomStore = require('./roomStore');
const deckStore = require('./deckStore');

/**
 * Creates a brand new room and persists it. Returns { code, room }.
 */
async function createRoom(playerId, nickname, config = {}) {
  const nickValidation = validateNickname(nickname);
  if (!nickValidation.valid) throw new Error(nickValidation.error);

  const trimmedNickname = nickname.trim();

  let code;
  do {
    code = generateRoomCode();
  } while (await roomStore.roomExists(code));

  const room = {
    code,
    creatorId: playerId,
    maxPlayers: config.maxPlayers || 8,
    blackCardsPerPlayer: config.blackCardsPerPlayer || 3,
    whiteCardsPerPlayer: config.whiteCardsPerPlayer || 10,
    pointsToWin: config.pointsToWin || 5,
    handSize: config.handSize || 5,
    useStandardDeck: config.useStandardDeck !== undefined ? config.useStandardDeck : true,
    state: GAME_STATES.AGUARDANDO_JOGADORES,
    players: new Map(),
    playerOrder: [],
    blackDeck: [],
    whiteDeck: [],
    currentRound: null,
  };

  room.players.set(playerId, {
    nickname: trimmedNickname,
    score: 0,
    hand: [],
    cardsReady: false,
    blackCards: [],
    whiteCards: [],
    connected: true,
    lastActive: Date.now(),
  });
  room.playerOrder.push(playerId);

  await roomStore.insertRoom(room);

  return { code, room };
}

async function joinRoom(room, playerId, nickname) {
  const nickValidation = validateNickname(nickname);
  if (!nickValidation.valid) throw new Error(nickValidation.error);

  const trimmedNickname = nickname.trim();
  const joinValidation = validateRoomJoin(room, trimmedNickname, playerId);
  if (!joinValidation.valid) throw new Error(joinValidation.error);

  if (joinValidation.isRejoin) {
    const player = room.players.get(playerId);
    player.nickname = trimmedNickname;
    player.connected = true;
    player.lastActive = Date.now();
    return { room, isRejoin: true };
  }

  room.players.set(playerId, {
    nickname: trimmedNickname,
    score: 0,
    hand: [],
    cardsReady: false,
    blackCards: [],
    whiteCards: [],
    connected: true,
    lastActive: Date.now(),
  });
  room.playerOrder.push(playerId);

  if (room.players.size >= MIN_PLAYERS && room.state === GAME_STATES.AGUARDANDO_JOGADORES) {
    room.state = GAME_STATES.CADASTRO_CARTAS;
  }

  return { room };
}

function updateRoomConfig(room, playerId, partialConfig) {
  const player = room.players.get(playerId);
  if (room.creatorId === playerId && player && partialConfig.maxPlayers) {
    room.maxPlayers = partialConfig.maxPlayers;
  }
  return room;
}

async function submitCards(room, playerId, blackCards, whiteCards) {
  const player = room.players.get(playerId);
  if (!player) throw new Error('Você não está nesta sala.');
  if (player.cardsReady) throw new Error('Você já enviou suas cartas.');

  if (room.state !== GAME_STATES.CADASTRO_CARTAS && room.state !== GAME_STATES.AGUARDANDO_JOGADORES) {
    throw new Error('Não é possível enviar cartas neste momento.');
  }

  const validation = validateCards(blackCards, whiteCards, room.blackCardsPerPlayer, room.whiteCardsPerPlayer, room.useStandardDeck);
  if (!validation.valid) throw new Error(validation.error);

  player.blackCards = blackCards.map(c => c.trim());
  player.whiteCards = whiteCards.map(c => c.trim());
  player.cardsReady = true;

  for (const text of player.blackCards) await deckStore.addCard('blackCards', text, false);
  for (const text of player.whiteCards) await deckStore.addCard('whiteCards', text, false);

  let allReady = true;
  for (const [, p] of room.players) {
    if (!p.cardsReady) { allReady = false; break; }
  }

  if (allReady && room.players.size >= MIN_PLAYERS) {
    room.state = GAME_STATES.PRONTA_PARA_INICIAR;
  }

  return { room, allReady };
}

async function startGame(room, playerId) {
  if (room.creatorId !== playerId) throw new Error('Apenas o criador da sala pode iniciar o jogo.');
  if (room.state !== GAME_STATES.PRONTA_PARA_INICIAR) {
    throw new Error('O jogo ainda não está pronto para iniciar. Todos os jogadores devem enviar suas cartas.');
  }
  if (room.players.size < MIN_PLAYERS) {
    throw new Error(`São necessários pelo menos ${MIN_PLAYERS} jogadores para iniciar o jogo.`);
  }
  for (const [, player] of room.players) {
    if (!player.cardsReady) throw new Error('Nem todos os jogadores enviaram suas cartas.');
  }

  const standardDeck = await deckStore.getDeck();
  const { newBlackCards, newWhiteCards } = buildDecks(room, standardDeck);
  for (const text of newBlackCards) await deckStore.addCard('blackCards', text, false);
  for (const text of newWhiteCards) await deckStore.addCard('whiteCards', text, false);

  dealHands(room);

  room.state = GAME_STATES.EM_ANDAMENTO;
  room.currentRound = {
    number: 1,
    blackCard: room.blackDeck.length > 0 ? room.blackDeck.pop() : null,
    hostIndex: 0,
    hostId: room.playerOrder[0],
    submissions: new Map(),
    winnerId: null,
    winnerCard: null,
  };

  return { room };
}

function playCard(room, playerId, cardIndex) {
  const validation = validateCardPlay(room, playerId);
  if (!validation.valid) throw new Error(validation.error);

  const player = room.players.get(playerId);
  if (typeof cardIndex !== 'number' || cardIndex < 0 || cardIndex >= player.hand.length) {
    throw new Error('Índice de carta inválido.');
  }

  const [playedCard] = player.hand.splice(cardIndex, 1);
  room.currentRound.submissions.set(playerId, { card: playedCard });

  const nonHostPlayers = room.playerOrder.filter(
    id => id !== room.currentRound.hostId && room.players.has(id) && room.players.get(id).connected
  );
  const allPlayed = nonHostPlayers.every(id => room.currentRound.submissions.has(id));

  if (allPlayed) room.state = GAME_STATES.VOTACAO;

  return { room, allPlayed };
}

function pickWinner(room, playerId, submissionIndex) {
  const validation = validatePickWinner(room, playerId);
  if (!validation.valid) throw new Error(validation.error);

  const submissionsArray = Array.from(room.currentRound.submissions.entries());
  if (typeof submissionIndex !== 'number' || submissionIndex < 0 || submissionIndex >= submissionsArray.length) {
    throw new Error('Índice de submissão inválido.');
  }

  const [winnerId, submission] = submissionsArray[submissionIndex];
  const winnerPlayer = room.players.get(winnerId);
  if (!winnerPlayer) throw new Error('Jogador vencedor não encontrado.');

  winnerPlayer.score += 1;
  room.currentRound.winnerId = winnerId;
  room.currentRound.winnerCard = submission.card;

  const gameOver = winnerPlayer.score >= room.pointsToWin;
  room.state = gameOver ? GAME_STATES.FINALIZADA : GAME_STATES.RESULTADO_RODADA;

  return { room, winnerId, winnerNickname: winnerPlayer.nickname, winnerCard: submission.card, gameOver };
}

function nextRound(room) {
  for (const [playerId] of room.currentRound.submissions) {
    drawCard(room, playerId);
  }

  if (room.blackDeck.length === 0) {
    room.state = GAME_STATES.FINALIZADA;
    return { room, gameOver: true };
  }

  const nextHostIndex = getNextHostIndex(room);
  const nextHostId = room.playerOrder[nextHostIndex];
  const nextBlackCard = room.blackDeck.pop();

  room.currentRound = {
    number: room.currentRound.number + 1,
    blackCard: nextBlackCard,
    hostIndex: nextHostIndex,
    hostId: nextHostId,
    submissions: new Map(),
    winnerId: null,
    winnerCard: null,
  };
  room.state = GAME_STATES.EM_ANDAMENTO;

  return { room, gameOver: false };
}

/**
 * Removes a player from the room (explicit leave, or a stale heartbeat).
 * Mirrors the desktop server's disconnect handling, minus the socket
 * concept — "disconnected" here just means "no heartbeat in time".
 */
function removePlayer(room, playerId, explicitLeave = false) {
  const player = room.players.get(playerId);
  if (!player) return { room, removed: false };

  const nickname = player.nickname;
  let czarDropped = false;
  let gameOver = false;
  let destroyed = false;
  const wasCreator = room.creatorId === playerId;
  const isMidGame = room.state === GAME_STATES.EM_ANDAMENTO || room.state === GAME_STATES.VOTACAO;

  player.connected = false;

  if (!isMidGame || explicitLeave) {
    room.players.delete(playerId);
    room.playerOrder = room.playerOrder.filter(id => id !== playerId);

    if ([GAME_STATES.AGUARDANDO_JOGADORES, GAME_STATES.CADASTRO_CARTAS, GAME_STATES.PRONTA_PARA_INICIAR].includes(room.state)) {
      // Mirrors the desktop app: if the host leaves during the lobby, the
      // whole room goes away rather than just losing a player.
      if (room.players.size > 0 && wasCreator) {
        destroyed = true;
      } else if (room.players.size < MIN_PLAYERS) {
        room.state = GAME_STATES.AGUARDANDO_JOGADORES;
      }
    } else if (isMidGame) {
      if (room.players.size < MIN_PLAYERS) {
        gameOver = true;
      } else {
        if (room.currentRound && room.currentRound.hostId === playerId) czarDropped = true;
        if (room.state === GAME_STATES.EM_ANDAMENTO && !czarDropped) {
          const nonHostPlayers = room.playerOrder.filter(id => id !== room.currentRound.hostId && room.players.has(id) && room.players.get(id).connected);
          const allPlayed = nonHostPlayers.length > 0 && nonHostPlayers.every(id => room.currentRound.submissions.has(id));
          if (allPlayed) room.state = GAME_STATES.VOTACAO;
        }
      }
    }
  } else {
    if (room.currentRound && room.currentRound.hostId === playerId) czarDropped = true;
    if (room.state === GAME_STATES.EM_ANDAMENTO && !czarDropped) {
      const nonHostPlayers = room.playerOrder.filter(id => id !== room.currentRound.hostId && room.players.has(id) && room.players.get(id).connected);
      const allPlayed = nonHostPlayers.length > 0 && nonHostPlayers.every(id => room.currentRound.submissions.has(id));
      if (allPlayed) room.state = GAME_STATES.VOTACAO;
    }
  }

  return { room, removed: true, nickname, czarDropped, gameOver, destroyed };
}

const DISCONNECTED_AFTER_MS = 35 * 1000; // ~2 missed heartbeats (client pings every ~15s)
const REMOVED_AFTER_MS = 120 * 1000; // matches the desktop server's 2-minute reconnect grace period

/**
 * Replaces the old socket.io 'disconnect' event: since HTTP has no
 * persistent connection, staleness is inferred from each player's
 * last heartbeat. Called at the top of most handlers so state self-heals
 * without needing a cron job. Mutates `room` and returns what happened so
 * the caller can broadcast the right events.
 */
function sweepPresence(room) {
  const now = Date.now();
  const events = { disconnected: [], removed: [] };

  for (const [playerId, player] of Array.from(room.players.entries())) {
    const idleFor = now - player.lastActive;

    if (player.connected && idleFor > DISCONNECTED_AFTER_MS) {
      player.connected = false;
      events.disconnected.push({ playerId, nickname: player.nickname });
    }

    if (idleFor > REMOVED_AFTER_MS) {
      const result = removePlayer(room, playerId, false);
      if (result.removed) {
        events.removed.push({ playerId, nickname: result.nickname, czarDropped: result.czarDropped, gameOver: result.gameOver, destroyed: result.destroyed });
      }
    }
  }

  return events;
}

function getPlayerList(room) {
  const list = [];
  for (const [playerId, player] of room.players) {
    list.push({
      nickname: player.nickname,
      score: player.score,
      cardsReady: player.cardsReady,
      connected: player.connected,
      isCreator: playerId === room.creatorId,
    });
  }
  return list;
}

function getScoresForRoom(room) {
  const scores = [];
  for (const [, player] of room.players) {
    scores.push({ nickname: player.nickname, score: player.score });
  }
  return scores.sort((a, b) => b.score - a.score);
}

module.exports = {
  createRoom,
  joinRoom,
  updateRoomConfig,
  submitCards,
  startGame,
  playCard,
  pickWinner,
  nextRound,
  removePlayer,
  sweepPresence,
  getPlayerList,
  getScoresForRoom,
  calculateRanking,
  HAND_SIZE,
};
