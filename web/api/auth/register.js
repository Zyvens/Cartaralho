const { sql } = require('../../lib/db');
const { withErrors, ok, fail, requireMethod, getBody } = require('../../lib/http');
const { normalizeUsername, hashPassword, createSession } = require('../../lib/auth');

module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'POST')) return;
  const { username, password, displayName } = getBody(req);
  const normalized = normalizeUsername(username);
  const name = String(displayName || username || '').trim();

  if (!/^[a-z0-9_.-]{3,24}$/.test(normalized)) {
    return fail(res, 400, 'Usuário deve ter 3 a 24 caracteres: letras, números, ponto, hífen ou _.');
  }
  if (String(password || '').length < 6) return fail(res, 400, 'A senha deve ter pelo menos 6 caracteres.');
  if (name.length < 2 || name.length > 24) return fail(res, 400, 'Nome de exibição deve ter 2 a 24 caracteres.');

  const exists = await sql`SELECT id FROM users WHERE lower(username) = ${normalized} LIMIT 1`;
  if (exists.length) return fail(res, 409, 'Esse usuário já existe.');

  const passwordHash = await hashPassword(password);
  const rows = await sql`INSERT INTO users (username, display_name, password_hash)
                         VALUES (${normalized}, ${name}, ${passwordHash})
                         RETURNING id, username, display_name, created_at`;
  const user = rows[0];
  const token = await createSession(user.id);
  ok(res, { token, user });
});
