const { sql } = require('../../lib/db');
const { withErrors, ok, fail, requireMethod, getBody } = require('../../lib/http');
const { normalizeUsername, verifyPassword, createSession } = require('../../lib/auth');

module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'POST')) return;
  const { username, password } = getBody(req);
  const normalized = normalizeUsername(username);
  const rows = await sql`SELECT id, username, display_name, password_hash, created_at
                         FROM users WHERE lower(username) = ${normalized} LIMIT 1`;
  const user = rows[0];
  if (!user || !(await verifyPassword(password || '', user.password_hash))) {
    return fail(res, 401, 'Usuário ou senha inválidos.');
  }
  await sql`UPDATE users SET last_login_at = now() WHERE id = ${user.id}`;
  const token = await createSession(user.id);
  ok(res, { token, user: { id: user.id, username: user.username, display_name: user.display_name, created_at: user.created_at } });
});
