const { withErrors, ok, requireMethod } = require('../lib/http');
const deckStore = require('../lib/deckStore');

function sample(arr, size) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
}

module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'GET')) return;
  const deck = await deckStore.getDeck();

  ok(res, {
    blackCards: sample(deck.blackCards || [], 8),
    whiteCards: sample(deck.whiteCards || [], 12),
  });
});
