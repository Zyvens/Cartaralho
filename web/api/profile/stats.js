const { sql } = require('../../lib/db');
const { withErrors, ok, requireMethod } = require('../../lib/http');
const { requireUser } = require('../../lib/auth');

module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'GET')) return;
  const user = await requireUser(req, res);
  if (!user) return;

  const totals = await sql`
    SELECT COUNT(*)::int AS matches,
           COALESCE(SUM(rounds_won), 0)::int AS rounds_won,
           COALESCE(SUM(CASE WHEN won_match THEN 1 ELSE 0 END), 0)::int AS matches_won,
           COALESCE(SUM(final_score), 0)::int AS total_points
    FROM match_players WHERE user_id = ${user.id}`;

  const mostUsed = await sql`
    SELECT text, type, times_used, matches_used
    FROM user_cards WHERE user_id = ${user.id}
    ORDER BY times_used DESC, matches_used DESC, updated_at DESC LIMIT 1`;
  const mostSeen = await sql`
    SELECT text, type, times_seen
    FROM user_cards WHERE user_id = ${user.id}
    ORDER BY times_seen DESC, updated_at DESC LIMIT 1`;
  const favoriteBlack = await sql`
    SELECT text, times_won
    FROM user_cards WHERE user_id = ${user.id} AND type = 'blackCards'
    ORDER BY times_won DESC, updated_at DESC LIMIT 1`;

  ok(res, {
    stats: {
      ...totals[0],
      mostUsed: mostUsed[0] || null,
      mostSeen: mostSeen[0] || null,
      favoriteBlack: favoriteBlack[0] || null,
    }
  });
});
