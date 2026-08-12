const { withErrors, ok, fail, requireMethod } = require('../lib/http');

/** Public, non-secret config the browser needs to open its Pusher connection. */
module.exports = withErrors(async (req, res) => {
  if (!requireMethod(req, res, 'GET')) return;
  const { PUSHER_KEY, PUSHER_CLUSTER } = process.env;
  if (!PUSHER_KEY || !PUSHER_CLUSTER) return fail(res, 500, 'PUSHER_KEY / PUSHER_CLUSTER não configuradas.');
  ok(res, { pusherKey: PUSHER_KEY, pusherCluster: PUSHER_CLUSTER });
});
