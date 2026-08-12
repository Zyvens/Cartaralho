/** Small helpers shared by every /api handler. */

function getBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.length > 0) {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

function ok(res, data = {}) {
  res.status(200).json({ success: true, ...data });
}

function fail(res, status, message) {
  res.status(status).json({ success: false, error: message });
}

/** Wraps a handler so thrown Errors become clean 400 JSON responses instead of 500s/crashes. */
function withErrors(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error('[API Error]', err);
      fail(res, err.statusCode || 400, err.message || 'Erro inesperado.');
    }
  };
}

function requireMethod(req, res, method) {
  if (req.method !== method) {
    fail(res, 405, `Método não permitido. Use ${method}.`);
    return false;
  }
  return true;
}

module.exports = { getBody, ok, fail, withErrors, requireMethod };
