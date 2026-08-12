const { sql } = require('../../lib/db');
const { withErrors, ok, requireMethod } = require('../../lib/http');

module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'GET')) return;
  const rows = await sql`
    SELECT u.id, u.display_name, u.username,
           COUNT(mp.id)::int AS matches,
           COALESCE(SUM(mp.final_score), 0)::int AS points,
           COALESCE(SUM(mp.rounds_won), 0)::int AS rounds_won,
           COALESCE(SUM(CASE WHEN mp.won_match THEN 1 ELSE 0 END), 0)::int AS wins
    FROM users u
    LEFT JOIN match_players mp ON mp.user_id = u.id
    GROUP BY u.id
    ORDER BY points DESC, wins DESC, rounds_won DESC, matches ASC, u.display_name ASC
    LIMIT 100`;
  const recent = await sql`
    SELECT room_code, ranking, winner_nickname, finished_at
    FROM match_history ORDER BY finished_at DESC LIMIT 20`;
  ok(res, { rank: rows, recentMatches: recent });
});
