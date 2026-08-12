const { requireAdmin } = require('../../lib/adminAuth');
const deckStore = require('../../lib/deckStore');

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === 'GET') {
      return res.status(200).json(await deckStore.getDeck());
    }

    if (req.method === 'POST') {
      const { type, text } = req.body || {};
      if (!type || !text) return res.status(400).json({ error: 'Tipo e texto obrigatórios' });
      await deckStore.addCard(type, text, true);
      return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: 'Método não permitido.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
