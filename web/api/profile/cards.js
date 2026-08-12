const { sql } = require('../../lib/db');
const { withErrors, ok, requireMethod } = require('../../lib/http');
const { requireUser, cardMaterialTier, cardBorderTier } = require('../../lib/auth');

module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'GET')) return;
  const user = await requireUser(req, res);
  if (!user) return;
  const rows = await sql`
    SELECT id, type, text, times_used, matches_used, times_seen, times_won,
           duplicate_creation_count, created_at, updated_at
    FROM user_cards WHERE user_id = ${user.id}
    ORDER BY type, text`;
  const cards = rows.map(card => ({
    ...card,
    materialTier: cardMaterialTier(card.matches_used),
    borderTier: cardBorderTier(card.duplicate_creation_count),
  }));
  ok(res, { cards });
});
