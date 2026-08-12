const { HAND_SIZE } = require('./constants');
const deckManager = require('./deckManager');

/**
 * Embaralha um array usando o algoritmo Fisher-Yates (in-place).
 * @param {Array} array
 * @returns {Array} O mesmo array embaralhado
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function buildDecks(room) {
  room.blackDeck = [];
  room.whiteDeck = [];

  const uniqueBlack = new Set();
  const uniqueWhite = new Set();

  const standardDeck = deckManager.getDeck();
  const stdBlack = shuffleArray([...standardDeck.blackCards.map(c => c.text)]);
  const stdWhite = shuffleArray([...standardDeck.whiteCards.map(c => c.text)]);

  for (const [, player] of room.players) {
    if (player.blackCards && Array.isArray(player.blackCards)) {
      for (const card of player.blackCards) {
        const text = card.trim();
        if (text) {
          if (!uniqueBlack.has(text.toLowerCase())) {
            uniqueBlack.add(text.toLowerCase());
            room.blackDeck.push(text);
            deckManager.addCard('blackCards', text, false);
          } else {
            // Duplicata - puxa uma do baralho padrão pra compensar
            if (stdBlack.length > 0) {
              const fallback = stdBlack.pop();
              room.blackDeck.push(fallback);
              uniqueBlack.add(fallback.toLowerCase());
            }
          }
        }
      }
    }
    if (player.whiteCards && Array.isArray(player.whiteCards)) {
      for (const card of player.whiteCards) {
        const text = card.trim();
        if (text) {
          if (!uniqueWhite.has(text.toLowerCase())) {
            uniqueWhite.add(text.toLowerCase());
            room.whiteDeck.push(text);
            deckManager.addCard('whiteCards', text, false);
          } else {
            // Duplicata - puxa uma do baralho padrão
            if (stdWhite.length > 0) {
              const fallback = stdWhite.pop();
              room.whiteDeck.push(fallback);
              uniqueWhite.add(fallback.toLowerCase());
            }
          }
        }
      }
    }
  }

  if (room.useStandardDeck) {
    for (const text of stdBlack) {
      if (!uniqueBlack.has(text.toLowerCase())) {
        uniqueBlack.add(text.toLowerCase());
        room.blackDeck.push(text);
      }
    }
    for (const text of stdWhite) {
      if (!uniqueWhite.has(text.toLowerCase())) {
        uniqueWhite.add(text.toLowerCase());
        room.whiteDeck.push(text);
      }
    }
  }

  shuffleArray(room.blackDeck);
  shuffleArray(room.whiteDeck);
}

/**
 * Distribui HAND_SIZE cartas brancas para cada jogador.
 * @param {object} room
 */
function dealHands(room) {
  for (const [, player] of room.players) {
    player.hand = [];
    for (let i = 0; i < room.handSize; i++) {
      if (room.whiteDeck.length > 0) {
        player.hand.push(room.whiteDeck.pop());
      }
    }
  }
}

/**
 * Compra uma carta branca do deck para a mão do jogador.
 * @param {object} room
 * @param {string} playerId - Socket ID do jogador
 * @returns {boolean} true se conseguiu comprar, false se o deck está vazio
 */
function drawCard(room, playerId) {
  const player = room.players.get(playerId);
  if (!player) return false;

  if (room.whiteDeck.length > 0) {
    player.hand.push(room.whiteDeck.pop());
    return true;
  }

  return false;
}

/**
 * Retorna o próximo índice de anfitrião, ciclando pela ordem dos jogadores.
 * @param {object} room
 * @returns {number} Próximo índice de host
 */
function getNextHostIndex(room) {
  const currentIndex = room.currentRound.hostIndex;
  const totalPlayers = room.playerOrder.length;

  if (totalPlayers === 0) return 0;

  return (currentIndex + 1) % totalPlayers;
}

/**
 * Calcula o ranking dos jogadores ordenado por pontuação.
 * @param {object} room
 * @returns {Array<{ nickname: string, score: number, socketId: string }>}
 */
function calculateRanking(room) {
  const ranking = [];

  for (const [socketId, player] of room.players) {
    ranking.push({
      nickname: player.nickname,
      score: player.score,
      socketId,
    });
  }

  ranking.sort((a, b) => b.score - a.score);

  return ranking;
}

/**
 * Gera um código de sala de 6 caracteres alfanuméricos em maiúsculas.
 * @returns {string}
 */
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

module.exports = {
  shuffleArray,
  buildDecks,
  dealHands,
  drawCard,
  getNextHostIndex,
  calculateRanking,
  generateRoomCode,
};
