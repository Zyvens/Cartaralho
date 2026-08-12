const crypto = require('crypto');
const { promisify } = require('util');
const { sql } = require('./db');

const scrypt = promisify(crypto.scrypt);
const SESSION_DAYS = 30;

function normalizeUsername(value) {
  return String(value || '').trim().toLowerCase();
}

async function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = await scrypt(String(password), salt, 64);
  return `${salt}:${Buffer.from(derived).toString('hex')}`;
}

async function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hashHex] = stored.split(':');
  const candidate = await scrypt(String(password), salt, 64);
  const expected = Buffer.from(hashHex, 'hex');
  const actual = Buffer.from(candidate);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function tokenHash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = tokenHash(token);
  await sql`INSERT INTO auth_sessions (token_hash, user_id, expires_at)
            VALUES (${hash}, ${userId}, now() + (${SESSION_DAYS} || ' days')::interval)`;
  return token;
}

function readBearer(req) {
  const header = req.headers && (req.headers.authorization || req.headers.Authorization);
  if (!header || !String(header).startsWith('Bearer ')) return null;
  return String(header).slice(7).trim();
}

async function getUserFromRequest(req) {
  const token = readBearer(req);
  if (!token) return null;
  const hash = tokenHash(token);
  const rows = await sql`SELECT u.id, u.username, u.display_name, u.created_at
                         FROM auth_sessions s
                         JOIN users u ON u.id = s.user_id
                         WHERE s.token_hash = ${hash} AND s.expires_at > now()
                         LIMIT 1`;
  return rows[0] || null;
}

async function requireUser(req, res) {
  const user = await getUserFromRequest(req);
  if (!user) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Faça login para continuar.' }));
    return null;
  }
  return user;
}

function cardMaterialTier(matchesUsed) {
  if (matchesUsed >= 100) return 'platinum';
  if (matchesUsed >= 60) return 'gold';
  if (matchesUsed >= 30) return 'silver';
  if (matchesUsed >= 10) return 'copper';
  return 'standard';
}

function cardBorderTier(duplicateCount) {
  if (duplicateCount >= 100) return 'platinum';
  if (duplicateCount >= 50) return 'gold';
  if (duplicateCount >= 30) return 'silver';
  if (duplicateCount >= 10) return 'copper';
  return 'standard';
}

module.exports = {
  normalizeUsername,
  hashPassword,
  verifyPassword,
  createSession,
  tokenHash,
  readBearer,
  getUserFromRequest,
  requireUser,
  cardMaterialTier,
  cardBorderTier,
};
