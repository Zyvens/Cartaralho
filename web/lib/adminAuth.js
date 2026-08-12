/** Same simple scheme the desktop app uses ("user:password" in the
 *  Authorization header), but the expected value must come from env vars —
 *  no hardcoded default for the public web deployment. */
function requireAdmin(req, res) {
  if (!process.env.ADMIN_PASSWORD) {
    res.status(500).json({ error: 'ADMIN_PASSWORD não configurada no servidor.' });
    return false;
  }

  const expected = `${process.env.ADMIN_USER || 'admin'}:${process.env.ADMIN_PASSWORD}`;
  if (req.headers.authorization !== expected) {
    res.status(401).json({ error: 'Não autorizado' });
    return false;
  }
  return true;
}

module.exports = { requireAdmin };
