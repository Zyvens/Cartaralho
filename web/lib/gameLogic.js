/**
 * Pure game-logic helpers shared by every room action.
 * No I/O here — callers load/save state via roomStore and the standard
 * deck via deckStore, then pass plain data in.
 */

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Builds the black/white decks for a room from player-submitted cards plus
 * (optionally) the standard deck. Returns the native cards that should be
 * persisted into the shared deck store (player-submitted, non-duplicate).
 * @param {object} room
 * @param {{blackCards: Array<{text:string}>, whiteCards: Array<{text:string}>}} standardDeck
 * @returns {{ newBlackCards: string[], newWhiteCards: string[] }}
 */
function buildDecks(room, standardDeck) {
  room.blackDeck = [];
  room.whiteDeck = [];

  const uniqueBlack = new Set();
  const uniqueWhite = new Set();
  const newBlackCards = [];
  const newWhiteCards = [];

  const stdBlack = shuffleArray([...standardDeck.blackCards.map(c => c.text)]);
  const stdWhite = shuffleArray([...standardDeck.whiteCards.map(c => c.text)]);

  for (const [, player] of room.players) {
    if (Array.isArray(player.blackCards)) {
      for (const card of player.blackCards) {
        const text = card.trim();
        if (text) {
          if (!uniqueBlack.has(text.toLowerCase())) {
            uniqueBlack.add(text.toLowerCase());
            room.blackDeck.push(text);
            newBlackCards.push(text);
          } else if (stdBlack.length > 0) {
            const fallback = stdBlack.pop();
            room.blackDeck.push(fallback);
            uniqueBlack.add(fallback.toLowerCase());
          }
        }
      }
    }
    if (Array.isArray(player.whiteCards)) {
      for (const card of player.whiteCards) {
        const text = card.trim();
        if (text) {
          if (!uniqueWhite.has(text.toLowerCase())) {
            uniqueWhite.add(text.toLowerCase());
            room.whiteDeck.push(text);
            newWhiteCards.push(text);
          } else if (stdWhite.length > 0) {
            const fallback = stdWhite.pop();
            room.whiteDeck.push(fallback);
            uniqueWhite.add(fallback.toLowerCase());
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

  return { newBlackCards, newWhiteCards };
}

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

function drawCard(room, playerId) {
  const player = room.players.get(playerId);
  if (!player) return false;

  if (room.whiteDeck.length > 0) {
    player.hand.push(room.whiteDeck.pop());
    return true;
  }

  return false;
}

function getNextHostIndex(room) {
  const currentIndex = room.currentRound.hostIndex;
  const totalPlayers = room.playerOrder.length;

  if (totalPlayers === 0) return 0;

  return (currentIndex + 1) % totalPlayers;
}

function calculateRanking(room) {
  const ranking = [];

  for (const [playerId, player] of room.players) {
    ranking.push({
      nickname: player.nickname,
      score: player.score,
      playerId,
    });
  }

  ranking.sort((a, b) => b.score - a.score);

  return ranking;
}

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
