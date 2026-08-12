const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não configurada. Defina a connection string do Neon Postgres nas env vars da Vercel.');
}

// HTTP-based driver: one query per call, no persistent pool — the right
// shape for Vercel serverless functions (avoids exhausting Postgres
// connections across many short-lived invocations).
const sql = neon(process.env.DATABASE_URL);

module.exports = { sql };
