const { requireAdmin } = require('../../../../lib/adminAuth');
const deckStore = require('../../../../lib/deckStore');

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Método não permitido.' });

  try {
    const { type, index } = req.query;
    const deck = await deckStore.getDeck();
    const card = (deck[type] || [])[parseInt(index, 10)];
    if (!card) return res.status(404).json({ error: 'Carta não encontrada' });

    const success = await deckStore.deleteCard(card.id);
    if (success) return res.status(200).json({ success: true });
    res.status(404).json({ error: 'Carta não encontrada' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
