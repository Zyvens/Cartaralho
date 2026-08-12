const { withErrors, ok, fail, requireMethod, getBody } = require('../../lib/http');
const gameManager = require('../../lib/gameManager');
const roomStore = require('../../lib/roomStore');
const { broadcast } = require('../../lib/pusherServer');
const { applyPresenceSweep } = require('../../lib/roomEvents');

module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'POST')) return;
  const { playerId, code, cardIndex } = getBody(req);
  if (!playerId || !code) return fail(res, 400, 'playerId e code são obrigatórios.');

  const room = await roomStore.loadRoom(code);
  if (!room) return fail(res, 404, 'Sala não encontrada.');

  const swept = await applyPresenceSweep(room);
  if (swept.deleted) return fail(res, 404, 'Sala não encontrada.');

  const { allPlayed } = gameManager.playCard(room, playerId, cardIndex);

  const nonHostPlayers = room.playerOrder.filter(
    id => id !== room.currentRound.hostId && room.players.has(id) && room.players.get(id).connected
  );

  let anonymousSubmissions = null;
  if (allPlayed) {
    // Shuffle the submission order for anonymity, and persist that same
    // order so pick-winner's index lookup matches what the host saw.
    const entries = Array.from(room.currentRound.submissions.entries());
    for (let i = entries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [entries[i], entries[j]] = [entries[j], entries[i]];
    }
    room.currentRound.submissions = new Map(entries);
    anonymousSubmissions = entries.map(([, submission], index) => ({ index, card: submission.card }));
  }

  await roomStore.saveRoom(room);

  await broadcast(room.code, 'card_played', {
    submissionCount: room.currentRound.submissions.size,
    totalExpected: nonHostPlayers.length,
  });

  if (anonymousSubmissions) {
    await broadcast(room.code, 'all_cards_played', {
      submissions: anonymousSubmissions,
      blackCard: room.currentRound.blackCard,
    });
  }

  ok(res);
});
