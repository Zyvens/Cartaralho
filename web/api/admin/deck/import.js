const { requireAdmin } = require('../../../lib/adminAuth');
const deckStore = require('../../../lib/deckStore');

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

  try {
    await deckStore.importDeck(req.body || {});
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
