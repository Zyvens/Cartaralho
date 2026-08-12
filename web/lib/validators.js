const { GAME_STATES, MAX_NICKNAME_LENGTH } = require('./constants');

/**
 * Valida o nickname do jogador.
 * @param {string} nickname
 * @returns {{ valid: boolean, error?: string }}
 */
function validateNickname(nickname) {
  if (!nickname || typeof nickname !== 'string') {
    return { valid: false, error: 'O nickname é obrigatório.' };
  }

  const trimmed = nickname.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'O nickname não pode estar vazio.' };
  }

  if (trimmed.length > MAX_NICKNAME_LENGTH) {
    return { valid: false, error: `O nickname deve ter no máximo ${MAX_NICKNAME_LENGTH} caracteres.` };
  }

  return { valid: true };
}

/**
 * Valida as cartas submetidas por um jogador.
 * @param {string[]} blackCards - Cartas pretas do jogador
 * @param {string[]} whiteCards - Cartas brancas do jogador
 * @param {number} maxBlack - Quantidade máxima de cartas pretas
 * @param {number} maxWhite - Quantidade máxima de cartas brancas
 * @param {boolean} useStandardDeck - Se o baralho padrão está sendo usado
 * @returns {{ valid: boolean, error?: string }}
 */
function validateCards(blackCards, whiteCards, maxBlack, maxWhite, useStandardDeck = true) {
  if (!Array.isArray(blackCards)) {
    return { valid: false, error: 'Formato de cartas pretas inválido.' };
  }

  if (!Array.isArray(whiteCards)) {
    return { valid: false, error: 'Formato de cartas brancas inválido.' };
  }

  if (useStandardDeck) {
    if (blackCards.length > maxBlack) {
      return { valid: false, error: `Você pode enviar no máximo ${maxBlack} cartas pretas.` };
    }
    if (whiteCards.length > maxWhite) {
      return { valid: false, error: `Você pode enviar no máximo ${maxWhite} cartas brancas.` };
    }
    // Permite empty arrays se useStandardDeck for true
  } else {
    if (blackCards.length !== maxBlack) {
      return { valid: false, error: `Você deve enviar EXATAMENTE ${maxBlack} cartas pretas, pois a mesa não usa o baralho padrão.` };
    }
    if (whiteCards.length !== maxWhite) {
      return { valid: false, error: `Você deve enviar EXATAMENTE ${maxWhite} cartas brancas, pois a mesa não usa o baralho padrão.` };
    }
  }

  for (let i = 0; i < blackCards.length; i++) {
    if (typeof blackCards[i] !== 'string' || blackCards[i].trim().length === 0) {
      return { valid: false, error: `A carta preta #${i + 1} não pode estar vazia.` };
    }
  }

  for (let i = 0; i < whiteCards.length; i++) {
    if (typeof whiteCards[i] !== 'string' || whiteCards[i].trim().length === 0) {
      return { valid: false, error: `A carta branca #${i + 1} não pode estar vazia.` };
    }
  }


  return { valid: true };
}

/**
 * Valida se um jogador pode entrar em uma sala.
 * @param {object} room - Objeto da sala
 * @param {string} nickname - Nickname do jogador
 * @param {string} playerId - Id estável do jogador (sessionId do cliente)
 * @returns {{ valid: boolean, error?: string }}
 */
function validateRoomJoin(room, nickname, playerId) {
  if (!room) {
    return { valid: false, error: 'Sala não encontrada.' };
  }

  const trimmedNickname = nickname.trim().toLowerCase();

  // Reingresso: mesmo playerId (sessionId estável do navegador) já está na sala
  if (playerId && room.players.has(playerId)) {
    return { valid: true, isRejoin: true };
  }

  if (room.players.size >= room.maxPlayers) {
    return { valid: false, error: 'A sala está cheia.' };
  }

  if (room.state !== GAME_STATES.AGUARDANDO_JOGADORES && room.state !== GAME_STATES.CADASTRO_CARTAS) {
    return { valid: false, error: 'O jogo já começou. Não é possível entrar na sala.' };
  }

  for (const [, player] of room.players) {
    if (player.nickname.trim().toLowerCase() === trimmedNickname) {
      return { valid: false, error: 'Já existe um jogador com esse nickname na sala.' };
    }
  }

  return { valid: true };
}

/**
 * Valida se um jogador pode jogar uma carta.
 * @param {object} room - Objeto da sala
 * @param {string} playerId - Socket ID do jogador
 * @returns {{ valid: boolean, error?: string }}
 */
function validateCardPlay(room, playerId) {
  if (!room) {
    return { valid: false, error: 'Sala não encontrada.' };
  }

  if (room.state !== GAME_STATES.EM_ANDAMENTO) {
    return { valid: false, error: 'Não é possível jogar cartas neste momento.' };
  }

  if (room.currentRound.hostId === playerId) {
    return { valid: false, error: 'O anfitrião da rodada não pode jogar cartas.' };
  }

  if (room.currentRound.submissions.has(playerId)) {
    return { valid: false, error: 'Você já jogou uma carta nesta rodada.' };
  }

  const player = room.players.get(playerId);
  if (!player) {
    return { valid: false, error: 'Jogador não encontrado na sala.' };
  }

  if (!player.hand || player.hand.length === 0) {
    return { valid: false, error: 'Você não possui cartas na mão.' };
  }

  return { valid: true };
}

/**
 * Valida se o anfitrião pode escolher o vencedor.
 * @param {object} room - Objeto da sala
 * @param {string} playerId - Socket ID do jogador
 * @returns {{ valid: boolean, error?: string }}
 */
function validatePickWinner(room, playerId) {
  if (!room) {
    return { valid: false, error: 'Sala não encontrada.' };
  }

  if (room.state !== GAME_STATES.VOTACAO) {
    return { valid: false, error: 'Não é possível escolher o vencedor neste momento.' };
  }

  if (room.currentRound.hostId !== playerId) {
    return { valid: false, error: 'Apenas o anfitrião da rodada pode escolher o vencedor.' };
  }

  // Verificar se todos os jogadores (exceto o host) já jogaram
  const nonHostPlayers = room.playerOrder.filter(id => id !== room.currentRound.hostId && room.players.has(id));
  const allPlayed = nonHostPlayers.every(id => room.currentRound.submissions.has(id));

  if (!allPlayed) {
    return { valid: false, error: 'Nem todos os jogadores jogaram suas cartas.' };
  }

  return { valid: true };
}

module.exports = {
  validateNickname,
  validateCards,
  validateRoomJoin,
  validateCardPlay,
  validatePickWinner,
};
