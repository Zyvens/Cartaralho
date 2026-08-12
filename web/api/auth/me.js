const { withErrors, ok, requireMethod } = require('../../lib/http');
const { requireUser } = require('../../lib/auth');

module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'GET')) return;
  const user = await requireUser(req, res);
  if (!user) return;
  ok(res, { user });
});
