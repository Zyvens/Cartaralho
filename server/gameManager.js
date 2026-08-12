const { GAME_STATES, WINNING_SCORE, MIN_PLAYERS, HAND_SIZE } = require('./constants');
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

class GameManager {
  constructor() {
    /** @type {Map<string, object>} roomCode → room */
    this.rooms = new Map();
    /** @type {Map<string, string>} socketId → roomCode */
    this.socketToRoom = new Map();
  }

  // ─────────────────────────── CREATE ROOM ───────────────────────────

  /**
   * Cria uma nova sala.
   * @param {string} socketId
   * @param {string} nickname
   * @param {{ maxPlayers?: number, blackCardsPerPlayer?: number, whiteCardsPerPlayer?: number }} config
   * @returns {{ code: string, room: object }}
   */
  createRoom(socketId, nickname, config = {}, ip = null, sessionId = null) {
    const nickValidation = validateNickname(nickname);
    if (!nickValidation.valid) {
      throw new Error(nickValidation.error);
    }

    const trimmedNickname = nickname.trim();

    // Gerar código único
    let code;
    do {
      code = generateRoomCode();
    } while (this.rooms.has(code));

    const maxPlayers = config.maxPlayers || 8;
    const blackCardsPerPlayer = config.blackCardsPerPlayer || 3;
    const whiteCardsPerPlayer = config.whiteCardsPerPlayer || 10;
    const pointsToWin = config.pointsToWin || 10;
    const handSize = config.handSize || 5;
    const useStandardDeck = config.useStandardDeck !== undefined ? config.useStandardDeck : true;
    const afkEnabled = config.afkEnabled !== undefined ? config.afkEnabled : true;
    const sharedLocalPool = config.sharedLocalPool !== undefined ? config.sharedLocalPool : false;

    const room = {
      code,
      creatorId: socketId,
      maxPlayers,
      blackCardsPerPlayer,
      whiteCardsPerPlayer,
      pointsToWin,
      handSize,
      useStandardDeck,
      afkEnabled,
      sharedLocalPool,
      state: GAME_STATES.AGUARDANDO_JOGADORES,
      players: new Map(),
      playerOrder: [],
      blackDeck: [],
      whiteDeck: [],
      currentRound: null,
      pointsToWin: 5, // Fixo por enquanto
    };

    room.players.set(socketId, {
      nickname: trimmedNickname,
      score: 0,
      isCreator: true,
      hand: [],
      cardsReady: false,
      blackCards: [],
      whiteCards: [],
      connected: true,
      lastActive: Date.now(),
      ip,
      sessionId,
    });
    room.playerOrder.push(socketId);

    this.rooms.set(code, room);
    this.socketToRoom.set(socketId, code);

    console.log(`[Sala Criada] Código: ${code} | Criador: ${trimmedNickname} (${socketId})`);

    return { code, room };
  }

  // ─────────────────────────── JOIN ROOM ───────────────────────────

  /**
   * Adiciona um jogador a uma sala existente.
   */
  joinRoom(socketId, nickname, code, ip = null, sessionId = null) {
    const nickValidation = validateNickname(nickname);
    if (!nickValidation.valid) {
      throw new Error(nickValidation.error);
    }

    const trimmedNickname = nickname.trim();
    const upperCode = code.toUpperCase().trim();
    const room = this.rooms.get(upperCode);

    const joinValidation = validateRoomJoin(room, trimmedNickname, ip, sessionId);
    if (!joinValidation.valid) {
      throw new Error(joinValidation.error);
    }

    if (joinValidation.isRejoin) {
      const oldId = joinValidation.oldSocketId;
      const player = room.players.get(oldId);
      
      const oldNickname = player.nickname;
      player.nickname = trimmedNickname;
      player.connected = true;
      player.lastActive = Date.now();
      player.ip = ip;
      player.sessionId = sessionId;

      room.players.delete(oldId);
      room.players.set(socketId, player);
      
      const orderIndex = room.playerOrder.indexOf(oldId);
      if (orderIndex !== -1) room.playerOrder[orderIndex] = socketId;
      
      this.socketToRoom.delete(oldId);
      this.socketToRoom.set(socketId, upperCode);

      if (room.currentRound) {
        if (room.currentRound.hostId === oldId) {
          room.currentRound.hostId = socketId;
        }
        if (room.currentRound.submissions && room.currentRound.submissions.has(oldId)) {
          const sub = room.currentRound.submissions.get(oldId);
          room.currentRound.submissions.delete(oldId);
          room.currentRound.submissions.set(socketId, sub);
        }
        if (room.currentRound.winnerId === oldId) {
          room.currentRound.winnerId = socketId;
        }
      }

      console.log(`[Reingresso] Sala ${upperCode} | Jogador: ${trimmedNickname} (${socketId}) substituiu ${oldId}`);
      return { room, isRejoin: true, oldNickname, newNickname: trimmedNickname, oldSocketId: oldId };
    }

    room.players.set(socketId, {
      nickname: trimmedNickname,
      score: 0,
      hand: [],
      cardsReady: false,
      blackCards: [],
      whiteCards: [],
      connected: true,
      lastActive: Date.now(),
      ip,
      sessionId,
    });
    room.playerOrder.push(socketId);

    // Mudar estado para cadastro de cartas quando tiver jogadores suficientes
    if (room.players.size >= MIN_PLAYERS && room.state === GAME_STATES.AGUARDANDO_JOGADORES) {
      room.state = GAME_STATES.CADASTRO_CARTAS;
    }

    this.socketToRoom.set(socketId, upperCode);

    console.log(`[Jogador Entrou] ${trimmedNickname} (${socketId}) → Sala ${upperCode} (${room.players.size}/${room.maxPlayers})`);

    return { room };
  }

  // ─────────────────────────── SUBMIT CARDS ───────────────────────────

  /**
   * Submete as cartas de um jogador.
   * @param {string} socketId
   * @param {string} code
   * @param {string[]} blackCards
   * @param {string[]} whiteCards
   * @returns {{ room: object }}
   */
  submitCards(socketId, code, blackCards, whiteCards) {
    const upperCode = code.toUpperCase().trim();
    const room = this.rooms.get(upperCode);

    if (!room) {
      throw new Error('Sala não encontrada.');
    }

    const player = room.players.get(socketId);
    if (!player) {
      throw new Error('Você não está nesta sala.');
    }

    if (player.cardsReady) {
      throw new Error('Você já enviou suas cartas.');
    }

    if (room.state !== GAME_STATES.CADASTRO_CARTAS && room.state !== GAME_STATES.AGUARDANDO_JOGADORES) {
      throw new Error('Não é possível enviar cartas neste momento.');
    }

    const validation = validateCards(blackCards, whiteCards, room.blackCardsPerPlayer, room.whiteCardsPerPlayer, room.useStandardDeck);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const deckManager = require('./deckManager'); // Import locally or top if preferred

    if (room.sharedLocalPool) {
      // Host cria cartas para todo mundo
      room.blackDeck.push(...blackCards.map(c => {
        const t = c.trim(); deckManager.addCard('blackCards', t, false); return t;
      }));
      room.whiteDeck.push(...whiteCards.map(c => {
        const t = c.trim(); deckManager.addCard('whiteCards', t, false); return t;
      }));
      // Marca todos como prontos
      for (const [, p] of room.players) {
        p.cardsReady = true;
      }
    } else {
      player.blackCards = blackCards.map(c => {
        const text = c.trim(); deckManager.addCard('blackCards', text, false); return text;
      });

      player.whiteCards = whiteCards.map(c => {
        const text = c.trim(); deckManager.addCard('whiteCards', text, false); return text;
      });

      player.cardsReady = true;
    }

    // Verificar se todos os jogadores estão prontos
    let allReady = true;
    for (const [, p] of room.players) {
      if (!p.cardsReady) {
        allReady = false;
        break;
      }
    }

    if (allReady && room.players.size >= MIN_PLAYERS) {
      room.state = GAME_STATES.PRONTA_PARA_INICIAR;
    }

    console.log(`[Cartas Enviadas] ${player.nickname} (${socketId}) → Sala ${upperCode} | Pretas: ${blackCards.length}, Brancas: ${whiteCards.length}`);

    return { room, allReady };
  }

  // ─────────────────────────── START GAME ───────────────────────────

  /**
   * Inicia o jogo. Apenas o criador da sala pode iniciar.
   * @param {string} socketId
   * @param {string} code
   * @returns {{ room: object }}
   */
  startGame(socketId, code) {
    const upperCode = code.toUpperCase().trim();
    const room = this.rooms.get(upperCode);

    if (!room) {
      throw new Error('Sala não encontrada.');
    }

    if (room.creatorId !== socketId) {
      throw new Error('Apenas o criador da sala pode iniciar o jogo.');
    }

    if (room.state !== GAME_STATES.PRONTA_PARA_INICIAR) {
      throw new Error('O jogo ainda não está pronto para iniciar. Todos os jogadores devem enviar suas cartas.');
    }

    if (room.players.size < MIN_PLAYERS) {
      throw new Error(`São necessários pelo menos ${MIN_PLAYERS} jogadores para iniciar o jogo.`);
    }

    // Verificar se todos estão prontos
    for (const [, player] of room.players) {
      if (!player.cardsReady) {
        throw new Error('Nem todos os jogadores enviaram suas cartas.');
      }
    }

    // Montar e embaralhar decks
    buildDecks(room);

    // Distribuir mãos iniciais
    dealHands(room);

    // Configurar primeira rodada
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

    console.log(`[Jogo Iniciado] Sala ${upperCode} | Jogadores: ${room.players.size} | Cartas pretas: ${room.blackDeck.length + 1} | Cartas brancas: ${room.whiteDeck.length + room.players.size * HAND_SIZE}`);

    return { room };
  }

  // ─────────────────────────── PLAY CARD ───────────────────────────

  /**
   * Um jogador joga uma carta da mão.
   * @param {string} socketId
   * @param {string} code
   * @param {number} cardIndex - Índice da carta na mão do jogador
   * @returns {{ room: object, allPlayed: boolean }}
   */
  playCard(socketId, code, cardIndex) {
    const upperCode = code.toUpperCase().trim();
    const room = this.rooms.get(upperCode);

    const validation = validateCardPlay(room, socketId);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const player = room.players.get(socketId);

    if (typeof cardIndex !== 'number' || cardIndex < 0 || cardIndex >= player.hand.length) {
      throw new Error('Índice de carta inválido.');
    }

    // Remover carta da mão e adicionar às submissões
    const [playedCard] = player.hand.splice(cardIndex, 1);
    room.currentRound.submissions.set(socketId, { card: playedCard });

    // Verificar se todos os não-host já jogaram
    const nonHostPlayers = room.playerOrder.filter(
      id => id !== room.currentRound.hostId && room.players.has(id) && room.players.get(id).connected
    );
    const allPlayed = nonHostPlayers.every(id => room.currentRound.submissions.has(id));

    if (allPlayed) {
      room.state = GAME_STATES.VOTACAO;
    }

    console.log(`[Carta Jogada] ${player.nickname} (${socketId}) → Sala ${upperCode} | Rodada ${room.currentRound.number} | Todas jogaram: ${allPlayed}`);

    return { room, allPlayed };
  }

  // ─────────────────────────── PICK WINNER ───────────────────────────

  /**
   * O anfitrião escolhe a submissão vencedora.
   * @param {string} socketId
   * @param {string} code
   * @param {number} submissionIndex - Índice da submissão vencedora
   * @returns {{ room: object, winnerId: string, winnerCard: string, gameOver: boolean }}
   */
  pickWinner(socketId, code, submissionIndex) {
    const upperCode = code.toUpperCase().trim();
    const room = this.rooms.get(upperCode);

    const validation = validatePickWinner(room, socketId);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Converter submissões para array para acessar por índice
    const submissionsArray = Array.from(room.currentRound.submissions.entries());

    if (typeof submissionIndex !== 'number' || submissionIndex < 0 || submissionIndex >= submissionsArray.length) {
      throw new Error('Índice de submissão inválido.');
    }

    const [winnerId, submission] = submissionsArray[submissionIndex];
    const winnerPlayer = room.players.get(winnerId);

    if (!winnerPlayer) {
      throw new Error('Jogador vencedor não encontrado.');
    }

    // Atualizar pontuação
    winnerPlayer.score += 1;

    // Registrar vencedor da rodada
    room.currentRound.winnerId = winnerId;
    room.currentRound.winnerCard = submission.card;

    // Verificar fim de jogo
    const gameOver = winnerPlayer.score >= room.pointsToWin;

    if (gameOver) {
      room.state = GAME_STATES.FINALIZADA;
      console.log(`[Jogo Finalizado] Sala ${upperCode} | Vencedor: ${winnerPlayer.nickname} (${winnerPlayer.score} pontos)`);
    } else {
      room.state = GAME_STATES.RESULTADO_RODADA;
    }

    console.log(`[Vencedor Escolhido] Sala ${upperCode} | Rodada ${room.currentRound.number} | Vencedor: ${winnerPlayer.nickname} | Carta: "${submission.card}" | Pontuação: ${winnerPlayer.score}`);

    return {
      room,
      winnerId,
      winnerNickname: winnerPlayer.nickname,
      winnerCard: submission.card,
      gameOver,
    };
  }

  // ─────────────────────────── NEXT ROUND ───────────────────────────

  /**
   * Avança para a próxima rodada.
   * @param {string} code
   * @returns {{ room: object, gameOver: boolean }}
   */
  nextRound(code) {
    const upperCode = code.toUpperCase().trim();
    const room = this.rooms.get(upperCode);

    if (!room) {
      throw new Error('Sala não encontrada.');
    }

    // Cada jogador que jogou compra uma nova carta
    for (const [playerId] of room.currentRound.submissions) {
      drawCard(room, playerId);
    }

    // Verificar se ainda há cartas pretas
    if (room.blackDeck.length === 0) {
      room.state = GAME_STATES.FINALIZADA;
      console.log(`[Jogo Finalizado] Sala ${upperCode} | Sem mais cartas pretas.`);
      return { room, gameOver: true };
    }

    // Rotacionar anfitrião
    const nextHostIndex = getNextHostIndex(room);
    const nextHostId = room.playerOrder[nextHostIndex];

    // Próxima carta preta
    const nextBlackCard = room.blackDeck.pop();

    // Configurar nova rodada
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

    console.log(`[Nova Rodada] Sala ${upperCode} | Rodada ${room.currentRound.number} | Anfitrião: ${room.players.get(nextHostId)?.nickname}`);

    return { room, gameOver: false };
  }

  // ─────────────────────────── GET ROOM ───────────────────────────

  /**
   * Retorna uma sala pelo código.
   * @param {string} code
   * @returns {object|null}
   */
  getRoom(code) {
    if (!code) return null;
    return this.rooms.get(code.toUpperCase().trim()) || null;
  }

  // ─────────────────────────── REMOVE PLAYER ───────────────────────────

  /**
   * Remove um jogador de sua sala (desconexão).
   * @param {string} socketId
   * @returns {{ code: string, room: object, nickname: string }|null}
   */
  removePlayer(socketId, explicitLeave = false) {
    const code = this.socketToRoom.get(socketId);
    if (!code) return null;

    const room = this.rooms.get(code);
    if (!room) {
      this.socketToRoom.delete(socketId);
      return null;
    }

    const player = room.players.get(socketId);
    if (!player) {
      this.socketToRoom.delete(socketId);
      return null;
    }

    const nickname = player.nickname;
    let czarDropped = false;
    let gameOver = false;

    if (!room.disconnectTimeouts) room.disconnectTimeouts = new Map();

    // Se o jogo não começou, ou se a partida já terminou, a remoção é definitiva.
    const isMidGame = room.state === GAME_STATES.EM_ANDAMENTO || room.state === GAME_STATES.VOTACAO;
    
    // Marcar como desconectado (mesmo se for explicit leave, ajuda a não ser contado em lógicas abaixo)
    player.connected = false;

    if (!isMidGame || explicitLeave) {
      // Exclusão permanente
      room.players.delete(socketId);
      room.playerOrder = room.playerOrder.filter(id => id !== socketId);
      
      // Limpa qualquer timeout ativo
      if (room.disconnectTimeouts.has(socketId)) {
        clearTimeout(room.disconnectTimeouts.get(socketId));
        room.disconnectTimeouts.delete(socketId);
      }

      if (room.state === GAME_STATES.AGUARDANDO_JOGADORES || room.state === GAME_STATES.CADASTRO_CARTAS || room.state === GAME_STATES.PRONTA_PARA_INICIAR) {
        if (room.players.size < MIN_PLAYERS) {
          room.state = GAME_STATES.AGUARDANDO_JOGADORES;
        }
        if (room.players.size === 0) {
          this.rooms.delete(code);
          console.log(`[Sala Removida] ${code} (todos saíram)`);
        } else if (room.creatorId === socketId) {
          this.rooms.delete(code);
          console.log(`[Sala Removida] ${code} (criador desconectou no lobby)`);
          room.destroyed = true;
        }
      } else if (room.state === GAME_STATES.FINALIZADA) {
        if (room.players.size === 0) {
          this.rooms.delete(code);
        }
      } else if (isMidGame) {
        // Exclusão definitiva no meio do jogo (clicou em Sair da Partida ou Timeout)
        if (room.players.size < MIN_PLAYERS) {
          gameOver = true;
        } else {
          // Precisamos checar se o Czar saiu em definitivo
          if (room.currentRound && room.currentRound.hostId === socketId) {
            czarDropped = true;
          }
          // Verificar se a rodada deve avançar para votação caso fosse o último a jogar e saiu
          if (room.state === GAME_STATES.EM_ANDAMENTO && !czarDropped) {
            const nonHostPlayers = room.playerOrder.filter(id => id !== room.currentRound.hostId && room.players.has(id) && room.players.get(id).connected);
            const allPlayed = nonHostPlayers.length > 0 && nonHostPlayers.every(id => room.currentRound.submissions.has(id));
            if (allPlayed) room.state = GAME_STATES.VOTACAO;
          }
        }
      }
    } else {
      // Jogo em andamento: não foi explicitLeave, apenas perdeu conexão (Internet)
      if (room.currentRound && room.currentRound.hostId === socketId) {
        czarDropped = true;
      }

      // Se era EM_ANDAMENTO e o cara que faltava jogar caiu, devemos ir para votação?
      if (room.state === GAME_STATES.EM_ANDAMENTO && !czarDropped) {
        const nonHostPlayers = room.playerOrder.filter(
          id => id !== room.currentRound.hostId && room.players.has(id) && room.players.get(id).connected
        );
        const allPlayed = nonHostPlayers.length > 0 && nonHostPlayers.every(id => room.currentRound.submissions.has(id));
        if (allPlayed) {
          room.state = GAME_STATES.VOTACAO;
        }
      }

      // Agenda exclusão em 2 minutos (120000 ms) se não voltar
      const timeoutId = setTimeout(() => {
        // Usa uma dependência circular ou apenas despacha um evento se conseguirmos?
        // Aqui no gameManager nós apenas removemos e o index precisaria notificar.
        // É mais limpo retornar um callback ou injetar o EventEmitter. Mas podemos usar o próprio removePlayer dnv explicitamente.
        // Para simplificar, o index.js vai disparar o timeout e chamar removePlayer explícito?
        // Sim, melhor deixar o setTimeout no index.js ou disparar um callback. 
        // Vamos expor o timeoutId para o index.js lidar se quisermos, mas aqui fazemos internamente se preferir.
      }, 120000);
      
      // ESPERA: É melhor não colocar setTimeout aqui se gameManager não acessa o socket 'io'.
      // Ao invés disso, apenas setamos uma flag e deixamos o index tratar o timeout.
    }

    // Se todos desconectaram (mas não deletados), remover sala?
    // A sala só morre se 0 jogadores conectados e não tem ngm pra voltar.
    let anyConnected = false;
    for (const [, p] of room.players) {
      if (p.connected) {
        anyConnected = true;
        break;
      }
    }

    if (!anyConnected && (room.players.size === 0 || isMidGame)) {
      // Se não há ninguém conectado e o jogo tá no meio, podemos manter a sala se a configuração permitir,
      // mas se cair pra 0 connected e eles não voltarem, o setTimeout vai limpar eles depois.
      // Porém, se room.players.size === 0 (todos explicitLeave), morre na hora.
      if (room.players.size === 0) {
         this.rooms.delete(code);
         console.log(`[Sala Removida] ${code} (vazia)`);
      }
    }

    this.socketToRoom.delete(socketId);
    console.log(`[Jogador Saiu] ${nickname} (${socketId}) → Sala ${code} (Explícito: ${explicitLeave})`);

    return { code, room: this.rooms.get(code) || null, nickname, czarDropped, gameOver, isMidGameExplicit: explicitLeave && isMidGame };
  }

  // ─────────────────────────── HELPERS ───────────────────────────

  /**
   * Retorna a lista de jogadores formatada para emissão.
   * @param {object} room
   * @returns {Array<{ nickname: string, score: number, cardsReady: boolean, connected: boolean, isCreator: boolean }>}
   */
  getPlayerList(room) {
    const list = [];
    for (const [socketId, player] of room.players) {
      list.push({
        nickname: player.nickname,
        score: player.score,
        cardsReady: player.cardsReady,
        connected: player.connected,
        isCreator: socketId === room.creatorId,
      });
    }
    return list;
  }

  /**
   * Retorna o código da sala de um jogador.
   * @param {string} socketId
   * @returns {string|null}
   */
  getRoomCodeBySocket(socketId) {
    return this.socketToRoom.get(socketId) || null;
  }
}

module.exports = new GameManager();
